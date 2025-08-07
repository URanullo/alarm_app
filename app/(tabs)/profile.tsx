import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function ProfileScreen() {
  const handleLogout = () => {
    Alert.alert('Logged out', 'You have been logged out.');
  };

  const handleOption = (option) => {
    Alert.alert(option, `${option} pressed!`);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Profile</Text>
      <View style={styles.optionsContainer}>
        <TouchableOpacity style={styles.optionRow} onPress={() => handleOption('Account Details')}>
          <Text style={styles.optionText}>Account Details</Text>
          <Ionicons name="chevron-forward" size={20} color="#222" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.optionRow} onPress={() => handleOption('Setup SoS')}>
          <Text style={styles.optionText}>Setup SoS</Text>
          <Ionicons name="chevron-forward" size={20} color="#222" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.optionRow} onPress={() => handleOption('Settings')}>
          <Text style={styles.optionText}>Settings</Text>
          <Ionicons name="chevron-forward" size={20} color="#222" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.optionRow} onPress={() => handleOption('About')}>
          <Text style={styles.optionText}>About</Text>
          <Ionicons name="chevron-forward" size={20} color="#222" />
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
    paddingHorizontal: 24,
    paddingTop: 48,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 32,
  },
  optionsContainer: {
    marginBottom: 48,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  optionText: {
    fontSize: 16,
    color: '#222',
  },
  logoutButton: {
    borderWidth: 1.5,
    borderColor: '#E53935',
    borderRadius: 24,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 24,
    marginHorizontal: 8,
  },
  logoutButtonText: {
    color: '#E53935',
    fontWeight: 'bold',
    fontSize: 18,
  },
}); 
