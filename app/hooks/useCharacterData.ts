import { useState, useEffect } from 'react';
// Certifique-se de que CharacterData e CharacterApiResponse estão importados
import { CharacterData, CharacterApiResponse } from '@app/types/CharacterData'; 

// 1. Função de busca de dados (mantida como auxiliar)
const fetchCharacterData = async (characterId: string): Promise<CharacterData> => {
  const endpoint = `https://api.jikan.moe/v4/characters/${characterId}/full`;
  
  const response = await fetch(endpoint);
  
  if (!response.ok) {
    throw new Error(`Erro ao buscar dados: ${response.statusText}`);
  }
  
  const data: CharacterApiResponse = await response.json();
  return data.data; 
};

export const useCharacterData = (characterId: string) => {
  // O estado que armazena os dados, tipado como CharacterData ou null
  const [characterData, setCharacterData] = useState<CharacterData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Flag para evitar atualização de estado em componente desmontado (boa prática)
    let isMounted = true; 
    
    const loadData = async () => {
      setLoading(true); // Inicia carregamento
      setError(null);    // Limpa erros anteriores
      try {
        const data = await fetchCharacterData(characterId);
        if (isMounted) {
          setCharacterData(data); // Salva os dados no estado
        }
      } catch (err) {
        if (isMounted) {
          setError(err as Error); // Salva o erro no estado
        }
      } finally {
        if (isMounted) {
          setLoading(false); // Finaliza carregamento
        }
      }
    };

    loadData();

    return () => {
      isMounted = false; // Cleanup
    };
    // Re-executa o efeito se o characterId mudar
  }, [characterId]); 

  // Retorna o que o componente precisa para renderizar
  return { characterData, loading, error }; 
};