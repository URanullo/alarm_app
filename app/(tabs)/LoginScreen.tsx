import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from 'react-native';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Handle login button press
  const handleLogin = () => {
    // TODO: Add validation and authentication logic
    alert(`Email: ${email}\nPassword: ${password}`);
  };

  // Handle forgot password press
  const handleForgotPassword = () => {
    // TODO: Navigate to forgot password screen
    alert('Forgot password?');
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={styles.container}>
          <Text style={styles.title}>Let's sign you in.</Text>
          <Text style={styles.subtitle}>Welcome back.</Text>

          {/* Email Field */}
          <Text style={styles.label}>Email</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="mail-outline" size={20} color="#888" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Your email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              placeholderTextColor="#bbb"
              textContentType="emailAddress"
              accessibilityLabel="Email"
              returnKeyType="next"
            />
          </View>

          {/* Password Field */}
          <Text style={styles.label}>Password</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color="#888" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Enter password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              placeholderTextColor="#bbb"
              textContentType="password"
              accessibilityLabel="Password"
              returnKeyType="done"
            />
            <TouchableOpacity
              onPress={() => setShowPassword((prev) => !prev)}
              accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
              style={styles.eyeButton}
            >
              <Ionicons
                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                size={20}
                color="#bbb"
              />
            </TouchableOpacity>
          </View>

          {/* Forgot Password Link */}
          <TouchableOpacity style={styles.forgotContainer} onPress={handleForgotPassword}>
            <Text style={styles.forgotText}>Forgot password?</Text>
          </TouchableOpacity>

          {/* Login Button */}
          <TouchableOpacity
            style={[styles.button, !(email && password) && styles.buttonDisabled]}
            onPress={handleLogin}
            activeOpacity={0.85}
            disabled={!(email && password)}
            accessibilityRole="button"
            accessibilityLabel="Login"
          >
            <Text style={styles.buttonText}>Login</Text>
          </TouchableOpacity>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#E53935',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#222',
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    color: '#222',
    marginBottom: 6,
    marginTop: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 10,
    marginBottom: 8,
    backgroundColor: '#fafafa',
    height: 48,
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: 44,
    fontSize: 15,
    color: '#222',
  },
  eyeButton: {
    padding: 4,
  },
  forgotContainer: {
    alignItems: 'flex-end',
    marginBottom: 24,
  },
  forgotText: {
    color: '#E53935',
    fontWeight: 'bold',
    fontSize: 13,
  },
  button: {
    backgroundColor: '#E53935',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  buttonDisabled: {
    backgroundColor: '#ffb3b3',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
}); 