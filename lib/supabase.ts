import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://placeholder-project.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';

export const isSupabaseConfigured = 
  Boolean(process.env.EXPO_PUBLIC_SUPABASE_URL) && 
  process.env.EXPO_PUBLIC_SUPABASE_URL !== 'https://your-supabase-project.supabase.co';

// Robust in-memory fallback storage if native AsyncStorage is null in Expo Go
const memoryStorage = new Map<string, string>();

const SafeAuthStorage = {
  getItem: async (key: string): Promise<string | null> => {
    if (Platform.OS === 'web') {
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          return window.localStorage.getItem(key);
        }
      } catch (e) {
        // Ignore web storage restrictions
      }
      return memoryStorage.get(key) ?? null;
    }

    try {
      return await AsyncStorage.getItem(key);
    } catch (e) {
      // Fallback if AsyncStorage native module is null in Expo Go
      return memoryStorage.get(key) ?? null;
    }
  },
  setItem: async (key: string, value: string): Promise<void> => {
    if (Platform.OS === 'web') {
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem(key, value);
          return;
        }
      } catch (e) {
        // Ignore web storage restrictions
      }
      memoryStorage.set(key, value);
      return;
    }

    try {
      await AsyncStorage.setItem(key, value);
    } catch (e) {
      memoryStorage.set(key, value);
    }
  },
  removeItem: async (key: string): Promise<void> => {
    if (Platform.OS === 'web') {
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.removeItem(key);
          return;
        }
      } catch (e) {
        // Ignore web storage restrictions
      }
      memoryStorage.delete(key);
      return;
    }

    try {
      await AsyncStorage.removeItem(key);
    } catch (e) {
      memoryStorage.delete(key);
    }
  },
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: SafeAuthStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
