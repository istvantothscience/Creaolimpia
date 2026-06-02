-- FUTTASD LE EZT A SUPABASE SQL EDITORBAN!

-- 1. Töröljük a régi korlátozást (ami csak student/teacher-t engedett)
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;

-- 2. Hozzáadjuk az új korlátozást, amiben már az admin is benne van
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('teacher', 'student', 'admin'));
