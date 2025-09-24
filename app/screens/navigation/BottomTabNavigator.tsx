import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';
import EmergencyCasesScreen from '../../services/EmergencyCases';
import { useUser } from '../../UserContext';
import HomeScreen from '../home/HomeScreen';
import LoginScreen from '../login/LoginScreen';
import ProfileScreen from '../profile/ProfileScreen';

const Tab = createBottomTabNavigator();

// BottomTabNavigator.tsx
function Tabs() {
  const { user } = useUser();

  if (!user) {
    return <LoginScreen />;
  }

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName = "";
          if (route.name === "Home") iconName = "home";
          else if (route.name === "Profile") iconName = "person-outline";
          else if (route.name === "EmergencyCases") iconName = "alert-circle";
          return <Ionicons name={iconName as any} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#E53935",
        tabBarInactiveTintColor: "#bbb",
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="EmergencyCases" component={EmergencyCasesScreen} options={{ title: 'Emergencies' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function BottomTabNavigator() {
  return (
      <Tabs />
  );
}
