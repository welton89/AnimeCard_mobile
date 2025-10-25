// src/features/Settings/types.ts

// O formato da sua configuração
export interface Settings {
  name: string;
  API: string; // URL da API
  Token: string;
  gemini: string;
  Thema: 'light' | 'dark';
  Colors: string; // Exemplo: string JSON de cores
}

// O formato de uma linha no banco de dados (chave-valor)
export interface SettingDBItem {
  key: keyof Settings; // 'name', 'API', 'Token', etc.
  value: string; // O valor é sempre salvo como string no BD
}

// Valor inicial padrão
export const defaultSettings: Settings = {
  name: '',
  API: '',
  Token: '',
  gemini: '',
  Thema: 'dark',
  Colors: JSON.stringify({
    primary: '#6200ee',
    secondary: '#03dac4',
  }),
};