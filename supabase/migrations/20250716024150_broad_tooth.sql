/*
# Blood Donor Management System Database

## Overview
This migration creates a comprehensive blood donor management system with user accounts, blood stock management, and donation tracking.

## New Tables
1. **profiles** - Extended user profiles with role-based access
2. **blood_stock** - Real-time blood inventory management
3. **donor_registrations** - Donor registration and medical information
4. **blood_requests** - Blood requests from hospitals/patients
5. **donations** - Donation history and tracking
6. **hospitals** - Hospital/medical facility information

## Security
- Enable RLS on all tables
- Role-based access policies (admin, donor, hospital, public)
- Secure data handling for medical information

## Features
- Real-time stock monitoring
- Automated low stock alerts
- Donor eligibility tracking
- Request matching system
*/

-- Create custom types
CREATE TYPE user_role AS ENUM ('admin', 'donor', 'hospital', 'public');
CREATE TYPE blood_type AS ENUM ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-');
CREATE TYPE stock_status AS ENUM ('abundant', 'sufficient', 'limited', 'critical');
CREATE TYPE donation_status AS ENUM ('scheduled', 'completed', 'cancelled', 'postponed');
CREATE TYPE request_status AS ENUM ('pending', 'approved', 'fulfilled', 'cancelled');

-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name text NOT NULL,
    email text NOT NULL,
    phone text,
    role user_role DEFAULT 'public',
    blood_type blood_type,
    date_of_birth date,
    gender text CHECK (gender IN ('male', 'female')),
    address text,
    city text DEFAULT 'Balikpapan',
    emergency_contact text,
    emergency_phone text,
    is_active boolean DEFAULT true,
    last_donation_date date,
    total_donations integer DEFAULT 0,
    avatar_url text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Blood stock table
CREATE TABLE IF NOT EXISTS blood_stock (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    blood_type blood_type NOT NULL,
    quantity integer NOT NULL DEFAULT 0,
    reserved_quantity integer DEFAULT 0,
    expiry_date date,
    status stock_status DEFAULT 'sufficient',
    last_updated timestamptz DEFAULT now(),
    updated_by uuid REFERENCES auth.users(id),
    location text DEFAULT 'PMI Balikpapan',
    batch_number text,
    notes text,
    created_at timestamptz DEFAULT now()
);

-- Hospitals table
CREATE TABLE IF NOT EXISTS hospitals (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    address text NOT NULL,
    city text DEFAULT 'Balikpapan',
    phone text,
    email text,
    contact_person text,
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Donor registrations table
CREATE TABLE IF NOT EXISTS donor_registrations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name text NOT NULL,
    email text NOT NULL,
    phone text NOT NULL,
    blood_type blood_type NOT NULL,
    date_of_birth date NOT NULL,
    gender text NOT NULL CHECK (gender IN ('male', 'female')),
    weight decimal(5,2) NOT NULL,
    height decimal(5,2),
    address text NOT NULL,
    city text DEFAULT 'Balikpapan',
    medical_conditions text,
    medications text,
    last_donation_date date,
    is_eligible boolean DEFAULT true,
    eligibility_notes text,
    preferred_donation_time text,
    emergency_contact text,
    emergency_phone text,
    status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'inactive')),
    approved_by uuid REFERENCES auth.users(id),
    approved_at timestamptz,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Blood requests table
CREATE TABLE IF NOT EXISTS blood_requests (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    requester_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    patient_name text NOT NULL,
    blood_type blood_type NOT NULL,
    quantity integer NOT NULL,
    urgency text DEFAULT 'normal' CHECK (urgency IN ('low', 'normal', 'high', 'emergency')),
    hospital_id uuid REFERENCES hospitals(id),
    hospital_name text,
    contact_person text NOT NULL,
    contact_phone text NOT NULL,
    medical_reason text,
    required_date date NOT NULL,
    status request_status DEFAULT 'pending',
    fulfilled_quantity integer DEFAULT 0,
    fulfilled_date timestamptz,
    fulfilled_by uuid REFERENCES auth.users(id),
    notes text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Donations table
CREATE TABLE IF NOT EXISTS donations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    donor_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    donation_date date NOT NULL,
    blood_type blood_type NOT NULL,
    quantity integer DEFAULT 1,
    status donation_status DEFAULT 'scheduled',
    location text DEFAULT 'PMI Balikpapan',
    staff_id uuid REFERENCES auth.users(id),
    pre_donation_checkup jsonb,
    post_donation_notes text,
    next_eligible_date date,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE blood_stock ENABLE ROW LEVEL SECURITY;
ALTER TABLE hospitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE donor_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE blood_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Profiles policies
CREATE POLICY "Users can view their own profile"
    ON profiles FOR SELECT
    TO authenticated
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON profiles FOR UPDATE
    TO authenticated
    USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
    ON profiles FOR ALL
    TO authenticated
    USING (EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid() AND role = 'admin'
    ));

CREATE POLICY "Public can view basic donor info"
    ON profiles FOR SELECT
    TO authenticated
    USING (role = 'donor' AND is_active = true);

-- Blood stock policies
CREATE POLICY "Everyone can view blood stock"
    ON blood_stock FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Admins can manage blood stock"
    ON blood_stock FOR ALL
    TO authenticated
    USING (EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid() AND role = 'admin'
    ));

-- Hospitals policies
CREATE POLICY "Everyone can view hospitals"
    ON hospitals FOR SELECT
    TO authenticated
    USING (is_active = true);

CREATE POLICY "Admins can manage hospitals"
    ON hospitals FOR ALL
    TO authenticated
    USING (EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid() AND role = 'admin'
    ));

-- Donor registrations policies
CREATE POLICY "Users can view their own registrations"
    ON donor_registrations FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "Users can create registrations"
    ON donor_registrations FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own registrations"
    ON donor_registrations FOR UPDATE
    TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all registrations"
    ON donor_registrations FOR ALL
    TO authenticated
    USING (EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid() AND role = 'admin'
    ));

-- Blood requests policies
CREATE POLICY "Users can view their own requests"
    ON blood_requests FOR SELECT
    TO authenticated
    USING (requester_id = auth.uid());

CREATE POLICY "Users can create requests"
    ON blood_requests FOR INSERT
    TO authenticated
    WITH CHECK (requester_id = auth.uid());

CREATE POLICY "Users can update their own requests"
    ON blood_requests FOR UPDATE
    TO authenticated
    USING (requester_id = auth.uid());

CREATE POLICY "Admins can manage all requests"
    ON blood_requests FOR ALL
    TO authenticated
    USING (EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid() AND role = 'admin'
    ));

-- Donations policies
CREATE POLICY "Users can view their own donations"
    ON donations FOR SELECT
    TO authenticated
    USING (donor_id = auth.uid());

CREATE POLICY "Admins can manage all donations"
    ON donations FOR ALL
    TO authenticated
    USING (EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid() AND role = 'admin'
    ));

-- Insert default blood stock data
INSERT INTO blood_stock (blood_type, quantity, status, location, batch_number) VALUES
('A+', 124, 'sufficient', 'PMI Balikpapan', 'A+2024001'),
('A-', 45, 'sufficient', 'PMI Balikpapan', 'A-2024001'),
('B+', 98, 'sufficient', 'PMI Balikpapan', 'B+2024001'),
('B-', 23, 'limited', 'PMI Balikpapan', 'B-2024001'),
('AB+', 32, 'limited', 'PMI Balikpapan', 'AB+2024001'),
('AB-', 8, 'critical', 'PMI Balikpapan', 'AB-2024001'),
('O+', 15, 'critical', 'PMI Balikpapan', 'O+2024001'),
('O-', 12, 'critical', 'PMI Balikpapan', 'O-2024001');

-- Insert default hospitals
INSERT INTO hospitals (name, address, city, phone, email, contact_person) VALUES
('RSUD Abdul Wahab Sjahranie', 'Jl. Palang Merah Indonesia No.1, Klandasan Ilir', 'Balikpapan', '(0542) 873901', 'info@rsaws.id', 'dr. Siti Rahma'),
('RS Pertamina Balikpapan', 'Jl. Jend. Sudirman No.1, Prapatan', 'Balikpapan', '(0542) 7391234', 'info@rspertamina-bpp.com', 'dr. Ahmad Hidayat'),
('RS Bhakti Asih', 'Jl. Jend. Ahmad Yani No.77, Klandasan Ulu', 'Balikpapan', '(0542) 736666', 'info@rsbhaktiasih.com', 'dr. Maya Sari'),
('RS Kanujoso Djatiwibowo', 'Jl. MT. Haryono No.1, Sepinggan', 'Balikpapan', '(0542) 861888', 'info@rskd-balikpapan.co.id', 'dr. Bambang Sutrisno'),
('RS Medika Balikpapan', 'Jl. Jend. Sudirman No.2, Damai', 'Balikpapan', '(0542) 8861999', 'info@rsmedika-bpp.com', 'dr. Dewi Kartika');

-- Functions for automatic status updates
CREATE OR REPLACE FUNCTION update_blood_stock_status()
RETURNS TRIGGER AS $$
BEGIN
    -- Update status based on quantity
    IF NEW.quantity >= 100 THEN
        NEW.status = 'abundant';
    ELSIF NEW.quantity >= 50 THEN
        NEW.status = 'sufficient';
    ELSIF NEW.quantity >= 20 THEN
        NEW.status = 'limited';
    ELSE
        NEW.status = 'critical';
    END IF;
    
    NEW.last_updated = now();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_profile_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER update_blood_stock_status_trigger
    BEFORE UPDATE ON blood_stock
    FOR EACH ROW
    EXECUTE FUNCTION update_blood_stock_status();

CREATE TRIGGER update_profile_updated_at_trigger
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_profile_updated_at();

CREATE TRIGGER update_donor_registrations_updated_at_trigger
    BEFORE UPDATE ON donor_registrations
    FOR EACH ROW
    EXECUTE FUNCTION update_profile_updated_at();

CREATE TRIGGER update_blood_requests_updated_at_trigger
    BEFORE UPDATE ON blood_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_profile_updated_at();

CREATE TRIGGER update_donations_updated_at_trigger
    BEFORE UPDATE ON donations
    FOR EACH ROW
    EXECUTE FUNCTION update_profile_updated_at();

-- Create indexes for better performance
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_blood_type ON profiles(blood_type);
CREATE INDEX idx_blood_stock_type ON blood_stock(blood_type);
CREATE INDEX idx_blood_stock_status ON blood_stock(status);
CREATE INDEX idx_donor_registrations_blood_type ON donor_registrations(blood_type);
CREATE INDEX idx_donor_registrations_status ON donor_registrations(status);
CREATE INDEX idx_blood_requests_blood_type ON blood_requests(blood_type);
CREATE INDEX idx_blood_requests_status ON blood_requests(status);
CREATE INDEX idx_donations_donor_id ON donations(donor_id);
CREATE INDEX idx_donations_blood_type ON donations(blood_type);