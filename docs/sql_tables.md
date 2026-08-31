-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.categories (
  category_id integer NOT NULL DEFAULT nextval('categories_category_id_seq'::regclass),
  set_id integer,
  category_name text NOT NULL,
  description text,
  icon text,
  difficulty text DEFAULT 'A1'::text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT categories_pkey PRIMARY KEY (category_id),
  CONSTRAINT categories_set_id_fkey FOREIGN KEY (set_id) REFERENCES public.word_sets(set_id)
);
CREATE TABLE public.quiz_results (
  quiz_id integer NOT NULL DEFAULT nextval('quiz_results_quiz_id_seq'::regclass),
  user_id uuid,
  set_id integer,
  total_questions integer,
  correct_answers integer,
  score real,
  completed_at timestamp with time zone DEFAULT now(),
  time_taken integer DEFAULT 0,
  CONSTRAINT quiz_results_pkey PRIMARY KEY (quiz_id),
  CONSTRAINT quiz_results_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id),
  CONSTRAINT quiz_results_set_id_fkey FOREIGN KEY (set_id) REFERENCES public.word_sets(set_id)
);
CREATE TABLE public.user_favorites (
  favorite_id integer NOT NULL DEFAULT nextval('user_favorites_favorite_id_seq'::regclass),
  user_id uuid,
  word_id integer,
  added_at timestamp with time zone DEFAULT now(),
  CONSTRAINT user_favorites_pkey PRIMARY KEY (favorite_id),
  CONSTRAINT user_favorites_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id),
  CONSTRAINT user_favorites_word_id_fkey FOREIGN KEY (word_id) REFERENCES public.words(word_id)
);
CREATE TABLE public.user_sets_data (
  id integer NOT NULL DEFAULT nextval('user_sets_data_id_seq'::regclass),
  user_id uuid,
  set_id integer,
  learned_count integer DEFAULT 0,
  total_words integer DEFAULT 0,
  average_score real DEFAULT 0.0,
  completed_at timestamp with time zone,
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT user_sets_data_pkey PRIMARY KEY (id),
  CONSTRAINT user_sets_data_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id),
  CONSTRAINT user_sets_data_set_id_fkey FOREIGN KEY (set_id) REFERENCES public.word_sets(set_id)
);
CREATE TABLE public.user_words_data (
  id integer NOT NULL DEFAULT nextval('user_words_data_id_seq'::regclass),
  user_id uuid,
  word_id integer,
  set_id integer,
  is_learned boolean DEFAULT false,
  attempt_count integer DEFAULT 0,
  correct_count integer DEFAULT 0,
  learned_at timestamp with time zone,
  last_attempt timestamp with time zone,
  difficulty_rating integer DEFAULT 0,
  CONSTRAINT user_words_data_pkey PRIMARY KEY (id),
  CONSTRAINT user_words_data_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id),
  CONSTRAINT user_words_data_word_id_fkey FOREIGN KEY (word_id) REFERENCES public.words(word_id),
  CONSTRAINT user_words_data_set_id_fkey FOREIGN KEY (set_id) REFERENCES public.word_sets(set_id)
);
CREATE TABLE public.users (
  user_id uuid NOT NULL,
  username text UNIQUE,
  email text UNIQUE,
  first_name text,
  last_name text,
  gender text,
  phone text,
  profile_image text,
  user_level integer DEFAULT 1,
  learned_word_count integer DEFAULT 0,
  experiment_score integer DEFAULT 0,
  current_streak integer DEFAULT 0,
  max_streak integer DEFAULT 0,
  total_study_time integer DEFAULT 0,
  preferred_language text DEFAULT 'tr'::text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT users_pkey PRIMARY KEY (user_id),
  CONSTRAINT users_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.word_sets (
  set_id integer NOT NULL DEFAULT nextval('word_sets_set_id_seq'::regclass),
  set_name text NOT NULL,
  difficulty text,
  description text,
  icon text,
  color text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT word_sets_pkey PRIMARY KEY (set_id)
);
CREATE TABLE public.word_translations (
  translation_id integer NOT NULL DEFAULT nextval('word_translations_translation_id_seq'::regclass),
  word_id integer,
  language_code text NOT NULL,
  word_text text NOT NULL,
  meaning text NOT NULL,
  example_sentence text,
  example_sentence_mean text,
  pronunciation text,
  word_type text,
  audio_url text,
  image_url text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT word_translations_pkey PRIMARY KEY (translation_id),
  CONSTRAINT word_translations_word_id_fkey FOREIGN KEY (word_id) REFERENCES public.words(word_id)
);
CREATE TABLE public.words (
  word_id integer NOT NULL DEFAULT nextval('words_word_id_seq'::regclass),
  category_id integer,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT words_pkey PRIMARY KEY (word_id),
  CONSTRAINT words_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(category_id)
);