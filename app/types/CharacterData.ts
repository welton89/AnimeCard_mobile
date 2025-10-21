// Tipos auxiliares para as estruturas de imagem (jpg e webp)
interface Image {
  image_url: string;
  small_image_url: string;
  large_image_url?: string; // large_image_url é opcional (presente apenas em anime)
}

interface Images {
  jpg: Image;
  webp: Image;
}

// Estrutura para os dados de anime/manga associados
interface AnimeMangaReference {
  // animeId: string,
  role: string;
  anime?: { // A estrutura é 'anime' no JSON, mas 'anime' em 'data' e 'manga' é um array de objetos com esta estrutura interna
    mal_id: number;
    url: string;
    images: Images;
    title: string;
  };
  manga?: { // Estrutura similar para manga, se houver
    mal_id: number;
    url: string;
    images: Images;
    title: string;
  };
}

// Estrutura para os dados de pessoa (dublador)
interface Person {
  mal_id: string;
  url: string;
  images: {
    jpg: {
      image_url: string;
    };
  };
  name: string;
}

// Estrutura para os dados de voz (dublador)
interface Voice {
  person: Person;
  language: string;
}

// Interface principal para a estrutura 'data'
export interface CharacterData {
  mal_id: number;
  url: string;
  images: Images;
  name: string;
  name_kanji: string;
  nicknames: string[];
  favorites: number;
  about: string;
  anime: AnimeMangaReference[];
  manga: AnimeMangaReference[];
  voices: Voice[];
}

// Interface para a resposta completa da API (que contém o campo 'data')
export interface CharacterApiResponse {
  data: CharacterData;
}