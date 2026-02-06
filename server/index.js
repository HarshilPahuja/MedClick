import express from "express";
import bcrypt from "bcrypt";
import "dotenv/config";
import bodyParser from "body-parser";
import { createClient } from "@supabase/supabase-js";
import session from "express-session";
import passport from "passport";
import { Strategy } from "passport-local";
import GoogleStrategy from "passport-google-oauth2";
import cors from "cors";
//t=medtime
//due- t <= now <= t + 3 hours else missed.
//upcoming- now < t <= now + 2 hours
//provided its not there in logs for -2hr - t- +3hr //code till -3hr -t - +3hr but logically should be -2.
// im assuming no one eats medicines so soon
import "./cron/reminderCron.js";
import { refreshToken } from "firebase-admin/app";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SECRET
);

const app = express();
const port = process.env.PORT || 3000;
const saltRounds = 10;

app.use(
  session({
    secret: process.env.SECRET_SESSION_KEY,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 30,
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  cors({
    origin: "https://medclick-one.vercel.app/",
    methods: ["GET", "POST", "DELETE"],
    credentials: true,
  })
);
app.use(express.json());

app.get("/me", (req, res) => {
  if (req.isAuthenticated()) {
    return res.json({ authenticated: true, user: req.user });
  }
  res.json({ authenticated: false });
});

app.post("/storemeds", async (req, res) => {
  if (!req.isAuthenticated()) {
    return res
      .status(401)
      .json({ success: false, message: "Not authenticated" });
  }
  const to_store_obj = req.body.filledmed;

  const { error } = await supabase.from("medicines").insert([
    {
      email: req.user.email,
      med_name: to_store_obj.final_name,
      dosage: to_store_obj.final_dosage,
      instructions: to_store_obj.final_instruction,
      times_per_day: to_store_obj.final_timesperday,
      med_time: to_store_obj.final_times,
      days: to_store_obj.final_days,
    },
  ]);

  if (error) {
    return res.status(500).json({ success: false, message: "Database error" });
  } else {
    return res.json({ success: true });
  }
});

app.get("/getmeds", async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.json({ success: false, message: "not authenticated" });
  }

  // Fetch medicines
  const { data: medicines, error } = await supabase
    .from("medicines")
    .select("*")
    .eq("email", req.user.email);

  if (error) {
    return res.json({ success: false, message: "database error" });
  }

  // Today info
  const now = new Date();
  const todayDate = now.toISOString().split("T")[0]; // YYYY-MM-DD
  const todayName = now.toLocaleDateString("en-US", { weekday: "long" });

  // Fetch today's reminder logs
  const { data: logs } = await supabase
    .from("reminder")
    .select("med_name, logged_time")
    .eq("email", req.user.email)
    .eq("logged_date", todayDate);

  let result = [];

  for (const med of medicines) {
    // Check if medicine is scheduled today
    if (!med.days.includes(todayName)) continue;

    for (const timeStr of med.med_time) {
      // build scheduled time t
      const [hh, mm] = timeStr.split(":").map(Number);
      const t = new Date(now);
      t.setHours(hh, mm, 0, 0);

      const tMinus3 = new Date(t.getTime() - 3 * 60 * 60 * 1000);
      const tPlus3 = new Date(t.getTime() + 3 * 60 * 60 * 1000);
      const tPlus2 = new Date(t.getTime() + 2 * 60 * 60 * 1000);

      // Check reminder logs in [-3h , +3h]
      const alreadyLogged = logs?.some((log) => {
        if (log.med_name !== med.med_name) return false;

        const [lh, lm] = log.logged_time.split(":").map(Number);
        const loggedAt = new Date(now);
        loggedAt.setHours(lh, lm, 0, 0);

        return loggedAt >= tMinus3 && loggedAt <= tPlus3;
      });

      if (alreadyLogged) continue;

      // Due OR Upcoming
      const isDue = now >= t && now <= tPlus3;
      const isUpcoming = now < t && t <= tPlus2;

      if (isDue || isUpcoming) {
        result.push({
          med_name: med.med_name,
          dosage: med.dosage,
          instructions: med.instructions,
          med_time: timeStr,
          times_per_day: med.times_per_day,
        });
      }
    }
  }

  res.json(result);
});

app.post("/medtaken", async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  const { dawaikanaam } = req.body;
  const useremail = req.user.email;

  const now = new Date();

  const date = now.toISOString().split("T")[0]; // YYYY-MM-DD

  const time = now.toTimeString().slice(0, 8); // HH:MM:SS

  const { data, error } = await supabase.from("reminder").insert([
    {
      email: useremail,
      med_name: dawaikanaam,
      logged_date: date,
      logged_time: time,
    },
  ]);

  if (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "database error",
    });
  }

  return res.json({ success: true, data });
});

app.post("/store-fcm-token", async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  const { token } = req.body;
  const email = req.user.email;

  await supabase
    .from("authentication")
    .update({ fcm_token: token })
    .eq("email", email);

  res.json({ success: true });
});

app.post("/signin", async (req, res) => {
  try {
    bcrypt.hash(
      req.body.sending_password,
      saltRounds,
      async (err, encrypted_password) => {
        if (err) {
          console.log(err);
          return res.status(500).json({ success: false });
        }
        const { data, error } = await supabase
          .from("authentication")
          .insert([
            {
              email: req.body.sending_email,
              password: encrypted_password,
            },
          ])
          .select("email, password")
          .single();

        if (error) {
          return res.status(400).json({ success: false, error: error.message });
        }
        req.login(data, (err) => {
          //for signin session cookies // req.login() is the core Passport function that creates a session. passport.authenticate("local") just calls req.login() for you after verification. authenticate("local") verifies if correct user if valid calls req.login
          if (err) {
            return res.status(500).json({ success: false });
          }

          return res.status(200).json({ success: true, loggedIn: true });
        });
      }
    );
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false });
  }
});

app.post("/login", passport.authenticate("local"), async (req, res) => {
  return res.json(true);
});
//need to verify app for production use of oauth ig.

passport.use(
  "google",
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:3000/auth/google/callback",
      userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo",
    },
    async (accessToken, refreshToken, profile, cb) => {
      try {
        const { data: checkdata, error: checkerror } = await supabase
          .from("authentication")
          .select("email")
          .eq("email", profile.email)
          .maybeSingle();
        if (checkerror) {
          return cb(checkerror);
        }
        if (!checkdata) {
          //maybesingle returns one row(object) or null while single returns one row(object) or error
          // user doesnt exist.(its sign in)
          const { data, error } = await supabase
            .from("authentication")
            .insert([
              {
                email: profile.email,
                password: "google",
              },
            ])
            .select("email")
            .single();

          if (error) return cb(error);

          return cb(null, data);
        }
        //its login using oauth

        return cb(null, checkdata);
      } catch (err) {
        return cb(err);
      }
    }
  )
);

app.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/",
  }),
  (req, res) => {
    res.redirect("http://localhost:5173/home");
  }
);

passport.use(
  "local",
  new Strategy(
    {
      usernameField: "sending_email",
      passwordField: "sending_password",
    },
    async function verify(username, password, cb) {
      try {
        const { data, error } = await supabase
          .from("authentication")
          .select("*")
          .eq("email", username);

        if (error || !data || data.length === 0) {
          return cb(null, false); // user not found
        }

        const user = data[0];

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
          return cb(null, false);
        }

        delete user.password; //good practice so it doesnt go beyond, once we do it the next step when we return, password doesnt go.
        return cb(null, user);
      } catch (err) {
        return cb(err);
      }
    }
  )
);

passport.serializeUser((user, cb) => {
  cb(null, user);
});

passport.deserializeUser((user, cb) => {
  cb(null, user);
});

app.listen(port, () => {
  console.log(`app listening on port ${port}`);
});
