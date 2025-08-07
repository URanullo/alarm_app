import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function LocationScreen() {
  const router = useRouter();

  const handleAllow = () => {
    router.push('/sos');
  };

  const handleSkip = () => {
    router.push('/sos');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Track your location</Text>
      <Text style={styles.subtitle}>
         Please allow the location!
      </Text>
      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.allowButton} onPress={handleAllow}>
          <Text style={styles.buttonText}>Allow</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <Text style={styles.skipButtonText}>Skip for now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#E53935',
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#222',
    marginBottom: 32,
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
  },
  allowButton: {
    backgroundColor: '#E53935',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 32,
    alignItems: 'center',
    marginRight: 12,
  },
  skipButton: {
    backgroundColor: '#eee',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  skipButtonText: {
    color: '#E53935',
    fontWeight: 'bold',
    fontSize: 16,
  },
}); 