import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import Constants from 'expo-constants';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import getUserLocation from '../../screens/home/LocationService';
import { useUser } from '../../UserContext';
const baseUrl = Constants.expoConfig?.extra?.baseUrl;
console.log('baseUrl', baseUrl);

export const unstable_settings = {
  headerShown: false,
};

interface ServerError {
  error?: string;
  message?: string;
}

const EMERGENCY_TYPES = [
    { key: 'accident', label: 'Accident', priority: 'High', color: '#E53935', icon: 'car-crash' },
    { key: 'fire', label: 'Fire', priority: 'Critical', color: '#FF5722', icon: 'fire' },
    { key: 'medical', label: 'Medical', priority: 'Critical', color: '#4CAF50', icon: 'medical-bag' },
    { key: 'flood', label: 'Flood', priority: 'High', color: '#2196F3', icon: 'home-flood' },
    { key: 'quake', label: 'Earthquake', priority: 'Critical', color: '#FF9800', icon: 'home-lightning-bolt-outline' },
    { key: 'robbery', label: 'Robbery', priority: 'High', color: '#9C27B0', icon: 'account-alert' },
    { key: 'assault', label: 'Assault', priority: 'High', color: '#F44336', icon: 'hand-rock' },
    { key: 'other', label: 'Other', priority: 'Low', color: '#607D8B', icon: 'ellipsis-h' },
];


export default function ReportEmergencyScreen() {
  const [selectedType, setSelectedType] = useState<string>('accident');
  const [customType, setCustomType] = useState<string>('');
  const [location, setLocation] = useState<string>('Fetching location…');
  const [manualLocation, setManualLocation] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [attachedImages, setAttachedImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showConfirmation, setShowConfirmation] = useState<boolean>(false);
  const [showCustomTypeModal, setShowCustomTypeModal] = useState<boolean>(false);
  const [showLocationModal, setShowLocationModal] = useState<boolean>(false);
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
      const now = new Date().toISOString();
      const selectedEmergency = EMERGENCY_TYPES.find(e => e.key === selectedType);
      const priority = selectedEmergency?.priority || "Medium";

      const payload = {
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
      const response = await fetch(`${baseUrl}/send-to-admins`, {
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
        console.log(`Submitted successfully`);

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

  const handleTypeSelection = (type: string) => {
    if (type === 'other') {
      setShowCustomTypeModal(true);
    } else {
      setSelectedType(type);
      setCustomType('');
    }
  };

  const handleCustomTypeSubmit = () => {
    if (customType.trim()) {
      setSelectedType('other');
      setShowCustomTypeModal(false);
    }
  };

  const handleImagePicker = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Permission required', 'You need to grant access to your gallery.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
      allowsMultipleSelection: true,
    });

    if (!result.canceled && result.assets) {
      const newImages = result.assets.map(asset => asset.uri);
      setAttachedImages(prev => [...prev, ...newImages].slice(0, 3)); // Max 3 images
    }
  };

  const removeImage = (index: number) => {
    setAttachedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleLocationChange = () => {
    setShowLocationModal(true);
  };

  const handleManualLocationSubmit = () => {
    if (manualLocation.trim()) {
      setLocation(manualLocation.trim());
      setShowLocationModal(false);
    }
  };

  const getSelectedTypeLabel = () => {
    if (selectedType === 'other' && customType) {
      return customType;
    }
    return EMERGENCY_TYPES.find(t => t.key === selectedType)?.label || 'Unknown';
  };


  const handleSubmitConfirmation = () => {
    setShowConfirmation(true);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 5}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <MaterialCommunityIcons name="alert-circle" size={28} color="#fff" />
          <Text style={styles.headerTitle}>Report Emergency</Text>
        </View>
        <View style={styles.placeholder} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Emergency Type Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Emergency Type</Text>
          <Text style={styles.sectionSubtitle}>Select the type of emergency you&apos;re reporting</Text>
          <View style={styles.typeGrid}>
            {EMERGENCY_TYPES.map((type) => (
              <TouchableOpacity
                key={type.key}
                style={[
                  styles.typeItem,
                  selectedType === type.key && styles.typeItemSelected,
                  isLoading && styles.disabled
                ]}
                onPress={() => !isLoading && handleTypeSelection(type.key)}
                activeOpacity={0.8}
                disabled={isLoading}
              >
                <MaterialCommunityIcons 
                  name={type.icon as any} 
                  size={32} 
                  color={selectedType === type.key ? type.color : (isLoading ? '#ccc' : '#999')} 
                />
                <Text style={[
                  styles.typeLabel,
                  selectedType === type.key && { color: type.color, fontWeight: 'bold' },
                  isLoading && { color: '#ccc'}
                ]}>{type.label}</Text>
                {selectedType === type.key && type.key === 'other' && customType && (
                  <Text style={styles.customTypeLabel}>{customType}</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>


        {/* Location */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location</Text>
          <Text style={styles.sectionSubtitle}>Where is this emergency occurring?</Text>
          <View style={styles.locationBox}>
            <Ionicons name="location-outline" size={20} color="#0a7ea4" style={{ marginRight: 8 }} />
            <Text style={styles.locationText} numberOfLines={2}>{location}</Text>
            <TouchableOpacity
              style={[styles.changeButton, isLoading && styles.disabled]}
              onPress={handleLocationChange}
              disabled={isLoading}
            >
              <Text style={[styles.changeButtonText, isLoading && { color: '#ccc'}]}>Change</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.sectionSubtitle}>Provide details about the emergency</Text>
          <View style={styles.textAreaContainer}>
            <TextInput
              style={[styles.textArea, isLoading && styles.disabledInput]}
              placeholder="Describe the emergency in detail..."
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              editable={!isLoading}
              maxLength={500}
            />
            <Text style={styles.characterCount}>{description.length}/500</Text>
          </View>
        </View>

        {/* Image Attachments */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Attach Photos (Optional)</Text>
          <Text style={styles.sectionSubtitle}>Add photos to help responders understand the situation</Text>
          <View style={styles.imageContainer}>
            {attachedImages.map((uri, index) => (
              <View key={index} style={styles.imageWrapper}>
                <Image source={{ uri }} style={styles.attachedImage} />
                <TouchableOpacity 
                  style={styles.removeImageButton}
                  onPress={() => removeImage(index)}
                  disabled={isLoading}
                >
                  <Ionicons name="close-circle" size={20} color="#fff" />
                </TouchableOpacity>
              </View>
            ))}
            {attachedImages.length < 3 && (
              <TouchableOpacity 
                style={[styles.addImageButton, isLoading && styles.disabled]}
                onPress={handleImagePicker}
                disabled={isLoading}
              >
                <Ionicons name="camera" size={24} color="#0a7ea4" />
                <Text style={styles.addImageText}>Add Photo</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Submit Button */}
      <TouchableOpacity
        style={[styles.submitButton, isLoading && styles.submitButtonLoading]}
        onPress={handleSubmitConfirmation}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.submitButtonText}>Submit Emergency Report</Text>
        )}
      </TouchableOpacity>

      {/* Custom Type Modal */}
      <Modal visible={showCustomTypeModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Specify Emergency Type</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Enter emergency type..."
              value={customType}
              onChangeText={setCustomType}
              autoFocus
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowCustomTypeModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleCustomTypeSubmit}
              >
                <Text style={styles.confirmButtonText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Location Modal */}
      <Modal visible={showLocationModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Enter Location Manually</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Enter location address..."
              value={manualLocation}
              onChangeText={setManualLocation}
              autoFocus
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowLocationModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleManualLocationSubmit}
              >
                <Text style={styles.confirmButtonText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Confirmation Modal */}
      <Modal visible={showConfirmation} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.confirmationModal}>
            <MaterialCommunityIcons name="alert-circle" size={48} color="#FF5722" />
            <Text style={styles.confirmationTitle}>Confirm Emergency Report</Text>
            <Text style={styles.confirmationText}>
              You are about to submit a {getSelectedTypeLabel().toLowerCase()} emergency report.
            </Text>
            <Text style={styles.confirmationSubtext}>
              This will notify emergency responders immediately.
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowConfirmation(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.confirmButton]}
                onPress={() => {
                  setShowConfirmation(false);
                  handleSubmit();
                }}
              >
                <Text style={styles.confirmButtonText}>Submit Report</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#0a7ea4',
    paddingTop: Constants.statusBarHeight + 10,
    paddingBottom: 15,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backButton: {
    padding: 8,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 8,
  },
  placeholder: {
    width: 40,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  section: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 16,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  typeItem: {
    width: '23%',
    aspectRatio: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#e9ecef',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  typeItemSelected: {
    borderColor: '#0a7ea4',
    backgroundColor: '#f0f8ff',
    elevation: 4,
    shadowOpacity: 0.15,
  },
  typeLabel: {
    fontSize: 11,
    color: '#495057',
    marginTop: 6,
    textAlign: 'center',
    fontWeight: '500',
  },
  customTypeLabel: {
    fontSize: 9,
    color: '#0a7ea4',
    marginTop: 2,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  locationBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  locationText: {
    flex: 1,
    color: '#495057',
    fontSize: 14,
    lineHeight: 20,
  },
  changeButton: {
    backgroundColor: '#0a7ea4',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginLeft: 12,
  },
  changeButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12,
  },
  textAreaContainer: {
    position: 'relative',
  },
  textArea: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    minHeight: 120,
    fontSize: 15,
    color: '#495057',
    borderWidth: 1,
    borderColor: '#e9ecef',
    textAlignVertical: 'top',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  characterCount: {
    position: 'absolute',
    bottom: 8,
    right: 12,
    fontSize: 12,
    color: '#6c757d',
  },
  imageContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  imageWrapper: {
    position: 'relative',
    width: 80,
    height: 80,
  },
  attachedImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#dc3545',
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addImageButton: {
    width: 80,
    height: 80,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#0a7ea4',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addImageText: {
    fontSize: 10,
    color: '#0a7ea4',
    marginTop: 4,
    fontWeight: '500',
  },
  submitButton: {
    backgroundColor: '#dc3545',
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: Platform.OS === 'ios' ? 30 : 20,
    paddingVertical: 16,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  disabled: {
    opacity: 0.6,
  },
  disabledInput: {
    backgroundColor: '#f8f9fa',
    color: '#6c757d',
  },
  submitButtonLoading: {
    backgroundColor: '#dc3545',
    opacity: 0.8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  confirmationModal: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 16,
    textAlign: 'center',
  },
  confirmationTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginTop: 16,
    marginBottom: 12,
    textAlign: 'center',
  },
  confirmationText: {
    fontSize: 16,
    color: '#495057',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 22,
  },
  confirmationSubtext: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
    marginBottom: 24,
  },
  modalInput: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#495057',
    borderWidth: 1,
    borderColor: '#e9ecef',
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#6c757d',
  },
  confirmButton: {
    backgroundColor: '#0a7ea4',
  },
  cancelButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  confirmButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});
