// @app/services/jikanApi.ts

const JIKAN_BASE_URL = 'https://api.jikan.moe/v4';

// Tipagem simplificada para os dados de Personagens da Jikan API
// A estrutura real é mais complexa, mas isso é o suficiente para o exemplo
export interface JikanCharacter {
  character: {
    mal_id: number;
    url: string;
    images: {
      jpg: {
        image_url: string;
      };
    };
    name: string;
  };
  role: 'Main' | 'Supporting';
  voice_actors: Array<{
    person: {
      mal_id: number;
      name: string;
    };
    language: string;
  }>;
}

export interface JikanCharactersResponse {
    data: JikanCharacter[];
}


/**
 * Busca a lista de personagens de um anime pelo ID usando a Jikan API.
 * @param animeId O MAL ID (MyAnimeList ID) do anime.
 * @returns Uma Promise que resolve para a lista de JikanCharacter.
 */
export async function getAnimeCharacters(animeId: number): Promise<JikanCharacter[]> {
    const url = `${JIKAN_BASE_URL}/anime/${animeId}/characters`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            // Lança um erro descritivo se a requisição falhar (ex: 404, 500)
            throw new Error(`Falha ao buscar personagens: ${response.status} ${response.statusText}`);
        }
        
        const data: JikanCharactersResponse = await response.json();
        return data.data; // Retorna apenas o array de personagens
        
    } catch (error) {
        console.error("Erro na Jikan API:", error);
        throw new Error("Não foi possível carregar os dados de personagens.");
    }
}