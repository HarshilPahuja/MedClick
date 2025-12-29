import cron from "node-cron";
import { createClient } from "@supabase/supabase-js";
import admin from "../firebaseAdmin.js";


//due- t <= now <= t + 3 hours else missed.
//upcoming- now < t <= now + 2 hours
//provided its not there in logs for -2hr - t- +3hr

// notification when
// t <= now <= t + 3 hours
// AND
// NO log exists in [-2h , +3h]


const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SECRET
);

// helper
function buildDate(today, timeStr) {
  return new Date(`${today}T${timeStr}:00`);
}

// runs every 5 minutes
cron.schedule("*/5 * * * *", async () => {
  console.log("🔄 cron running");

  const now = new Date();
  const today = now.toISOString().split("T")[0];
  const todayName = now.toLocaleDateString("en-US", { weekday: "long" });

  const { data: medicines, error } = await supabase
    .from("medicines")
    .select("*");

  if (error) {
    console.error("Error fetching medicines:", error);
    return;
  }

  for (const med of medicines) {
    const { email, med_name, med_time, days } = med;

    if (!days.includes(todayName)) continue;

    for (const time of med_time) {
      const t = buildDate(today, time);
      const tMinus2 = new Date(t.getTime() - 2 * 60 * 60 * 1000);
      const tPlus3  = new Date(t.getTime() + 3 * 60 * 60 * 1000);

      // ignore past missed
      if (now > tPlus3) continue;

      //  not due yet
      if (now < t) continue;

      //  now is in DUE window [t , t+3h]

      const { data: logs, error: logError } = await supabase
        .from("reminder")
        .select("logged_time")
        .eq("email", email)
        .eq("med_name", med_name)
        .eq("logged_date", today);

      if (logError) {
        console.error("Error checking reminder log:", logError);
        continue;
      }

      const taken = logs?.some((log) => {
        const loggedAt = buildDate(today, log.logged_time);
        return loggedAt >= tMinus2 && loggedAt <= tPlus3;
      });

      // If taken → stop notifying
      if (taken) continue;

      // fetch FCM token
      const { data: user } = await supabase
        .from("authentication")
        .select("fcm_token")
        .eq("email", email)
        .single();

      if (!user?.fcm_token) continue;

      // 🔔DUE NOTIFICATION (EVERY CRON RUN)
      await admin.messaging().send({
        token: user.fcm_token,
        notification: {
          title: "Medicine Due 💊",
          body: `Please take ${med_name} scheduled at ${time}`,
        },
      });

      console.log(
        `🔔 DUE → ${email} | ${med_name} | ${time}`
      );
    }
  }
});