import * as Notifications from 'expo-notifications';
import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { Alert, Platform } from 'react-native';
import app from '.';

export default function RootLayout() {
  useEffect(() => {
    let subscription: Notifications.EventSubscription;

    if (Platform.OS === 'web') {
       // 💻 Web push listener
      const messaging = getMessaging(app);
      onMessage(messaging, (payload) => {
        console.log('💻 Web notification received:', payload);
        Alert.alert(
          payload.notification?.title || 'Notification',
          payload.notification?.body || ''
        );
      });
    } else {
     // 📱 Mobile push listener
     Notifications.addNotificationReceivedListener(notification => {
        console.log('📱 Mobile notification received:', notification);
        Alert.alert(
          notification.request.content.title || 'Notification',
          notification.request.content.body || ''
        );
      });
    }

    // return () => {
    //   // if (subscription) subscription.remove?.();
    // };
  }, []);

  return <Stack screenOptions={{ headerShown: false }} />;
}