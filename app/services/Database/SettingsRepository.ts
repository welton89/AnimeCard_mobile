import * as SQLite from 'expo-sqlite';
import { Settings, SettingDBItem, defaultSettings } from '@app/types/config'; 
import { Character, Anime } from '@app/services/types'

const DB_NAME = 'app.db';
let db: SQLite.SQLiteDatabase | null = null;


/**
 * Obtém a conexão com o banco de dados (padrão Singleton).
 */
export const getDBConnection = async (): Promise<SQLite.SQLiteDatabase> => {
  if (db) return db;
  try {
    db = await SQLite.openDatabaseAsync(DB_NAME); 
    console.log('Database opened successfully with async API.');
    return db;
  } catch (error) {
    console.error('Database connection failed:', error);
    // Re-lança o erro para ser capturado onde getDBConnection é chamado
    throw error; 
  }
};

/**
 * Cria todas as tabelas necessárias: settings, animes e chars.
 */
export const createSettingsTable = async (database: SQLite.SQLiteDatabase): Promise<void> => {
  // Query para a tabela settings
  const settingsQuery = `
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY NOT NULL,
      value TEXT NOT NULL
    );
  `;
  // Query para a tabela animes
  const animeQuery = `
    CREATE TABLE IF NOT EXISTS animes (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      images TEXT,
      status TEXT NOT NULL
    );
  `;
  // Query para a tabela chars (Personagens)
  const charQuery = `
    CREATE TABLE IF NOT EXISTS chars (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      images TEXT,
      animeId TEXT,
      FOREIGN KEY (animeId) REFERENCES animes(id) ON DELETE CASCADE
    );
  `;
  try {
    // Executa a criação de todas as tabelas
    await database.execAsync(settingsQuery);
    await database.execAsync(animeQuery);
    await database.execAsync(charQuery);
    console.log('Todas as tabelas foram verificadas/criadas com sucesso.');
  } catch (error) {
    console.error('Failed to create tables:', error);
    throw error;
  }
};


/**
 * Função central para garantir que o DB e todas as tabelas estejam prontas.
 * ESTA DEVE SER CHAMADA E AGUARDADA NO INÍCIO DA APLICAÇÃO.
 */
export const initializeDBAndTables = async (): Promise<void> => {
  const database = await getDBConnection();
  await createSettingsTable(database);
};


const getSettingsFromDB = async (database: SQLite.SQLiteDatabase): Promise<Settings> => {
  const query = 'SELECT * FROM settings';
  try {
    const result = await database.getAllAsync<SettingDBItem>(query); 
    const currentSettings: Partial<Settings> = {};
    
    result.forEach(item => {
      // É crucial garantir que o valor seja mapeado corretamente para o tipo
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
    value: String(value), // Garante que tudo seja string para o DB
  }));

  const query = `INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?);`;
  
  try {
    // Usamos runAsync em loop para atualizar cada chave/valor.
    for (const item of dataToSave) {
        await database.runAsync(query, [item.key, item.value]);
    }
    console.log('Settings salvas com sucesso.');
  } catch (error) {
    console.error("Failed to save all settings:", error);
    throw error;
  }
};


/**
 * Inicializa o banco de dados e as configurações (cria tabelas e insere valores iniciais).
 */
export const initializeSettings = async (): Promise<Settings> => {
  const database = await getDBConnection();
  await createSettingsTable(database); // Garante que as tabelas existam

  const settings = await getSettingsFromDB(database);
  
  // Condição para popular com dados padrão se estiver vazio
  if (!settings.name || settings.name === defaultSettings.name) {
      // Salva para garantir que todos os campos padrão estão lá
      await saveAllSettings(database, defaultSettings);
      return defaultSettings;
  }
  
  return settings;
};


/**
 * Objeto de Repositório Principal para Settings
 */
export const SettingsRepository = {
    // Use a função que faz o setup completo, incluindo o preenchimento inicial.
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
    description || '', // Fallback para string vazia
    images || '',      // Fallback para string vazia
    status || 'list',
  ]);
};

// READ: Busca um único Anime pelo ID
export const getAnimeById = async (animeId: string): Promise<Anime | null> => {
  const database = await getDBConnection();
  const query = `SELECT * FROM animes WHERE id = ?;`;
  const result = await database.getFirstAsync<Anime>(query, [animeId]);

  if (result) {
    // Mapeia para o tipo Anime.
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
    // Aponta para a inicialização completa (que cria as tabelas)
    initialize: initializeSettings, 
    getAll: async () => getAllAnimes(),
    set: async (anime:Anime) => saveAnime(anime),
    del: async (id:string) => deleteAnimeById(id),
};




// CREATE/UPDATE: Salva um Personagem (usa REPLACE)
export const saveCharacter = async (char: Character): Promise<void> => {
  const database = await getDBConnection();
  const query = `
    INSERT OR REPLACE INTO chars (id, name, description, images, animeId)
    VALUES (?, ?, ?, ?, ?);
  `;
  const { id, name, description, images, animeId } = char;

  console.warn(char)

  await database.runAsync(query, [
    id,
    name,
    description || '', // CORREÇÃO: Garante que não é null/undefined
    images || '',      // CORREÇÃO: Garante que não é null/undefined
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

// READ: Busca todos os Personagens
export const getAllCharacter = async (): Promise<Character[]> => {
  const database = await getDBConnection();
  const query = `SELECT * FROM chars;`;
  const results = await database.getAllAsync<Character>(query);

    return results.map(row => ({
      id: row.id,
      name: row.name,
      description: row.description,
      images: row.images,
      animeId: row.animeId
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
    // Aponta para a inicialização completa (que cria as tabelas)
    initialize: initializeSettings,
    getAll: async () => getAllCharacter(),
    set: async (char:Character) => saveCharacter(char),
    del: async (id:string) => deleteCharacterById(id),
};