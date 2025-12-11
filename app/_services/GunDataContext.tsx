import React, { createContext, useContext, useState, useMemo, useEffect, useCallback } from 'react';
import { View, Text } from 'react-native';
import type { Anime, Character } from "@app/_services/types";
import * as api from "@app/_services/api";
import { gunAnimeRepository, gunCharacterRepository } from '@app/_services/GunRepository';
import { gunService } from '@app/_services/GunDB';
import { useGunStore } from '@app/hooks/useGunStore';
import { useGunAuth } from '@app/hooks/useGunAuth';
import { StorageService } from './Storage';

interface GunDataContextType {
  characters: Character[];
  setCharacters: React.Dispatch<React.SetStateAction<Character[]>>;
  animes: Anime[];
  setAnimes: React.Dispatch<React.SetStateAction<Anime[]>>;
  loading: boolean;
  isOnline: boolean;
  addAnime: (newAnime: Anime) => Promise<void>;
  delAnime: (id: string) => Promise<void>;
  addChar: (newChar: Character) => Promise<void>;
  delChar: (id: string) => Promise<void>;
  updateAnime: (updatedAnime: Anime) => Promise<void>;
  updateChar: (updatedChar: Character) => Promise<void>;
  // Novos métodos
  updateAnimeProgress: (id: string, episode: number, season?: number) => Promise<void>;
  toggleCharacterFavorite: (id: string) => Promise<void>;
  getAnimesByStatus: (status: string) => Anime[];
  getFavoriteCharacters: () => Character[];
  sync: () => Promise<void>;
}

export const GunDataContext = createContext<GunDataContextType | undefined>(undefined);

export function GunDataProvider({ children }: { children: React.ReactNode }) {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [animes, setAnimes] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(true);
  
  const { 
    settings, 
    isLoading: isSettingsLoading, 
    isInitialized, 
    isOnline,
    initialize,
    sync: syncSettings 
  } = useGunStore();
  
  const { isAuthenticated, checkAuth } = useGunAuth();

  // Função para carregar dados
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Garante que os arrays nunca sejam null
      setAnimes(prev => prev || []);
      setCharacters(prev => prev || []);
      
      // 1. Carrega dados do cache AsyncStorage primeiro (rápido)
      const [cachedAnimes, cachedCharacters] = await Promise.all([
        StorageService.getItem<Anime[]>('gun_animes_cache').then(data => data || []).catch(() => []),
        StorageService.getItem<Character[]>('gun_characters_cache').then(data => data || []).catch(() => [])
      ]);
      
      // Sempre define os arrays, mesmo se vazios
      setAnimes(cachedAnimes || []);
      setCharacters(cachedCharacters || []);
      
      if (cachedAnimes.length > 0 || cachedCharacters.length > 0) {
        setLoading(false); // Para de carregar se há dados
        console.log('Dados carregados do cache local');
      }
      
      // 2. Tenta carregar do Gun.js em background (pode demorar)
      try {
        const [gunAnimesData, gunCharactersData] = await Promise.all([
          gunAnimeRepository.getAll(),
          gunCharacterRepository.getAll(),
        ]);
        
        // Valida e atualiza se houver dados diferentes
        if (gunAnimesData.length > 0 || gunCharactersData.length > 0) {
          // Valida dados dos animes
          const validAnimes = gunAnimesData.filter(anime => 
            anime && 
            anime.id && 
            anime.name && 
            typeof anime.images === 'string'
          );
          
          // Valida dados dos personagens
          const validCharacters = gunCharactersData.filter(char => 
            char && 
            char.id && 
            char.name && 
            typeof char.images === 'string' &&
            char.animeId
          );
          
          setAnimes(validAnimes);
          setCharacters(validCharacters);
          console.log('Dados validados e atualizados do Gun.js');
        }
      } catch (gunError) {
        console.warn('Gun.js ainda não disponível, usando cache:', gunError);
      }
      
      // 3. API externa removida - Gun.js é usado para sincronização P2P
      console.log('Sincronização via Gun.js P2P ativa');
      
    } catch (error) {
      console.error("Falha ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  }, [settings, isOnline]);

  // Inicialização imediata
  useEffect(() => {
    const initializeApp = async () => {
      // 1. Carrega dados imediatamente do cache
      fetchData();
      
      // 2. Inicializa Gun.js e aguarda
      await initialize();
      
      // 3. Aguarda Gun.js e SEA se estabilizarem completamente
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // 4. Verifica autenticação após Gun.js estar pronto
      await checkAuth();
      
      console.log('🎉 Inicialização completa do app');
    };
    
    initializeApp();
  }, []);

  // Recarrega dados quando autenticação muda
  useEffect(() => {
    if (isAuthenticated) {
      console.log('Usuário autenticado, recarregando dados...');
      fetchData();
    }
  }, [isAuthenticated]);

  // Verifica periodicamente se a sessão ainda está válida
  useEffect(() => {
    const checkSessionPeriodically = setInterval(async () => {
      if (isAuthenticated) {
        const stillAuth = gunService.isUserAuthenticated();
        if (!stillAuth) {
          console.log('⚠️ Sessão expirou, fazendo logout...');
          // Aqui você pode chamar logout ou tentar restaurar
          await checkAuth();
        }
      }
    }, 30000); // Verifica a cada 30 segundos

    return () => clearInterval(checkSessionPeriodically);
  }, [isAuthenticated, checkAuth]);

  // Métodos CRUD para Animes
  const addAnime = useCallback(async (newAnime: Anime) => {
    try {
      // Valida dados obrigatórios
      if (!newAnime.id || !newAnime.name) {
        throw new Error('Dados do anime inválidos: ID e nome são obrigatórios');
      }
      
      // Adiciona timestamp se não existir
      const animeWithTimestamp = {
        ...newAnime,
        images: newAnime.images || '', // Garante que images nunca seja undefined
        description: newAnime.description || '',
        createdAt: newAnime.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Salva no Gun.js primeiro (sempre funciona)
      await gunAnimeRepository.set(animeWithTimestamp);
      setAnimes(prevAnimes => [...prevAnimes, animeWithTimestamp]);

      // Sincronização automática via Gun.js P2P
      console.log('Anime salvo e sincronizado via Gun.js:', animeWithTimestamp.name);
    } catch (error) {
      console.error("Falha ao adicionar anime:", error);
      throw error;
    }
  }, [settings.API, isOnline]);

  const updateAnime = useCallback(async (updatedAnime: Anime) => {
    try {
      const animeWithTimestamp = {
        ...updatedAnime,
        updatedAt: new Date().toISOString()
      };

      await gunAnimeRepository.set(animeWithTimestamp);
      setAnimes(prevAnimes => 
        prevAnimes.map(anime => 
          anime.id === updatedAnime.id ? animeWithTimestamp : anime
        )
      );

      // Sincronização automática via Gun.js P2P
    } catch (error) {
      console.error("Falha ao atualizar anime:", error);
      throw error;
    }
  }, [settings, isOnline]);

  const delAnime = useCallback(async (id: string) => {
    try {
      await gunAnimeRepository.del(id);
      setAnimes(prevAnimes => prevAnimes.filter(anime => anime.id !== id));

      // Sincronização automática via Gun.js P2P
    } catch (error) {
      console.error("Falha ao deletar anime:", error);
      throw error;
    }
  }, [settings.API, isOnline]);

  // Métodos CRUD para Personagens
  const addChar = useCallback(async (newChar: Character) => {
    const isAlreadyInState = characters.some(char => char.id === newChar.id);
    if (isAlreadyInState) {
      console.warn(`Personagem com ID ${newChar.id} já existe. Ação abortada.`);
      return;
    }

    try {
      // Valida dados obrigatórios
      if (!newChar.id || !newChar.name || !newChar.animeId) {
        throw new Error('Dados do personagem inválidos: ID, nome e animeId são obrigatórios');
      }
      
      const charWithTimestamp = {
        ...newChar,
        images: newChar.images || '', // Garante que images nunca seja undefined
        description: newChar.description || '',
        createdAt: newChar.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await gunCharacterRepository.set(charWithTimestamp);
      setCharacters(prevCharacters => [...prevCharacters, charWithTimestamp]);

      // Sincronização automática via Gun.js P2P
    } catch (error) {
      console.error("Falha ao adicionar personagem:", error);
      throw error;
    }
  }, [settings, characters, isOnline]);

  const updateChar = useCallback(async (updatedChar: Character) => {
    try {
      const charWithTimestamp = {
        ...updatedChar,
        updatedAt: new Date().toISOString()
      };

      await gunCharacterRepository.set(charWithTimestamp);
      setCharacters(prevCharacters => 
        prevCharacters.map(char => 
          char.id === updatedChar.id ? charWithTimestamp : char
        )
      );

      // Sincronização automática via Gun.js P2P
    } catch (error) {
      console.error("Falha ao atualizar personagem:", error);
      throw error;
    }
  }, [settings, isOnline]);

  const delChar = useCallback(async (id: string) => {
    try {
      await gunCharacterRepository.del(id);
      setCharacters(prevCharacters => 
        prevCharacters.filter(char => char.id !== id)
      );

      // Sincronização automática via Gun.js P2P
    } catch (error) {
      console.error("Falha ao deletar personagem:", error);
      throw error;
    }
  }, [settings.API, isOnline]);

  // Novos métodos específicos
  const updateAnimeProgress = useCallback(async (id: string, episode: number, season?: number) => {
    try {
      await gunAnimeRepository.updateProgress(id, episode, season);
      
      setAnimes(prevAnimes => 
        prevAnimes.map(anime => 
          anime.id === id 
            ? { 
                ...anime, 
                currentEpisode: episode, 
                currentSeason: season || anime.currentSeason,
                updatedAt: new Date().toISOString()
              }
            : anime
        )
      );
    } catch (error) {
      console.error("Falha ao atualizar progresso:", error);
      throw error;
    }
  }, []);

  const toggleCharacterFavorite = useCallback(async (id: string) => {
    try {
      await gunCharacterRepository.toggleFavorite(id);
      
      setCharacters(prevCharacters => 
        prevCharacters.map(char => 
          char.id === id 
            ? { 
                ...char, 
                favorite: !char.favorite,
                updatedAt: new Date().toISOString()
              }
            : char
        )
      );
    } catch (error) {
      console.error("Falha ao alterar favorito:", error);
      throw error;
    }
  }, []);

  // Métodos de consulta
  const getAnimesByStatus = useCallback((status: string) => {
    return animes.filter(anime => anime.status === status);
  }, [animes]);

  const getFavoriteCharacters = useCallback(() => {
    return characters.filter(char => char.favorite === true);
  }, [characters]);

  // Sincronização manual
  const sync = useCallback(async () => {
    try {
      console.log('🔄 Sincronização manual iniciada no contexto...');
      
      // 1. Sincroniza configurações primeiro
      await syncSettings();
      
      // 2. Força recarregamento dos dados
      await fetchData();
      
      // 3. Força sincronização no Gun.js
      await gunAnimeRepository['sync']?.() || Promise.resolve();
      await gunCharacterRepository['sync']?.() || Promise.resolve();
      
      console.log('✅ Sincronização manual concluída no contexto');
    } catch (error) {
      console.error('❌ Erro na sincronização manual:', error);
      throw error; // Re-throw para que o componente possa tratar
    }
  }, [syncSettings, fetchData]);

  const contextValue = useMemo(() => ({
    characters, setCharacters,
    animes, setAnimes,
    loading, // Apenas o loading dos dados, não das configurações
    isOnline,
    addAnime, addChar,
    delAnime, delChar,
    updateAnime, updateChar,
    updateAnimeProgress,
    toggleCharacterFavorite,
    getAnimesByStatus,
    getFavoriteCharacters,
    sync
  }), [
    characters, animes, loading, isOnline,
    addAnime, addChar, delAnime, delChar, updateAnime, updateChar,
    updateAnimeProgress, toggleCharacterFavorite, getAnimesByStatus,
    getFavoriteCharacters, sync
  ]);

  // Sempre renderiza - não bloqueia mais
  return (
    <GunDataContext.Provider value={contextValue}>
      {children}
    </GunDataContext.Provider>
  );
}

export function useGunData() {
  const context = useContext(GunDataContext);
  if (context === undefined) {
    console.error('useGunData must be used within a GunDataProvider');
    // Retorna valores padrão para evitar crash
    return {
      characters: [],
      setCharacters: () => {},
      animes: [],
      setAnimes: () => {},
      loading: false,
      isOnline: false,
      addAnime: async () => {},
      delAnime: async () => {},
      addChar: async () => {},
      delChar: async () => {},
      updateAnime: async () => {},
      updateChar: async () => {},
      updateAnimeProgress: async () => {},
      toggleCharacterFavorite: async () => {},
      getAnimesByStatus: () => [],
      getFavoriteCharacters: () => [],
      sync: async () => {}
    };
  }
  return context;
}