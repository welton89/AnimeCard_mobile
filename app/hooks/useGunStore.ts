import { create } from 'zustand';
import { Settings, defaultSettings } from '@app/types/config';
import { gunService } from '@app/_services/GunDB';
import { gunSettingsRepository } from '@app/_services/GunRepository';
import { StorageService } from '@app/_services/Storage';

interface GunSettingsState {
  settings: Settings;
  isInitialized: boolean;
  isLoading: boolean;
  isOnline: boolean;
  // Ações
  initialize: () => Promise<void>;
  updateSetting: <T extends keyof Settings>(key: T, value: Settings[T]) => Promise<void>;
  updateAllSettings: (newSettings: Settings) => Promise<void>;
  sync: () => Promise<void>;
}

export const useGunStore = create<GunSettingsState>((set, get) => ({
  settings: defaultSettings,
  isInitialized: true, // Inicia como true para não bloquear
  isLoading: false,    // Inicia como false para não bloquear
  isOnline: false,

  initialize: async () => {
    try {
      // Carrega configurações do AsyncStorage primeiro (rápido)
      const cachedSettings = await StorageService.getItem<Settings>('gun_settings_cache');
      if (cachedSettings) {
        set({ settings: cachedSettings });
      }
      
      // Inicializa Gun.js em background
      gunService.initialize().then(async () => {
        console.log('Gun.js inicializado em background');
        
        // Testa conectividade com peers
        await gunService.testAllPeersConnectivity();
        const peerStatus = gunService.getPeerStatus();
        const isConnected = Array.from(peerStatus.values()).some(status => status);
        set({ isOnline: isConnected });
        
        if (isConnected) {
          console.log('Conectado aos peers Gun.js');
        } else {
          console.log('Funcionando apenas localmente');
        }
        
        // Carrega configurações do Gun.js (pode demorar)
        gunSettingsRepository.initialize().then((gunSettings) => {
          set({ settings: gunSettings });
          console.log('Configurações Gun.js carregadas');
        }).catch((error) => {
          console.warn('Falha ao carregar configurações Gun.js:', error);
        });
      }).catch((error) => {
        console.warn('Falha ao inicializar Gun.js:', error);
        set({ isOnline: false });
      });
      
    } catch (error) {
      console.error('Erro na inicialização:', error);
    }
  },

  updateSetting: async (key, value) => {
    const newSettings = { ...get().settings, [key]: value };
    set({ settings: newSettings });
    
    try {
      await gunSettingsRepository.save(newSettings);
      console.log(`Configuração ${key} salva com Gun.js`);
    } catch (error) {
      console.error(`Erro ao salvar ${key} com Gun.js:`, error);
    }
  },

  updateAllSettings: async (newSettings) => {
    set({ settings: newSettings });
    try {
      await gunSettingsRepository.save(newSettings);
      console.log('Todas as configurações salvas com Gun.js');
    } catch (error) {
      console.error('Erro ao salvar configurações com Gun.js:', error);
    }
  },

  sync: async () => {
    try {
      console.log('🔄 Iniciando sincronização manual...');
      
      // Testa conectividade primeiro
      await gunService.testAllPeersConnectivity();
      const peerStatus = gunService.getPeerStatus();
      const isConnected = Array.from(peerStatus.values()).some(status => status);
      set({ isOnline: isConnected });
      
      if (isConnected) {
        await gunService.sync();
        console.log('✅ Sincronização com peers concluída');
      } else {
        console.log('⚠️ Sem conectividade com peers, funcionando localmente');
        // Mesmo sem peers, força sincronização local
        await gunService.sync();
      }
    } catch (error) {
      console.error('❌ Erro na sincronização:', error);
      set({ isOnline: false });
      throw error; // Re-throw para que o componente possa tratar
    }
  }
}));

// Função utilitária para aguardar inicialização
export const waitForGunInitialization = (): Promise<Settings> => {
  const store = useGunStore.getState();
  
  if (store.isInitialized) {
    return Promise.resolve(store.settings);
  }
  
  return new Promise((resolve) => {
    const unsubscribe = useGunStore.subscribe((state) => {
      if (state.isInitialized) {
        unsubscribe();
        resolve(state.settings);
      }
    });
  });
};