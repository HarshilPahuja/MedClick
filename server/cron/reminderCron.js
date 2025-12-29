import cron from "node-cron";
import { createClient } from "@supabase/supabase-js";
import admin from "../firebaseAdmin.js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SECRET
);

const GRACE_MINUTES = 15;

// helper: adds minutes to "HH:MM"
function addMinutesToTime(timeStr, minutes) {
  const [h, m] = timeStr.split(":").map(Number);
  const d = new Date();
  d.setHours(h, m + minutes, 0, 0);
  return d.toTimeString().slice(0, 8); // HH:MM:SS
}

// runs every 5 minutes
cron.schedule("*/5 * * * *", async () => {
  console.log("cron running");

  const now = new Date();
  const today = now.toISOString().split("T")[0]; // YYYY-MM-DD
  const todayName = now.toLocaleDateString("en-US", { weekday: "long" });  //day Name

  const { data: medicines, error } = await supabase
    .from("medicines")
    .select("*");

  if (error) {
    console.error("Error fetching medicines:", error);
    return;
  }

  for (const med of medicines) {
    const { email, med_name, med_time, days } = med;

    // Skip if medicine not scheduled today
    if (!days.includes(todayName)) continue;

    // Loop over each scheduled time
    for (const time of med_time) {
      // time = "08:00"

      const medDateTime = new Date(`${today}T${time}:00`);
      const graceDeadline = new Date(
        medDateTime.getTime() + GRACE_MINUTES * 60000
      );

      // If still within grace window → skip
      if (now <= graceDeadline) continue;

      //  Check if medicine was logged IN THIS SLOT ONLY
      const upperTime = addMinutesToTime(time, GRACE_MINUTES);

      const { data: logs, error: logError } = await supabase
        .from("reminder")
        .select("med_name")
        .eq("email", email)
        .eq("med_name", med_name)
        .eq("logged_date", today)
        .gte("logged_time", time)       // >= scheduled time
        .lt("logged_time", upperTime)   // < scheduled time + grace
        .limit(1);

      if (logError) {
        console.error("Error checking reminder log:", logError);
        continue;
      }

      // If already taken in this window → skip
      if (logs && logs.length > 0) continue;

      //  Fetch user's FCM token
      const { data: user } = await supabase
        .from("authentication")
        .select("fcm_token")
        .eq("email", email)
        .single();

      if (!user?.fcm_token) continue;

      //  Send notification
      await admin.messaging().send({
        token: user.fcm_token,
        notification: {
          title: "Medicine Reminder 💊",
          body: `You missed ${med_name} scheduled at ${time}`,
        },
      });

      console.log(
        `🔔 Reminder sent → ${email} | ${med_name} | ${time}`
      );
    }
  }
});
