import Constants from 'expo-constants';
import * as Device from "expo-device";
import * as Notifications from 'expo-notifications';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getDoc } from "firebase/firestore";
import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet
} from 'react-native';
import { app, auth, db } from "../../services/firebaseConfig";
import LoginForm from './LoginForm';

const baseUrl = Constants.expoConfig?.extra?.baseUrl;
 console.log('baseUrl',baseUrl);

export default function LoginScreen() {
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (email: string, password: string, isLoading: boolean) => {

    console.log('Login attempt with:', email, password);
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      isLoading = false;
      return;
    }
    try {
      setIsLoading(true);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (!userDoc.exists()) {
        Alert.alert("Error", "User profile not found");
        return;
      }
      const userData = userDoc.data();
      console.log("User Data:", userData);

      if (userData.role !== "user") {
        Alert.alert("Access Denied", "You must be user to log in.");
        return;
      }

      console.log('Login successful');
      // Get push token
      const token = await registerForPushNotificationsAsync();
      console.log("📱 Expo Push Token:", token);

      if (token) {
        if (Platform.OS === 'web') {
          // Save as fcmToken
          await setDoc(doc(db, "users", user.uid), { fcmToken: token }, { merge: true });
        } else {
          // Save as expoPushToken
          await setDoc(doc(db, "users", user.uid), { expoPushToken: token }, { merge: true });
        }
      }
      await fetch(`${baseUrl}/save-token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: userCredential.user.email,
          token: token
        })
      });

    } catch (error) {
      Alert.alert('Login Failed', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#fff' }} // Ensure KAV takes full screen and has a background
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} // Standard behavior
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0} // Adjust if you have a fixed header/footer
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled" // Good for forms
        showsVerticalScrollIndicator={false} // Optional: hide scrollbar
      >
        <LoginForm onSubmit={handleLogin} isLoading={isLoading} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}


export async function registerForPushNotificationsAsync() {
  if (Platform.OS === 'web') {
    try {
      const messaging = getMessaging(app);

      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        const vapidKey = "BJ7xbLYiFbFrM96eJLpi3J4g9XXfb6cV6mWVJfRJ2tceuhe6RXY8Q6t8tzOR65ysgDdw-RX6lWiyLUoyfcoLPIs"; // from Firebase console → Project Settings → Cloud Messaging
        const fcmToken = await getToken(messaging, { vapidKey });
        console.log("🌐 Web FCM Token:", fcmToken);
        return fcmToken;
      } else {
        alert("Permission for notifications denied.");
        return null;
      }
    } catch (err) {
      console.error("Error getting FCM token for web:", err);
    }
  } else {
    // Native devices (Expo Notifications)
    let token;
    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== "granted") {
        alert("Failed to get push token!");
        return;
      }
      token = (await Notifications.getExpoPushTokenAsync({
        projectId: Constants.expoConfig.extra.eas.projectId,
      })).data;

      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("default", {
          name: "default",
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: "#FF231F7C",
        });
      }

      console.log("📱 Native Push Token:", token);
      return token;
    } else {
      alert("Must use physical device for push notifications");
    }
  }
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center', // center when space available
    padding: 24,
    backgroundColor: '#fff',
  },
});