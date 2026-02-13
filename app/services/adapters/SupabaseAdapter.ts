
import { BackendAdapter, SyncResult } from '../interfaces/BackendAdapter';
import { supabase } from '../../config/supabase';
import { User, UserSetData, UserWordData, QuizResult, UserFavorite } from '../../types';

export class SupabaseAdapter implements BackendAdapter {

    async initialize(): Promise<void> {
        // Supabase client is initialized in config/supabase.ts
        // We can check connection here if needed
        const { error } = await supabase.from('word_sets').select('count').single();
        if (error) {
            console.error("Supabase connection check failed", error);
            // We might not throw here to allow offline mode to proceed
        }
    }

    async getAllData(): Promise<SyncResult> {
        const [categories, wordSets, words, translations] = await Promise.all([
            supabase.from('categories').select('*'),
            supabase.from('word_sets').select('*'),
            supabase.from('words').select('*'),
            supabase.from('word_translations').select('*')
        ]);

        return {
            categories: categories.data || [],
            wordSets: wordSets.data || [],
            words: words.data || [],
            translations: translations.data || [],
            timestamp: new Date().toISOString()
        };
    }

    async getUpdates(lastSyncTimestamp: string): Promise<SyncResult> {
        // Simple Delta Sync implementation
        const [categories, wordSets, words, translations] = await Promise.all([
            supabase.from('categories').select('*').gt('updated_at', lastSyncTimestamp),
            supabase.from('word_sets').select('*').gt('updated_at', lastSyncTimestamp),
            supabase.from('words').select('*').gt('updated_at', lastSyncTimestamp),
            supabase.from('word_translations').select('*').gt('updated_at', lastSyncTimestamp)
        ]);

        return {
            categories: categories.data || [],
            wordSets: wordSets.data || [],
            words: words.data || [],
            translations: translations.data || [],
            timestamp: new Date().toISOString()
        };
    }

    async login(email: string, password: string): Promise<{ user: any; error: any }> {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        return { user: data.user, error };
    }

    async register(email: string, password: string, userData?: any): Promise<{ data: any; error: any }> {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: { data: userData }
        });
        return { data, error };
    }

    async logout(): Promise<void> {
        await supabase.auth.signOut();
    }

    async getCurrentUser(): Promise<any> {
        const { data: { user } } = await supabase.auth.getUser();
        return user;
    }

    async getUser(userId: string): Promise<User | null> {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (error) return null;
        return data as User;
    }

    async createUser(userData: Partial<User>): Promise<User> {
        const { data, error } = await supabase
            .from('users')
            .insert([userData])
            .select()
            .single();

        if (error) throw error;
        return data as User;
    }

    async updateUser(userId: string, updates: Partial<User>): Promise<User> {
        const { data, error } = await supabase
            .from('users')
            .update(updates)
            .eq('user_id', userId)
            .select()
            .single();

        if (error) throw error;
        return data as User;
    }

    async getUserProgress(userId: string, setId: number): Promise<UserSetData | null> {
        const { data, error } = await supabase
            .from('user_sets_data')
            .select('*')
            .eq('user_id', userId)
            .eq('set_id', setId)
            .single();

        if (error) return null;
        return data as UserSetData;
    }

    async saveUserProgress(userId: string, setId: number, data: Partial<UserSetData>): Promise<boolean> {
        const { error } = await supabase
            .from('user_sets_data')
            .upsert([{
                user_id: userId,
                set_id: setId,
                ...data
            }], {
                onConflict: 'user_id,set_id'
            });

        if (error) {
            console.error("Supabase saveUserProgress error", error);
            return false;
        }
        return true;
    }

    async saveQuizResult(result: QuizResult): Promise<boolean> {
        const { error } = await supabase
            .from('quiz_results')
            .insert([result]);

        if (error) {
            console.error("Supabase saveQuizResult error", error);
            return false;
        }
        return true;
    }

    async saveWordLearningStatus(userId: string, wordId: number, status: Partial<UserWordData>): Promise<boolean> {
        const { error } = await supabase
            .from('user_words_data')
            .upsert([{
                user_id: userId,
                word_id: wordId,
                ...status
            }], {
                onConflict: 'user_id,word_id,set_id'
            });

        if (error) {
            console.error("Supabase saveWordLearningStatus error", error);
            return false;
        }
        return true;
    }

    async batchSaveWordLearningStatus(data: Partial<UserWordData>[]): Promise<boolean> {
        const { error } = await supabase
            .from('user_words_data')
            .upsert(data, {
                onConflict: 'user_id,word_id,set_id'
            });

        if (error) {
            console.error("Supabase batchSaveWordLearningStatus error", error);
            return false;
        }
        return true;
    }

    async addFavorite(userId: string, wordId: number): Promise<boolean> {
        const { error } = await supabase
            .from('user_favorites')
            .insert([{ user_id: userId, word_id: wordId }]);

        if (error) {
            console.error("Supabase addFavorite error", error);
            return false;
        }
        return true;
    }

    async removeFavorite(userId: string, wordId: number): Promise<boolean> {
        const { error } = await supabase
            .from('user_favorites')
            .delete()
            .eq('user_id', userId)
            .eq('word_id', wordId);

        if (error) {
            console.error("Supabase removeFavorite error", error);
            return false;
        }
        return true;
    }

    async getFavorites(userId: string): Promise<UserFavorite[]> {
        const { data, error } = await supabase
            .from('user_favorites')
            .select('*')
            .eq('user_id', userId);

        if (error) return [];
        return data as UserFavorite[];
    }
}
