export interface CardImage {
  // id: string;
  url: string;
}

export interface Character {
  id: string;
  name: string;
  description: string;
  images: string
  animeId: string;
}

export interface Anime {
  id:string;
  name: string;
  images: string;
  description?: string;
  status?: string


}



export interface JikanImage {
  image_url: string;
  small_image_url: string;
  large_image_url: string;
}

export interface JikanImages {
  jpg: JikanImage;
  webp: JikanImage;
}

export interface Genre {
    mal_id: number;
    type: string;
    name: string;
    url: string;
}

export interface Aired {
    from: string; // Data de início da exibição
    string: string; // Ex: "Apr 3, 1998 to Apr 24, 1999"
}
export interface Trailer {
    youtube_id?: string;
    url?: string;
    embed_url: string;
}

export interface AnimeData {
  mal_id: string;
  url: string | null;
  images: JikanImages;
  trailer:Trailer | null;
  title: string;
  title_english: string | null;
  type: string | null; // TV, Movie, OVA, etc.
  episodes: number | null;
  aired: Aired | null;
  score: number | null; // A avaliação (score)
  scored_by: number | null; // O número de votos
  synopsis: string | null;
  genres: Genre[];
}

export interface Pagination {
    last_visible_page: number;
    has_next_page: boolean;
    current_page: number;
    items: {
        count: number;
        total: number;
        per_page: number;
    };
}

export interface AnimeApiResponse {
  pagination: Pagination;
  data: AnimeData[];
}




