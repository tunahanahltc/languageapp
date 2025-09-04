# Supabase Database Setup Guide

## 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up or log in
3. Create a new project
4. Note down your project URL and anon key

## 2. Environment Variables

Create a `.env` file in your project root and add:

```
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 3. Database Schema

Run the following SQL in your Supabase SQL editor:

### Users Table
```sql
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE,
  first_name TEXT,
  last_name TEXT,
  gender TEXT,
  phone TEXT,
  user_level INTEGER DEFAULT 1,
  learned_word_count INTEGER DEFAULT 0,
  experiment_score INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policy for users to read their own data
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid() = id);

-- Create policy for users to update their own data
CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Create policy for users to insert their own data
CREATE POLICY "Users can insert own data" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);
```

### Word Sets Table
```sql
CREATE TABLE word_sets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'topics',
  difficulty TEXT DEFAULT 'easy',
  icon TEXT,
  gradient_start TEXT,
  gradient_end TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE word_sets ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "Word sets are viewable by everyone" ON word_sets
  FOR SELECT USING (true);
```

### Words Table
```sql
CREATE TABLE words (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  set_id UUID REFERENCES word_sets(id) ON DELETE CASCADE,
  word_text TEXT NOT NULL,
  word_meaning TEXT NOT NULL,
  example_sentence TEXT,
  example_sentence_meaning TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE words ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "Words are viewable by everyone" ON words
  FOR SELECT USING (true);
```

### User Progress Table
```sql
CREATE TABLE user_sets_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  set_id UUID REFERENCES word_sets(id) ON DELETE CASCADE,
  learned_count INTEGER DEFAULT 0,
  total_words INTEGER DEFAULT 0,
  average_score REAL DEFAULT 0.0,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, set_id)
);

-- Enable Row Level Security
ALTER TABLE user_sets_data ENABLE ROW LEVEL SECURITY;

-- Create policy for users to manage their own progress
CREATE POLICY "Users can manage own progress" ON user_sets_data
  FOR ALL USING (auth.uid() = user_id);
```

### User Words Data Table
```sql
CREATE TABLE user_words_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  word_id UUID REFERENCES words(id) ON DELETE CASCADE,
  set_id UUID REFERENCES word_sets(id) ON DELETE CASCADE,
  is_learned BOOLEAN DEFAULT FALSE,
  learned_at TIMESTAMP WITH TIME ZONE,
  practice_count INTEGER DEFAULT 0,
  last_practiced_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, word_id, set_id)
);

-- Enable Row Level Security
ALTER TABLE user_words_data ENABLE ROW LEVEL SECURITY;

-- Create policy for users to manage their own word data
CREATE POLICY "Users can manage own word data" ON user_words_data
  FOR ALL USING (auth.uid() = user_id);
```

### Eğer tablo zaten varsa, unique constraint eklemek için:
```sql
-- Mevcut tabloya unique constraint ekle
ALTER TABLE user_words_data 
ADD CONSTRAINT user_words_unique UNIQUE (user_id, word_id, set_id);

-- user_sets_data tablosu için unique constraint ekle
ALTER TABLE user_sets_data 
ADD CONSTRAINT user_sets_data_unique UNIQUE (user_id, set_id);
```

## 4. Sample Data

Insert some sample word sets and words:

```sql
-- Insert sample word sets
INSERT INTO word_sets (title, description, category, difficulty, icon, gradient_start, gradient_end) VALUES
('Hayvanlar', 'En yaygın hayvan isimleri.', 'topics', 'easy', '🐾', '#10B981', '#3B82F6'),
('Meyveler', 'Yaygın meyve isimleri.', 'topics', 'easy', '🍎', '#F59E0B', '#EF4444'),
('Renkler', 'Temel renk isimleri.', 'topics', 'easy', '🎨', '#6366F1', '#8B5CF6'),
('Meslekler', 'Yaygın meslek isimleri.', 'topics', 'medium', '👩‍⚕️', '#06b6d4', '#818cf8'),
('Duygular', 'Temel duygu ifadeleri.', 'topics', 'medium', '😊', '#f43f5e', '#fbbf24');

-- Insert sample words for Hayvanlar set
INSERT INTO words (set_id, word_text, word_meaning, example_sentence, example_sentence_meaning) 
SELECT 
  ws.id,
  w.word_text,
  w.word_meaning,
  w.example_sentence,
  w.example_sentence_meaning
FROM word_sets ws
CROSS JOIN (VALUES
  ('cat', 'kedi', 'The cat is sleeping.', 'Kedi uyuyor.'),
  ('dog', 'köpek', 'The dog is barking.', 'Köpek havlıyor.'),
  ('bird', 'kuş', 'A bird is flying.', 'Bir kuş uçuyor.'),
  ('horse', 'at', 'The horse runs fast.', 'At hızlı koşuyor.'),
  ('fish', 'balık', 'Fish live in water.', 'Balıklar suda yaşar.'),
  ('lion', 'aslan', 'The lion is the king of the jungle.', 'Aslan ormanın kralıdır.'),
  ('elephant', 'fil', 'The elephant has a long trunk.', 'Filin uzun bir hortumu var.'),
  ('rabbit', 'tavşan', 'The rabbit eats carrots.', 'Tavşan havuç yer.')
) AS w(word_text, word_meaning, example_sentence, example_sentence_meaning)
WHERE ws.title = 'Hayvanlar';

-- Insert sample words for Meyveler set
INSERT INTO words (set_id, word_text, word_meaning, example_sentence, example_sentence_meaning) 
SELECT 
  ws.id,
  w.word_text,
  w.word_meaning,
  w.example_sentence,
  w.example_sentence_meaning
FROM word_sets ws
CROSS JOIN (VALUES
  ('apple', 'elma', 'I eat an apple every day.', 'Her gün bir elma yerim.'),
  ('banana', 'muz', 'Bananas are yellow.', 'Muzlar sarıdır.'),
  ('grape', 'üzüm', 'Grapes can be green or purple.', 'Üzümler yeşil veya mor olabilir.'),
  ('orange', 'portakal', 'Oranges are rich in vitamin C.', 'Portakallar C vitamini açısından zengindir.'),
  ('strawberry', 'çilek', 'Strawberries are sweet.', 'Çilekler tatlıdır.'),
  ('watermelon', 'karpuz', 'Watermelon is refreshing in summer.', 'Karpuz yazın ferahlatıcıdır.'),
  ('lemon', 'limon', 'Lemons are sour.', 'Limonlar ekşidir.'),
  ('pear', 'armut', 'Pears are juicy.', 'Armutlar suludur.')
) AS w(word_text, word_meaning, example_sentence, example_sentence_meaning)
WHERE ws.title = 'Meyveler';
```

## 5. Update Functions

Create functions to automatically update timestamps:

```sql
-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for all tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_word_sets_updated_at BEFORE UPDATE ON word_sets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_words_updated_at BEFORE UPDATE ON words
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_progress_updated_at BEFORE UPDATE ON user_progress
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_words_data_updated_at BEFORE UPDATE ON user_words_data
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

## 6. Authentication Setup

1. Go to Authentication > Settings in your Supabase dashboard
2. Configure your site URL and redirect URLs
3. Enable email confirmations if needed
4. Set up any additional authentication providers (Google, GitHub, etc.)

## 7. Testing the Connection

After setting up everything, test the connection by running your app and checking if the data loads correctly from Supabase.

## Notes

- Make sure to replace the environment variables with your actual Supabase credentials
- The RLS (Row Level Security) policies ensure users can only access their own data
- The sample data provides a good starting point for testing the app
- You can modify the schema and sample data according to your specific needs
