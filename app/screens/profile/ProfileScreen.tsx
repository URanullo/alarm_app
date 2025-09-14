import { useRouter } from 'expo-router';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, Timestamp } from 'firebase/firestore';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Button,
  RefreshControl, ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { auth, db } from '../../services/firebaseConfig';

export interface UserProfile {
  uid: string;
  email: string;
  firstName: string;
  lastName: string;
  barangay: string;
  contactNumber: string;
  role?: string;
  createdAt: Timestamp; // Assuming you store this
  // ... any other fields
}

export default function ProfileScreen() {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [refreshing, setRefreshing] = useState(false);
    const router = useRouter();

    // ... (fetchUserProfile function remains the same) ...
    const fetchUserProfile = async (uid: string) => {
      console.log("Fetching profile for UID:", uid);
      setIsLoading(true);
      setError(null);
      try {
        const userDocRef = doc(db, 'users', uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const profileData = userDocSnap.data() as UserProfile;
          setUserProfile(profileData);
        } else {
          console.warn('No such user profile document in Firestore for UID:', uid);
          setError('User profile not found. Please complete your profile or contact support.');
          setUserProfile(null);
        }
      } catch (e: any) {
        console.error('Error fetching user profile:', e);
        setError(`Failed to load profile: ${e.message}`);
        setUserProfile(null);
      } finally {
        setIsLoading(false);
        setRefreshing(false);
      }
    };

    useEffect(() => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
          setCurrentUser(user);
          fetchUserProfile(user.uid);
        } else {
          setCurrentUser(null);
          setUserProfile(null);
          setIsLoading(false);
          // Optional: Redirect to login, e.g., router.replace('/login');
        }
      });
      return () => unsubscribe();
    }, []);

    const handleLogout = async () => {
      Alert.alert(
        "Confirm",
        "Are you sure you want to log out?",
        [
          {
            text: "Cancel",
            onPress: () => console.log("Logout canceled"),
            style: "cancel"
          },
          {
            text: "Logout",
            onPress: async () => {
              try {
                await auth.signOut();
                console.log("User signed out successfully");
              } catch (e: any) {
                Alert.alert("Logout Error", e.message);
              }
            },
            style: "destructive"
          }
        ],
        { cancelable: true }
      );
    };

    const onRefresh = useCallback(() => {
      if (currentUser?.uid) {
        setRefreshing(true);
        fetchUserProfile(currentUser.uid);
      }
    }, [currentUser]);

    if (isLoading && !userProfile && !refreshing) {
      return (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#007bff" />
          <Text style={styles.loadingText}>Loading Profile...</Text>
        </View>
      );
    }

    return (
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#007bff"]} />
        }
      >
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            {currentUser?.uid && <Button title="Retry Loading Profile" onPress={() => fetchUserProfile(currentUser.uid)} color="#ff6347" />}
          </View>
        )}

        {currentUser && userProfile ? (
          <View style={styles.profileCard}>
            <Text style={styles.header}>Your Profile:</Text>
            <Text style={styles.detailText}><Text style={styles.label}>Name:</Text> {userProfile.firstName} {userProfile.lastName}</Text>
            <Text style={styles.detailText}><Text style={styles.label}>Email:</Text> {userProfile.email}</Text>
            <Text style={styles.detailText}><Text style={styles.label}>Contact No:</Text> {userProfile.contactNumber || 'Not provided'}</Text>
            <Text style={styles.detailText}><Text style={styles.label}>Barangay:</Text> {userProfile.barangay || 'Not set'}</Text>
            {userProfile.role && <Text style={styles.detailText}><Text style={styles.label}>Role:</Text> {userProfile.role}</Text>}
            {userProfile.createdAt && (
              <Text style={styles.detailTextMuted}>
                <Text style={styles.label}>Member Since:</Text> {new Date(userProfile.createdAt.seconds * 1000).toLocaleDateString()}
              </Text>
            )}
          </View>
        ) : (
          !isLoading && !error && <Text style={styles.infoText}>Profile information is not available at the moment.</Text>
        )}

        {!userProfile && currentUser && !isLoading && error?.includes('profile not found') && (
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

  // ... (styles remain the same)
  const styles = StyleSheet.create({
    container: {
      flexGrow: 1,
      alignItems: 'center',
      padding: 20,
      backgroundColor: '#f4f6f8',
    },
    centered: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#f4f6f8',
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 25,
      color: '#333',
      textAlign: 'center',
    },
    profileCard: {
      backgroundColor: '#fff',
      borderRadius: 10,
      padding: 20,
      width: '100%',
      maxWidth: 500,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
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
    label: {
      fontWeight: 'bold',
      color: '#555',
    },
    detailText: {
      fontSize: 16,
      marginBottom: 10,
      lineHeight: 24,
      color: '#444',
    },
    detailTextMuted: {
        fontSize: 14,
        color: '#777',
        marginTop: 5,
    },
    loadingText: {
      marginTop: 10,
      fontSize: 16,
      color: '#555',
    },
    infoText: {
      fontSize: 16,
      color: '#666',
      textAlign: 'center',
      marginTop: 20,
    },
    errorContainer: {
      backgroundColor: '#ffebee',
      padding: 15,
      borderRadius: 8,
      marginVertical: 15,
      width: '100%',
      maxWidth: 500,
      alignItems: 'center',
    },
    errorText: {
      color: '#c62828',
      fontSize: 15,
      textAlign: 'center',
      marginBottom: 10,
    },
    logoutButtonContainer: {
      marginTop: 30,
      width: '80%',
      maxWidth: 300,
    },
  });