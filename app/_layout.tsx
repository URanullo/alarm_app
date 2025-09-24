import { Audio } from 'expo-av';
import * as Notifications from 'expo-notifications';
import { Stack } from 'expo-router';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { useEffect } from 'react';
import { Alert } from 'react-native';
import { db } from './services/firebaseConfig';
import { UserProvider } from './UserContext';

let getMessaging, onMessage;

export default function RootLayout() {
  useEffect(() => {
   (async () => {
     await Notifications.setNotificationChannelAsync('critical', {
      name: 'Critical Alerts',
      importance: Notifications.AndroidImportance.MAX,
      sound: 'default',
      vibrationPattern: [0, 500, 500, 500],
      lightColor: '#FF231F7C',
      bypassDnd: true,
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
     });
    })();

    let subscription: Notifications.EventSubscription;
    subscription = Notifications.addNotificationReceivedListener(async (notification) => {
    console.log('📱 Mobile notification received:', notification);
    Alert.alert(
      notification.request.content.title || 'Notification',
      notification.request.content.body || ''
    );
   (async () => {
        const { sound } = await Audio.Sound.createAsync(
          require('./assets/notify.mp3')
        );
        await sound.playAsync();
    })();
    try {
      const content = notification?.request?.content;
      const data: any = content?.data || {};

      // Persist minimal emergency record to Firestore → EmergencyCases collection
      await addDoc(collection(db, 'EmergencyCases'), {
        alarmType: data?.type || data?.category || 'ALERT',
        alarmLevel: data?.priority || data?.level || 'Medium',
        message: content?.body || data?.message || '',
        createdAt: serverTimestamp(),
      });
    } catch (err) {
      console.warn('Failed to save emergency:', err);
    }
    });

    return () => {
      if (subscription) subscription.remove?.();
    };
  }, []);

  return (
    <UserProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </UserProvider>
  );
}