importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyCFyDeqmRvrVaunGTAS3Wb3_pmxABN-ReU",
  authDomain: "alarm-project-3d9b3.firebaseapp.com",
  projectId: "alarm-project-3d9b3",
  storageBucket: "alarm-project-3d9b3.appspot.com",
  messagingSenderId: "1097820826450",
  appId: "1:1097820826450:web:18abdedd9078d70011288b",
  measurementId: "G-6EQPPCT9ZT"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  // Customize notification here
  self.registration.showNotification(payload.notification.title, {
    body: payload.notification.body,
    icon: '/icon.png'
  });
});