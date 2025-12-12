import { create } from 'zustand';
import { gunService } from '@app/_services/GunDB';
import { StorageService } from '@app/_services/Storage';

interface AuthState {
  isAuthenticated: boolean;
  username: string | null;
  isLoading: boolean;
  error: string | null;
  // Ações
  createAccount: (username: string, password: string) => Promise<boolean>;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  clearError: () => void;
  checkAuth: () => Promise<void>;
}

export const useGunAuth = create<AuthState>((set, get) => ({
  isAuthenticated: false,
  username: null,
  isLoading: false,
  error: null,

  createAccount: async (username: string, password: string) => {
    set({ isLoading: true, error: null });
    
    try {
      await gunService.createUser(username, password);
      set({ 
        isAuthenticated: true, 
        username, 
        isLoading: false 
      });
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao criar conta';
      set({ 
        error: errorMessage, 
        isLoading: false 
      });
      return false;
    }
  },

  login: async (username: string, password: string) => {
    set({ isLoading: true, error: null });
    
    try {
      await gunService.loginUser(username, password);
      set({ 
        isAuthenticated: true, 
        username, 
        isLoading: false 
      });
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro no login';
      set({ 
        error: errorMessage, 
        isLoading: false 
      });
      return false;
    }
  },

  logout: () => {
    gunService.logoutUser();
    set({ 
      isAuthenticated: false, 
      username: null, 
      error: null 
    });
  },

  clearError: () => {
    set({ error: null });
  },

  checkAuth: async () => {
    try {
      console.log('🔍 INICIANDO VERIFICAÇÃO DE AUTENTICAÇÃO...');
      
      // Verifica se user.is existe
      const userIs = gunService.getCurrentUser();
      console.log('👤 USER.IS:', !!userIs);
      
      if (userIs) {
        console.log('📊 DADOS USER.IS:', {
          hasAlias: !!userIs.alias,
          alias: userIs.alias?.substring(0, 20) + '...',
          hasPub: !!userIs.pub
        });
      }
      
      // Verifica estado de autenticação
      const isAuth = gunService.isUserAuthenticated();
      console.log('🔐 IS_AUTHENTICATED:', isAuth);
      
      // Busca username
      const username = await gunService.getCurrentUsernameAsync();
      console.log('👤 USERNAME_ASYNC:', username);
      
      console.log('📊 RESULTADO FINAL:', { isAuth, username });
      
      set({ 
        isAuthenticated: isAuth,
        username: username
      });
    } catch (error) {
      console.error('❌ Erro ao verificar autenticação:', error);
      set({ 
        isAuthenticated: false,
        username: null
      });
    }
  }
}));