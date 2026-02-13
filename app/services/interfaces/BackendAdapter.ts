import { WordSet, WordTranslation, User, UserSetData, UserWordData, QuizResult, UserFavorite } from '../../types';

export interface SyncResult {
    categories: any[];
    wordSets: any[];
    words: any[];
    translations: any[];
    timestamp: string;
}

export interface BackendAdapter {
    // Initialization & Sync
    initialize(): Promise<void>;
    getAllData(): Promise<SyncResult>;
    getUpdates(lastSyncTimestamp: string): Promise<SyncResult>; // Delta Sync

    // Auth
    login(email: string, password: string): Promise<{ user: any; error: any }>;
    register(email: string, password: string, userData?: any): Promise<{ data: any; error: any }>;
    logout(): Promise<void>;
    getCurrentUser(): Promise<any>;

    // User Data
    getUser(userId: string): Promise<User | null>;
    createUser(userData: Partial<User>): Promise<User>;
    updateUser(userId: string, updates: Partial<User>): Promise<User>;

    // Progress & Activity
    getUserProgress(userId: string, setId: number): Promise<UserSetData | null>;
    saveUserProgress(userId: string, setId: number, data: Partial<UserSetData>): Promise<boolean>;

    saveQuizResult(result: QuizResult): Promise<boolean>;

    // Word Learning Status
    saveWordLearningStatus(userId: string, wordId: number, status: Partial<UserWordData>): Promise<boolean>;
    batchSaveWordLearningStatus(data: Partial<UserWordData>[]): Promise<boolean>;

    // Favorites
    addFavorite(userId: string, wordId: number): Promise<boolean>;
    removeFavorite(userId: string, wordId: number): Promise<boolean>;
    getFavorites(userId: string): Promise<UserFavorite[]>;
}
