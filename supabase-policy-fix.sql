-- FUTTASD LE EZT A SUPABASE SQL EDITORBAN!

-- 1. Engedélyezzük a Row Level Security-t a szükséges táblákon (ha eddig nem lett volna)
ALTER TABLE program_score_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE individual_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE individual_score_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE olympia_participants ENABLE ROW LEVEL SECURITY;

-- 2. Mindenki láthatja az adatokat (SELECT)
CREATE POLICY "Mindenki láthatja a pontokat" ON program_score_entries FOR SELECT USING (true);
CREATE POLICY "Mindenki láthatja a tevékenységeket" ON individual_activities FOR SELECT USING (true);
CREATE POLICY "Mindenki láthatja az egyéni pontokat" ON individual_score_entries FOR SELECT USING (true);
CREATE POLICY "Mindenki láthatja a résztvevőket" ON olympia_participants FOR SELECT USING (true);

-- 3. Csak a tanárok és adminok módosíthatnak/vihetnek fel adatokat (INSERT, UPDATE, DELETE)
-- Megjegyzés: Ha használtad a user_has_write_access() függvényt, akkor arra építünk.
-- De a biztonság kedvéért itt megadjuk a szerepkört ellenőrző kódot direkt is.

CREATE POLICY "Szervezők vihetnek fel pontot" ON program_score_entries 
FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('teacher', 'admin'))
);

CREATE POLICY "Szervezők módosíthatnak pontot" ON program_score_entries 
FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('teacher', 'admin'))
);

CREATE POLICY "Szervezők törölhetnek pontot" ON program_score_entries 
FOR DELETE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('teacher', 'admin'))
);

-- Ugyanez az egyéni pontozás segédtábláira (ha vannak)
CREATE POLICY "Szervezők vihetnek fel résztvevőt" ON olympia_participants
FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('teacher', 'admin')));

CREATE POLICY "Szervezők módosíthatnak résztvevőt" ON olympia_participants
FOR UPDATE USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('teacher', 'admin')));

CREATE POLICY "Szervezők törölhetnek résztvevőt" ON olympia_participants
FOR DELETE USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('teacher', 'admin')));
