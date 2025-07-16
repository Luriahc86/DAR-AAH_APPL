import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
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
        };
        Insert: {
          id: string;
          full_name: string;
          email: string;
          phone?: string | null;
          role?: 'admin' | 'donor' | 'hospital' | 'public';
          blood_type?: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-' | null;
          date_of_birth?: string | null;
          gender?: 'male' | 'female' | null;
          address?: string | null;
          city?: string | null;
          emergency_contact?: string | null;
          emergency_phone?: string | null;
          is_active?: boolean;
          last_donation_date?: string | null;
          total_donations?: number;
          avatar_url?: string | null;
        };
        Update: {
          id?: string;
          full_name?: string;
          email?: string;
          phone?: string | null;
          role?: 'admin' | 'donor' | 'hospital' | 'public';
          blood_type?: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-' | null;
          date_of_birth?: string | null;
          gender?: 'male' | 'female' | null;
          address?: string | null;
          city?: string | null;
          emergency_contact?: string | null;
          emergency_phone?: string | null;
          is_active?: boolean;
          last_donation_date?: string | null;
          total_donations?: number;
          avatar_url?: string | null;
          updated_at?: string;
        };
      };
      blood_stock: {
        Row: {
          id: string;
          blood_type: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
          quantity: number;
          reserved_quantity: number;
          expiry_date: string | null;
          status: 'abundant' | 'sufficient' | 'limited' | 'critical';
          last_updated: string;
          updated_by: string | null;
          location: string | null;
          batch_number: string | null;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          blood_type: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
          quantity?: number;
          reserved_quantity?: number;
          expiry_date?: string | null;
          status?: 'abundant' | 'sufficient' | 'limited' | 'critical';
          updated_by?: string | null;
          location?: string | null;
          batch_number?: string | null;
          notes?: string | null;
        };
        Update: {
          id?: string;
          blood_type?: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
          quantity?: number;
          reserved_quantity?: number;
          expiry_date?: string | null;
          status?: 'abundant' | 'sufficient' | 'limited' | 'critical';
          updated_by?: string | null;
          location?: string | null;
          batch_number?: string | null;
          notes?: string | null;
        };
      };
      hospitals: {
        Row: {
          id: string;
          name: string;
          address: string;
          city: string | null;
          phone: string | null;
          email: string | null;
          contact_person: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          address: string;
          city?: string | null;
          phone?: string | null;
          email?: string | null;
          contact_person?: string | null;
          is_active?: boolean;
        };
        Update: {
          id?: string;
          name?: string;
          address?: string;
          city?: string | null;
          phone?: string | null;
          email?: string | null;
          contact_person?: string | null;
          is_active?: boolean;
          updated_at?: string;
        };
      };
      donor_registrations: {
        Row: {
          id: string;
          user_id: string | null;
          full_name: string;
          email: string;
          phone: string;
          blood_type: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
          date_of_birth: string;
          gender: 'male' | 'female';
          weight: number;
          height: number | null;
          address: string;
          city: string | null;
          medical_conditions: string | null;
          medications: string | null;
          last_donation_date: string | null;
          is_eligible: boolean;
          eligibility_notes: string | null;
          preferred_donation_time: string | null;
          emergency_contact: string | null;
          emergency_phone: string | null;
          status: 'pending' | 'approved' | 'rejected' | 'inactive';
          approved_by: string | null;
          approved_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          full_name: string;
          email: string;
          phone: string;
          blood_type: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
          date_of_birth: string;
          gender: 'male' | 'female';
          weight: number;
          height?: number | null;
          address: string;
          city?: string | null;
          medical_conditions?: string | null;
          medications?: string | null;
          last_donation_date?: string | null;
          is_eligible?: boolean;
          eligibility_notes?: string | null;
          preferred_donation_time?: string | null;
          emergency_contact?: string | null;
          emergency_phone?: string | null;
          status?: 'pending' | 'approved' | 'rejected' | 'inactive';
          approved_by?: string | null;
          approved_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          full_name?: string;
          email?: string;
          phone?: string;
          blood_type?: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
          date_of_birth?: string;
          gender?: 'male' | 'female';
          weight?: number;
          height?: number | null;
          address?: string;
          city?: string | null;
          medical_conditions?: string | null;
          medications?: string | null;
          last_donation_date?: string | null;
          is_eligible?: boolean;
          eligibility_notes?: string | null;
          preferred_donation_time?: string | null;
          emergency_contact?: string | null;
          emergency_phone?: string | null;
          status?: 'pending' | 'approved' | 'rejected' | 'inactive';
          approved_by?: string | null;
          approved_at?: string | null;
          updated_at?: string;
        };
      };
      blood_requests: {
        Row: {
          id: string;
          requester_id: string | null;
          patient_name: string;
          blood_type: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
          quantity: number;
          urgency: 'low' | 'normal' | 'high' | 'emergency';
          hospital_id: string | null;
          hospital_name: string | null;
          contact_person: string;
          contact_phone: string;
          medical_reason: string | null;
          required_date: string;
          status: 'pending' | 'approved' | 'fulfilled' | 'cancelled';
          fulfilled_quantity: number;
          fulfilled_date: string | null;
          fulfilled_by: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          requester_id?: string | null;
          patient_name: string;
          blood_type: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
          quantity: number;
          urgency?: 'low' | 'normal' | 'high' | 'emergency';
          hospital_id?: string | null;
          hospital_name?: string | null;
          contact_person: string;
          contact_phone: string;
          medical_reason?: string | null;
          required_date: string;
          status?: 'pending' | 'approved' | 'fulfilled' | 'cancelled';
          fulfilled_quantity?: number;
          fulfilled_date?: string | null;
          fulfilled_by?: string | null;
          notes?: string | null;
        };
        Update: {
          id?: string;
          requester_id?: string | null;
          patient_name?: string;
          blood_type?: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
          quantity?: number;
          urgency?: 'low' | 'normal' | 'high' | 'emergency';
          hospital_id?: string | null;
          hospital_name?: string | null;
          contact_person?: string;
          contact_phone?: string;
          medical_reason?: string | null;
          required_date?: string;
          status?: 'pending' | 'approved' | 'fulfilled' | 'cancelled';
          fulfilled_quantity?: number;
          fulfilled_date?: string | null;
          fulfilled_by?: string | null;
          notes?: string | null;
          updated_at?: string;
        };
      };
    };
  };
};