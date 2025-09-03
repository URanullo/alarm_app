import { FontAwesome, FontAwesome5, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { auth } from './services/firebaseConfig';
import Constants from 'expo-constants';

const baseUrl = Constants.expoConfig?.extra?.baseUrl;
 console.log('baseUrl',baseUrl);
export const unstable_settings = {
  headerShown: false,
};

const EMERGENCY_TYPES = [
  { key: 'accident', label: 'Accident', icon: <MaterialCommunityIcons name="car-crash" size={28} color="#E53935" /> },
  { key: 'fire', label: 'Fire', icon: <MaterialCommunityIcons name="fire" size={28} color="#bbb" /> },
  { key: 'medical', label: 'Medical', icon: <FontAwesome5 name="first-aid" size={28} color="#bbb" /> },
  { key: 'flood', label: 'Flood', icon: <MaterialCommunityIcons name="home-flood" size={28} color="#bbb" /> },
  { key: 'quake', label: 'Quake', icon: <MaterialCommunityIcons name="home-lightning-bolt-outline" size={28} color="#bbb" /> },
  { key: 'robbery', label: 'Robbery', icon: <FontAwesome5 name="user-secret" size={28} color="#bbb" /> },
  { key: 'assault', label: 'Assault', icon: <FontAwesome5 name="hand-rock" size={28} color="#bbb" /> },
  { key: 'other', label: 'Other', icon: <FontAwesome name="ellipsis-h" size={28} color="#bbb" /> },
];

export default function ReportEmergencyScreen() {
  const [selectedType, setSelectedType] = useState('accident');
  const [location, setLocation] = useState('Campo, Bacuag, Surigao City');
  const [description, setDescription] = useState('');
  const user = auth.currentUser;

  const handleSubmit = async () => {
    try {
      console.log(`BASEURL: ${baseUrl}/send-to-user`);
      await fetch(`${baseUrl}/send-to-user`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: 'test@gmail.com',
          sound: 'default',
          title: 'Alert! ' + selectedType.toUpperCase() + ' reported',
          body: `\nLocation: ${location}\nDescription: ${description}\nReporter: ${user.displayName || user.email || 'User'}`
        })
      });
    } catch (error) {
      Alert.alert('Submit Failed', error.message);
    }
  };

  const handleChangeLocation = () => {
    // Placeholder for location change logic
    alert('Change location feature coming soon!');
  };

  return (
    <View style={styles.container}>
      {/* Removed custom header */}
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        {/* Emergency Type Selection */}
        <Text style={styles.sectionLabel}>Select Emergency type</Text>
        <View style={styles.typeGrid}>
          {EMERGENCY_TYPES.map((type) => (
            <TouchableOpacity
              key={type.key}
              style={[styles.typeItem, selectedType === type.key && styles.typeItemSelected]}
              onPress={() => setSelectedType(type.key)}
              activeOpacity={0.8}
            >
              {React.cloneElement(type.icon, {
                color: selectedType === type.key ? '#E53935' : '#bbb',
              })}
              <Text style={[styles.typeLabel, selectedType === type.key && { color: '#E53935', fontWeight: 'bold' }]}>{type.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
        {/* Location */}
        <Text style={styles.sectionLabel}>Location</Text>
        <View style={styles.locationBox}>
          <Ionicons name="location-outline" size={20} color="#E53935" style={{ marginRight: 8 }} />
          <Text style={styles.locationText}>{location}</Text>
          <TouchableOpacity style={styles.changeButton} onPress={handleChangeLocation}>
            <Text style={styles.changeButtonText}>Change</Text>
          </TouchableOpacity>
        </View>
        {/* Description */}
        <Text style={styles.sectionLabel}>Specify emergency in brief</Text>
        <TextInput
          style={styles.textArea}
          placeholder="Describe the emergency..."
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={5}
          textAlignVertical="top"
        />
      </ScrollView>
      {/* Submit Button */}
      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>Submit Report</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
    paddingTop: 36,
  },
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
  },
  typeItemSelected: {
    borderColor: '#E53935',
    backgroundColor: '#fff5f5',
  },
  typeLabel: {
    fontSize: 12,
    color: '#bbb',
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
  },
  locationText: {
    flex: 1,
    color: '#222',
    fontSize: 14,
  },
  changeButton: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingVertical: 4,
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
  },
  submitButton: {
    backgroundColor: '#E53935',
    borderRadius: 12,
    margin: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 17,
  },
}); 