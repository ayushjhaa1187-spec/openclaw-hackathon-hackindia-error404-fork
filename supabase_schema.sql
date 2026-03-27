-- EduSync Database Schema (PostgreSQL)
-- Execute this in your Supabase SQL Editor

-- 1. UTILITIES & ENUMS
CREATE TYPE user_role AS ENUM ('student', 'moderator', 'admin');
CREATE TYPE skill_category AS ENUM ('Engineering', 'Design', 'Business', 'Arts', 'Languages', 'Science', 'Writing', 'Tech');
CREATE TYPE swap_status AS ENUM ('pending', 'accepted', 'completed', 'cancelled');
CREATE TYPE resource_type AS ENUM ('PDF', 'Doc', 'Video', 'Link');
CREATE TYPE resource_status AS ENUM ('pending', 'approved', 'rejected');

-- 2. CAMPUSES
CREATE TABLE campuses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  short_code TEXT NOT NULL UNIQUE,
  domain_suffix TEXT NOT NULL, -- e.g. nitn.edu.in
  primary_color TEXT DEFAULT '#4f46e5',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Seed Campuses
INSERT INTO campuses (name, short_code, domain_suffix, primary_color) VALUES
('Northvale Institute of Technology', 'NIT-N', 'nitn.edu.in', '#4f46e5'),
('Deccan Engineering University', 'DEU', 'deu.ac.in', '#10b981'),
('Vistara College of Science & Tech', 'VCST', 'vistara.edu', '#f59e0b'),
('Indravali Technical University', 'ITU', 'itu.edu.in', '#8b5cf6'),
('Sahyadri Institute of Advanced Studies', 'SIAS', 'sias.ac.in', '#f43f5e');

-- 3. PROFILES
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  role user_role DEFAULT 'student',
  campus_id UUID REFERENCES campuses(id),
  department TEXT,
  year_of_study INTEGER,
  bio TEXT,
  karma_balance INTEGER DEFAULT 100, -- Starting bonus
  audit_grade TEXT DEFAULT 'A',
  onboarding_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. SKILLS
CREATE TABLE skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category skill_category NOT NULL,
  tags TEXT[] DEFAULT '{}',
  karma_cost INTEGER DEFAULT 50,
  is_nexus BOOLEAN DEFAULT false, -- If true, visible to all campuses
  campus_id UUID REFERENCES campuses(id),
  avg_rating DECIMAL(3,2) DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. SKILL REQUESTS (SWAPS)
CREATE TABLE skill_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  skill_id UUID REFERENCES skills(id) ON DELETE CASCADE,
  requester_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  message TEXT,
  proposed_time TIMESTAMPTZ,
  status swap_status DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);

-- 6. SKILL REVIEWS
CREATE TABLE skill_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  skill_id UUID REFERENCES skills(id) ON DELETE CASCADE,
  reviewer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. RESOURCES (THE VAULT)
CREATE TABLE resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  uploader_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  campus_id UUID REFERENCES campuses(id),
  title TEXT NOT NULL,
  subject TEXT,
  type resource_type NOT NULL,
  url TEXT NOT NULL,
  karma_cost INTEGER DEFAULT 20,
  is_verified BOOLEAN DEFAULT false,
  status resource_status DEFAULT 'pending',
  download_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 8. RESOURCE UNLOCKS
CREATE TABLE resource_unlocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_id UUID REFERENCES resources(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  karma_spent INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(resource_id, user_id)
);

-- 9. KARMA LEDGER (TRANSACTION LOG)
CREATE TABLE karma_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  type TEXT NOT NULL, -- 'earned' or 'spent'
  source TEXT, -- e.g. 'Skill Swap', 'Resource Unlock'
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 10. CONVERSATIONS & MESSAGES
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_ids UUID[] NOT NULL,
  last_message TEXT,
  last_message_at TIMESTAMPTZ DEFAULT now(),
  is_nexus_bridge BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 11. NOTIFICATIONS
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  link TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 12. ROW LEVEL SECURITY (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Skills are viewable by everyone" ON skills FOR SELECT USING (true);
CREATE POLICY "Users can insert own skills" ON skills FOR INSERT WITH CHECK (auth.uid() = mentor_id);
CREATE POLICY "Users can update own skills" ON skills FOR UPDATE USING (auth.uid() = mentor_id);

ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Approved resources are viewable by everyone" ON resources FOR SELECT USING (status = 'approved');
CREATE POLICY "Uploaders can view pending resources" ON resources FOR SELECT USING (auth.uid() = uploader_id);
CREATE POLICY "Admins can view everything" ON resources FOR SELECT USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'moderator')));

-- FUNCTIONS & TRIGGERS
-- Auto-update profile updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = now();
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- RPC for incrementing downloads
CREATE OR REPLACE FUNCTION increment_download_count(row_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE resources SET download_count = download_count + 1 WHERE id = row_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
