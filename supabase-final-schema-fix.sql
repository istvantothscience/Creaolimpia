-- Ezt a SQL kódot futtasd le a Supabase SQL Editorban! Létrehozza a hiányzó táblákat és beállítja a jogosultságokat az Admin/Teacher számára.

-- 1. TÁBLÁK LÉTREHOZÁSA (ha esetleg hiányoznának)
CREATE TABLE IF NOT EXISTS program_score_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    program_event_id UUID NOT NULL,
    team_id UUID NOT NULL,
    student_name TEXT,
    points NUMERIC NOT NULL,
    note TEXT,
    metric_label TEXT,
    metric_value NUMERIC,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS individual_score_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    participant_id UUID NOT NULL,
    activity_id UUID NOT NULL,
    points NUMERIC NOT NULL,
    placement INTEGER,
    metric_label TEXT,
    metric_value NUMERIC,
    note TEXT,
    score_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS olympia_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    class_name TEXT,
    participant_order INTEGER,
    team_id UUID,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS individual_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    scoring_type TEXT NOT NULL,
    default_points NUMERIC,
    max_points NUMERIC,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- 2. RLS ENGEDÉLYEZÉSE
ALTER TABLE program_score_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE individual_score_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE olympia_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE individual_activities ENABLE ROW LEVEL SECURITY;


-- 3. JOGOSULTSÁGOK (POLICIES) TÖRLÉSE ÉS ÚJRALÉTREHOZÁSA

-- Program Score Entries
DROP POLICY IF EXISTS "Mindenki láthatja a pontokat" ON program_score_entries;
DROP POLICY IF EXISTS "Szervezők vihetnek fel pontot" ON program_score_entries;
DROP POLICY IF EXISTS "Szervezők módosíthatnak pontot" ON program_score_entries;
DROP POLICY IF EXISTS "Szervezők törölhetnek pontot" ON program_score_entries;
DROP POLICY IF EXISTS "Admin és teacher vihet fel program pontot" ON program_score_entries;

CREATE POLICY "Mindenki láthatja a pontokat" ON program_score_entries FOR SELECT USING (true);

CREATE POLICY "Admin és Teacher vihet fel pontot" ON program_score_entries 
FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('teacher', 'admin')));

CREATE POLICY "Admin és Teacher módosíthat pontot" ON program_score_entries 
FOR UPDATE USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('teacher', 'admin')));

CREATE POLICY "Admin és Teacher törölhet pontot" ON program_score_entries 
FOR DELETE USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('teacher', 'admin')));

-- Individual Score Entries
DROP POLICY IF EXISTS "Mindenki láthatja az egyéni pontokat" ON individual_score_entries;
DROP POLICY IF EXISTS "Szervezők vihetnek fel egyéni pontot" ON individual_score_entries;
DROP POLICY IF EXISTS "Szervezők módosíthatnak egyéni pontot" ON individual_score_entries;
DROP POLICY IF EXISTS "Szervezők törölhetnek egyéni pontot" ON individual_score_entries;
DROP POLICY IF EXISTS "Admin és teacher vihet fel egyéni pontot" ON individual_score_entries;
DROP POLICY IF EXISTS "Admin és teacher módosíthat egyéni pontot" ON individual_score_entries;
DROP POLICY IF EXISTS "Admin és teacher törölhet egyéni pontot" ON individual_score_entries;

CREATE POLICY "Mindenki láthatja az egyéni pontokat" ON individual_score_entries FOR SELECT USING (true);

CREATE POLICY "Admin és Teacher vihet fel egyéni pontot" ON individual_score_entries 
FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('teacher', 'admin')));

CREATE POLICY "Admin és Teacher módosíthat egyéni pontot" ON individual_score_entries 
FOR UPDATE USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('teacher', 'admin')));

CREATE POLICY "Admin és Teacher törölhet egyéni pontot" ON individual_score_entries 
FOR DELETE USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('teacher', 'admin')));

-- Participants és Activities select jogai (hogy lássák a listákban)
DROP POLICY IF EXISTS "Mindenki láthatja a résztvevőket" ON olympia_participants;
DROP POLICY IF EXISTS "Mindenki láthatja a tevékenységeket" ON individual_activities;

CREATE POLICY "Mindenki láthatja a résztvevőket" ON olympia_participants FOR SELECT USING (true);
CREATE POLICY "Mindenki láthatja a tevékenységeket" ON individual_activities FOR SELECT USING (true);


-- 4. VIEW-K FRISSÍTÉSE (hogy a táblák biztosan létezzenek már ekkor)
CREATE OR REPLACE VIEW team_individual_score_summary AS
SELECT 
  p.team_id,
  t.name as team_name,
  COALESCE(SUM(ise.points), 0) as individual_points,
  COUNT(DISTINCT p.id) as participants_with_team,
  COUNT(ise.id) as score_entries_count
FROM olympia_participants p
LEFT JOIN teams t ON p.team_id = t.id
LEFT JOIN individual_score_entries ise ON p.id = ise.participant_id
GROUP BY p.team_id, t.name;

CREATE OR REPLACE VIEW individual_scores_by_activity AS
SELECT 
  a.id as activity_id,
  a.name as activity_name,
  p.id as participant_id,
  p.full_name,
  p.class_name,
  p.team_id,
  t.name as team_name,
  COALESCE(SUM(ise.points), 0) as total_points,
  MIN(ise.placement) as best_recorded_placement,
  COUNT(ise.id) as entry_count
FROM individual_activities a
JOIN individual_score_entries ise ON a.id = ise.activity_id
JOIN olympia_participants p ON ise.participant_id = p.id
LEFT JOIN teams t ON p.team_id = t.id
GROUP BY a.id, a.name, p.id, p.full_name, p.class_name, p.team_id, t.name;
