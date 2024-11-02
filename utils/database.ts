import Translation from "@/models/Translation";
import * as SQLite from "expo-sqlite";

const DBProvider = {
  migrateDbIfNeeded: async (db: SQLite.SQLiteDatabase) => {
    const DATABASE_VERSION = 1;
    let currentDbVersion: { user_version: number } | null =
      await db.getFirstAsync<{
        user_version: number;
      }>("PRAGMA user_version");

    if (currentDbVersion == null) return;

    if (currentDbVersion.user_version >= DATABASE_VERSION) {
      return;
    }

    if (currentDbVersion.user_version === 0) {
      await db.execAsync(`
        PRAGMA journal_mode = 'wal';
        CREATE TABLE translations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            source_text TEXT NOT NULL,
            source_language VARCHAR(5) NOT NULL,
            translated_text TEXT NOT NULL,
            target_language VARCHAR(5) NOT NULL,
            is_marked BOOLEAN DEFAULT FALSE,
            is_deleted BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      currentDbVersion.user_version = 1;
    }
    await db.execAsync(`PRAGMA user_version = ${DATABASE_VERSION}`);
  },
  getTranslations: async (db: SQLite.SQLiteDatabase) => {
    return await db.getAllAsync<Translation>(
      "SELECT * FROM translations WHERE is_deleted = 0 order by created_at desc"
    );
  },

  getTranslation: async (db: SQLite.SQLiteDatabase, id: number) => {
    return await db.getFirstAsync<Translation>(
      "SELECT * FROM translations WHERE id = ? AND is_deleted = ?",
      id,
      0
    );
  },

  insertTranslation: async (
    db: SQLite.SQLiteDatabase,
    translationData: Translation
  ) => {
    return await db.runAsync(
      `INSERT INTO translations (source_text, source_language, translated_text, target_language) VALUES (?, ?, ?, ?)`,
      translationData.source_text,
      translationData.source_language,
      translationData.translated_text,
      translationData.target_language
    );
  },

  updateTranslation: async (
    db: SQLite.SQLiteDatabase,
    translationData: Translation
  ) => {
    if (!translationData.id) return;

    return await db.runAsync(
      `UPDATE translations 
       SET source_text = ?, 
           source_language = ?, 
           translated_text = ?, 
           target_language = ? ,
           is_marked = ?
       WHERE id = ?`,
      [
        translationData.source_text,
        translationData.source_language,
        translationData.translated_text,
        translationData.target_language,
        translationData.is_marked ? translationData.is_marked : 0,
        translationData.id,
      ]
    );
  },

  getFavorites: async (db: SQLite.SQLiteDatabase) => {
    return await db.getAllAsync<Translation>(
      "SELECT * FROM translations WHERE is_deleted = ? AND is_marked = ? order by created_at desc",
      0,
      1
    );
  },

  deleteAllTranslations: async (db: SQLite.SQLiteDatabase) => {
    await db.runAsync("DELETE * FROM translations WHERE is_marked = ?", 0);

    await db.runAsync(
      "UPDATE translations SET is_deleted = ? WHERE is_marked = ?",
      1,
      1
    );
  },
};

export default DBProvider;
