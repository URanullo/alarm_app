import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useUser } from '../../UserContext';

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useUser(); // ✅ get user from context

console.log('user',user);
  // Navigate to report emergency page
  const handleSOS = () => {
    router.push('screens/report_emergency/ReportEmergencyScreen');
  };

  return (
    <ScrollView>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          {user ? (
            <View>
              <Text style={styles.hey}>Hey!</Text>
              <Text style={styles.username}>{user.firstName} {user.lastName}</Text>
            </View>
          ) : (
            <Text style={styles.infoText}>
              Profile information is not available at the moment.
            </Text>
          )}
          <TouchableOpacity style={styles.bellButton}>
            <Ionicons name="notifications-outline" size={26} color="#222" />
          </TouchableOpacity>
        </View>

        {/* Help message */}
        <View style={styles.helpContainer}>
          <Text style={styles.helpText}>Help is just a click away!</Text>
          <Text style={styles.helpText}>
            Click <Text style={styles.sosHighlight}>SOS button</Text> to call the help.
          </Text>
        </View>

        {/* SOS Button */}
        <View style={styles.sosContainer}>
          <TouchableOpacity style={styles.sosButton} onPress={handleSOS} activeOpacity={0.8}>
            <Text style={styles.sosText}>SOS</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
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
  infoText: {
    color: '#666',
  },
});
