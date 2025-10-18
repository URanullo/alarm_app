import { Audio } from 'expo-av';
import * as Notifications from 'expo-notifications';
import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { UserProvider } from './UserContext';
import EmergencyAlertModal from './components/EmergencyAlertModal';

export default function RootLayout() {
  const [showEmergencyAlert, setShowEmergencyAlert] = useState(false);
  const [alertData, setAlertData] = useState({ title: '', message: '' });

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
    
    // Show custom emergency alert modal
    setAlertData({
      title: notification.request.content.title || 'Emergency Notification',
      message: notification.request.content.body || 'An emergency alert has been received.'
    });
    setShowEmergencyAlert(true);
    
    // Play sound
    (async () => {
        const { sound } = await Audio.Sound.createAsync(
          require('./assets/notify.mp3')
        );
        await sound.playAsync();
    })();
    });

    return () => {
      if (subscription) subscription.remove?.();
    };
  }, []);

  return (
    <UserProvider>
      <Stack screenOptions={{ headerShown: false }} />
      <EmergencyAlertModal
        visible={showEmergencyAlert}
        title={alertData.title}
        message={alertData.message}
        onDismiss={() => setShowEmergencyAlert(false)}
      />
    </UserProvider>
  );
}