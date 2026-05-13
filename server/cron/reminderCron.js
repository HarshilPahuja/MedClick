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
  // If timeStr is already in HH:mm:ss format, don't add :00
  if (timeStr.split(':').length === 3) {
    return new Date(`${today}T${timeStr}`);
  }
  return new Date(`${today}T${timeStr}:00`);
}

// runs every 5 minutes
cron.schedule("*/5 * * * *", async () => {
  const nowRaw = new Date();
  const offset = 5.5 * 60 * 60 * 1000;
  const indiaTime = new Date(nowRaw.getTime() + offset);
  
  const yyyy = indiaTime.getUTCFullYear();
  const mm = String(indiaTime.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(indiaTime.getUTCDate()).padStart(2, '0');
  const today = `${yyyy}-${mm}-${dd}`;
  
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const todayName = dayNames[indiaTime.getUTCDay()];

  console.log(`\n--- 🔄 Cron Started (India Time): ${yyyy}-${mm}-${dd} ${String(indiaTime.getUTCHours()).padStart(2, '0')}:${String(indiaTime.getUTCMinutes()).padStart(2, '0')} ---`);

  const { data: medicines, error } = await supabase
    .from("medicines")
    .select("*");

  if (error) {
    console.error("❌ Supabase Error:", error);
    return;
  }

  console.log(`Checking ${medicines?.length || 0} medicines...`);

  for (const med of medicines) {
    const { email, med_name, med_time, days, end_date } = med;

    // Check if med has expired
    if (end_date) {
      const expiry = new Date(end_date);
      expiry.setHours(23, 59, 59, 999);
      if (indiaTime > expiry) {
        console.log(`⏭️ Expired: ${med_name} (${email})`);
        continue;
      }
    }

    if (!days.includes(todayName)) continue;

    for (const time of med_time) {
      const t = buildDate(today, time);
      const tMinus2 = new Date(t.getTime() - 2 * 60 * 60 * 1000);
      const tPlus3  = new Date(t.getTime() + 3 * 60 * 60 * 1000);

      if (indiaTime > tPlus3) continue; // Past window
      if (indiaTime < t) continue;      // Not time yet

      // Check if already taken
      const { data: logs, error: logError } = await supabase
        .from("reminder")
        .select("logged_time")
        .eq("email", email)
        .eq("med_name", med_name)
        .eq("logged_date", today);

      if (logError) {
        console.error(`❌ Log Error for ${med_name}:`, logError);
        continue;
      }

      const taken = logs?.some((log) => {
        const loggedAt = buildDate(today, log.logged_time);
        return loggedAt >= tMinus2 && loggedAt <= tPlus3;
      });

      if (taken) {
        console.log(`✅ Already Taken: ${med_name} at ${time} (${email})`);
        continue;
      }

      // Fetch FCM tokens
      const { data: user } = await supabase
        .from("authentication")
        .select("fcm_token")
        .eq("email", email)
        .single();

      if (!user?.fcm_token) {
        console.log(`⚠️ No Token: ${email}`);
        continue;
      }

      let tokens = [];
      try {
        const parsed = JSON.parse(user.fcm_token);
        tokens = Array.isArray(parsed) ? parsed : [user.fcm_token];
      } catch (e) {
        tokens = [user.fcm_token];
      }

      if (tokens.length === 0) continue;

      // 🔔 SEND NOTIFICATION
      try {
        const response = await admin.messaging().sendEachForMulticast({
          tokens: tokens,
          notification: {
            title: "Medicine Due 💊",
            body: `Please take ${med_name} scheduled at ${time}`,
          },
        });
        console.log(`🔔 Notified ${email} (${response.successCount} devices) for ${med_name}`);
      } catch (fcmError) {
        console.error(`❌ FCM Error for ${email}:`, fcmError.message);
      }
    }
  }
  console.log("--- ✅ Cron Finished ---\n");
});