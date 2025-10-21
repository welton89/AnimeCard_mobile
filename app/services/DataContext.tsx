// DataContex.tsx
import React, { createContext, useContext, useState, useMemo, useEffect, useCallback } from 'react';
import type { Anime, Character } from "@app/services/types";
import * as api from "@app/services/api"; // Certifique-se de que a importação da API está aqui
import { AnimeRepository, CharRepository } from '@app/services/Database/SettingsRepository';
import { useSettingsStore } from '@app/hooks/useSettingsStore';
import { ActivityIndicator, MD2Colors, Text } from 'react-native-paper';

// 1. Defina o formato dos dados (incluindo o status de carregamento e a nova função)
interface DataContextType {
  characters: Character[];
  setCharacters: React.Dispatch<React.SetStateAction<Character[]>>;
  animes: Anime[];
  setAnimes: React.Dispatch<React.SetStateAction<Anime[]>>;
  loading: boolean;
  addAnime: (newAnime:Anime) => Promise<void>; 
  delAnime: (id:string) => Promise<void>; 
  addChar: (newChar:Character) => Promise<void>; 

}

export const DataContext = createContext<DataContextType | undefined>(undefined);

// 2. Componente Provedor (Aonde o Estado e a API são Chamados)
export function DataProvider({ children }: { children: React.ReactNode }) {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [animes, setAnimes] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(true);
  const { settings, isLoading, isInitialized, initialize, updateSetting } = useSettingsStore();
  

  // Lógica de Chamada da API para inicialização
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      if (settings.API != ''){
        const [animesData, charactersData] = await Promise.all([
          api.getAnimes(),
          api.getCharacters(),
        ]);
        setAnimes(animesData);
        setCharacters(charactersData); 
      }else{
        const [animesData, charactersData] = await Promise.all([
           AnimeRepository.getAll(),
           CharRepository.getAll(),
          ]);
          setAnimes(animesData);
          setCharacters(charactersData); 
      }
    } catch (error) {
      console.error("Failed to fetch data", error);
    } finally {
      setLoading(false);
    }
  }, [settings]);
  

  useEffect(() => {
    // 1. Garante que o store de settings inicializou E que não estamos carregando as configurações
    if (isInitialized && !isLoading) {
        fetchData();
    }
}, [isInitialized, isLoading, fetchData])
// ----------------------------------------------------------------------
// 🎯 NOVA FUNÇÃO: ADICIONAR ANIME E CHAMAR API
// ----------------------------------------------------------------------
  const addAnime = useCallback(async (newAnime: Anime) => {
    try {
      if (settings.API != ''){
        const createdAnime = await api.createAnime(newAnime);
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
  }, [settings]);


  const delAnime = useCallback(async (id: string) => {
    try {
      if (settings.API != ''){
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
  }, [settings]);


  const addChar = useCallback(async (newChar: Character) => {
    try {
      if (settings.API != ''){
        const createdAnime = await api.createCharacter(newChar);
        CharRepository.set(newChar)
        setCharacters(prevCharacters => [...prevCharacters, newChar]);

      }else{
        CharRepository.set(newChar)
        setCharacters(prevCharacters => [...prevCharacters, newChar]);
        console.log('Char adicionado com sucesso:', newChar.name);
      }
      
      // 2. ATUALIZA O ESTADO LOCAL: Usa a função de callback para garantir o estado mais recente
      // setAnimes(prevAnimes => [...prevAnimes, createdAnime]);
      // setAnimesFilter(prevAnimesFilter => [...prevAnimesFilter, createdAnime]);

    } catch (error) {
      console.error("Falha ao adicionar anime no servidor.", error);
      throw error; // Propaga o erro para o componente que chamou
    }
  }, [settings]);

// ----------------------------------------------------------------------

  // Chama a API apenas na montagem do Provider
  useEffect(() => {
    fetchData();
  }, [settings]);

  // Use useMemo para evitar re-renders desnecessários
  const contextValue = useMemo(() => ({
    characters, setCharacters,
    animes, setAnimes,
    loading, 
    addAnime, 
    addChar,
    delAnime,
  }), [characters, animes, loading, addAnime, addChar, delAnime, settings]); // Adicione 'addAnime' como dependência


//   if (!isInitialized || loading) {
//      return (

//        <>
//      <ActivityIndicator animating={true} style={{width:'100%',height:'100%'}} size={'large'} color={MD2Colors.red800}/>
//      <Text style={{color:'black'}}>
// Carregando dados do Servidor
//      </Text>
//      </>
//       )
//     //  return null; // Pode ser um ActivityIndicator ou uma Splash Screen
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