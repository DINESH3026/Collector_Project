import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/auth';
import { AuthInput } from '@/components/ui/AuthInput';
import { SignInMode } from '@/types/auth';

export default function SignInScreen() {
  const router = useRouter();
  const { signInWithPassword, signInWithOtp, verifyOtp, isConfigured } = useAuth();

  const [mode, setMode] = useState<SignInMode>('password');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!identifier.trim()) {
      newErrors.identifier = 'Please enter your email or mobile number';
    }

    if (mode === 'password' && !password) {
      newErrors.password = 'Please enter your password';
    }

    if (mode === 'otp' && otpSent && !otpCode.trim()) {
      newErrors.otpCode = 'Please enter the verification OTP';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignIn = async () => {
    setAuthError('');
    if (!validateForm()) return;

    setLoading(true);

    if (mode === 'password') {
      const { error } = await signInWithPassword(identifier, password);
      setLoading(false);

      if (error) {
        const msg = error.message || 'Invalid login credentials. If you do not have an account yet, please sign up.';
        setAuthError(msg);
        if (Platform.OS === 'web') {
          console.error('Sign In Error:', msg);
        } else {
          Alert.alert('Sign In Failed', msg, [
            { text: 'Try Again', style: 'cancel' },
            { text: 'Create Account', onPress: () => router.push('/(auth)/sign-up') },
          ]);
        }
      } else {
        router.replace('/(tabs)');
      }
    } else {
      // OTP Mode
      if (!otpSent) {
        const { error } = await signInWithOtp(identifier);
        setLoading(false);

        if (error) {
          setAuthError(error.message || 'Failed to send OTP code');
        } else {
          setOtpSent(true);
          if (Platform.OS !== 'web') {
            Alert.alert('OTP Sent', 'A verification code has been sent.');
          }
        }
      } else {
        const { error } = await verifyOtp(identifier, otpCode);
        setLoading(false);

        if (error) {
          setAuthError(error.message || 'Invalid OTP code');
        } else {
          router.replace('/(tabs)');
        }
      }
    }
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(auth)/sign-up');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Top Decorative Background Circles */}
          <View style={styles.bgCircleTop} />
          <View style={styles.bgCircleBottom} />

          {/* Top Navigation */}
          <View style={styles.topBar}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={handleBack}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={20} color="#1F2937" />
            </TouchableOpacity>
          </View>

          {/* Header & Logo */}
          <View style={styles.headerSection}>
            <View style={styles.logoBadge}>
              <Ionicons name="flask-outline" size={28} color="#9333EA" />
            </View>
            <Text style={styles.headerTitle}>Welcome back!</Text>
            <Text style={styles.headerSubtitle}>
              Continue your science learning journey.
            </Text>
          </View>

          {/* Auth Card */}
          <View style={styles.authCard}>
            {/* Mode Switcher Tabs */}
            <View style={styles.tabContainer}>
              <TouchableOpacity
                style={[
                  styles.tabButton,
                  mode === 'password' && styles.tabButtonActive,
                ]}
                onPress={() => {
                  setMode('password');
                  setOtpSent(false);
                  setAuthError('');
                  setErrors({});
                }}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.tabText,
                    mode === 'password' && styles.tabTextActive,
                  ]}
                >
                  Password
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.tabButton,
                  mode === 'otp' && styles.tabButtonActive,
                ]}
                onPress={() => {
                  setMode('otp');
                  setAuthError('');
                  setErrors({});
                }}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.tabText,
                    mode === 'otp' && styles.tabTextActive,
                  ]}
                >
                  OTP
                </Text>
              </TouchableOpacity>
            </View>

            {/* In-app Error Banner */}
            {authError ? (
              <View style={styles.errorBanner}>
                <Ionicons name="alert-circle" size={20} color="#EF4444" style={{ marginRight: 8 }} />
                <Text style={styles.errorBannerText}>{authError}</Text>
              </View>
            ) : null}

            {/* Input Fields */}
            <AuthInput
              label="Email or Mobile Number"
              iconName="mail-outline"
              placeholder="Enter email or mobile number"
              value={identifier}
              onChangeText={(text) => {
                setIdentifier(text);
                if (authError) setAuthError('');
                if (errors.identifier) setErrors((prev) => ({ ...prev, identifier: '' }));
              }}
              error={errors.identifier}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            {mode === 'password' ? (
              <>
                <AuthInput
                  label="Password"
                  iconName="lock-closed-outline"
                  placeholder="Enter your password"
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (authError) setAuthError('');
                    if (errors.password) setErrors((prev) => ({ ...prev, password: '' }));
                  }}
                  isPassword
                  error={errors.password}
                />

                <TouchableOpacity
                  style={styles.forgotPasswordContainer}
                  onPress={() => router.push('/(auth)/forgot-password')}
                  activeOpacity={0.7}
                >
                  <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                {otpSent && (
                  <AuthInput
                    label="Enter OTP Code"
                    iconName="key-outline"
                    placeholder="Enter 6-digit OTP code"
                    value={otpCode}
                    onChangeText={(text) => {
                      setOtpCode(text);
                      if (authError) setAuthError('');
                      if (errors.otpCode) setErrors((prev) => ({ ...prev, otpCode: '' }));
                    }}
                    keyboardType="number-pad"
                    maxLength={6}
                    error={errors.otpCode}
                  />
                )}
              </>
            )}

            {/* Primary Button */}
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSignIn}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.submitButtonText}>
                  {mode === 'password'
                    ? 'Sign In'
                    : otpSent
                    ? 'Verify & Sign In'
                    : 'Get OTP Code'}
                </Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Footer Link */}
          <View style={styles.footerSection}>
            <Text style={styles.footerText}>
              New to Vigyaan?{' '}
              <Text
                style={styles.footerLinkText}
                onPress={() => router.push('/(auth)/sign-up')}
              >
                Create Account
              </Text>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 30,
  },
  bgCircleTop: {
    position: 'absolute',
    top: -120,
    right: -80,
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: '#EFF6FF',
    opacity: 0.8,
  },
  bgCircleBottom: {
    position: 'absolute',
    bottom: -150,
    left: -100,
    width: 350,
    height: 350,
    borderRadius: 175,
    backgroundColor: '#F3E8FF',
    opacity: 0.3,
  },
  topBar: {
    marginBottom: 16,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoBadge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F3E8FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6,
  },
  headerSubtitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748B',
    textAlign: 'center',
  },
  authCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 14,
    padding: 4,
    marginBottom: 20,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  tabButtonActive: {
    backgroundColor: '#2563EB',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  tabTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderColor: '#FCA5A5',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  errorBannerText: {
    flex: 1,
    fontSize: 13,
    color: '#B91C1C',
    fontWeight: '500',
    lineHeight: 18,
  },
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginTop: -6,
    marginBottom: 20,
  },
  forgotPasswordText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2563EB',
  },
  submitButton: {
    backgroundColor: '#2563EB',
    borderRadius: 14,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  footerSection: {
    alignItems: 'center',
    marginTop: 28,
  },
  footerText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748B',
  },
  footerLinkText: {
    fontWeight: '700',
    color: '#2563EB',
    textDecorationLine: 'underline',
  },
});
