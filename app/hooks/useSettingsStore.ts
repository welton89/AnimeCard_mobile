
import { create } from 'zustand';
import { Settings, defaultSettings } from '@app/types/config';
import { SettingsRepository } from '@app/_services/Database/SettingsRepository';


// 1. Define o formato do estado e das ações do Zustand
interface SettingsState {
  settings: Settings;
  isInitialized: boolean;
  isLoading: boolean;
  // Ações
  initialize: () => Promise<void>;
  updateSetting: <T extends keyof Settings>(key: T, value: Settings[T]) => Promise<void>;
  updateAllSettings: (newSettings: Settings) => Promise<void>;
}

// 2. Cria o store
export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: defaultSettings,
  isInitialized: false,
  isLoading: true,

  // Ação para carregar configurações do BD na inicialização do app
  initialize: async () => {
    set({ isLoading: true });
    try {
      const initialSettings = await SettingsRepository.initialize();
      set({ settings: initialSettings, isInitialized: true, isLoading: false });
    } catch (error) {
      console.error('Failed to initialize settings from DB:', error);
      // Se falhar, usa os defaults
      set({ settings: defaultSettings, isInitialized: true, isLoading: false });
    }
  },

  // Ação para atualizar uma única configuração
  updateSetting: async (key, value) => {
    // 1. Atualiza o estado na memória (para reatividade imediata na UI)
    const newSettings = { ...get().settings, [key]: value };
    set({ settings: newSettings });
    
    // 2. Persiste a alteração no BD (operação assíncrona)
    try {
      await SettingsRepository.save(newSettings);
      console.log(`Setting ${key} saved successfully!`);
    } catch (error) {
      console.error(`Failed to save ${key} to DB:`, error);
      // Aqui você pode adicionar lógica para reverter o estado se o save falhar
    }
  },
  
  // Ação para atualizar o objeto inteiro (se for o caso)
  updateAllSettings: async (newSettings) => {
    set({ settings: newSettings });
    try {
      await SettingsRepository.save(newSettings);
      console.log('All settings saved successfully!');
    } catch (error) {
      console.error('Failed to save all settings to DB:', error);
    }
  },
}));


export const waitForSettingsInitialization = (): Promise<Settings> => {
    const store = useSettingsStore.getState();
    
    if (store.isInitialized) {
        return Promise.resolve(store.settings);
    }
        return new Promise((resolve) => {
        
        const unsubscribe = useSettingsStore.subscribe(
            (state: SettingsState) => {
                
                if (state.isInitialized) {
                    unsubscribe();
                    resolve(state.settings);
                }
            }
        );
    });
};