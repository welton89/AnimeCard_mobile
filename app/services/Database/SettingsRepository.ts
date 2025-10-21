import * as SQLite from 'expo-sqlite';
import { Settings, SettingDBItem, defaultSettings } from '@app/types/config'; 
import {Character, Anime} from '@app/services/types'

const DB_NAME = 'app.db';
let db: SQLite.SQLiteDatabase | null = null;


export const getDBConnection = async (): Promise<SQLite.SQLiteDatabase> => {
  if (db) return db;
  try {
    db = await SQLite.openDatabaseAsync(DB_NAME); 
    console.log('Database opened successfully with async API.');
    return db;
  } catch (error) {
    console.error('Database connection failed:', error);
    throw error;
  }
};

/**
 * Cria a tabela de configurações.
 */
export const createSettingsTable = async (database: SQLite.SQLiteDatabase): Promise<void> => {
  const query = `
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY NOT NULL,
      value TEXT NOT NULL
    );
  `;
  const anime = `
    CREATE TABLE IF NOT EXISTS animes (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      images TEXT,
      status TEXT NOT NULL
    );
  `;
  const char = `
    CREATE TABLE IF NOT EXISTS chars (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      images TEXT,
      animeId TEXT,
      FOREIGN KEY (animeId) REFERENCES animes(id)
    );
  `;
  try {
    await database.execAsync(query);
    await database.execAsync(char);
    await database.execAsync(anime);
  } catch (error) {
    console.error('Failed to create settings table:', error);
    throw error;
  }
};


const getSettingsFromDB = async (database: SQLite.SQLiteDatabase): Promise<Settings> => {
  const query = 'SELECT * FROM settings';
  try {
    const result = await database.getAllAsync<SettingDBItem>(query); 
    const currentSettings: Partial<Settings> = {};
    
    result.forEach(item => {
      (currentSettings as any)[item.key] = item.value; 
    });

    const mergedSettings: Settings = { ...defaultSettings, ...currentSettings as Settings };
    return mergedSettings;

  } catch (error) {
    console.error("Failed to get settings from DB:", error);
    throw error;
  }
};


export const saveAllSettings = async (database: SQLite.SQLiteDatabase, settings: Settings): Promise<void> => {
  const dataToSave: SettingDBItem[] = Object.entries(settings).map(([key, value]) => ({
    key: key as keyof Settings,
    value: String(value), // Garante que tudo seja string
  }));

  const query = `INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?);`;
  
  try {
    // Usamos o runAsync() em loop para atualizar cada chave/valor.
    // O runAsync é a versão assíncrona correta para execução de comandos individuais.
    for (const item of dataToSave) {
        await database.runAsync(query, [item.key, item.value]);
    }
  } catch (error) {
    console.error("Failed to save all settings:", error);
    throw error;
  }
};


/**
 * Inicializa o banco de dados e a tabela, e insere os valores iniciais se estiver vazia.
 */
export const initializeSettings = async (): Promise<Settings> => {
  const database = await getDBConnection();
  await createSettingsTable(database);

  const settings = await getSettingsFromDB(database);
  
  // Condição para popular com dados padrão se estiver vazio
  if (!settings.name || settings.name === defaultSettings.name) {
      // Re-salva para garantir que todos os campos padrão estão lá
      await saveAllSettings(database, defaultSettings);
      return defaultSettings;
  }
  
  return settings;
};


/**
 * Objeto de Repositório Principal
 */
export const SettingsRepository = {
    initialize: initializeSettings,
    get: async () => getSettingsFromDB(await getDBConnection()),
    save: async (settings: Settings) => saveAllSettings(await getDBConnection(), settings),
};





// CREATE/UPDATE: Salva um Anime (usa REPLACE para cobrir INSERT e UPDATE)
export const saveAnime = async (anime: Anime): Promise<void> => {
  const database = await getDBConnection();
  const query = `
    INSERT OR REPLACE INTO animes (id, name, description, images, status)
    VALUES ( ?, ?, ?, ?, ?);
  `;
  const { id, name, description, images, status } = anime;

  await database.runAsync(query, [
    id,
    name,
    description || null,
    images || null,
    status || 'Desconhecido',
  ]);
};

// READ: Busca um único Anime pelo ID
export const getAnimeById = async (animeId: string): Promise<Anime | null> => {
  const database = await getDBConnection();
  const query = `SELECT * FROM animes WHERE id = ?;`;
  const result = await database.getFirstAsync<Anime>(query, [animeId]);

  if (result) {
    // Expo-sqlite retorna um objeto com as colunas do DB. Mapeamos para o tipo Anime.
    const { id, name, images, description, status } = result;
    return { id, name, images, description, status } as Anime;
  }
  return null;
};

// READ: Busca todos os Animes
export const getAllAnimes = async (): Promise<Anime[]> => {
  const database = await getDBConnection();
  const query = `SELECT * FROM animes;`;
  const results = await database.getAllAsync<Anime>(query);
  
  // Mapeia os resultados para garantir a tipagem correta
  return results.map(row => ({
    id: row.id,
    name: row.name,
    images: row.images,
    description: row.description,
    status: row.status,
  })) as Anime[];
};

// DELETE: Remove um Anime pelo ID
export const deleteAnimeById = async (animeId: string): Promise<void> => {
  const database = await getDBConnection();
  const query = `DELETE FROM animes WHERE id = ?;`;
  await database.runAsync(query, [animeId]);
};



export const AnimeRepository = {
    initialize: initializeSettings,
    getAll: async () => getAllAnimes(),
    set: async (anime:Anime) => saveAnime(anime),
    del: async (id:string) => deleteAnimeById(id),
    // save: async (settings: Settings) => saveAllSettings(await getDBConnection(), settings),
};




// CREATE/UPDATE: Salva um Personagem (usa REPLACE)
export const saveCharacter = async (char: Character): Promise<void> => {
  const database = await getDBConnection();
  const query = `
    INSERT OR REPLACE INTO chars (id, name, description, images, animeId)
    VALUES (?, ?, ?, ?, ?);
  `;
  const { id, name, description, images, animeId } = char;

  await database.runAsync(query, [
    id,
    name,
    description || null,
    images || null,
    animeId,
  ]);
};

// READ: Busca um único Personagem pelo ID
export const getCharacterById = async (charId: string): Promise<Character | null> => {
  const database = await getDBConnection();
  const query = `SELECT * FROM chars WHERE id = ?;`;
  const result = await database.getFirstAsync<Character>(query, [charId]);

  if (result) {
    const { id, name, description, images, animeId } = result;
    return { id, name, description, images, animeId } as Character;
  }
  return null;
};
// READ: Busca um all Personagem
export const getAllCharacter = async (): Promise<Character[]> => {
  const database = await getDBConnection();
  const query = `SELECT * FROM chars;`;
  const results = await database.getAllAsync<Character>(query);

    return results.map(row => ({
      id: row.id,
      name: row.name,
      description: row.description,
      images: row.images,
    })) as Character[];

  }


// READ: Busca todos os Personagens de um Anime específico
export const getCharactersByAnimeId = async (animeId: string): Promise<Character[]> => {
  const database = await getDBConnection();
  const query = `SELECT * FROM chars WHERE animeId = ?;`;
  const results = await database.getAllAsync<Character>(query, [animeId]);

  return results.map(row => ({
    id: row.id,
    name: row.name,
    description: row.description,
    images: row.images,
    animeId: row.animeId,
  })) as Character[];
};

// DELETE: Remove um Personagem pelo ID
export const deleteCharacterById = async (charId: string): Promise<void> => {
  const database = await getDBConnection();
  const query = `DELETE FROM chars WHERE id = ?;`;
  await database.runAsync(query, [charId]);
};



export const CharRepository = {
    initialize: initializeSettings,
    getAll: async () => getAllCharacter(),
    set: async (char:Character) => saveCharacter(char),
    del: async (id:string) => deleteCharacterById(id),
};