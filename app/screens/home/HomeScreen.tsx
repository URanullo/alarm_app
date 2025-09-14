import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { onAuthStateChanged, User, type Auth } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator, Button,
  Dimensions,
  RefreshControl, ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import * as firebaseSvc from '../../services/firebaseConfig';
import { db } from '../../services/firebaseConfig';

export interface UserProfile {
  firstName: string;
  lastName: string;
}

export default function HomeScreen() {
  const [isVolunteer, setIsVolunteer] = useState(false);
  const router = useRouter();
  const authInstance = firebaseSvc.auth as unknown as Auth;
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

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
      const unsubscribe = onAuthStateChanged(authInstance, (user) => {
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
    }, [authInstance]);

  // Navigate to report emergency page
    const handleSOS = () => {
      router.push('/report-emergency');
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
          <Text style={styles.loadingText}>Loading Home...</Text>
        </View>
      );
    }

  return (
        <ScrollView
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#007bff"]} />
          }
        >
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
              {currentUser?.uid && <Button title="Retry Loading Home" onPress={() => fetchUserProfile(currentUser.uid)} color="#ff6347" />}
            </View>
          )}
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
       {currentUser && userProfile ? (
        <View>
          <Text style={styles.hey}>Hey!</Text>
          <Text style={styles.username}>{userProfile.firstName} {userProfile.lastName}</Text>
        </View>
        ) : (
          !isLoading && !error && <Text style={styles.infoText}>Profile information is not available at the moment.</Text>
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
        {/* Animated ripple effect can be added later for polish */}
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
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f4f6f8',
  },
  loadingText: {
    color: '#222',
    marginTop: 8,
  },
  errorContainer: {
    backgroundColor: '#fff5f5',
    borderRadius: 12,
    margin: 16,
    padding: 12,
  },
  errorText: {
    color: '#c53030',
  },
  infoText: {
    color: '#666',
  },
}); 