import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { signOut } from 'firebase/auth';
import React, { useState } from 'react';
import { Button, Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { auth } from '../../services/firebaseConfig';

const USER_NAME = 'Yover Nullo'; // Placeholder for user name

export default function ProfileScreen() {
  const [isVolunteer, setIsVolunteer] = useState(false);
  const router = useRouter();

  // Navigate to report emergency page
  const handleSOS = () => {
    router.push('/report-emergency');
  };

   const handleLogout = async () => {
    try {
      await signOut(auth);
      // User will be redirected to LoginScreen by your auth logic in BottomTabNavigator
    } catch (error) {
      Alert.alert('Logout Failed', error.message);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.hey}>Hey!</Text>
          <Text style={styles.username}>This is Profile Screen</Text>
        </View>
        <TouchableOpacity style={styles.bellButton}>
          <Ionicons name="notifications-outline" size={26} color="#222" />
        </TouchableOpacity>
      </View>

      {/* Help message */}
       <Button title="Logout" onPress={handleLogout} />
    </View>
  );
}

const { width } = Dimensions.get('window');
const SOS_SIZE = width * 0.55;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7',
    paddingTop: 48,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  hey: {
    color: '#888',
    fontSize: 15,
    marginBottom: 2,
  },
  username: {
    fontWeight: 'bold',
    fontSize: 18,
    color: '#222',
  },
  bellButton: {
    padding: 6,
  },
  helpContainer: {
    marginBottom: 18,
  },
  helpText: {
    color: '#222',
    fontSize: 15,
    textAlign: 'left',
  },
  sosHighlight: {
    color: '#E53935',
    fontWeight: 'bold',
  },
  sosContainer: {
    alignItems: 'center',
    marginVertical: 18,
  },
  sosButton: {
    width: SOS_SIZE,
    height: SOS_SIZE,
    borderRadius: SOS_SIZE / 2,
    backgroundColor: '#E53935',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#E53935',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 8,
  },
  sosText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 38,
    letterSpacing: 2,
  },
  volunteerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    marginTop: 18,
    marginBottom: 18,
    paddingHorizontal: 18,
    paddingVertical: 8,
    alignSelf: 'center',
    width: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  volunteerText: {
    fontSize: 16,
    color: '#222',
    marginRight: 12,
    fontWeight: '500',
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingVertical: 10,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 8,
  },
  navItem: {
    alignItems: 'center',
    flex: 1,
  },
  navText: {
    fontSize: 13,
    color: '#bbb',
    marginTop: 2,
    fontWeight: '500',
  },
}); 