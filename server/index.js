import express from "express";
import bcrypt from "bcrypt";
import "dotenv/config";
import bodyParser from "body-parser";
import { createClient } from "@supabase/supabase-js";
import cors from "cors";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SECRET
);

const app = express();
const port = process.env.PORT || 3000;
const saltRounds = 10;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  })
);
app.use(express.json());

app.post("/signin", async (req, res) => {
  bcrypt.hash(
    req.body.sending_password,
    saltRounds,
    async (err, encrypted_password) => {
      if (err) {
        console.log(err);
      }
      const { error } = await supabase.from("authentication").insert([
        {
          email: req.body.sending_email,
          password: encrypted_password,
        },
      ]);

      if (error) {
        console.error(error);
      } else {
        console.log("User inserted successfully"); // remove later
      }
    }
  );
});

app.post("/login", async (req, res) => {
  const received_email = req.body.sending_email;
  const received_password = req.body.sending_password;

  const { data, error } = await supabase
    .from("authentication")
    .select("password")
    .eq("email", received_email);

  if (error || data.length === 0) {
    return res.json(false);
  }

  const isMatch = await bcrypt.compare(received_password, data[0].password);

  return res.json(isMatch);
});

app.listen(port, () => {
  console.log(`app listening on port ${port}`);
});
