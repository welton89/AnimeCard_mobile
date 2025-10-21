//Api.ts
import type { Anime, Character } from "./types";
import { waitForSettingsInitialization } from '@app/hooks/useSettingsStore';

const CONFIG_STORAGE_KEY = 'app_config';
const DEFAULT_PATH_ANIME = 'animes';
const DEFAULT_PATH_CHARACTER = 'personagens';

async function getConfig() {
  const settings = await waitForSettingsInitialization(); 
  const Config = {
    URL_BASE: settings.API, 
    TOKEN: settings.Token, 
    NOME: settings.name,
  }

  return Config;
}


async function fetchData<T>(path: string): Promise<T> {
  const { URL_BASE } = await getConfig();
  if (!URL_BASE) {
    throw new Error("URL_BASE não configurada. Abra as Configurações para inserir o endereço da API.");
  }
  const response = await fetch(`${URL_BASE}?path=${path}`);
  if (!response.ok) {
    throw new Error(`Falha ao carregar ${path}`);
  }
  const data = await response.json();
  return data.data as T;
}

async function postData<T>(path: string, action: 'create' | 'update' | 'delete', body: any): Promise<T> {
  const { URL_BASE, TOKEN } = await getConfig();

  if (!URL_BASE || !TOKEN) {
    throw new Error("Configurações de API incompletas. Abra as Configurações para inserir a URL Base e o Token.");
  }

  const url = `${URL_BASE}?path=${path}&action=${action}&token=${TOKEN}`;
  console.log(`Requisição POST para: ${url}`);
  const response = await fetch(url, {
    method: 'POST',
    body: JSON.stringify(body),

  });
  
  if (!response.ok) {
    const errorText = await response.text();
    console.log('API Error:', errorText);
    throw new Error(`Falha ao ${action} ${path}. Verifique o token e a URL.`);
  }
  const data = await response.json();
  return data as T;
}

// --- Funções Exportadas (Mantidas) ---

// Animes
export const getAnimes = () => fetchData<Anime[]>(DEFAULT_PATH_ANIME);
export const createAnime = (anime: Anime) => postData<{ data: Anime }>(DEFAULT_PATH_ANIME, 'create', anime).then(res => res.data);
export const updateAnime = (id: string, anime: Partial<Anime>) => postData<{ data: Anime }>(`${DEFAULT_PATH_ANIME}/${id}`, 'update', anime).then(res => res.data);
export const deleteAnime = (id: string) => postData(`${DEFAULT_PATH_ANIME}/${id}`, 'delete', {});

// Characters
export const getCharacters = () => fetchData<Character[]>(DEFAULT_PATH_CHARACTER);
export const createCharacter = (character: Omit<Character, 'id'>) => postData<{ data: Character }>(DEFAULT_PATH_CHARACTER, 'create', character).then(res => res.data);
export const updateCharacter = (id: string, character: Partial<Character>) => postData<{ data: Character }>(`${DEFAULT_PATH_CHARACTER}/${id}`, 'update', character).then(res => res.data);
export const deleteCharacter = (id: string) => postData(`${DEFAULT_PATH_CHARACTER}/${id}`, 'delete', {});
