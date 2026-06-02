-- ÚJ TÁBORI ADATBÁZIS SÉMA
-- Futtasd le ezt a Supabase SQL Editorjában!

-- FIGYELEM: A Supabase-ben a jelszavakat biztonsági okokból a beépített 'auth.users' tábla kezeli
-- (ez végzi a jelszavak titkosítását és a beléptetést). Ezért a nevek és szerepkörök (munkamenetek) 
-- egy közös 'profiles' táblába kerülnek, ami rákapcsolódik az auth rendszerre.

-- 1. PROFILOK (Tanárok és Diákok közös táblája a névvel és szereppel)
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text NOT NULL,
  role text CHECK (role IN ('teacher', 'student')) NOT NULL DEFAULT 'student',
  team_id uuid, -- Diákok esetén melyik csapathoz tartozik (tanároknak lehet NULL)
  created_at timestamptz DEFAULT now()
);

-- 2. CSAPATOK TÁBLÁJA (A 10 csapat)
CREATE TABLE teams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  color text,
  created_at timestamptz DEFAULT now()
);

-- Hivatkozás frissítése, hogy a diákok rá tudjanak mutatni a csapatukra
ALTER TABLE profiles ADD CONSTRAINT fk_team FOREIGN KEY (team_id) REFERENCES teams(id);

-- 3. PONTOK TÁBLÁJA (A 10 csapat 4 napra leosztott pontjai)
CREATE TABLE team_points (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid REFERENCES teams(id) NOT NULL,
  camp_day integer CHECK (camp_day IN (1, 2, 3, 4)) NOT NULL, -- 1., 2., 3. vagy 4. nap
  points integer NOT NULL,
  note text, -- pl. Milyen feladatért kapták
  entered_by uuid REFERENCES profiles(id), -- a tanár vagy diák, aki beírta
  created_at timestamptz DEFAULT now()
);

-- 4. HETI PROGRAM TÁBLÁZAT
CREATE TABLE weekly_program (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  day_number integer CHECK (day_number IN (1, 2, 3, 4)), -- 1. naptól 4. napig
  start_time time NOT NULL,
  end_time time,
  title text NOT NULL,
  description text,
  location text,
  created_at timestamptz DEFAULT now()
);

-- 5. TRIGGER: Automatikus profil létrehozása, amikor valaki regisztrál / kap egy jelszót
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, role)
  VALUES (
    new.id, 
    new.email, 
    COALESCE(new.raw_user_meta_data->>'full_name', 'Névtelen Felhasználó'),
    COALESCE(new.raw_user_meta_data->>'role', 'student') -- alapból diák lesz, ha nincs más megadva
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ha már létezne a trigger, akkor töröljük az előzőt
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 6. KEZDETI 10 CSAPAT FELTÖLTÉSE (SEED DATA)
INSERT INTO teams (name, color) VALUES 
('1. Csapat - Sárkányok', '#ef4444'),
('2. Csapat - Villámok', '#22c55e'),
('3. Csapat - Farkasok', '#3b82f6'),
('4. Csapat - Rókák', '#f97316'),
('5. Csapat - Sólymok', '#eab308'),
('6. Csapat - Pandák', '#a855f7'),
('7. Csapat - Gepárdok', '#94a3b8'),
('8. Csapat - Főnixek', '#dc2626'),
('9. Csapat - Delfinek', '#06b6d4'),
('10. Csapat - Jaguárok', '#1e293b');

-- 7. JOGOSULTSÁGOK (Row Level Security - opcionális, de ajánlott)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_program ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Mindenki láthatja a csapatokat" ON teams FOR SELECT USING (true);
CREATE POLICY "Mindenki láthatja a programot" ON weekly_program FOR SELECT USING (true);
CREATE POLICY "Mindenki láthatja a pontokat" ON team_points FOR SELECT USING (true);
CREATE POLICY "Mindenki láthatja a profilokat" ON profiles FOR SELECT USING (true);

-- Csak bejelentkezett felhasználók rögzíthetnek pontot
CREATE POLICY "Aktív userek adhatnak pontot" ON team_points FOR INSERT WITH CHECK (auth.uid() = entered_by);
