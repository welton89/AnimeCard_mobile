

import React, { createContext, useContext, useState, useMemo, useEffect, useCallback } from 'react';
import type { Anime, Character } from "@app/_services/types";
import * as api from "@app/_services/api"; // Certifique-se de que a importação da API está aqui
import { AnimeRepository, CharRepository } from '@app/_services/Database/SettingsRepository';
import { useSettingsStore } from '@app/hooks/useSettingsStore';
import { StyleSheet } from 'react-native';

// 1. Defina o formato dos dados (incluindo o status de carregamento e a nova função)
interface DataContextType {
  characters: Character[];
  setCharacters: React.Dispatch<React.SetStateAction<Character[]>>;
  animes: Anime[];
  setAnimes: React.Dispatch<React.SetStateAction<Anime[]>>;
  loading: boolean; // Indica se os dados estão sendo carregados (inicialização + fetch)
  addAnime: (newAnime:Anime) => Promise<void>; 
  delAnime: (id:string) => Promise<void>; 
  addChar: (newChar:Character) => Promise<void>; 
  delChar: (id:string) => Promise<void>; 
  updateAnime: (updatedAnime: Anime) => Promise<void>; 
  updateChar: (updatedChar: Character) => Promise<void>;
}

export const DataContext = createContext<DataContextType | undefined>(undefined);

// 2. Componente Provedor (Aonde o Estado e a API são Chamados)
export function DataProvider({ children }: { children: React.ReactNode }) {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [animes, setAnimes] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Assumimos que useSettingsStore lida com initializeSettings() e o isInitialized só é true APÓS o DB estar pronto.
  const { settings, isLoading: isSettingsLoading, isInitialized, initialize, updateSetting } = useSettingsStore();
  

  // Lógica de Chamada da API / DB para inicialização dos dados
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [animesData, charactersData] = await Promise.all([
           AnimeRepository.getAll(),
           CharRepository.getAll(),
          ]);
          setAnimes(animesData);
          setCharacters(charactersData); 
      
      // Checa o modo de operação (API ou Local DB)
      if (settings.API !== ''){
        const [animesData, charactersData] = await Promise.all([
          api.getAnimes(),
          api.getCharacters(),
        ]);
        setAnimes(animesData);
        setCharacters(charactersData); 
      }else{
        console.log('dados locais')

      }
    } catch (error) {
      console.error("Failed to fetch data", error);
    } finally {
      setLoading(false);
    }
  }, [settings]);
  

  useEffect(() => {
    if (isInitialized && !isSettingsLoading) {
        fetchData();
    }
  }, [isInitialized, isSettingsLoading, fetchData])
// ----------------------------------------------------------------------
  const addAnime = useCallback(async (newAnime: Anime) => {
    try {
      if (settings.API !== ''){
        await api.createAnime(newAnime);
        AnimeRepository.set(newAnime)
        setAnimes(prevAnimes => [...prevAnimes, newAnime]);
      }else{
        AnimeRepository.set(newAnime)
        setAnimes(prevAnimes => [...prevAnimes, newAnime]);
        console.log('Anime adicionado com sucesso:', newAnime.name );
      }
    } catch (error) {
      console.error("Falha ao adicionar anime no servidor.", error);
      throw error; // Propaga o erro para o componente que chamou
    }
  }, [settings.API]);


  const updateAnime = useCallback(async (updatedAnime: Anime) => {
    try {
        if (settings.API !== '') {
            await api.updateAnime(updatedAnime.id, updatedAnime);
            AnimeRepository.set(updatedAnime);
        } else {
            AnimeRepository.set(updatedAnime);
            console.log(`Anime atualizado localmente: ${updatedAnime.name}`);
        }
        setAnimes(prevAnimes => 
            prevAnimes.map(anime => 
                anime.id === updatedAnime.id ? updatedAnime : anime
            )
        );

    } catch (error) {
        console.error("Falha ao atualizar anime.", error);
        throw error;
    }
}, [settings]);

  const delAnime = useCallback(async (id: string) => {
    try {
      if (settings.API !== ''){
        await api.deleteAnime(id);
        AnimeRepository.del(id)
         setAnimes(prevAnimes => {
            return prevAnimes.filter(anime => anime.id !== id);
          });
           console.log('Anime apagado do servidor com sucesso:', id );
      }else{
        AnimeRepository.del(id)
         setAnimes(prevAnimes => {
            return prevAnimes.filter(anime => anime.id !== id);
          });
        console.log('Anime apagado com sucesso:', id );
      }
    } catch (error) {
      console.error("Falha ao adicionar anime no servidor.", error);
      throw error; // Propaga o erro para o componente que chamou
    }
  }, [settings.API]);


 const addChar = useCallback(async (newChar: Character) => {
    const isAlreadyInState = characters.some(char => char.id === newChar.id);
    if (isAlreadyInState) {
        console.warn(`Personagem com ID ${newChar.id} já existe no estado. Ação abortada.`);
        return; 
    }

    try {
      if (settings.API !== ''){
        await api.createCharacter(newChar);
        CharRepository.set(newChar); // Salva no local após sucesso da API
        setCharacters(prevCharacters => [...prevCharacters, newChar]);
      }else{
        // Esta chamada AGORA é segura, pois o componente principal está bloqueado pelo !isInitialized || loading
        CharRepository.set(newChar);
        setCharacters(prevCharacters => [...prevCharacters, newChar]);
        console.log('Char adicionado com sucesso:', newChar.name);
      }
      
    } catch (error) {
      console.error("Falha ao adicionar personagem.", error);
      throw error; 
    }
  }, [settings, characters]);
// ----------------------------------------------------------------------

const updateChar = useCallback(async (updatedChar: Character) => {
    try {
        if (settings.API !== '') {
            await api.updateCharacter(updatedChar.id,updatedChar);
            CharRepository.set(updatedChar);

        } else {
            CharRepository.set(updatedChar);
            console.log(`Personagem atualizado localmente: ${updatedChar.name}`);
        }
        setCharacters(prevCharacters => 
            prevCharacters.map(char => 
                char.id === updatedChar.id ? updatedChar : char
            )
        );

    } catch (error) {
        console.error("Falha ao atualizar personagem.", error);
        throw error;
    }
}, [settings, characters]);



  const delChar = useCallback(async (id: string) => {
    try {
      if (settings.API !== ''){
        await api.deleteCharacter(id);
        CharRepository.del(id)
        setCharacters(prevCsetCharacters => {
            return prevCsetCharacters.filter(char => char.id !== id);
          });
          console.log('Personagem apagado do servidor com sucesso:', id );
      }else{
        CharRepository.del(id)
        setCharacters(prevCsetCharacters => {
            return prevCsetCharacters.filter(char => char.id !== id);
          });
        console.log('Personagem apagado com sucesso:', id );
      }
    } catch (error) {
      console.error("Falha ao apagar personagem no servidor.", error);
      throw error; // Propaga o erro para o componente que chamou
    }
  }, [settings.API]);

// ----------------------------------------------------------------------


  // Use useMemo para evitar re-renders desnecessários
  const contextValue = useMemo(() => ({
    characters, setCharacters,
    animes, setAnimes,
    loading: loading || isSettingsLoading, // Combina loading de dados e de settings
    addAnime, 
    addChar,
    delAnime,
    delChar,
    updateAnime,
    updateChar, 
  }), [characters, animes, loading, isSettingsLoading, addAnime,
     addChar, delAnime, delChar, updateAnime, updateChar]); 


  // 🚨 BLOQUEIO DE CARREGAMENTO CRÍTICO 🚨
  // Esta lógica garante que NENHUM componente filho que dependa das funções DB
  // seja renderizado antes da inicialização do DB e do carregamento inicial dos dados.
  // if (!isInitialized || loading || isSettingsLoading) {
  // if (!isInitialized || loading || isSettingsLoading) {
  //    return (
  //      <View style={styles.loadingContainer}>
  //        <ActivityIndicator animating={true} size={'large'} color={MD2Colors.red800}/>
  //        <Text style={styles.loadingText}>
  //          Carregando dados do Catálogo...
  //        </Text>
  //      </View>
  //     )
  // }


  return (
    <DataContext.Provider value={contextValue}>
      {children}
    </DataContext.Provider>
  );
}

// 4. Hook customizado useData permanece o mesmo
export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
