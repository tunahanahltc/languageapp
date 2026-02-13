// Global type definitions

// Word related types
export interface Word {
  word_id: number;
  category_id?: number;
  created_at?: string;
  updated_at?: string;
}

// Word Translation types
export interface WordTranslation {
  translation_id: number;
  word_id: number;
  language_code: string;
  word_text: string;
  meaning: string;
  example_sentence?: string | null;
  example_sentence_mean?: string | null;
  pronunciation?: string | null;
  word_type?: string | null;
  audio_url?: string | null;
  image_url?: string | null;
  created_at?: string;
  updated_at?: string;
}

// Category types
export interface Category {
  category_id: number;
  set_id: number;
  category_name: string;
  description?: string | null;
  icon?: string | null;
  created_at?: string;
  updated_at?: string;
  difficulty?: string;
}

// WordSet related types
export interface WordSet {
  set_id: number;
  set_name: string;
  difficulty?: string | null;
  description?: string | null;
  icon?: string | null;
  color?: string | null;
  created_at?: string;
  updated_at?: string;
  word_count?: number;
  is_public?: boolean;
  created_by?: string;
  user_id?: string;
  // Compatibility aliases
  id?: number;
  name?: string;
}

// Progress related types
export interface Progress {
  id: number;
  user_id: string;
  word_id: number;
  word_set_id: number;
  correct_count: number;
  incorrect_count: number;
  last_practiced?: string;
  mastery_level: number;
  created_at?: string;
}

// User related types
export interface User {
  user_id: string;
  username?: string;
  first_name?: string | null;
  last_name?: string | null;
  gender?: string | null;
  email: string;
  phone?: string | null;
  profile_image?: string | null;
  user_level?: number;
  learned_word_count?: number;
  experiment_score?: number;
  current_streak?: number;
  max_streak?: number;
  total_study_time?: number;
  preferred_language?: string;
  created_at?: string;
  updated_at?: string;
  // Compatibility aliases
  id?: string;
}

// User Set Data types
export interface UserSetData {
  id?: number;
  user_id: string;
  set_id: number;
  learned_count: number;
  total_words: number;
  average_score: number;
  completed_at?: string | null;
  updated_at?: string;
}

// User Word Data types
export interface UserWordData {
  id?: number;
  user_id: string;
  set_id: number;
  word_id: number;
  is_learned: number | boolean;
  attempt_count: number;
  correct_count: number;
  learned_at?: string | null;
  last_attempt?: string | null;
  difficulty_rating: number;
}

// User Favorite types
export interface UserFavorite {
  favorite_id?: number;
  user_id: string;
  word_id: number;
  added_at: string;
}

// Auth related types
export interface AuthSession {
  access_token: string;
  refresh_token: string;
  user: User;
}

// Theme related types
export type ThemeType = string;

// ThemeColors is a readonly array of gradient color strings
export type ThemeColors = readonly string[];

// Quiz Result types
export interface QuizResult {
  quiz_id?: number;
  user_id: string;
  set_id: number;
  total_questions: number;
  correct_answers: number;
  score: number;
  completed_at: string;
  time_taken: number;
}

// ThemeColorProperties contains all color properties for a theme
export interface ThemeColorProperties {
  gradientStart: string;
  gradientEnd: string;
  text: string;
  textSecondary: string;
  border: string;
  surface: string;
  primary: string;
  secondary: string;
  background: string;
  cardBackground: string;
  inputBackground: string;
  error: string;
}

export interface Theme {
  name: string;
  displayName: string;
  colors: ThemeColors;
  isDark: boolean;
}

// TTS Settings
export interface TTSSettings {
  enabled: boolean;
  rate: number;
  pitch: number;
  language: string;
}

export interface PracticeStats {
  totalWords: number;
  masteredWords: number;
  learningWords: number;
  newWords: number;
  streak: number;
  lastPracticeDate?: string;
}

// Navigation types
export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Main: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  WordSets: undefined;
  Practice: undefined;
  Profile: undefined;
};

export type HomeStackParamList = {
  HomeScreen: undefined;
  WordLearn: {
    wordSetId: number;
    wordSetName: string;
  };
  Flashcard: {
    wordSetId: number;
    wordSetName: string;
  };
};

// Auth Stack Navigation Types
export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

// Word Learn Screen Params
export interface WordLearnScreenParams {
  wordSet?: any;
  category?: any;
}

// Flashcard Screen Params
export interface FlashcardScreenParams {
  wordSet?: any;
  categoryId?: number | string;
}

// WordSetsPage Params
export interface WordSetsPageParams {
  refresh?: boolean;
}

// Screen Navigation Props
import { RouteProp } from '@react-navigation/native';

export type LoginScreenNavigationProp = any;
export type RegisterScreenNavigationProp = any;
export type HomeScreenNavigationProp = any;
export type WordSetsPageNavigationProp = any;
export type ProfileScreenNavigationProp = any;
export type PracticeScreenNavigationProp = any;

// Route Props
export type WordLearnScreenRouteProp = RouteProp<MainTabParamList & { WordLearnScreen: WordLearnScreenParams }, 'WordLearnScreen'>;
export type FlashcardScreenRouteProp = RouteProp<MainTabParamList & { FlashcardScreen: FlashcardScreenParams }, 'FlashcardScreen'>;
export type WordSetsPageRouteProp = RouteProp<MainTabParamList, 'WordSets'>;
