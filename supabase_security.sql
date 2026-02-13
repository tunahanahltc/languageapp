-- Enable RLS on all tables
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE word_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE words ENABLE ROW LEVEL SECURITY;
ALTER TABLE word_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sets_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_words_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;

-- PUBLIC READ-ONLY TABLES (Categories, WordSets, Words, Translations)
-- Everyone can read these tables, but no one (except admin) can modify them.

CREATE POLICY "Public Read Categories" ON categories
FOR SELECT USING (true);

CREATE POLICY "Public Read WordSets" ON word_sets
FOR SELECT USING (true);

CREATE POLICY "Public Read Words" ON words
FOR SELECT USING (true);

CREATE POLICY "Public Read Translations" ON word_translations
FOR SELECT USING (true);

-- USER SPECIFIC TABLES
-- Users can only see and modify their own data.

-- USERS Table
CREATE POLICY "Users can view own profile" ON users
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON users
FOR UPDATE USING (auth.uid() = user_id);

-- USER_SETS_DATA Table
CREATE POLICY "Users can view own set progress" ON user_sets_data
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own set progress" ON user_sets_data
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own set progress" ON user_sets_data
FOR UPDATE USING (auth.uid() = user_id);

-- USER_WORDS_DATA Table
CREATE POLICY "Users can view own word progress" ON user_words_data
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own word progress" ON user_words_data
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own word progress" ON user_words_data
FOR UPDATE USING (auth.uid() = user_id);

-- QUIZ_RESULTS Table
CREATE POLICY "Users can view own quiz results" ON quiz_results
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own quiz results" ON quiz_results
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- USER_FAVORITES Table
CREATE POLICY "Users can view own favorites" ON user_favorites
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own favorites" ON user_favorites
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own favorites" ON user_favorites
FOR DELETE USING (auth.uid() = user_id);
