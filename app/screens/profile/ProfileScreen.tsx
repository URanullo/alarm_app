import * as ImagePicker from 'expo-image-picker';
import type { Auth } from 'firebase/auth';
import { getAuth, updateProfile } from 'firebase/auth';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useUser } from '../../UserContext';
import { storage } from '../../services/firebaseConfig';

export default function ProfileScreen() {
  const { user, logout } = useUser();
  const auth: Auth = getAuth();
  const [loading, setLoading] = useState(false);

  const displayName = useMemo(() => {
    if (!user) return 'Guest';
    try {
      const anyUser: any = user as any;
      if (anyUser?.firstName || anyUser?.lastName) {
        return `${anyUser.firstName || ''} ${anyUser.lastName || ''}`.trim();
      }
      return (anyUser?.displayName || anyUser?.email || 'User') as string;
    } catch {
      return 'User';
    }
  }, [user]);

  const emailOrId = useMemo(() => {
    if (!user) return '';
    try {
      const anyUser: any = user as any;
      return (anyUser?.email || anyUser?.uid || '') as string;
    } catch {
      return '';
    }
  }, [user]);

  const avatarUri = useMemo(() => {
    if (!user) return '';
    try {
      const anyUser: any = user as any;
      return (anyUser?.photoURL || anyUser?.profilePhotoUrl || '') as string;
    } catch {
      return '';
    }
  }, [user]);

  const initials = useMemo(() => {
    try {
      const parts = displayName.split(' ').filter(Boolean);
      const letters = parts.slice(0, 2).map(p => p[0]?.toUpperCase()).join('');
      return letters || 'U';
    } catch {
      return 'U';
    }
  }, [displayName]);

  const memberSince = useMemo(() => {
    if (!user) return undefined;
    try {
      const anyUser: any = user as any;
      if (anyUser?.createdAt?.seconds) {
        return new Date(anyUser.createdAt.seconds * 1000).toLocaleDateString();
      }
      if (anyUser?.metadata?.creationTime) {
        return new Date(anyUser.metadata.creationTime).toLocaleDateString();
      }
      return undefined;
    } catch {
      return undefined;
    }
  }, [user]);

  const handleLogout = async () => {
    Alert.alert("Confirm", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          try {
            await logout();
          } catch (e: any) {
            Alert.alert("Logout Error", e.message);
          }
        },
      },
    ]);
  };

  const handleEditProfile = async () => {
    if (!user) return;

    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert("Permission required", "You need to grant access to your gallery.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      try {
        setLoading(true);
        const localUri = result.assets[0].uri;

        // Fetch the file as a blob
        const response = await fetch(localUri);
        const blob = await response.blob();

        // Create a storage ref and upload
        const uid = (() => {
          try {
            return (user as any)?.uid || auth.currentUser?.uid || 'unknown-user';
          } catch {
            return auth.currentUser?.uid || 'unknown-user';
          }
        })();
        const imageRef = ref(storage, `profilePhotos/${uid}.jpg`);
        await uploadBytes(imageRef, blob, { contentType: 'image/jpeg' });

        // Get a download URL and update auth profile
        const downloadURL = await getDownloadURL(imageRef);
        if (auth.currentUser) {
          await updateProfile(auth.currentUser, { photoURL: downloadURL });
        }

        Alert.alert("Profile Updated", "Your profile picture has been updated.");
      } catch (err: any) {
        Alert.alert("Error", err.message);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.headerCard}>
        <View style={styles.avatarWrapper}>
          {avatarUri ? (
            <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatarFallback}>
              <Text style={styles.avatarInitials}>{initials}</Text>
            </View>
          )}
        </View>
        <View style={styles.headerTextWrapper}>
          <Text style={styles.nameText}>{displayName}</Text>
          {!!emailOrId && <Text style={styles.emailText}>{emailOrId}</Text>}
          {!!memberSince && (
            <Text style={styles.memberSinceText}>Member since {memberSince}</Text>
          )}
        </View>
        <Pressable style={styles.editButton} onPress={handleEditProfile} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.editButtonText}>Edit Profile</Text>
          )}
        </Pressable>
      </View>

      {user ? (
        <View style={styles.profileCard}>
          <Text style={styles.sectionTitle}>Details</Text>
          <View style={styles.rowItem}>
            <Text style={styles.rowLabel}>Contact No</Text>
            <Text style={styles.rowValue}>
              {(() => {
                try {
                  return (user as any)?.contactNumber || 'Not provided';
                } catch {
                  return 'Not provided';
                }
              })()}
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.rowItem}>
            <Text style={styles.rowLabel}>Barangay</Text>
            <Text style={styles.rowValue}>
              {(() => {
                try {
                  return (user as any)?.barangay || 'Not set';
                } catch {
                  return 'Not set';
                }
              })()}
            </Text>
          </View>
        </View>
      ) : (
        <View style={styles.emptyStateCard}>
          <Text style={styles.infoText}>Profile information is not available.</Text>
        </View>
      )}

      <Pressable style={styles.dangerButton} onPress={handleLogout}>
        <Text style={styles.dangerButtonText}>Logout</Text>
      </Pressable>
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
  headerCard: {
    backgroundColor: '#0a7ea4',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxWidth: 500,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  avatarWrapper: {
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarImage: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 2,
    borderColor: '#e0f2f1',
    backgroundColor: '#d0e7ef',
  },
  avatarFallback: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#d0e7ef',
    borderWidth: 2,
    borderColor: '#e0f2f1',
  },
  avatarInitials: {
    fontSize: 32,
    fontWeight: '700',
    color: '#0a3d62',
  },
  headerTextWrapper: {
    alignItems: 'center',
  },
  nameText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  emailText: {
    fontSize: 14,
    color: '#e6f7ff',
  },
  memberSinceText: {
    fontSize: 12,
    color: '#e6f7ff',
    marginTop: 4,
    opacity: 0.9,
  },
  editButton: {
    marginTop: 14,
    alignSelf: 'center',
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
  },
  editButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  profileCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    maxWidth: 500,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0a3d62',
    marginBottom: 12,
  },
  rowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  rowLabel: {
    color: '#555',
    fontWeight: '600',
  },
  rowValue: {
    color: '#333',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#eee',
    marginVertical: 6,
  },
  emptyStateCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    maxWidth: 500,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
    marginBottom: 20,
    alignItems: 'center',
  },
  infoText: { fontSize: 16, color: '#666', marginTop: 20 },
  dangerButton: {
    marginTop: 10,
    marginBottom: 20,
    backgroundColor: '#E53935',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 10,
    width: '100%',
    maxWidth: 500,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  dangerButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
});
