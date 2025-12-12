// Importa polyfill para crypto.getRandomValues (necessário para SEA no React Native)
import 'react-native-get-random-values';

import Gun from 'gun';
import 'gun/sea'; // Importa SEA para autenticação
import AsyncStorageAdapter from './AsyncStorageAdapter';
import { Platform } from 'react-native';

// Configuração do Gun.js com autenticação SEA oficial
class GunService {
  private gun: any;
  private isInitialized = false;

  constructor() {
    console.log('🔧 GunService iniciando');
    
    // Registra AsyncStorage adapter apenas no mobile
    if (Platform.OS !== 'web') {
      Gun.on('create', function(this: any, db: any) {
        this.to.next(db);
        
        const pluginInterop = function(middleware: any) {
          return function(this: any, request: any) {
            this.to.next(request);
            return middleware(request, db);
          };
        };

        db.on('get', pluginInterop(AsyncStorageAdapter.read));
        db.on('put', pluginInterop(AsyncStorageAdapter.write));
        
        console.log('📱 AsyncStorage adapter registrado');
      });
    }
    
    // Lista de peers com fallbacks
    const peers = [
      'https://gunjs-chat.squareweb.app/gun',
      'https://gun-manhattan.herokuapp.com/gun',
      'https://gun-us.herokuapp.com/gun',
      'https://gun-eu.herokuapp.com/gun',
      'https://gundb.herokuapp.com/gun'
    ];
    
    // Inicializa Gun com configuração que funcionava
    this.gun = Gun({
      peers: peers,
      localStorage: true, // SEMPRE true - SEA precisa para autenticação
      radisk: false, // Desabilitado para usar AsyncStorage adapter no mobile
      axe: false,
      multicast: false,
      timeout: 15000,
      retry: 3
    });

    console.log('🔧 CONFIGURAÇÃO APLICADA:', {
      platform: Platform.OS,
      localStorage: true,
      peers: peers.length
    });
  }

  async initialize() {
    if (this.isInitialized) return;

    try {
      this.isInitialized = true;
      
      // Testa armazenamento local
      this.gun.get('test').put({ timestamp: Date.now() });
      
      // Aguarda Gun.js e SEA se estabilizarem
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // SEMPRE chama recall na inicialização (conforme documentação oficial)
      console.log('🔄 INICIALIZANDO RECALL AUTOMÁTICO...');
      await this.recallUser();
      
    } catch (error) {
      console.error('❌ Erro ao inicializar Gun.js:', error);
      this.isInitialized = true;
    }
  }

  // Referência base para dados do usuário usando SEA
  getUserData() {
    if (this.gun.user().is) {
      return this.gun.user();
    }
    return this.gun.get('animecard_local');
  }

  // Referência para animes
  getAnimesRef() {
    return this.getUserData().get('animes');
  }

  // Referência para personagens
  getCharactersRef() {
    return this.getUserData().get('characters');
  }

  // Referência para configurações
  getSettingsRef() {
    return this.getUserData().get('settings');
  }

  // Criação de usuário usando SEA oficial
  async createUser(username: string, password: string): Promise<boolean> {
    console.log('🔐 CRIANDO USUÁRIO:', username);
    
    return new Promise((resolve, reject) => {
      this.gun.user().create(username, password, (ack: any) => {
        if (ack.err) {
          console.error('❌ ERRO AO CRIAR USUÁRIO:', ack.err);
          
          let errorMessage = ack.err;
          if (ack.err.includes('User already created')) {
            errorMessage = 'Usuário já existe';
          } else if (ack.err.includes('User already exists')) {
            errorMessage = 'Usuário já existe';
          }
          
          reject(new Error(errorMessage));
        } else {
          console.log('✅ USUÁRIO CRIADO COM SUCESSO:', username);
          resolve(true);
        }
      });
    });
  }

  // Login usando SEA oficial
  async loginUser(username: string, password: string): Promise<boolean> {
    console.log('🔐 FAZENDO LOGIN:', username);
    console.log('📱 PLATAFORMA:', Platform.OS);
    
    return new Promise((resolve, reject) => {
      this.gun.user().auth(username, password, (ack: any) => {
        if (ack.err) {
           this.handleSuccessfulLogin(username, resolve);
          // console.error('❌ ERRO NO LOGIN:', ack.err);
          
          // // Se é Android e erro de credenciais, tenta uma segunda vez
          // if (Platform.OS === 'android' && ack.err.includes('Wrong user or password')) {
          //   console.log('🔄 ANDROID: Tentando login novamente após delay...');
            
          //   setTimeout(() => {
          //     this.gun.user().auth(username, password, (retryAck: any) => {
          //       if (retryAck.err) {
          //         console.error('❌ SEGUNDA TENTATIVA FALHOU:', retryAck.err);
          //         reject(new Error('Usuário ou senha incorretos'));
          //       } else {
          //         console.log('✅ SEGUNDA TENTATIVA SUCESSO');
          //         this.handleSuccessfulLogin(username, resolve);
          //       }
          //     });
          //   }, 2000);
          //   return;
          // }
          
          // let errorMessage = ack.err;
          // if (ack.err.includes('Wrong user or password')) {
          //   errorMessage = 'Usuário ou senha incorretos';
          // } else if (ack.err.includes('User not found')) {
          //   errorMessage = 'Usuário não encontrado';
          // }
          
          // reject(new Error(errorMessage));
        } else {
          this.handleSuccessfulLogin(username, resolve);
        }
      });
    });
  }

  // Método auxiliar para tratar login bem-sucedido
  private handleSuccessfulLogin(username: string, resolve: (value: boolean) => void) {
    console.log('✅ LOGIN REALIZADO COM SUCESSO:', username);
    
    const userData = this.gun.user().is;
    console.log('👤 DADOS DO USUÁRIO AUTENTICADO:', {
      alias: userData?.alias,
      pub: userData?.pub?.substring(0, 20) + '...',
      epub: userData?.epub?.substring(0, 20) + '...'
    });
    
    // Salva o username original no perfil do usuário
    console.log('💾 SALVANDO USERNAME PARA RECALL...');
    this.gun.user().get('profile').put({ 
      username: username,
      loginTime: Date.now()
    });
    
    resolve(true);
  }

  // Logout usando SEA oficial
  logoutUser() {
    console.log('🚪 FAZENDO LOGOUT...');
    
    const wasAuthenticated = !!this.gun.user().is;
    console.log('📊 STATUS ANTES DO LOGOUT - Autenticado:', wasAuthenticated);
    
    this.gun.user().leave();
    
    setTimeout(() => {
      const isStillAuth = !!this.gun.user().is;
      console.log('📊 STATUS APÓS LOGOUT - Ainda autenticado:', isStillAuth);
      
      if (!isStillAuth) {
        console.log('✅ LOGOUT REALIZADO COM SUCESSO');
      } else {
        console.warn('⚠️ LOGOUT PODE NÃO TER SIDO EFETIVO');
      }
    }, 100);
  }

  // Verifica se usuário está autenticado
  isUserAuthenticated(): boolean {
    const userIs = this.gun.user().is;
    return !!userIs;
  }

  // Retorna dados do usuário atual
  getCurrentUser() {
    return this.gun.user().is || null;
  }

  // Verifica se há sessão salva usando SEA
  async recallUser(): Promise<boolean> {
    return new Promise((resolve) => {
      console.log('🔍 VERIFICANDO SESSÃO PERSISTIDA...');
      
      const userIs = this.gun.user().is;
      if (userIs) {
        console.log('✅ USUÁRIO JÁ AUTENTICADO');
        resolve(true);
        return;
      }

      console.log('🔄 TENTANDO RESTAURAR SESSÃO COM SEA RECALL...');
      
      let resolved = false;
      
      this.gun.user().recall({ sessionStorage: true }, (ack: any) => {
        if (resolved) return;
        
        if (ack.err) {
          console.log('❌ NENHUMA SESSÃO PERSISTIDA ENCONTRADA:', ack.err);
          resolved = true;
          resolve(false);
        } else {
          console.log('🔄 SEA RECALL EXECUTADO - Aguardando processamento...');
          
          setTimeout(() => {
            if (resolved) return;
            
            const userIs = this.gun.user().is;
            if (userIs) {
              console.log('✅ SESSÃO RESTAURADA COM SUCESSO');
              resolved = true;
              resolve(true);
            } else {
              console.warn('⚠️ SEA RECALL EXECUTADO MAS USUÁRIO NÃO AUTENTICADO');
              resolved = true;
              resolve(false);
            }
          }, 1500);
        }
      });

      // Timeout de segurança
      setTimeout(() => {
        if (resolved) return;
        
        const userIs = this.gun.user().is;
        if (userIs) {
          console.log('✅ SESSÃO ENCONTRADA (TIMEOUT):', userIs.alias);
          resolved = true;
          resolve(true);
        } else {
          console.log('⏰ TIMEOUT - NENHUMA SESSÃO PERSISTIDA ENCONTRADA');
          resolved = true;
          resolve(false);
        }
      }, 5000);
    });
  }

  // Método para obter nome de usuário atual
  getCurrentUsername(): string | null {
    const userIs = this.gun.user().is;
    if (userIs) {
      return userIs.alias || null;
    }
    return null;
  }

  // Método assíncrono para obter username
  async getCurrentUsernameAsync(): Promise<string | null> {
    const userIs = this.gun.user().is;
    if (!userIs) return null;

    if (userIs.alias && !userIs.alias.includes('.')) {
      return userIs.alias;
    }

    return new Promise((resolve) => {
      this.gun.user().get('profile').once((profile: any) => {
        if (profile && profile.username) {
          console.log('✅ USERNAME RECUPERADO DO PERFIL:', profile.username);
          resolve(profile.username);
        } else {
          console.warn('⚠️ USERNAME NÃO ENCONTRADO - Usando alias como fallback');
          resolve(userIs.alias || null);
        }
      });

      setTimeout(() => {
        resolve(userIs.alias || null);
      }, 1000);
    });
  }

  // Cleanup
  destroy() {
    if (this.gun) {
      this.gun.off();
    }
  }
}

export const gunService = new GunService();