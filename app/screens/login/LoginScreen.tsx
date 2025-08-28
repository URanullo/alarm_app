import Constants from 'expo-constants';
import * as Device from "expo-device";
import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from "firebase/firestore";
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
  const router = useRouter();

  const handleLogin = async (email: string, password: string) => {

    console.log('Login attempt with:', email, password);
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

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
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <LoginForm onSubmit={handleLogin} />
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