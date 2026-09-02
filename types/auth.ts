import { Session, User } from '@supabase/supabase-js';

export type SignInMode = 'password' | 'otp';

export interface SignUpFormData {
  fullName: string;
  email: string;
  mobileNumber?: string;
  gradeClass: string;
  schoolName: string;
  section: string;
  password: string;
  confirmPassword: string;
  agreeToTerms: boolean;
}

export interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isConfigured: boolean;
}

export interface AuthContextType extends AuthState {
  signInWithPassword: (identifier: string, password: string) => Promise<{ error: Error | null }>;
  signInWithOtp: (identifier: string) => Promise<{ error: Error | null }>;
  verifyOtp: (identifier: string, token: string) => Promise<{ error: Error | null }>;
  signUp: (formData: SignUpFormData) => Promise<{ data?: any; error: Error | null }>;
  signOut: () => Promise<{ error: Error | null }>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
}
