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
app.set("trust proxy", 1);

const port = process.env.PORT || 3000;
const saltRounds = 10;

app.use(
  session({
    secret: process.env.SECRET_SESSION_KEY,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 30,
      sameSite: "none",   // REQUIRED for cross-site
      secure: true        // REQUIRED for https
    },
  })
);


app.use(passport.initialize());
app.use(passport.session());

app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  cors({
    origin: "https://medclick-one.vercel.app",
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

// Helper to check 6-hour gap between times
function hasSixHourGap(times) {
  if (!times || times.length <= 1) return true;
  
  // Convert all times to minutes from midnight for easy comparison
  const minutes = times.map(t => {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
  }).sort((a, b) => a - b);

  for (let i = 0; i < minutes.length - 1; i++) {
    if (minutes[i + 1] - minutes[i] < 6 * 60) return false;
  }
  
  // Also check circular gap (last to first across midnight)
  const circularGap = (1440 - minutes[minutes.length - 1]) + minutes[0];
  if (circularGap < 6 * 60) return false;

  return true;
}

app.post("/storemeds", async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ success: false, message: "Not authenticated" });
  }
  const to_store_obj = req.body.filledmed;

  // Validate 6-hour gap between scheduled times
  if (!hasSixHourGap(to_store_obj.final_times)) {
    return res.status(400).json({ 
      success: false, 
      message: "Safety Rule: Scheduled doses for the same medicine must be at least 6 hours apart." 
    });
  }

  // Check if medicine with same name already exists for this user
  const { data: existing } = await supabase
    .from("medicines")
    .select("med_name")
    .eq("email", req.user.email)
    .eq("med_name", to_store_obj.final_name)
    .maybeSingle();

  if (existing) {
    return res.status(400).json({ success: false, message: "Medicine already exists in cabinet." });
  }

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

  const { data: medicines, error } = await supabase
    .from("medicines")
    .select("*")
    .eq("email", req.user.email);

  if (error) return res.json({ success: false, message: "database error" });

  const now = new Date();
  const todayName = now.toLocaleDateString("en-US", { weekday: "long" });

  // Fetch all logs from the last 24 hours for safety and persistence
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const { data: logs } = await supabase
    .from("reminder")
    .select("med_name, logged_date, logged_time")
    .eq("email", req.user.email)
    .gte("logged_date", yesterday.toLocaleDateString('en-CA'));

  let result = [];

  for (const med of medicines) {
    if (!med.days.includes(todayName)) continue;

    for (const timeStr of med.med_time) {
      const [hh, mm] = timeStr.split(":").map(Number);
      const t = new Date(now);
      t.setHours(hh, mm, 0, 0);

      // Windows
      const tMinus3 = new Date(t.getTime() - 3 * 60 * 60 * 1000);
      const tPlus3 = new Date(t.getTime() + 3 * 60 * 60 * 1000);
      const nowPlus2 = new Date(now.getTime() + 2 * 60 * 60 * 1000);

      const isDue = now >= t && now <= tPlus3;
      const isUpcoming = now < t && t <= nowPlus2;

      if (isDue || isUpcoming) {
        // Check if taken within the 6-hour safety window relative to NOW
        // OR within this specific dose's window [t-3, t+3]
        const sixHoursAgo = new Date(now.getTime() - 6 * 60 * 60 * 1000);
        
        const isTaken = logs?.some((log) => {
          if (log.med_name !== med.med_name) return false;
          const loggedAt = new Date(`${log.logged_date}T${log.logged_time}`);
          
          // It's "taken" if it was logged within this dose's specific window
          const withinDoseWindow = (loggedAt >= tMinus3 && loggedAt <= tPlus3);
          // OR if it's currently blocked by the 6-hour safety rule
          const blockedBySafety = (loggedAt >= sixHoursAgo);
          
          return withinDoseWindow || blockedBySafety;
        });

        result.push({
          med_name: med.med_name,
          dosage: med.dosage,
          instructions: med.instructions,
          med_time: timeStr,
          times_per_day: med.times_per_day,
          isTaken: !!isTaken,
        });
      }
    }
  }

  res.json(result);
});

app.get("/allmeds", async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ success: false, message: "Not authenticated" });
  }

  const { data, error } = await supabase
    .from("medicines")
    .select("*")
    .eq("email", req.user.email);

  if (error) {
    return res.status(500).json({ success: false, message: "Database error" });
  }

  res.json(data);
});

app.delete("/deletemed/:name", async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ success: false, message: "Not authenticated" });
  }

  const { name } = req.params;
  const email = req.user.email;

  const { error } = await supabase
    .from("medicines")
    .delete()
    .eq("email", email)
    .eq("med_name", name);

  if (error) {
    return res.status(500).json({ success: false, message: "Database error" });
  }

  res.json({ success: true });
});


app.post("/medtaken", async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  const { dawaikanaam } = req.body;
  const useremail = req.user.email;
  const now = new Date();

  // Unified Local-to-Server Date/Time (Avoid mixing ISO UTC with Local Time)
  const localDate = now.toLocaleDateString('en-CA'); // YYYY-MM-DD
  const localTime = now.toTimeString().slice(0, 8); // HH:MM:SS

  // 6-hour safety check using a robust timestamp
  const sixHoursAgo = new Date(now.getTime() - 6 * 60 * 60 * 1000);

  const { data: recentLogs } = await supabase
    .from("reminder")
    .select("*")
    .eq("email", useremail)
    .eq("med_name", dawaikanaam)
    .gte("logged_date", new Date(now.getTime() - 24 * 60 * 60 * 1000).toLocaleDateString('en-CA'));

  if (recentLogs) {
    const isTooSoon = recentLogs.some(log => {
      const logDateTime = new Date(`${log.logged_date}T${log.logged_time}`);
      return logDateTime >= sixHoursAgo;
    });

    if (isTooSoon) {
      return res.status(400).json({
        success: false,
        message: "Safety Warning: Please keep at least 6 hours between two doses of the same medicine."
      });
    }
  }

  const { data, error } = await supabase.from("reminder").insert([
    {
      email: useremail,
      med_name: dawaikanaam,
      logged_date: localDate,
      logged_time: localTime,
    },
  ]);

  if (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "database error" });
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

app.post("/updatemed", async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ success: false, message: "Not authenticated" });
  }

  const { filledmed } = req.body;
  const email = req.user.email;

  // Validate 6-hour gap between scheduled times
  if (!hasSixHourGap(filledmed.final_times)) {
    return res.status(400).json({ 
      success: false, 
      message: "Safety Rule: Scheduled doses for the same medicine must be at least 6 hours apart." 
    });
  }

  const { error } = await supabase
    .from("medicines")
    .update({
      dosage: filledmed.final_dosage,
      instructions: filledmed.final_instruction,
      times_per_day: filledmed.final_timesperday,
      med_time: filledmed.final_times,
      days: filledmed.final_days,
    })
    .eq("email", email)
    .eq("med_name", filledmed.final_name);

  if (error) {
    return res.status(500).json({ success: false, message: "Database error" });
  }

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

app.post("/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ success: false, message: "Logout failed" });
    }
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ success: false, message: "Session destruction failed" });
      }
      res.clearCookie("connect.sid"); // Clear the session cookie
      return res.json({ success: true });
    });
  });
});

//need to verify app for production use of oauth ig.

passport.use(
  "google",
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "https://medclick-5sc0.onrender.com/auth/google/callback",

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
    res.redirect("https://medclick-one.vercel.app/home");

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
