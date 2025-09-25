import { Audio } from 'expo-av';
import * as Notifications from 'expo-notifications';
import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { Alert } from 'react-native';
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
    // Read-only app: do not write to Firestore here. Admin/backend owns persistence.
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