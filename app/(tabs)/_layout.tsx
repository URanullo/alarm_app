import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          marginBottom: 16, // Move tab bar up from the bottom
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          height: 70,
          position: 'absolute',
          left: 0,
          right: 0,
        },
      }}
    />
  );
} 