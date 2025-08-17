import { supabase } from '../config/supabase';

// Word Sets Operations
export const getWordSets = async () => {
  try {
    const { data, error } = await supabase
      .from('word_sets')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching word sets:', error);
    throw error;
  }
};

export const getWordSetById = async (id) => {
  try {
    const { data, error } = await supabase
      .from('word_sets')
      .select('*')
      .eq('set_id', id)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching word set:', error);
    throw error;
  }
};

// Get words by set ID through categories
export const getWordsBySetId = async (setId) => {
  try {
    // First get categories for this set
    const { data: categories, error: catError } = await supabase
      .from('categories')
      .select('category_id')
      .eq('set_id', setId);

    if (catError) throw catError;

    if (!categories || categories.length === 0) {
      return [];
    }

    const categoryIds = categories.map(cat => cat.category_id);

    // Then get words for these categories
    const { data: words, error: wordsError } = await supabase
      .from('words')
      .select('word_id')
      .in('category_id', categoryIds);

    if (wordsError) throw wordsError;

    if (!words || words.length === 0) {
      return [];
    }

    const wordIds = words.map(word => word.word_id);

    // Finally get translations for these words
    const { data: translations, error: transError } = await supabase
      .from('word_translations')
      .select('*')
      .in('word_id', wordIds)
      .eq('language_code', 'en') // English words
      .order('created_at', { ascending: true });

    if (transError) throw transError;
    return translations || [];
  } catch (error) {
    console.error('Error fetching words by set ID:', error);
    throw error;
  }
};

// Get word count by set ID
export const getWordCountBySetId = async (setId) => {
  try {
    // First get categories for this set
    const { data: categories, error: catError } = await supabase
      .from('categories')
      .select('category_id')
      .eq('set_id', setId);

    if (catError) throw catError;

    if (!categories || categories.length === 0) {
      return 0;
    }

    const categoryIds = categories.map(cat => cat.category_id);

    // Then get word count for these categories
    const { count, error: wordsError } = await supabase
      .from('words')
      .select('*', { count: 'exact', head: true })
      .in('category_id', categoryIds);

    if (wordsError) throw wordsError;

    return count || 0;
  } catch (error) {
    console.error('Error fetching word count by set ID:', error);
    throw error;
  }
};



// Get all categories
export const getAllCategories = async () => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('category_id', { ascending: true });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};

// Get all words from words table (not translations)
export const getAllWordsFromWordsTable = async () => {
  try {
    const { data, error } = await supabase
      .from('words')
      .select('*')
      .order('word_id', { ascending: true });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching words:', error);
    throw error;
  }
};

export const createWordSet = async (wordSetData) => {
  try {
    const { data, error } = await supabase
      .from('word_sets')
      .insert([wordSetData])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating word set:', error);
    throw error;
  }
};

// Words Operations
export const getAllWords = async () => {
  try {
    const { data, error } = await supabase
      .from('word_translations')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching all words:', error);
    throw error;
  }
};



export const createWord = async (wordData) => {
  try {
    const { data, error } = await supabase
      .from('word_translations')
      .insert([wordData])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating word:', error);
    throw error;
  }
};

// User Operations
export const createUser = async (userData) => {
  try {
    console.log('Creating user in database:', userData);
    const { data, error } = await supabase
      .from('users')
      .insert([userData])
      .select()
      .single();

    console.log('Create user response:', { data, error });

    if (error) {
      console.error('Database create user error:', error);
      throw error;
    }
    return data;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

export const getUserByEmail = async (email) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
};

export const getUserById = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
};

export const updateUser = async (userId, updates) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};

// User Progress Operations
export const getUserProgress = async (userId, setId) => {
  try {
    const { data, error } = await supabase
      .from('user_sets_data')
      .select('*')
      .eq('user_id', userId)
      .eq('set_id', setId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching user progress:', error);
    throw error;
  }
};

export const updateUserProgress = async (userId, setId, progressData) => {
  try {
    const { data, error } = await supabase
      .from('user_sets_data')
      .upsert([{
        user_id: userId,
        set_id: setId,
        ...progressData
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating user progress:', error);
    throw error;
  }
};

// User Words Data Operations
export const getUserWordData = async (userId, wordId) => {
  try {
    const { data, error } = await supabase
      .from('user_words_data')
      .select('*')
      .eq('user_id', userId)
      .eq('word_id', wordId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching user word data:', error);
    throw error;
  }
};

export const updateUserWordData = async (userId, wordId, wordData) => {
  try {
    const { data, error } = await supabase
      .from('user_words_data')
      .upsert([{
        user_id: userId,
        word_id: wordId,
        ...wordData
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating user word data:', error);
    throw error;
  }
};

// Quiz Results Operations
export const saveQuizResult = async (quizData) => {
  try {
    const { data, error } = await supabase
      .from('quiz_results')
      .insert([quizData])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error saving quiz result:', error);
    throw error;
  }
};

export const getUserQuizResults = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('quiz_results')
      .select('*')
      .eq('user_id', userId)
      .order('completed_at', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching quiz results:', error);
    throw error;
  }
};

// User Favorites Operations
export const addToFavorites = async (userId, wordId) => {
  try {
    const { data, error } = await supabase
      .from('user_favorites')
      .insert([{
        user_id: userId,
        word_id: wordId
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error adding to favorites:', error);
    throw error;
  }
};

export const removeFromFavorites = async (userId, wordId) => {
  try {
    const { error } = await supabase
      .from('user_favorites')
      .delete()
      .eq('user_id', userId)
      .eq('word_id', wordId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error removing from favorites:', error);
    throw error;
  }
};

export const getUserFavorites = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('user_favorites')
      .select('*')
      .eq('user_id', userId)
      .order('added_at', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching user favorites:', error);
    throw error;
  }
};

// Authentication
export const signUp = async (email, password, userData) => {
  try {
    console.log('Signing up with:', { email, userData });
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData
      }
    });

    console.log('Supabase signUp response:', { data, error });

    if (error) {
      console.error('Supabase signUp error:', error);
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error signing up:', error);
    throw error;
  }
};

export const signIn = async (email, password) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error signing in:', error);
    throw error;
  }
};

export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

export const getCurrentUser = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) {
      // Auth session missing normal bir durum
      if (error.message?.includes('Auth session missing')) {
        return null;
      }
      throw error;
    }
    return user;
  } catch (error) {
    console.error('Error getting current user:', error);
    throw error;
  }
};

export default {
  // Word Sets
  getWordSets,
  getWordSetById,
  createWordSet,
  
  // Words
  getAllWords,
  getAllCategories,
  getAllWordsFromWordsTable,
  getWordsBySetId,
  createWord,
  
  // Users
  createUser,
  getUserByEmail,
  getUserById,
  updateUser,
  
  // Progress
  getUserProgress,
  updateUserProgress,
  
  // Word Data
  getUserWordData,
  updateUserWordData,
  
  // Quiz
  saveQuizResult,
  getUserQuizResults,
  
  // Favorites
  addToFavorites,
  removeFromFavorites,
  getUserFavorites,
  
  // Auth
  signUp,
  signIn,
  signOut,
  getCurrentUser
};
