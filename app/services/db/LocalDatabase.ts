import * as SQLite from 'expo-sqlite';

class LocalDatabase {
    private static instance: LocalDatabase;
    private db: SQLite.SQLiteDatabase;

    private constructor() {
        this.db = SQLite.openDatabaseSync('languageapp.db');
    }

    public static getInstance(): LocalDatabase {
        if (!LocalDatabase.instance) {
            LocalDatabase.instance = new LocalDatabase();
        }
        return LocalDatabase.instance;
    }

    public getDatabase(): SQLite.SQLiteDatabase {
        return this.db;
    }
}

export default LocalDatabase.getInstance();
