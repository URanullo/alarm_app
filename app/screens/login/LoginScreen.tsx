import { useRouter } from 'expo-router';
import { signInWithEmailAndPassword } from 'firebase/auth';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet
} from 'react-native';
import { auth } from '../../services/firebaseConfig';
import LoginForm from './LoginForm';


export default function LoginScreen() {
  const router = useRouter();

  const handleLogin = async (email: string, password: string) => {

    console.log('Login attempt with:', email, password);
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('Login successful:', userCredential.user);
    } catch (error) {
      Alert.alert('Login Failed', error.message);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <LoginForm onSubmit={handleLogin} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}


const styles = StyleSheet.create({
scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center', // center when space available
    padding: 24,
    backgroundColor: '#fff',
  },
});