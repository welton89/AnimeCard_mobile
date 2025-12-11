import { gunService } from './GunDB';
import { Anime, Character } from './types';
import { Settings } from '@app/types/config';
import { StorageService } from './Storage';

// Utilitário para gerar IDs únicos
const generateId = () => `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// Utilitário para timestamps
const getTimestamp = () => new Date().toISOString();

export class GunAnimeRepository {
  private animesRef = gunService.getAnimesRef();

  async getAll(): Promise<Anime[]> {
    return new Promise((resolve) => {
      const animes: Anime[] = [];
      const processedKeys = new Set();
      
      // Primeiro tenta carregar do AsyncStorage
      StorageService.getItem<Anime[]>('gun_animes_cache').then(cachedAnimes => {
        if (cachedAnimes && cachedAnimes.length > 0) {
          resolve(cachedAnimes);
        }
      });

      this.animesRef.map().on((data: any, key: string) => {
        if (data && data !== null && !processedKeys.has(key)) {
          processedKeys.add(key);
          
          // Valida dados antes de adicionar
          const validatedAnime = {
            ...data,
            id: key,
            name: data.name || 'Nome não disponível',
            images: data.images || '',
            description: data.description || ''
          };
          
          animes.push(validatedAnime);
          
          // Atualiza cache
          StorageService.setItem('gun_animes_cache', animes);
        }
      });

      // Aguarda um tempo para coletar dados
      setTimeout(() => {
        resolve(animes); // Resolve mesmo se vazio
      }, 300); // Timeout menor
    });
  }

  async set(anime: Anime): Promise<void> {
    const timestamp = getTimestamp();
    const animeData = {
      ...anime,
      updatedAt: timestamp,
      createdAt: anime.createdAt || timestamp
    };

    try {
      // 1. Salva no AsyncStorage primeiro (sempre funciona)
      await this.updateCache('animes', anime.id, animeData);
      console.log('Anime salvo no cache local:', anime.name);

      // 2. Tenta salvar no Gun.js em background (não bloqueia)
      this.animesRef.get(anime.id).put(animeData, (ack: any) => {
        if (ack.err) {
          console.warn('Falha ao salvar no Gun.js:', ack.err);
        } else {
          console.log('Anime sincronizado com Gun.js:', anime.name);
        }
      });

      // Resolve imediatamente após salvar no cache
      return Promise.resolve();
      
    } catch (error) {
      console.error('Erro ao salvar anime:', error);
      throw error;
    }
  }

  async get(id: string): Promise<Anime | null> {
    try {
      // Primeiro tenta do cache
      const cached = await StorageService.getItem<Anime[]>('gun_animes_cache') || [];
      const cachedAnime = cached.find(anime => anime.id === id);
      
      if (cachedAnime) {
        return cachedAnime;
      }

      // Se não encontrou no cache, tenta do Gun.js com timeout
      return new Promise((resolve) => {
        const timeout = setTimeout(() => {
          resolve(null);
        }, 1000); // Timeout de 1 segundo

        this.animesRef.get(id).once((data: any) => {
          clearTimeout(timeout);
          if (data && data !== null) {
            resolve({ ...data, id });
          } else {
            resolve(null);
          }
        });
      });
    } catch (error) {
      console.warn('Erro ao buscar anime:', error);
      return null;
    }
  }

  async del(id: string): Promise<void> {
    try {
      // 1. Remove do AsyncStorage primeiro (sempre funciona)
      await this.removeFromCache('animes', id);
      console.log('Anime removido do cache local:', id);

      // 2. Tenta remover do Gun.js em background (não bloqueia)
      this.animesRef.get(id).put(null, (ack: any) => {
        if (ack.err) {
          console.warn('Falha ao remover do Gun.js:', ack.err);
        } else {
          console.log('Anime removido do Gun.js:', id);
        }
      });

      // Resolve imediatamente após remover do cache
      return Promise.resolve();
      
    } catch (error) {
      console.error('Erro ao deletar anime:', error);
      throw error;
    }
  }

  // Método para atualizar progresso
  async updateProgress(id: string, episode: number, season?: number): Promise<void> {
    const anime = await this.get(id);
    if (anime) {
      const updatedAnime = {
        ...anime,
        currentEpisode: episode,
        currentSeason: season || anime.currentSeason,
        updatedAt: getTimestamp()
      };
      await this.set(updatedAnime);
    }
  }

  private async updateCache(type: string, id: string, data: any) {
    try {
      console.log(`Salvando ${type} no cache:`, id, data.name);
      const cached = await StorageService.getItem<any[]>(`gun_${type}_cache`) || [];
      const index = cached.findIndex(item => item.id === id);
      
      if (index >= 0) {
        cached[index] = { ...data, id };
        console.log(`${type} atualizado no cache`);
      } else {
        cached.push({ ...data, id });
        console.log(`${type} adicionado ao cache`);
      }
      
      await StorageService.setItem(`gun_${type}_cache`, cached);
      console.log(`Cache ${type} salvo com ${cached.length} itens`);
    } catch (error) {
      console.error('Erro ao atualizar cache:', error);
    }
  }

  private async removeFromCache(type: string, id: string) {
    try {
      const cached = await StorageService.getItem<any[]>(`gun_${type}_cache`) || [];
      const filtered = cached.filter(item => item.id !== id);
      await StorageService.setItem(`gun_${type}_cache`, filtered);
      console.log(`Item ${id} removido do cache ${type}`);
    } catch (error) {
      console.warn('Erro ao remover do cache:', error);
    }
  }
}

export class GunCharacterRepository {
  private charactersRef = gunService.getCharactersRef();

  async getAll(): Promise<Character[]> {
    return new Promise((resolve) => {
      const characters: Character[] = [];
      const processedKeys = new Set();
      
      // Primeiro tenta carregar do AsyncStorage
      StorageService.getItem<Character[]>('gun_characters_cache').then(cachedChars => {
        if (cachedChars && cachedChars.length > 0) {
          resolve(cachedChars);
        }
      });

      this.charactersRef.map().on((data: any, key: string) => {
        if (data && data !== null && !processedKeys.has(key)) {
          processedKeys.add(key);
          
          // Valida dados antes de adicionar
          const validatedCharacter = {
            ...data,
            id: key,
            name: data.name || 'Nome não disponível',
            images: data.images || '',
            description: data.description || '',
            animeId: data.animeId || 'unknown'
          };
          
          characters.push(validatedCharacter);
          
          // Atualiza cache
          StorageService.setItem('gun_characters_cache', characters);
        }
      });

      setTimeout(() => {
        resolve(characters); // Resolve mesmo se vazio
      }, 300); // Timeout menor
    });
  }

  async set(character: Character): Promise<void> {
    const timestamp = getTimestamp();
    const characterData = {
      ...character,
      updatedAt: timestamp,
      createdAt: character.createdAt || timestamp
    };

    try {
      // 1. Salva no AsyncStorage primeiro (sempre funciona)
      const animeRepo = new GunAnimeRepository();
      await animeRepo['updateCache']('characters', character.id, characterData);
      console.log('Personagem salvo no cache local:', character.name);

      // 2. Tenta salvar no Gun.js em background (não bloqueia)
      this.charactersRef.get(character.id).put(characterData, (ack: any) => {
        if (ack.err) {
          console.warn('Falha ao salvar no Gun.js:', ack.err);
        } else {
          console.log('Personagem sincronizado com Gun.js:', character.name);
        }
      });

      // Resolve imediatamente após salvar no cache
      return Promise.resolve();
      
    } catch (error) {
      console.error('Erro ao salvar personagem:', error);
      throw error;
    }
  }

  async get(id: string): Promise<Character | null> {
    try {
      // Primeiro tenta do cache
      const cached = await StorageService.getItem<Character[]>('gun_characters_cache') || [];
      const cachedCharacter = cached.find(character => character.id === id);
      
      if (cachedCharacter) {
        return cachedCharacter;
      }

      // Se não encontrou no cache, tenta do Gun.js com timeout
      return new Promise((resolve) => {
        const timeout = setTimeout(() => {
          resolve(null);
        }, 1000); // Timeout de 1 segundo

        this.charactersRef.get(id).once((data: any) => {
          clearTimeout(timeout);
          if (data && data !== null) {
            resolve({ ...data, id });
          } else {
            resolve(null);
          }
        });
      });
    } catch (error) {
      console.warn('Erro ao buscar personagem:', error);
      return null;
    }
  }

  async del(id: string): Promise<void> {
    try {
      // 1. Remove do AsyncStorage primeiro (sempre funciona)
      const animeRepo = new GunAnimeRepository();
      await animeRepo['removeFromCache']('characters', id);
      console.log('Personagem removido do cache local:', id);

      // 2. Tenta remover do Gun.js em background (não bloqueia)
      this.charactersRef.get(id).put(null, (ack: any) => {
        if (ack.err) {
          console.warn('Falha ao remover do Gun.js:', ack.err);
        } else {
          console.log('Personagem removido do Gun.js:', id);
        }
      });

      // Resolve imediatamente após remover do cache
      return Promise.resolve();
      
    } catch (error) {
      console.error('Erro ao deletar personagem:', error);
      throw error;
    }
  }

  async toggleFavorite(id: string): Promise<void> {
    const character = await this.get(id);
    if (character) {
      const updatedCharacter = {
        ...character,
        favorite: !character.favorite,
        updatedAt: getTimestamp()
      };
      await this.set(updatedCharacter);
    }
  }
}

export class GunSettingsRepository {
  private settingsRef = gunService.getSettingsRef();

  async get(): Promise<Partial<Settings>> {
    return new Promise(async (resolve) => {
      // Primeiro tenta carregar do AsyncStorage
      const cachedSettings = await StorageService.getItem<Settings>('gun_settings_cache');
      if (cachedSettings) {
        resolve(cachedSettings);
      }

      const settings: Partial<Settings> = {};
      
      this.settingsRef.map().on((value: any, key: string) => {
        if (value !== null && value !== undefined) {
          (settings as any)[key] = value;
          
          // Atualiza cache
          StorageService.setItem('gun_settings_cache', settings);
        }
      });

      setTimeout(() => resolve(settings), 500);
    });
  }

  async save(settings: Settings): Promise<void> {
    const promises = Object.entries(settings).map(([key, value]) => {
      return new Promise<void>((resolve, reject) => {
        this.settingsRef.get(key).put(value, (ack: any) => {
          if (ack.err) {
            reject(new Error(`Erro ao salvar configuração ${key}: ${ack.err}`));
          } else {
            resolve();
          }
        });
      });
    });

    await Promise.all(promises);
    
    // Atualiza cache
    await StorageService.setItem('gun_settings_cache', settings);
  }

  async initialize(): Promise<Settings> {
    const currentSettings = await this.get();
    
    if (Object.keys(currentSettings).length === 0) {
      const { defaultSettings } = await import('@app/types/config');
      await this.save(defaultSettings);
      return defaultSettings;
    }

    const { defaultSettings } = await import('@app/types/config');
    return { ...defaultSettings, ...currentSettings } as Settings;
  }
}

// Instâncias dos repositórios
export const gunAnimeRepository = new GunAnimeRepository();
export const gunCharacterRepository = new GunCharacterRepository();
export const gunSettingsRepository = new GunSettingsRepository();