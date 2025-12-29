import { initializeApp } from 'firebase/app';
import { getMessaging } from "firebase/messaging";


const firebaseConfig = {
  
  apiKey: "AIzaSyCYvxBMtL9nz20LdqfI7nnyImzjcEfiX7E",
  authDomain: "medclick-139fe.firebaseapp.com",
  projectId: "medclick-139fe",
  storageBucket: "medclick-139fe.firebasestorage.app",
  messagingSenderId: "632435594030",
  appId: "1:632435594030:web:0ff896c2f9b905411a20bf",
  measurementId: "G-8CDYW9JCXM"
};


const app = initializeApp(firebaseConfig);

//FCM
export const messaging = getMessaging(app);
export default app;



