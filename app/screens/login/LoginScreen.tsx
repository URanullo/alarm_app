import Constants from 'expo-constants';
import * as Device from "expo-device";
import * as Notifications from 'expo-notifications';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getDoc } from "firebase/firestore";
import { getMessaging, getToken } from 'firebase/messaging';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { app, db } from "../../services/firebaseConfig";
import LoginForm from './LoginForm';
import { useUser } from '../../UserContext';

// Import auth with type assertion
const auth = require("../../services/firebaseConfig").auth as any;


const baseUrl = Constants.expoConfig?.extra?.baseUrl;
 console.log('baseUrl',baseUrl);

export default function LoginScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const [showCustomAlert, setShowCustomAlert] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const { setUser } = useUser();

  const showAlert = (title: string, message: string) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setShowCustomAlert(true);
  };

  const handleLogin = async (email: string, password: string, isLoading: boolean) => {

    console.log('Login attempt with:', email, password);
    if (!email || !password) {
      showAlert('Error', 'Please enter both email and password');
      isLoading = false;
      return;
    }
    try {
      setIsLoading(true);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (!userDoc.exists()) {
        showAlert("Error", "User profile not found");
        return;
      }
      const userData = userDoc.data();
      console.log("User Data:", userData);

      if (userData.role !== "user") {
        showAlert("Access Denied", "You must be user to log in.");
        return;
      }

      setUser(userData as any);
      console.log("✅ User saved globally:", userData);
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
          token: token,
          role: userData.role
        })
      });

    } catch (error: any) {
      let message = "Login failed. Please try again.";
      
      switch (error.code) {
        case 'auth/user-not-found':
          message = "Account not found. Please check your email or register first.";
          break;
        case 'auth/wrong-password':
          message = "Incorrect email or password. Please try again.";
          break;
        case 'auth/invalid-credential':
          message = "Incorrect email or password. Please try again.";
          break;
        case 'auth/invalid-email':
          message = "Invalid email format. Please enter a valid email.";
          break;
        case 'auth/too-many-requests':
          message = "Too many failed attempts. Please try again later.";
          break;
        case 'auth/network-request-failed':
          message = "Network error. Please check your internet connection.";
          break;
        default:
          message = `Login failed: ${error.message}`;
      }
      
      showAlert('Login Failed', message);
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

      {/* Custom Alert Modal */}
      <Modal visible={showCustomAlert} transparent animationType="fade">
        <View style={styles.alertOverlay}>
          <View style={styles.alertContainer}>
            <View style={styles.alertIconContainer}>
              <Text style={styles.alertIcon}>⚠️</Text>
            </View>
            <Text style={styles.alertTitle}>{alertTitle}</Text>
            <Text style={styles.alertMessage}>{alertMessage}</Text>
            <TouchableOpacity 
              style={styles.alertButton}
              onPress={() => setShowCustomAlert(false)}
            >
              <Text style={styles.alertButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
        projectId: Constants.expoConfig?.extra?.eas?.projectId,
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
  alertOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  alertContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 28,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  alertIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fff3cd',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  alertIcon: {
    fontSize: 28,
  },
  alertTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 12,
    textAlign: 'center',
  },
  alertMessage: {
    fontSize: 16,
    color: '#495057',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  alertButton: {
    backgroundColor: '#E53935',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  alertButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});