import React, { useRef, useState } from 'react';
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
import { SelectModal } from '@/components/ui/SelectModal';

const GRADE_OPTIONS = [
  'Grade 6',
  'Grade 7',
  'Grade 8',
  'Grade 9',
  'Grade 10',
  'Grade 11',
  'Grade 12',
];

const SECTION_OPTIONS = [
  'Section A',
  'Section B',
  'Section C',
  'Section D',
  'Section E',
  'N/A',
];

export default function SignUpScreen() {
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);
  const { signUp, isConfigured } = useAuth();

  // Form States
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [gradeClass, setGradeClass] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [section, setSection] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  // Modal Pickers State
  const [gradeModalVisible, setGradeModalVisible] = useState(false);
  const [sectionModalVisible, setSectionModalVisible] = useState(false);

  // Status & Success View
  const [loading, setLoading] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [hasSession, setHasSession] = useState(false);
  const [signUpError, setSignUpError] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!fullName.trim()) newErrors.fullName = 'Full Name is required';
    
    if (!email.trim()) {
      newErrors.email = 'Email ID is required';
    } else if (!/\S+@\S+\.\S+/.test(email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!gradeClass) newErrors.gradeClass = 'Please select your Grade / Class';
    if (!schoolName.trim()) newErrors.schoolName = 'School/College Name is required';
    if (!section) newErrors.section = 'Please select your Section';

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters long';
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!agreeToTerms) {
      newErrors.terms = 'You must agree to the Terms & Conditions';
    }

    setErrors(newErrors);
    
    if (Object.keys(newErrors).length > 0) {
      const firstErr = Object.values(newErrors)[0];
      setSignUpError(`Please fix errors: ${firstErr}`);
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
      return false;
    }

    setSignUpError('');
    return true;
  };

  const handleSignUp = async () => {
    setSignUpError('');
    if (!validateForm()) return;

    setLoading(true);
    const { data, error } = await signUp({
      fullName,
      email,
      mobileNumber,
      gradeClass,
      schoolName,
      section,
      password,
      confirmPassword,
      agreeToTerms,
    });
    setLoading(false);

    if (error) {
      if (!isConfigured) {
        setSignupSuccess(true);
        setHasSession(true);
      } else {
        const msg = error.message || 'Could not create account. Please check your details.';
        setSignUpError(msg);
        scrollViewRef.current?.scrollTo({ y: 0, animated: true });
        if (Platform.OS !== 'web') {
          Alert.alert('Registration Failed', msg);
        }
      }
    } else {
      setSignupSuccess(true);
      setHasSession(Boolean(data?.session));
    }
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(auth)/sign-in');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
      >
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Top Bar */}
          <View style={styles.topBar}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={handleBack}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={20} color="#1F2937" />
            </TouchableOpacity>
          </View>

          {signupSuccess ? (
            /* SIGNUP DONE SUCCESS SCREEN */
            <View style={styles.successCard}>
              <View style={styles.successIconBadge}>
                <Ionicons name="checkmark-circle" size={68} color="#10B981" />
              </View>
              <Text style={styles.successTitle}>Signup Done! 🎉</Text>
              <Text style={styles.successSubtitle}>
                Your account for <Text style={styles.boldText}>{fullName}</Text> has been created successfully.
              </Text>

              <View style={styles.detailBox}>
                <Text style={styles.detailLabel}>Email: <Text style={styles.detailVal}>{email}</Text></Text>
                <Text style={styles.detailLabel}>Class: <Text style={styles.detailVal}>{gradeClass} ({section})</Text></Text>
                <Text style={styles.detailLabel}>School: <Text style={styles.detailVal}>{schoolName}</Text></Text>
              </View>

              {!hasSession && (
                <Text style={styles.infoNote}>
                  💡 Note: If email confirmation is enabled in your Supabase project, please check your inbox to verify your email. Otherwise, tap Sign In below!
                </Text>
              )}

              <TouchableOpacity
                style={styles.submitButton}
                onPress={() => {
                  if (hasSession) {
                    router.replace('/(tabs)');
                  } else {
                    router.push('/(auth)/sign-in');
                  }
                }}
                activeOpacity={0.8}
              >
                <Text style={styles.submitButtonText}>
                  {hasSession ? 'Go to Home Screen' : 'Proceed to Sign In'}
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            /* SIGNUP FORM */
            <>
              {/* Header Title Section */}
              <View style={styles.headerSection}>
                <View style={styles.badgePill}>
                  <Text style={styles.badgeText}>• STUDENT REGISTRATION</Text>
                </View>
                <Text style={styles.headerTitle}>Create Your Account</Text>
                <Text style={styles.headerSubtitle}>
                  Start your science learning journey.
                </Text>
              </View>

              {/* Error Banner */}
              {signUpError ? (
                <View style={styles.errorBanner}>
                  <Ionicons name="alert-circle" size={20} color="#EF4444" style={{ marginRight: 8 }} />
                  <Text style={styles.errorBannerText}>{signUpError}</Text>
                </View>
              ) : null}

              {/* SECTION 1: PERSONAL & CONTACT */}
              <View style={styles.sectionCard}>
                <Text style={styles.sectionHeaderTitle}>1. PERSONAL & CONTACT</Text>
                <View style={styles.divider} />

                <AuthInput
                  label="Full Name"
                  iconName="person-outline"
                  placeholder="Enter your full name"
                  value={fullName}
                  onChangeText={(text) => {
                    setFullName(text);
                    if (signUpError) setSignUpError('');
                    if (errors.fullName) setErrors((prev) => ({ ...prev, fullName: '' }));
                  }}
                  error={errors.fullName}
                />

                <AuthInput
                  label="Email ID"
                  iconName="mail-outline"
                  placeholder="Enter your email address"
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    if (signUpError) setSignUpError('');
                    if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
                  }}
                  error={errors.email}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />

                <AuthInput
                  label="Mobile Number"
                  labelRightText="Optional"
                  iconName="phone-portrait-outline"
                  placeholder="Enter 10-digit mobile number"
                  value={mobileNumber}
                  onChangeText={(text) => setMobileNumber(text)}
                  keyboardType="phone-pad"
                  maxLength={10}
                />
              </View>

              {/* SECTION 2: ACADEMIC DETAILS */}
              <View style={styles.sectionCard}>
                <Text style={styles.sectionHeaderTitle}>2. ACADEMIC DETAILS</Text>
                <View style={styles.divider} />

                <AuthInput
                  label="Grade / Class"
                  iconName="school-outline"
                  placeholder="Select your class (Grade 6–12)"
                  displayValue={gradeClass}
                  isSelectable
                  onPressSelect={() => setGradeModalVisible(true)}
                  error={errors.gradeClass}
                />

                <AuthInput
                  label="School / College Name"
                  iconName="business-outline"
                  placeholder="Enter school or college name"
                  value={schoolName}
                  onChangeText={(text) => {
                    setSchoolName(text);
                    if (signUpError) setSignUpError('');
                    if (errors.schoolName) setErrors((prev) => ({ ...prev, schoolName: '' }));
                  }}
                  error={errors.schoolName}
                />

                <AuthInput
                  label="Section"
                  iconName="pricetag-outline"
                  placeholder="Select your section"
                  displayValue={section}
                  isSelectable
                  onPressSelect={() => setSectionModalVisible(true)}
                  error={errors.section}
                />
              </View>

              {/* SECTION 3: ACCOUNT SECURITY */}
              <View style={styles.sectionCard}>
                <Text style={styles.sectionHeaderTitle}>3. ACCOUNT SECURITY</Text>
                <View style={styles.divider} />

                <AuthInput
                  label="Password"
                  iconName="lock-closed-outline"
                  placeholder="Create a password (min. 6 characters)"
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (signUpError) setSignUpError('');
                    if (errors.password) setErrors((prev) => ({ ...prev, password: '' }));
                  }}
                  isPassword
                  error={errors.password}
                />

                <AuthInput
                  label="Confirm Password"
                  iconName="key-outline"
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChangeText={(text) => {
                    setConfirmPassword(text);
                    if (signUpError) setSignUpError('');
                    if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: '' }));
                  }}
                  isPassword
                  error={errors.confirmPassword}
                />
              </View>

              {/* SECTION 4: TERMS & VERIFICATION */}
              <View style={styles.sectionCard}>
                <Text style={styles.sectionHeaderTitle}>4. TERMS & VERIFICATION</Text>
                <View style={styles.divider} />

                <TouchableOpacity
                  style={styles.checkboxContainer}
                  onPress={() => {
                    setAgreeToTerms(!agreeToTerms);
                    if (signUpError) setSignUpError('');
                    if (errors.terms) setErrors((prev) => ({ ...prev, terms: '' }));
                  }}
                  activeOpacity={0.8}
                >
                  <View
                    style={[
                      styles.checkbox,
                      agreeToTerms && styles.checkboxActive,
                      errors.terms ? styles.checkboxError : null,
                    ]}
                  >
                    {agreeToTerms && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}
                  </View>
                  <Text style={styles.checkboxLabel}>
                    I agree to the <Text style={styles.linkText}>Terms & Conditions</Text> and{' '}
                    <Text style={styles.linkText}>Privacy Policy.</Text>
                  </Text>
                </TouchableOpacity>
                {errors.terms ? <Text style={styles.errorText}>{errors.terms}</Text> : null}
              </View>

              {/* Create Account Button */}
              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleSignUp}
                disabled={loading}
                activeOpacity={0.8}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.submitButtonText}>Create Account</Text>
                )}
              </TouchableOpacity>

              {/* Footer Section */}
              <View style={styles.footerSection}>
                <Text style={styles.footerText}>
                  Already have an account?{' '}
                  <Text
                    style={styles.footerLinkText}
                    onPress={() => router.push('/(auth)/sign-in')}
                  >
                    Sign In
                  </Text>
                </Text>
              </View>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Select Modals */}
      <SelectModal
        visible={gradeModalVisible}
        title="Select Grade / Class"
        options={GRADE_OPTIONS}
        selectedValue={gradeClass}
        onSelect={(val) => {
          setGradeClass(val);
          if (signUpError) setSignUpError('');
          if (errors.gradeClass) setErrors((prev) => ({ ...prev, gradeClass: '' }));
        }}
        onClose={() => setGradeModalVisible(false)}
      />

      <SelectModal
        visible={sectionModalVisible}
        title="Select Section"
        options={SECTION_OPTIONS}
        selectedValue={section}
        onSelect={(val) => {
          setSection(val);
          if (signUpError) setSignUpError('');
          if (errors.section) setErrors((prev) => ({ ...prev, section: '' }));
        }}
        onClose={() => setSectionModalVisible(false)}
      />
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
    paddingBottom: 40,
  },
  topBar: {
    marginBottom: 12,
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
    marginBottom: 16,
  },
  badgePill: {
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 10,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#7C3AED',
    letterSpacing: 0.5,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748B',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderColor: '#FCA5A5',
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
  },
  errorBannerText: {
    flex: 1,
    fontSize: 13,
    color: '#B91C1C',
    fontWeight: '600',
    lineHeight: 18,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  sectionHeaderTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1E293B',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginBottom: 16,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  checkboxActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  checkboxError: {
    borderColor: '#EF4444',
  },
  checkboxLabel: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
    color: '#334155',
    lineHeight: 18,
  },
  linkText: {
    color: '#2563EB',
    fontWeight: '600',
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 6,
    marginLeft: 4,
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
    marginTop: 24,
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
  successCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  successIconBadge: {
    marginBottom: 12,
  },
  successTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
  },
  successSubtitle: {
    fontSize: 14,
    color: '#475569',
    textAlign: 'center',
    marginBottom: 20,
  },
  boldText: {
    fontWeight: '700',
    color: '#0F172A',
  },
  detailBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 16,
    width: '100%',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  detailLabel: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 6,
  },
  detailVal: {
    fontWeight: '700',
    color: '#1E293B',
  },
  infoNote: {
    fontSize: 12,
    color: '#D97706',
    backgroundColor: '#FEF3C7',
    padding: 12,
    borderRadius: 12,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
});
