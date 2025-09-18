import { FontAwesome, FontAwesome5, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import Constants from 'expo-constants';
import type { Auth } from 'firebase/auth';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'; // Added ActivityIndicator
import getUserLocation from '../../screens/home/LocationService';
import * as firebaseSvc from '../../services/firebaseConfig';
import { useUser } from '../../UserContext';


const baseUrl = Constants.expoConfig?.extra?.baseUrl;
const adminEmail = Constants.expoConfig?.extra?.adminEmail;
console.log('baseUrl', baseUrl);
console.log('adminEmail', adminEmail);

export const unstable_settings = {
  headerShown: false,
};

interface ServerError {
  error?: string;
  message?: string;
}

const EMERGENCY_TYPES = [
    { key: 'accident', label: 'Accident', priority: 'High', icon: <MaterialCommunityIcons name="car-wash" size={28} color="#E53935" /> },
    { key: 'fire', label: 'Fire', priority: 'Critical', icon: <MaterialCommunityIcons name="fire" size={28} color="#bbb" /> },
    { key: 'medical', label: 'Medical', priority: 'Critical', icon: <FontAwesome5 name="first-aid" size={28} color="#bbb" /> },
    { key: 'flood', label: 'Flood', priority: 'High', icon: <MaterialCommunityIcons name="home-flood" size={28} color="#bbb" /> },
    { key: 'quake', label: 'Quake', priority: 'Critical', icon: <MaterialCommunityIcons name="home-lightning-bolt-outline" size={28} color="#bbb" /> },
    { key: 'robbery', label: 'Robbery', priority: 'High', icon: <FontAwesome5 name="user-secret" size={28} color="#bbb" /> },
    { key: 'assault', label: 'Assault', priority: 'High', icon: <FontAwesome5 name="hand-rock" size={28} color="#bbb" /> },
    { key: 'other', label: 'Other', priority: 'Low', icon: <FontAwesome name="ellipsis-h" size={28} color="#bbb" /> },
];

export default function ReportEmergencyScreen() {
  const [selectedType, setSelectedType] = useState<string>('accident');
  const [location, setLocation] = useState<string>('Fetching location…');
  const [description, setDescription] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const authInstance = firebaseSvc.auth as unknown as Auth;
  const navigation = useNavigation();
  const { user } = useUser();

  useEffect(() => {
    let isMounted = true;
    const loadLocation = async () => {
      try {
        const addr = await getUserLocation();
        if (!isMounted) return;
        if (addr && addr !== 'Address not available') {
          setLocation(addr);
        } else {
          setLocation('Unable to fetch location');
        }
      } catch (e) {
        console.warn('Failed to load location:', e);
        if (isMounted) setLocation('Unable to fetch location');
      }
    };
    loadLocation();
    return () => { isMounted = false; };
  }, []);

 const handleSubmit = async () => {
    if (!user) {
      Alert.alert('Authentication Error', 'You must be logged in to submit a report.');
      return;
    }
    if (!baseUrl) {
        Alert.alert('Configuration Error', 'The base URL is not configured. Cannot submit report.');
        return;
    }
    if (!selectedType || !description.trim()) {
        Alert.alert('Missing Information', 'Please select an emergency type and provide a description.');
        return;
    }

    setIsLoading(true);
    try {
      const recipientEmail = adminEmail;
      const now = new Date().toISOString();
      const selectedEmergency = EMERGENCY_TYPES.find(e => e.key === selectedType);
      const priority = selectedEmergency?.priority || "Medium";

      const payload = {
        email: recipientEmail,
        title: `Alert! ${selectedType.toUpperCase()} reported`,
        body: `Emergency at ${location}`,
        sound: "default",
        data: {
          type: selectedType.toUpperCase(),
          description: description,
          location: location,
          barangay: user.barangay || "Not set",
          reportedBy: `${user.firstName} ${user.lastName}` || user.email,
          reporterContactNumber: user.contactNumber || "N/A",
          priority,
          clientDateTime: now,
        }
      };

      console.log('payload', payload);
      const response = await fetch(`${baseUrl}/send-to-user`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        Alert.alert(
          'Report Submitted',
          'Your emergency report has been successfully sent.',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
        setSelectedType('accident');
        setDescription('');
        console.log(`Submitted successfully to ${recipientEmail}`);

      } else {
        let errorTitle = `Submit Failed (Status: ${response.status})`;
        let errorMessage = 'An unknown error occurred.';

        try {
          const contentType = response.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            const errorData: ServerError = await response.json();
            if (errorData.error) {
              errorMessage = errorData.error;
            } else if (errorData.message) {
              errorMessage = errorData.message;
            } else {
              errorMessage = 'Could not retrieve specific error details from server.';
            }
          } else {
            const errorText = await response.text();
            errorMessage = errorText || 'Server returned a non-JSON error response.';
          }
        } catch (e) {
          console.warn('Failed to parse error details:', e);
          errorMessage = 'Could not parse error details from server.';
        }
        Alert.alert(errorTitle, errorMessage);
      }
    } catch (error: any) {
      Alert.alert('Submit Failed', `An error occurred: ${error.message || 'Please check your network connection.'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangeLocation = () => {
    Alert.alert('Feature Not Available', 'Change location feature coming soon!');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 5}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <Text style={styles.sectionLabel}>Select Emergency type</Text>
        <View style={styles.typeGrid}>
          {EMERGENCY_TYPES.map((type) => (
            <TouchableOpacity
              key={type.key}
              style={[
                styles.typeItem,
                selectedType === type.key && styles.typeItemSelected,
                isLoading && styles.disabled // Optionally disable type selection during loading
              ]}
              onPress={() => !isLoading && setSelectedType(type.key)} // Prevent changing type while loading
              activeOpacity={0.8}
              disabled={isLoading} // Disable touchable
            >
              {React.cloneElement(type.icon, {
                color: selectedType === type.key ? '#E53935' : (isLoading ? '#ccc' : '#bbb'),
              })}
              <Text style={[
                  styles.typeLabel,
                  selectedType === type.key && { color: '#E53935', fontWeight: 'bold' },
                  isLoading && { color: '#ccc'}
                ]}>{type.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionLabel}>Location</Text>
        <View style={styles.locationBox}>
          <Ionicons name="location-outline" size={20} color="#E53935" style={{ marginRight: 8 }} />
          <Text style={styles.locationText}>{location}</Text>
          <TouchableOpacity
            style={[styles.changeButton, isLoading && styles.disabled]}
            onPress={handleChangeLocation}
            disabled={isLoading}
          >
            <Text style={[styles.changeButtonText, isLoading && { color: '#ccc'}]}>Change</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionLabel}>Specify emergency in brief</Text>
        <TextInput
          style={[styles.textArea, isLoading && styles.disabledInput]}
          placeholder="Describe the emergency..."
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={5}
          textAlignVertical="top"
          editable={!isLoading} // Prevent editing while loading
        />
      </ScrollView>

      <TouchableOpacity
        style={[styles.submitButton, isLoading && styles.submitButtonLoading]}
        onPress={handleSubmit}
        disabled={isLoading} // Disable button when loading
      >
        {isLoading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.submitButtonText}>Submit Report</Text>
        )}
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
    paddingTop: Constants.statusBarHeight,
  },
  // ... (other styles remain the same)
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 18,
    color: '#222',
  },
  sectionLabel: {
    fontWeight: 'bold',
    fontSize: 15,
    color: '#222',
    marginTop: 18,
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  typeItem: {
    width: '23%',
    aspectRatio: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#eee',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
  },
  typeItemSelected: {
    borderColor: '#E53935',
    backgroundColor: '#fff5f5',
  },
  typeLabel: {
    fontSize: 12,
    color: '#555',
    marginTop: 6,
    textAlign: 'center',
  },
  locationBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    marginHorizontal: 16,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#eee',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
  },
  locationText: {
    flex: 1,
    color: '#222',
    fontSize: 14,
  },
  changeButton: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E53935',
    marginLeft: 8,
  },
  changeButtonText: {
    color: '#E53935',
    fontWeight: 'bold',
    fontSize: 13,
  },
  textArea: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginHorizontal: 16,
    padding: 12,
    minHeight: 100,
    fontSize: 15,
    color: '#222',
    borderWidth: 1,
    borderColor: '#eee',
    marginBottom: 16,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#E53935',
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: Platform.OS === 'ios' ? 30 : 20,
    paddingVertical: 16,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 17,
  },
  // Styles for disabled/loading state
  disabled: {
    opacity: 0.6, // Make it look disabled
    // backgroundColor: '#f0f0f0', // Optional: change background
  },
  disabledInput: {
    backgroundColor: '#f9f9f9', // Slightly different background for disabled input
    color: '#aaa',
  },
  submitButtonLoading: {
    backgroundColor: '#E53935', // Keep the color or change if desired
    opacity: 0.8,
  },
});
