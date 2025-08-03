import SQLite from 'react-native-sqlite-storage';

SQLite.enablePromise(true);

const DB_NAME = 'vocabulary_app.db';

const TABLES_SQL = [
  `CREATE TABLE IF NOT EXISTS users (
    username TEXT PRIMARY KEY,
    first_name TEXT,
    last_name TEXT,
    gender TEXT,
    userMail TEXT UNIQUE NOT NULL,
    phone TEXT,
    userLevel INTEGER DEFAULT 1,
    learnedWordCount INTEGER DEFAULT 0,
    experimentScore INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS wordSets (
    setId INTEGER PRIMARY KEY AUTOINCREMENT,
    setName TEXT,
    difficulty TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS words (
    wordId INTEGER PRIMARY KEY AUTOINCREMENT,
    setId INTEGER,
    wordText TEXT,
    wordTextMean TEXT,
    exampleSentence TEXT,
    exampleSentenceMean TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (setId) REFERENCES wordSets(setId) ON DELETE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS userSetsData (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT,
    setId INTEGER,
    learnedCount INTEGER DEFAULT 0,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (username) REFERENCES users(username) ON DELETE CASCADE,
    FOREIGN KEY (setId) REFERENCES wordSets(setId) ON DELETE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS userWordsData (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT,
    wordId INTEGER,
    is_learned INTEGER DEFAULT 0,
    learned_at DATETIME,
    FOREIGN KEY (username) REFERENCES users(username) ON DELETE CASCADE,
    FOREIGN KEY (wordId) REFERENCES words(wordId) ON DELETE CASCADE
  )`,
];

const DUMMY_USERS = [
  [
    'testuser', 'Ali', 'Veli', 'male', 'ali.veli@mail.com', '5551112233', 2, 5, 10
  ],
  [
    'janedoe', 'Jane', 'Doe', 'female', 'jane.doe@mail.com', '5552223344', 1, 2, 5
  ]
];

const DUMMY_WORDSETS = [
  ['Basic Words', 'easy'],
  ['Intermediate Set', 'medium'],
];

const DUMMY_WORDS = [
  [1, 'apple', 'elma', 'I eat an apple.', 'Bir elma yiyorum.'],
  [1, 'book', 'kitap', 'This is my book.', 'Bu benim kitabım.'],
  [2, 'challenge', 'meydan okuma', 'This is a big challenge.', 'Bu büyük bir meydan okuma.'],
];

let db;

export const openDatabase = async () => {
  if (db) return db;
  db = await SQLite.openDatabase({ name: DB_NAME, location: 'default' });
  return db;
};

export const setupDatabase = async () => {
  const database = await openDatabase();
  await database.transaction(async (tx) => {
    for (const sql of TABLES_SQL) {
      await tx.executeSql(sql);
    }
    // Insert dummy users
    for (const user of DUMMY_USERS) {
      await tx.executeSql(
        `INSERT OR IGNORE INTO users (username, first_name, last_name, gender, userMail, phone, userLevel, learnedWordCount, experimentScore)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        user
      );
    }
    // Insert dummy word sets
    for (const set of DUMMY_WORDSETS) {
      await tx.executeSql(
        `INSERT OR IGNORE INTO wordSets (setName, difficulty) VALUES (?, ?)`,
        set
      );
    }
    // Insert dummy words
    for (const word of DUMMY_WORDS) {
      await tx.executeSql(
        `INSERT OR IGNORE INTO words (setId, wordText, wordTextMean, exampleSentence, exampleSentenceMean) VALUES (?, ?, ?, ?, ?)`,
        word
      );
    }
  });
};

export const getUsers = async () => {
  const database = await openDatabase();
  const [results] = await database.executeSql('SELECT * FROM users');
  return results.rows.raw();
};

export const getWordSets = async () => {
  const database = await openDatabase();
  const [results] = await database.executeSql('SELECT * FROM wordSets');
  return results.rows.raw();
};

export const getWordsBySetId = async (setId) => {
  const database = await openDatabase();
  const [results] = await database.executeSql('SELECT * FROM words WHERE setId = ?', [setId]);
  return results.rows.raw();
};

export default {
  openDatabase,
  setupDatabase,
  getUsers,
  getWordSets,
  getWordsBySetId,
};
