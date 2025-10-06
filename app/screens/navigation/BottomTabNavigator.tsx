import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React, { useEffect, useState } from 'react';
import AlarmReportScreen from '../alarm_report/AlarmReportScreen';
import { useUser } from '../../UserContext';
import HomeScreen from '../home/HomeScreen';
import LoginScreen from '../login/LoginScreen';
import ProfileScreen from '../profile/ProfileScreen';
import MyEmergencyScreen from '../my_emergency/MyEmergencyScreen';

const Tab = createBottomTabNavigator();

function Tabs() {
  const { user } = useUser();
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setRole(user.role || "user");
    } else {
      setRole(null);
    }
  }, [user]);

  if (role !== "user") {
    return <LoginScreen />;
  }

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName = "";
          if (route.name === "Home") iconName = "home";
          else if (route.name === "Profile") iconName = "person-outline";
          else if (route.name === "AlarmReports") iconName = "alert-circle";
          else if (route.name === "MyEmergency") iconName = "medical";
          return <Ionicons name={iconName as any} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#E53935",
        tabBarInactiveTintColor: "#bbb",
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen
        name="AlarmReports"
        component={AlarmReportScreen}
        options={{ title: "Alarm Reports" }}
      />
        <Tab.Screen
          name="MyEmergency"
          component={MyEmergencyScreen}
          options={{ title: "My Emergency" }}
        />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function BottomTabNavigator() {
  return <Tabs />;
}
