import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useMutation } from '@tanstack/react-query';

import { AuthStackParamList } from '../../types';
import { registerApi, createUserProfileApi } from '../../api/authApi';
import { useAuthStore } from '../../store/authStore';
import COLORS from '../../constants/colors';
import Button from '../../components/Button';
import Input from '../../components/Input';

type Props = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'Register'>;
};

interface FormState {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  username: string;
  password: string;
  confirmPassword: string;
}

const INITIAL: FormState = {
  firstName: '',
  lastName: '',
  email: '',
  phoneNumber: '',
  username: '',
  password: '',
  confirmPassword: '',
};

const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const [form, setForm] = useState<FormState>(INITIAL);
  const [errors, setErrors] = useState<Partial<FormState>>({});
  const [isProcessing, setIsProcessing] = useState(false);

  const login = useAuthStore((s) => s.login);

  const set = (field: keyof FormState) => (value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  // ── Validation ────────────────────────────────────────────────────
  const validate = (): boolean => {
    const e: Partial<FormState> = {};
    if (!form.firstName.trim()) e.firstName = 'Required';
    if (!form.lastName.trim()) e.lastName = 'Required';
    if (!form.email.trim()) e.email = 'Required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Invalid email';
    if (!form.phoneNumber.trim()) e.phoneNumber = 'Required';
    else if (!/^\d{7,15}$/.test(form.phoneNumber.trim())) e.phoneNumber = 'Enter a valid phone number';
    if (!form.username.trim()) e.username = 'Required';
    else if (form.username.trim().length < 3) e.username = 'Min 3 characters';
    if (!form.password) e.password = 'Required';
    else if (form.password.length < 6) e.password = 'Min 6 characters';
    if (!form.confirmPassword) e.confirmPassword = 'Required';
    else if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Registration flow: signup → login → create profile ───────────
  const handleRegister = async () => {
    if (!validate()) return;
    setIsProcessing(true);
    try {
      // Step 1: create auth account — response already contains JWT tokens
      const signupResult = await registerApi({
        username: form.username.trim(),
        password: form.password,
        first_name: form.firstName.trim(),
        last_name: form.lastName.trim(),
        email: form.email.trim(),
        phone_number: parseInt(form.phoneNumber.trim(), 10),
      });

      const userId = signupResult.userId ?? 'unknown';

      // Step 2: create user profile (best-effort, non-blocking)
      createUserProfileApi({
        user_id: userId,
        first_name: form.firstName.trim(),
        last_name: form.lastName.trim(),
        email: form.email.trim(),
        phone_number: parseInt(form.phoneNumber.trim(), 10),
      }).catch(() => {
        // Profile creation failing is non-fatal
      });

      // Step 3: set auth state → AppNavigator switches to MainNavigator
      login(signupResult.accessToken, signupResult.token, userId);
    } catch (error) {
      Alert.alert('Registration Failed', (error as Error).message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={22} color={COLORS.white} />
          </TouchableOpacity>
          <View style={styles.logoWrap}>
            <Ionicons name="wallet" size={32} color={COLORS.white} />
          </View>
          <Text style={styles.appName}>Create Account</Text>
          <Text style={styles.tagline}>Start tracking your finances today</Text>
        </View>

        {/* Form card */}
        <View style={styles.card}>
          <View style={styles.row}>
            <Input
              label="First Name"
              placeholder="John"
              value={form.firstName}
              onChangeText={set('firstName')}
              autoCapitalize="words"
              error={errors.firstName}
              style={styles.halfInput}
            />
            <Input
              label="Last Name"
              placeholder="Doe"
              value={form.lastName}
              onChangeText={set('lastName')}
              autoCapitalize="words"
              error={errors.lastName}
              style={styles.halfInput}
            />
          </View>

          <Input
            label="Email"
            placeholder="john@example.com"
            value={form.email}
            onChangeText={set('email')}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            leftIcon="mail-outline"
            error={errors.email}
          />

          <Input
            label="Phone Number"
            placeholder="e.g. 9876543210"
            value={form.phoneNumber}
            onChangeText={set('phoneNumber')}
            keyboardType="phone-pad"
            leftIcon="call-outline"
            error={errors.phoneNumber}
          />

          <Input
            label="Username"
            placeholder="johndoe"
            value={form.username}
            onChangeText={set('username')}
            autoCapitalize="none"
            autoCorrect={false}
            leftIcon="person-outline"
            error={errors.username}
          />

          <Input
            label="Password"
            placeholder="Min 6 characters"
            value={form.password}
            onChangeText={set('password')}
            secureTextEntry
            leftIcon="lock-closed-outline"
            error={errors.password}
          />

          <Input
            label="Confirm Password"
            placeholder="Re-enter password"
            value={form.confirmPassword}
            onChangeText={set('confirmPassword')}
            secureTextEntry
            leftIcon="lock-closed-outline"
            error={errors.confirmPassword}
          />

          <Button
            title="Create Account"
            onPress={handleRegister}
            loading={isProcessing}
            style={styles.btn}
          />

          <View style={styles.linkRow}>
            <Text style={styles.linkText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={styles.link}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.primary },
  content: { flexGrow: 1, paddingBottom: 40 },

  header: { alignItems: 'center', paddingTop: 56, paddingBottom: 32, gap: 6 },
  backBtn: {
    position: 'absolute',
    top: 56,
    left: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoWrap: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  appName: { fontSize: 22, fontWeight: '800', color: COLORS.white },
  tagline: { fontSize: 13, color: 'rgba(255,255,255,0.8)' },

  card: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingTop: 28,
    flex: 1,
  },
  row: { flexDirection: 'row', gap: 12 },
  halfInput: { flex: 1 },

  btn: { marginTop: 8 },
  linkRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  linkText: { fontSize: 14, color: COLORS.textSecondary },
  link: { fontSize: 14, color: COLORS.primary, fontWeight: '600' },
});

export default RegisterScreen;
