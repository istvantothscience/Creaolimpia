-- Crea Olimpia Supabase SQL Migration
-- Run this in the Supabase SQL Editor

-- 1. Create tables
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  email text,
  display_name text,
  role text CHECK (role IN ('team', 'organizer', 'admin')) DEFAULT 'team',
  team_id uuid, -- Will reference teams(id) once created
  created_at timestamptz DEFAULT now()
);

CREATE TABLE teams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  short_name text,
  color text,
  icon text,
  motto text,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- update profile's team_id to reference teams
ALTER TABLE profiles ADD CONSTRAINT fk_team FOREIGN KEY (team_id) REFERENCES teams(id);

CREATE TABLE activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  category text CHECK (category IN ('sport', 'creative', 'community', 'morning', 'extra', 'penalty')),
  scoring_type text CHECK (scoring_type IN ('manual_points', 'ranking', 'match', 'individual')),
  default_points integer DEFAULT 0,
  max_points integer,
  activity_date date,
  location text,
  active boolean DEFAULT true,
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE point_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid REFERENCES teams(id),
  activity_id uuid REFERENCES activities(id),
  points integer NOT NULL,
  note text,
  entry_date date DEFAULT current_date,
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE program_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  program_date date NOT NULL,
  start_time time,
  end_time time,
  location text,
  category text,
  activity_id uuid REFERENCES activities(id),
  visible_to_teams boolean DEFAULT true,
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now()
);

-- 2. Create Views
CREATE VIEW team_total_scores AS
SELECT 
  t.id as team_id,
  t.name as team_name,
  t.color,
  t.icon,
  COALESCE(SUM(pe.points), 0) as total_points,
  RANK() OVER (ORDER BY COALESCE(SUM(pe.points), 0) DESC) as rank
FROM teams t
LEFT JOIN point_entries pe ON t.id = pe.team_id
GROUP BY t.id, t.name, t.color, t.icon;

CREATE VIEW daily_team_scores AS
SELECT 
  pe.entry_date as date,
  t.id as team_id,
  t.name as team_name,
  COALESCE(SUM(pe.points), 0) as daily_points
FROM teams t
JOIN point_entries pe ON t.id = pe.team_id
GROUP BY pe.entry_date, t.id, t.name;

-- 3. RLS Policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE point_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE program_items ENABLE ROW LEVEL SECURITY;

-- Team view access
CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Teams are viewable by everyone" ON teams FOR SELECT USING (true);
CREATE POLICY "Activities are viewable by everyone" ON activities FOR SELECT USING (true);
CREATE POLICY "Point entries viewable by everyone" ON point_entries FOR SELECT USING (true);
CREATE POLICY "Program items viewable by everyone" ON program_items FOR SELECT USING (true);

-- Organizer/Admin write access (Simplified)
CREATE OR REPLACE FUNCTION user_has_write_access() RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role IN ('organizer', 'admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE POLICY "Organizers can insert activities" ON activities FOR INSERT WITH CHECK (user_has_write_access());
CREATE POLICY "Organizers can update activities" ON activities FOR UPDATE USING (user_has_write_access());

CREATE POLICY "Organizers can insert points" ON point_entries FOR INSERT WITH CHECK (user_has_write_access());
CREATE POLICY "Organizers can update points" ON point_entries FOR UPDATE USING (user_has_write_access());
CREATE POLICY "Organizers can delete points" ON point_entries FOR DELETE USING (user_has_write_access());

CREATE POLICY "Organizers can insert program" ON program_items FOR INSERT WITH CHECK (user_has_write_access());
CREATE POLICY "Organizers can update program" ON program_items FOR UPDATE USING (user_has_write_access());

-- 4. Automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name, role)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name', 'team');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 5. Seed Data
INSERT INTO teams (name, short_name, color, icon) VALUES 
('Crea Sárkányok', 'CAS', '#ef4444', 'dragon'),
('Zöld Villámok', 'ZVL', '#22c55e', 'zap'),
('Kék Farkasok', 'KKF', '#3b82f6', 'dog'),
('Narancs Rókák', 'NRR', '#f97316', 'fox'),
('Arany Sólymok', 'ARS', '#eab308', 'bird'),
('Lila Pandák', 'LLP', '#a855f7', 'bear'),
('Ezüst Gepárdok', 'EZG', '#94a3b8', 'cat'),
('Piros Főnixek', 'PRF', '#dc2626', 'flame'),
('Türkiz Delfinek', 'TRD', '#06b6d4', 'fish'),
('Fekete Jaguárok', 'FKJ', '#1e293b', 'moon');

INSERT INTO activities (name, category, scoring_type) VALUES 
('Reggeli futás', 'morning', 'manual_points'),
('Foci bajnokság', 'sport', 'match'),
('Kosárdobó kihívás', 'sport', 'manual_points'),
('Kreatív csapatzászló', 'creative', 'manual_points'),
('Kvíz olimpia', 'extra', 'ranking'),
('Sportszerűségi pont', 'community', 'manual_points'),
('Tábori jócselekedet', 'community', 'manual_points');
