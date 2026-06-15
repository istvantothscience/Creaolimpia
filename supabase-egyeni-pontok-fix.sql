-- Ezt a kódot futtasd le a Supabase SQL Editorban, hogy minden egyéni pontozással kapcsolatos funkció és ranglista működjön!

-- 1. Engedélyezzük az RLS-t ha még nem lenne
ALTER TABLE IF EXISTS individual_score_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS olympia_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS individual_activities ENABLE ROW LEVEL SECURITY;

-- 2. Töröljük a korábbi esetleges rossz Policy-kat hogy ne legyen ütközés
DROP POLICY IF EXISTS "Szervezők vihetnek fel egyéni pontot" ON individual_score_entries;
DROP POLICY IF EXISTS "Szervezők módosíthatnak egyéni pontot" ON individual_score_entries;
DROP POLICY IF EXISTS "Szervezők törölhetnek egyéni pontot" ON individual_score_entries;
DROP POLICY IF EXISTS "Mindenki láthatja az egyéni pontokat" ON individual_score_entries;

DROP POLICY IF EXISTS "Szervezők vihetnek fel egyéni pontot" ON program_score_entries;

-- 3. SELECT jog mindenkinek
CREATE POLICY "Mindenki láthatja az egyéni pontokat" ON individual_score_entries FOR SELECT USING (true);
CREATE POLICY "Mindenki láthatja a résztvevőket" ON olympia_participants FOR SELECT USING (true);
CREATE POLICY "Mindenki láthatja a tevékenységeket" ON individual_activities FOR SELECT USING (true);

-- 4. INSERT/UPDATE/DELETE jog csak az admin és teacher számára (Egyéni pontok)
CREATE POLICY "Admin és teacher vihet fel egyéni pontot" ON individual_score_entries 
FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('teacher', 'admin')));

CREATE POLICY "Admin és teacher módosíthat egyéni pontot" ON individual_score_entries 
FOR UPDATE USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('teacher', 'admin')));

CREATE POLICY "Admin és teacher törölhet egyéni pontot" ON individual_score_entries 
FOR DELETE USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('teacher', 'admin')));

-- 5. INSERT/UPDATE/DELETE jog csak az admin és teacher számára (Program/Közös pontok - ha még hiányzott)
DROP POLICY IF EXISTS "Szervezők vihetnek fel pontot" ON program_score_entries;
CREATE POLICY "Admin és teacher vihet fel program pontot" ON program_score_entries 
FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('teacher', 'admin')));

-- 6. NÉZETEK LÉTREHOZÁSA A RANGLISTÁHOZ:

-- Összesíti csapatonként, hogy mennyi egyéni pontot szereztek összesen
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

-- Egyéni ranglista
CREATE OR REPLACE VIEW individual_leaderboard AS
SELECT 
  p.id as participant_id,
  p.full_name,
  p.class_name,
  p.team_id,
  t.name as team_name,
  COALESCE(SUM(ise.points), 0) as total_points,
  COUNT(ise.id) as score_entries_count,
  RANK() OVER (ORDER BY COALESCE(SUM(ise.points), 0) DESC) as rank
FROM olympia_participants p
LEFT JOIN teams t ON p.team_id = t.id
LEFT JOIN individual_score_entries ise ON p.id = ise.participant_id
GROUP BY p.id, p.full_name, p.class_name, p.team_id, t.name;

-- Egyéni pontok versenyszámonként
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
