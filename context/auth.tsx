import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { AuthContextType, SignUpFormData } from '@/types/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock user for demo mode when Supabase credentials are not configured yet
const MOCK_DEMO_USER: User = {
  id: 'demo-user-123',
  app_metadata: { provider: 'email' },
  user_metadata: {
    full_name: 'Vigyaan Student (Demo)',
    grade_class: 'Grade 10',
    school_name: 'Vigyaan Science High',
    section: 'Section A',
  },
  aud: 'authenticated',
  created_at: new Date().toISOString(),
  email: 'student@vigyaan.edu',
  phone: '',
  role: 'authenticated',
  updated_at: new Date().toISOString(),
};

const MOCK_DEMO_SESSION: Session = {
  access_token: 'demo-access-token-123',
  refresh_token: 'demo-refresh-token-123',
  expires_in: 3600,
  token_type: 'bearer',
  user: MOCK_DEMO_USER,
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setIsLoading(false);
      return;
    }

    // Fetch initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signInWithPassword = async (identifier: string, password: string) => {
    try {
      if (!isSupabaseConfigured) {
        // Demo Mode Fallback: Allow login with demo state
        const demoUser = {
          ...MOCK_DEMO_USER,
          email: identifier.includes('@') ? identifier : 'student@vigyaan.edu',
        };
        const demoSession = { ...MOCK_DEMO_SESSION, user: demoUser };
        setUser(demoUser);
        setSession(demoSession);
        return { error: null };
      }

      const { error } = await supabase.auth.signInWithPassword({
        email: identifier.trim(),
        password,
      });
      return { error };
    } catch (err: any) {
      return { error: err as Error };
    }
  };

  const signInWithOtp = async (identifier: string) => {
    try {
      if (!isSupabaseConfigured) {
        return { error: null };
      }

      const cleanIdentifier = identifier.trim();
      const isEmail = cleanIdentifier.includes('@');

      if (isEmail) {
        const { error } = await supabase.auth.signInWithOtp({
          email: cleanIdentifier,
        });
        return { error };
      } else {
        const { error } = await supabase.auth.signInWithOtp({
          phone: cleanIdentifier,
        });
        return { error };
      }
    } catch (err: any) {
      return { error: err as Error };
    }
  };

  const verifyOtp = async (identifier: string, token: string) => {
    try {
      if (!isSupabaseConfigured) {
        setUser(MOCK_DEMO_USER);
        setSession(MOCK_DEMO_SESSION);
        return { error: null };
      }

      const cleanIdentifier = identifier.trim();
      const isEmail = cleanIdentifier.includes('@');

      if (isEmail) {
        const { error } = await supabase.auth.verifyOtp({
          email: cleanIdentifier,
          token: token.trim(),
          type: 'email',
        });
        return { error };
      } else {
        const { error } = await supabase.auth.verifyOtp({
          phone: cleanIdentifier,
          token: token.trim(),
          type: 'sms',
        });
        return { error };
      }
    } catch (err: any) {
      return { error: err as Error };
    }
  };

  const signUp = async (formData: SignUpFormData) => {
    try {
      const { email, password, fullName, mobileNumber, gradeClass, schoolName, section } = formData;

      if (!isSupabaseConfigured) {
        const demoUser: User = {
          ...MOCK_DEMO_USER,
          email: email.trim(),
          user_metadata: {
            full_name: fullName.trim(),
            mobile_number: mobileNumber?.trim(),
            grade_class: gradeClass,
            school_name: schoolName.trim(),
            section: section,
          },
        };
        const demoSession = { ...MOCK_DEMO_SESSION, user: demoUser };
        setUser(demoUser);
        setSession(demoSession);
        return { data: { user: demoUser, session: demoSession }, error: null };
      }

      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: fullName.trim(),
            mobile_number: mobileNumber?.trim(),
            grade_class: gradeClass,
            school_name: schoolName.trim(),
            section: section,
          },
        },
      });
      return { data, error };
    } catch (err: any) {
      return { error: err as Error };
    }
  };

  const signOut = async () => {
    try {
      if (!isSupabaseConfigured) {
        setUser(null);
        setSession(null);
        return { error: null };
      }

      const { error } = await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      return { error };
    } catch (err: any) {
      return { error: err as Error };
    }
  };

  const resetPassword = async (email: string) => {
    try {
      if (!isSupabaseConfigured) {
        return { error: null };
      }

      const { error } = await supabase.auth.resetPasswordForEmail(email.trim());
      return { error };
    } catch (err: any) {
      return { error: err as Error };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isLoading,
        isConfigured: isSupabaseConfigured,
        signInWithPassword,
        signInWithOtp,
        verifyOtp,
        signUp,
        signOut,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
