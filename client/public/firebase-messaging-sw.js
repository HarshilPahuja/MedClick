importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyCYvxBMtL9nz20LdqfI7nnyImzjcEfiX7E",
  authDomain: "medclick-139fe.firebaseapp.com",
  projectId: "medclick-139fe",
  storageBucket: "medclick-139fe.firebasestorage.app",
  messagingSenderId: "632435594030",
  appId: "1:632435594030:web:0ff896c2f9b905411a20bf",
  measurementId: "G-8CDYW9JCXM"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    console.log("Background message received:", payload);

  self.registration.showNotification(
    payload.notification.title,
    {
      body: payload.notification.body,
    }
  );
});
