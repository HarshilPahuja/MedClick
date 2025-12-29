import express from "express";
import bcrypt from "bcrypt";
import "dotenv/config";
import bodyParser from "body-parser";
import { createClient } from "@supabase/supabase-js";
import session from "express-session";
import passport from "passport";
import { Strategy } from "passport-local";
import cors from "cors";
import admin from "./firebaseAdmin.js";

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
    origin: "http://localhost:5173",
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
  const { data, error } = await supabase
    .from("medicines")
    .select("*")
    .eq("email", req.user.email);
  if (error) {
    return res.json({ success: false, message: "database error" });
  }
  res.json(data);
});

app.post("/medtaken", async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  const { dawaikanaam } = req.body;
  const useremail = req.user.email;

  const now = new Date();

  const date = now.toISOString().split("T")[0]; // YYYY-MM-DD

  const time = now
    .toTimeString()
    .slice(0, 8); // HH:MM:SS

  const { data, error } = await supabase
    .from("reminder")
    .insert([
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

app.post("/send-test-notification", async (req, res) => {
  const { token } = req.body;

  try {
    await admin.messaging().send({
      token,
      notification: {
        title: "MedClick",
        body: "Time to take your medicine 💊",
      },
    });

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
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

passport.use(
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
