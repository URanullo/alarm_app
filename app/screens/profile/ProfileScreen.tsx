import { useRouter } from 'expo-router';
import { onAuthStateChanged, User } from 'firebase/auth';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Button,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { auth } from '../../services/firebaseConfig';
import { useUser } from '../../UserContext';

export default function ProfileScreen() {
  const { user, logout } = useUser();
  const router = useRouter();

  const handleLogout = async () => {
    Alert.alert(
      "Confirm",
      "Are you sure you want to log out?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            try {
              logout();
              console.log("User signed out successfully");
            } catch (e: any) {
              Alert.alert("Logout Error", e.message);
            }
          }
        }
      ]
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {user ? (
        <View style={styles.profileCard}>
          <Text style={styles.header}>Your Profile:</Text>
          <Text style={styles.detailText}>
            <Text style={styles.label}>Name:</Text> {user.firstName} {user.lastName}
          </Text>
          <Text style={styles.detailText}>
            <Text style={styles.label}>Email:</Text> {user.email}
          </Text>
          <Text style={styles.detailText}>
            <Text style={styles.label}>Contact No:</Text> {user.contactNumber || 'Not provided'}
          </Text>
          <Text style={styles.detailText}>
            <Text style={styles.label}>Barangay:</Text> {user.barangay || 'Not set'}
          </Text>
          {user.createdAt && (
            <Text style={styles.detailTextMuted}>
              <Text style={styles.label}>Member Since:</Text>{" "}
              {new Date(user.createdAt.seconds * 1000).toLocaleDateString()}
            </Text>
          )}
        </View>
      ) : (
        <Text style={styles.infoText}>Profile information is not available.</Text>
      )}

      {!user && (
        <Button
          title="Complete Your Profile"
          onPress={() => router.push('/profile-setup')}
          color="#1E90FF"
        />
      )}

      <View style={styles.logoutButtonContainer}>
        <Button title="Logout" onPress={handleLogout} color="#E53935" />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f4f6f8',
  },
  profileCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    width: '100%',
    maxWidth: 500,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 20,
  },
  header: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 15,
    color: '#007bff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 10,
  },
  label: { fontWeight: 'bold', color: '#555' },
  detailText: { fontSize: 16, marginBottom: 10, lineHeight: 24, color: '#444' },
  detailTextMuted: { fontSize: 14, color: '#777', marginTop: 5 },
  infoText: { fontSize: 16, color: '#666', marginTop: 20 },
  logoutButtonContainer: { marginTop: 30, width: '80%', maxWidth: 300 },
});
