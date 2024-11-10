import Translation from "@/models/Translation";
import VoiceTranslation, {
  VoiceTranslationRoom,
} from "@/models/VoiceTranslation";
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
      await db.execAsync(`
        PRAGMA journal_mode = 'wal';
        CREATE TABLE voice_conversation_room (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            source_language VARCHAR(5) NOT NULL,
            target_language VARCHAR(5) NOT NULL
        )
      `);
      await db.execAsync(`
        PRAGMA journal_mode = 'wal';
        CREATE TABLE voice_conversation_messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            room_id INTEGER NOT NULL,
            source_text TEXT NOT NULL,
            source_language VARCHAR(5) NOT NULL,
            translated_text TEXT NOT NULL,
            target_language VARCHAR(5) NOT NULL,
            is_mine BOOLEAN NOT NULL,
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
      "SELECT * FROM translations WHERE is_marked = ? order by created_at desc",

      1
    );
  },

  deleteAllTranslations: async (db: SQLite.SQLiteDatabase) => {
    await db.runAsync("UPDATE translations SET is_deleted = ?", [1]);
  },

  //Voice Conversation Room
  insertVoiceConversationRoom: async (
    db: SQLite.SQLiteDatabase,
    sourceLanguage: string,
    targetLanguage: string
  ) => {
    return await db.runAsync(
      `INSERT INTO voice_conversation_room (source_language, target_language) VALUES (?, ?)`,
      sourceLanguage,
      targetLanguage
    );
  },

  getVoiceConversationRoom: async (
    db: SQLite.SQLiteDatabase,
    options: {
      sourceLanguage: string;
      targetLanguage: string;
    }
  ) => {
    return await db.getFirstAsync<VoiceTranslationRoom>(
      "SELECT * FROM voice_conversation_room WHERE source_language = ? AND target_language = ? LIMIT ?",
      options.sourceLanguage,
      options.targetLanguage,
      1
    );
  },

  //Voice Conversation Messages
  insertVoiceConversationMessage: async (
    db: SQLite.SQLiteDatabase,
    roomId: number,
    data: VoiceTranslation
  ) => {
    return await db.runAsync(
      `INSERT INTO voice_conversation_messages (room_id, source_text, source_language, translated_text, target_language, is_mine) VALUES (?, ?, ?, ?, ?, ?)`,
      roomId,
      data.source_text,
      data.source_language,
      data.translated_text,
      data.target_language,
      data.is_mine
    );
  },

  getVoiceConversationMessages: async (
    db: SQLite.SQLiteDatabase,
    options: {
      roomId: number;
      limit: number;
      offset?: number;
    }
  ) => {
    return await db.getAllAsync<VoiceTranslation>(
      "SELECT * FROM voice_conversation_messages WHERE room_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?",
      options.roomId,
      options.limit,
      options.offset || 0
    );
  },
};

export default DBProvider;
