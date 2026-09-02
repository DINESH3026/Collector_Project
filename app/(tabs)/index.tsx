import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/auth';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const { user, signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      Alert.alert('Error', error.message);
    } else {
      router.replace('/(auth)/sign-in');
    }
  };

  const fullName = user?.user_metadata?.full_name || 'Vigyaan Student';
  const gradeClass = user?.user_metadata?.grade_class || 'Grade N/A';
  const schoolName = user?.user_metadata?.school_name || 'Vigyaan Academy';
  const section = user?.user_metadata?.section || 'N/A';

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* User Card */}
        <View style={styles.card}>
          <View style={styles.avatarContainer}>
            <Ionicons name="person-circle-outline" size={72} color="#2563EB" />
          </View>

          <Text style={styles.welcomeBadge}>✓ AUTHENTICATED</Text>
          <Text style={styles.userName}>{fullName}</Text>
          <Text style={styles.userEmail}>{user?.email || 'student@vigyaan.edu'}</Text>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Ionicons name="school-outline" size={18} color="#64748B" />
            <Text style={styles.infoText}>{gradeClass} • {section}</Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="business-outline" size={18} color="#64748B" />
            <Text style={styles.infoText}>{schoolName}</Text>
          </View>
        </View>

        {/* Sign Out Button */}
        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut} activeOpacity={0.8}>
          <Ionicons name="log-out-outline" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
          <Text style={styles.signOutButtonText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
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
    padding: 24,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    marginBottom: 24,
  },
  avatarContainer: {
    marginBottom: 12,
  },
  welcomeBadge: {
    fontSize: 12,
    fontWeight: '800',
    color: '#059669',
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  userName: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 16,
  },
  divider: {
    height: 1,
    width: '100%',
    backgroundColor: '#F1F5F9',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#334155',
    marginLeft: 8,
  },
  signOutButton: {
    backgroundColor: '#EF4444',
    flexDirection: 'row',
    borderRadius: 14,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  signOutButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
