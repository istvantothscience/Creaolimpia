-- EZT A SQL KÓDOT FUTTASD LE A SUPABASE SQL EDITORBAN!
-- Mivel admin lettél, a régi "teacher" jogkörös RLS szabályok miatt nem tudsz menteni.
-- Ez a script mindenhol megadja az adminoknak is a jogot.

-- 1. Program (Közös agora) pontokhoz
DROP POLICY IF EXISTS "Szervezők vihetnek fel pontot" ON program_score_entries;
DROP POLICY IF EXISTS "Szervezők módosíthatnak pontot" ON program_score_entries;
DROP POLICY IF EXISTS "Szervezők törölhetnek pontot" ON program_score_entries;
DROP POLICY IF EXISTS "Admin és teacher vihet fel program pontot" ON program_score_entries;

CREATE POLICY "Szervezők vihetnek fel pontot" ON program_score_entries 
FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('teacher', 'admin')));

CREATE POLICY "Szervezők módosíthatnak pontot" ON program_score_entries 
FOR UPDATE USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('teacher', 'admin')));

CREATE POLICY "Szervezők törölhetnek pontot" ON program_score_entries 
FOR DELETE USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('teacher', 'admin')));


-- 2. Egyéni pontokhoz (biztos ami biztos)
DROP POLICY IF EXISTS "Admin és teacher vihet fel egyéni pontot" ON individual_score_entries;
DROP POLICY IF EXISTS "Admin és teacher módosíthat egyéni pontot" ON individual_score_entries;
DROP POLICY IF EXISTS "Admin és teacher törölhet egyéni pontot" ON individual_score_entries;

CREATE POLICY "Admin és teacher vihet fel egyéni pontot" ON individual_score_entries 
FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('teacher', 'admin')));

CREATE POLICY "Admin és teacher módosíthat egyéni pontot" ON individual_score_entries 
FOR UPDATE USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('teacher', 'admin')));

CREATE POLICY "Admin és teacher törölhet egyéni pontot" ON individual_score_entries 
FOR DELETE USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('teacher', 'admin')));
