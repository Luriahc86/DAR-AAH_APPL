import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface Profile {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  role: 'admin' | 'donor' | 'hospital' | 'public';
  blood_type: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-' | null;
  date_of_birth: string | null;
  gender: 'male' | 'female' | null;
  address: string | null;
  city: string | null;
  emergency_contact: string | null;
  emergency_phone: string | null;
  is_active: boolean;
  last_donation_date: string | null;
  total_donations: number;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string, additionalData?: any) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          await fetchProfile(session.user.id);
        } else {
          setProfile(null);
          setLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
      } else {
        setProfile(data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
  };

  const signUp = async (email: string, password: string, fullName: string, additionalData?: any) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    
    if (error) throw error;
    
    if (data.user) {
      // Prepare profile data
      const profileData: any = {
        id: data.user.id,
        full_name: fullName,
        email: email,
        role: additionalData?.role || 'public',
      };

      // Add role-specific data
      if (additionalData) {
        if (additionalData.phone) profileData.phone = additionalData.phone;
        if (additionalData.bloodType) profileData.blood_type = additionalData.bloodType;
        if (additionalData.dateOfBirth) profileData.date_of_birth = additionalData.dateOfBirth;
        if (additionalData.gender) profileData.gender = additionalData.gender;
        if (additionalData.address) profileData.address = additionalData.address;
      }

      // Create profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([profileData]);
      
      if (profileError) throw profileError;

      // If hospital role, create hospital record
      if (additionalData?.role === 'hospital' && additionalData.hospitalName) {
        const { error: hospitalError } = await supabase
          .from('hospitals')
          .insert([{
            name: additionalData.hospitalName,
            address: additionalData.hospitalAddress || '',
            phone: additionalData.phone || '',
            email: email,
            contact_person: fullName,
          }]);
        
        if (hospitalError) console.error('Error creating hospital record:', hospitalError);
      }
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) throw new Error('No user logged in');
    
    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id);
    
    if (error) throw error;
    
    // Refresh profile
    await fetchProfile(user.id);
  };

  const value = {
    user,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};