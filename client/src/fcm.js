import { messaging } from "./firebase";
import { getToken, onMessage } from "firebase/messaging";

export async function getFCMToken() {
  const permission = await Notification.requestPermission();

  if (permission !== "granted") {
    console.log("Notification permission denied");
    return null;
  }

  const token = await getToken(messaging, {
    vapidKey: "BMcK8INzix2ht8UnG7uGoV8LBHD-qVSqVQlaUPsYGhE-lrIu1t4xJXMTuye8kfaO2W8no0kbuDKtYwPgFQh91tI",
  });

  return token;
}


// Foreground messages
export function listenForMessages() {
  onMessage(messaging, (payload) => {
    alert(payload.notification.title + "\n" + payload.notification.body);
  });
}