import { Audio } from 'expo-av';
import * as Notifications from 'expo-notifications';
import { Stack } from 'expo-router';
import { addDoc, collection } from 'firebase/firestore';
import { useEffect } from 'react';
import { Alert } from 'react-native';
import { db } from './services/firebaseConfig';
import { UserProvider } from './UserContext';

// Removed unused variables

// Helper function to map admin alarm levels to UI expected values
function mapAlarmLevel(level: string): 'Low' | 'Medium' | 'High' | 'Critical' {
  const levelLower = level.toLowerCase();
  if (levelLower === 'critical' || levelLower === 'emergency') return 'Critical';
  if (levelLower === 'high' || levelLower === 'severe') return 'High';
  if (levelLower === 'medium' || levelLower === 'moderate') return 'Medium';
  if (levelLower === 'low' || levelLower === 'warning') return 'Low';
  return 'Medium'; // default fallback
}

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
    
    // Show alert
    Alert.alert(
      notification.request.content.title || 'Notification',
      notification.request.content.body || ''
    );
    
    // Play sound
    (async () => {
        const { sound } = await Audio.Sound.createAsync(
          require('./assets/notify.mp3')
        );
        await sound.playAsync();
    })();

    // Save notification to AdminAlarms collection for UI display
    try {
      const notificationData = notification.request.content;
      const data = notificationData.data || {};
      
      // Map admin payload to AdminAlarm structure
      const adminAlarm = {
        title: notificationData.title || 'Emergency Alert',
        message: notificationData.body || (data.description as string) || 'Emergency reported',
        alarmType: (data.type as string) || 'Emergency',
        alarmLevel: mapAlarmLevel((data.alarmLevel as string) || 'Warning'),
        sentBy: (data.reportedBy as string) || 'Admin',
        status: 'Active' as const,
        sentAt: new Date(),
        isUrgent: ((data.alarmLevel as string) || '').toLowerCase() === 'critical',
        location: (data.location as string) || 'All areas',
        instructions: (data.instructions as string) || null,
        targetAudience: 'All' as const,
        images: (data.images as string[]) || []
      };

      await addDoc(collection(db, 'AdminAlarms'), adminAlarm);
      console.log('✅ Admin alarm saved to Firestore:', adminAlarm);
    } catch (error) {
      console.error('❌ Error saving admin alarm to Firestore:', error);
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