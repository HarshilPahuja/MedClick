import express from "express";
import bcrypt from "bcrypt";
import "dotenv/config";
import bodyParser from "body-parser";
import { createClient } from "@supabase/supabase-js";
import session from "express-session";
import passport from "passport";
import { Strategy } from "passport-local";
import cors from "cors";

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
    methods: ["GET", "POST"],
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
        } req.login(data, (err) => { //for signin session cookies
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
