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
      console.log('🔍 Verificando autenticação...');
      
      // Primeiro verifica se já está autenticado
      if (gunService.isUserAuthenticated()) {
        const username = gunService.getCurrentUsername();
        console.log('✅ Usuário já autenticado:', username);
        set({ 
          isAuthenticated: true,
          username: username
        });
        return;
      }

      // Tenta restaurar sessão
      const isAuth = await gunService.recallUser();
      const username = gunService.getCurrentUsername();
      
      console.log('🔐 Resultado da verificação:', { isAuth, username });
      
      set({ 
        isAuthenticated: isAuth,
        username: username
      });
    } catch (error) {
      console.warn('❌ Erro ao verificar autenticação:', error);
      set({ 
        isAuthenticated: false,
        username: null
      });
    }
  }
}));