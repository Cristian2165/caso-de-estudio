-- MindBridge Database Schema
-- Run this in your Supabase SQL editor

-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret-here';

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  role VARCHAR(20) CHECK (role IN ('psychologist', 'child')) NOT NULL,
  avatar TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Psychologists table
CREATE TABLE IF NOT EXISTS psychologists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  license_number VARCHAR(100) UNIQUE NOT NULL,
  specializations TEXT[] DEFAULT '{}',
  assigned_children TEXT[] DEFAULT '{}',
  hospital VARCHAR(255),
  years_experience INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Children table
CREATE TABLE IF NOT EXISTS children (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  age INTEGER NOT NULL,
  diagnosis TEXT[] DEFAULT '{}',
  parent_email VARCHAR(255) NOT NULL,
  assigned_psychologist UUID REFERENCES psychologists(id),
  preferences JSONB DEFAULT '{}',
  current_emotion VARCHAR(20) DEFAULT 'neutral',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Biometric data table
CREATE TABLE IF NOT EXISTS biometric_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  child_id UUID REFERENCES children(id) ON DELETE CASCADE,
  heart_rate INTEGER NOT NULL,
  stress_level VARCHAR(10) CHECK (stress_level IN ('low', 'medium', 'high')) NOT NULL,
  skin_temperature DECIMAL(4,2) NOT NULL,
  activity VARCHAR(20) CHECK (activity IN ('resting', 'active', 'excited', 'agitated')) NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Biometric alerts table
CREATE TABLE IF NOT EXISTS biometric_alerts (
  id VARCHAR(255) PRIMARY KEY,
  child_id UUID REFERENCES children(id) ON DELETE CASCADE,
  type VARCHAR(30) CHECK (type IN ('high_stress', 'rapid_heartrate', 'emotional_distress', 'inactivity')) NOT NULL,
  severity VARCHAR(10) CHECK (severity IN ('low', 'medium', 'high', 'critical')) NOT NULL,
  message TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved BOOLEAN DEFAULT FALSE,
  action_taken TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Emotion records table
CREATE TABLE IF NOT EXISTS emotion_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  child_id UUID REFERENCES children(id) ON DELETE CASCADE,
  emotion VARCHAR(20) CHECK (emotion IN ('joy', 'sadness', 'anger', 'fear', 'disgust', 'neutral')) NOT NULL,
  intensity INTEGER CHECK (intensity >= 0 AND intensity <= 100) NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  triggers TEXT[] DEFAULT '{}',
  context TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Therapy sessions table
CREATE TABLE IF NOT EXISTS therapy_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  child_id UUID REFERENCES children(id) ON DELETE CASCADE,
  psychologist_id UUID REFERENCES psychologists(id) ON DELETE CASCADE,
  start_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  end_time TIMESTAMP WITH TIME ZONE,
  status VARCHAR(20) CHECK (status IN ('active', 'paused', 'completed', 'cancelled')) DEFAULT 'active',
  objectives TEXT[] DEFAULT '{}',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Emotional islands table
CREATE TABLE IF NOT EXISTS emotional_islands (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  child_id UUID REFERENCES children(id) ON DELETE CASCADE,
  emotion VARCHAR(20) CHECK (emotion IN ('joy', 'sadness', 'anger', 'fear', 'disgust', 'neutral')) NOT NULL,
  name VARCHAR(255) NOT NULL,
  unlocked BOOLEAN DEFAULT FALSE,
  visit_count INTEGER DEFAULT 0,
  last_visit TIMESTAMP WITH TIME ZONE,
  progress JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_biometric_data_child_timestamp ON biometric_data(child_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_biometric_alerts_child_timestamp ON biometric_alerts(child_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_emotion_records_child_timestamp ON emotion_records(child_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_children_psychologist ON children(assigned_psychologist);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE psychologists ENABLE ROW LEVEL SECURITY;
ALTER TABLE children ENABLE ROW LEVEL SECURITY;
ALTER TABLE biometric_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE biometric_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE emotion_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE therapy_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE emotional_islands ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Psychologists can view assigned children" ON children
  FOR SELECT USING (
    assigned_psychologist IN (
      SELECT id FROM psychologists WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Children can view their own data" ON children
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Biometric data access" ON biometric_data
  FOR ALL USING (
    child_id IN (
      SELECT id FROM children 
      WHERE user_id = auth.uid() 
      OR assigned_psychologist IN (
        SELECT id FROM psychologists WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Alerts access" ON biometric_alerts
  FOR ALL USING (
    child_id IN (
      SELECT id FROM children 
      WHERE user_id = auth.uid() 
      OR assigned_psychologist IN (
        SELECT id FROM psychologists WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Emotion records access" ON emotion_records
  FOR ALL USING (
    child_id IN (
      SELECT id FROM children 
      WHERE user_id = auth.uid() 
      OR assigned_psychologist IN (
        SELECT id FROM psychologists WHERE user_id = auth.uid()
      )
    )
  );

-- Functions for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Sample data for testing
INSERT INTO users (id, name, email, role) VALUES 
  ('11111111-1111-1111-1111-111111111111', 'Dr. María González', 'maria.gonzalez@mindbridge.com', 'psychologist'),
  ('22222222-2222-2222-2222-222222222222', 'Lucas Martínez', 'lucas.martinez@email.com', 'child')
ON CONFLICT (email) DO NOTHING;

INSERT INTO psychologists (user_id, license_number, specializations, years_experience) VALUES 
  ('11111111-1111-1111-1111-111111111111', 'PSY-2021-0456', ARRAY['Terapia Cognitivo-Conductual', 'Psicología Infantil', 'TEA'], 8)
ON CONFLICT (license_number) DO NOTHING;

INSERT INTO children (user_id, age, diagnosis, parent_email, assigned_psychologist) VALUES 
  ('22222222-2222-2222-2222-222222222222', 8, ARRAY['TEA', 'Ansiedad'], 'parent@email.com', 
   (SELECT id FROM psychologists WHERE license_number = 'PSY-2021-0456'))
ON CONFLICT DO NOTHING;