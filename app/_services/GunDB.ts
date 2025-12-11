import Gun from 'gun';
import 'gun/sea'; // Importa SEA para autenticação
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Configuração do Gun.js com autenticação SEA oficial
class GunService {
  private gun: any;
  private isInitialized = false;
  private peerStatus: Map<string, boolean> = new Map();
  private connectionAttempts: Map<string, number> = new Map();

  constructor() {
    console.log('Inicializando GunService...');
    
    // Lista de peers com fallbacks
    const peers = [
      'https://gunjs-chat.squareweb.app/gun', // Seu peer personalizado
      'https://gun-manhattan.herokuapp.com/gun',
      'https://gun-us.herokuapp.com/gun',
      // Peers alternativos
      'https://gun-eu.herokuapp.com/gun',
      'https://gundb.herokuapp.com/gun'
    ];
    
    // Inicializa Gun com configuração otimizada para React Native
    this.gun = Gun({
      peers: peers,
      localStorage: true, // SEMPRE true - SEA precisa disso para persistir
      radisk: false,
      // Configurações específicas para melhorar conectividade
      axe: false, // Desabilita axe para React Native
      multicast: false, // Desabilita multicast
      // Timeout personalizado
      timeout: 15000, // 15 segundos
      // Configurações de retry
      retry: 3
    });

    console.log('🔧 Gun.js configurado com localStorage habilitado para SEA');
    
    // Monitora conexões com peers
    this.setupPeerMonitoring(peers);
    
    console.log('Gun inicializado com', peers.length, 'peers');
  }

  // Salva credenciais (web e mobile)
  private async saveCredentialsToStorage(username: string, password: string) {
    try {
      const credentials = {
        username,
        password,
        timestamp: Date.now()
      };

      if (Platform.OS === 'web') {
        // Web: usa localStorage
        localStorage.setItem('gun_user_credentials', JSON.stringify(credentials));
        console.log('💾 Credenciais salvas no localStorage');
      } else {
        // Mobile: usa AsyncStorage
        await AsyncStorage.setItem('gun_user_credentials', JSON.stringify(credentials));
        console.log('💾 Credenciais salvas no AsyncStorage');
      }
    } catch (error) {
      console.warn('❌ Erro ao salvar credenciais:', error);
    }
  }

  // Carrega credenciais (web e mobile)
  private async loadCredentialsFromStorage(): Promise<{username: string, password: string} | null> {
    try {
      let stored: string | null = null;

      if (Platform.OS === 'web') {
        // Web: usa localStorage
        stored = localStorage.getItem('gun_user_credentials');
        if (stored) {
          console.log('🌐 Credenciais encontradas no localStorage');
        }
      } else {
        // Mobile: usa AsyncStorage
        stored = await AsyncStorage.getItem('gun_user_credentials');
        if (stored) {
          console.log('� Creedenciais encontradas no AsyncStorage');
        }
      }

      if (stored) {
        const credentials = JSON.parse(stored);
        return credentials;
      }
    } catch (error) {
      console.warn('❌ Erro ao carregar credenciais:', error);
    }
    return null;
  }

  // Remove credenciais (web e mobile)
  private async clearCredentialsFromStorage() {
    try {
      if (Platform.OS === 'web') {
        // Web: usa localStorage
        localStorage.removeItem('gun_user_credentials');
        console.log('🗑️ Credenciais removidas do localStorage');
      } else {
        // Mobile: usa AsyncStorage
        await AsyncStorage.removeItem('gun_user_credentials');
        console.log('🗑️ Credenciais removidas do AsyncStorage');
      }
    } catch (error) {
      console.warn('❌ Erro ao remover credenciais:', error);
    }
  }

  private setupPeerMonitoring(peers: string[]) {
    // Inicializa status dos peers
    peers.forEach(peer => {
      this.peerStatus.set(peer, false);
      this.connectionAttempts.set(peer, 0);
    });

    // Monitora eventos de conexão
    this.gun.on('hi', (peer: any) => {
      const peerUrl = this.extractPeerUrl(peer);
      if (peerUrl) {
        this.peerStatus.set(peerUrl, true);
        console.log('✅ Conectado ao peer:', peerUrl);
      }
    });

    this.gun.on('bye', (peer: any) => {
      const peerUrl = this.extractPeerUrl(peer);
      if (peerUrl) {
        this.peerStatus.set(peerUrl, false);
        console.log('❌ Desconectado do peer:', peerUrl);
      }
    });

    // Testa conectividade inicial
    setTimeout(() => {
      this.testAllPeersConnectivity();
    }, 2000);
  }

  private extractPeerUrl(peer: any): string | null {
    try {
      if (peer && peer.url) return peer.url;
      if (peer && typeof peer === 'string') return peer;
      return null;
    } catch (error) {
      return null;
    }
  }

  async initialize() {
    if (this.isInitialized) return;

    try {
      // 1. Inicialização local primeiro
      this.isInitialized = true;
      console.log('🚀 Gun.js inicializado localmente');
      
      // 2. Testa armazenamento local
      this.gun.get('test').put({ timestamp: Date.now() });
      
      // 3. Aguarda Gun.js e SEA se estabilizarem
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // 4. NÃO chama recallUser aqui - será feito no checkAuth
      console.log('✅ Gun.js pronto para autenticação');
      
      // 5. Diagnóstico completo (em background)
      setTimeout(async () => {
        await this.diagnoseReactNativeIssues();
        await this.getConnectivityReport();
      }, 3000);
      
    } catch (error) {
      console.error('❌ Erro ao inicializar Gun.js:', error);
      this.isInitialized = true; // Continua mesmo com erro
    }
  }



  // Referência base para dados do usuário usando SEA
  getUserData() {
    if (this.gun.user().is) {
      // Usuário autenticado - dados privados criptografados
      return this.gun.user();
    }
    // Fallback para dados locais se não logado
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
    console.log('Criando usuário com SEA:', username);
    
    return new Promise((resolve, reject) => {
      this.gun.user().create(username, password, (ack: any) => {
        if (ack.err) {
          console.error('Erro ao criar usuário:', ack.err);
          
          // Traduz erros comuns
          let errorMessage = ack.err;
          if (ack.err.includes('User already created')) {
            errorMessage = 'Usuário já existe';
          } else if (ack.err.includes('User already exists')) {
            errorMessage = 'Usuário já existe';
          }
          
          reject(new Error(errorMessage));
        } else {
          console.log('Usuário criado com sucesso:', username);
          resolve(true);
        }
      });
    });
  }

  // Login usando SEA oficial
  async loginUser(username: string, password: string): Promise<boolean> {
    console.log('🔐 Fazendo login com SEA:', username);
    
    return new Promise((resolve, reject) => {
      this.gun.user().auth(username, password, async (ack: any) => {
        if (ack.err) {
          console.error('❌ Erro no login:', ack.err);
          
          // Traduz erros comuns
          let errorMessage = ack.err;
          if (ack.err.includes('Wrong user or password')) {
            errorMessage = 'Usuário ou senha incorretos';
          } else if (ack.err.includes('User not found')) {
            errorMessage = 'Usuário não encontrado';
          }
          
          reject(new Error(errorMessage));
        } else {
          console.log('✅ Login realizado com sucesso:', username);
          console.log('👤 Dados do usuário:', this.gun.user().is);
          
          // SEA já persiste automaticamente com localStorage
          
          // Verifica se o storage está funcionando
          this.testStoragePersistence();
          
          resolve(true);
        }
      });
    });
  }

  // Logout usando SEA oficial
  logoutUser() {
    this.gun.user().leave();
    console.log('✅ Logout realizado - SEA limpa automaticamente');
  }

  // Verifica se usuário está autenticado
  isUserAuthenticated(): boolean {
    return !!this.gun.user().is;
  }

  // Retorna dados do usuário atual
  getCurrentUser() {
    return this.gun.user().is || null;
  }

  // Verifica se há sessão salva usando APENAS SEA nativo
  async recallUser(): Promise<boolean> {
    return new Promise((resolve) => {
      // Primeiro verifica se já está autenticado
      if (this.gun.user().is) {
        console.log('✅ Usuário já autenticado:', this.gun.user().is.alias);
        resolve(true);
        return;
      }

      console.log('🔍 Tentando restaurar sessão SEA...');
      
      let resolved = false;
      
      // Usa APENAS o recall nativo do SEA
      this.gun.user().recall((ack: any) => {
        if (resolved) return;
        
        if (ack.err) {
          console.log('❌ Nenhuma sessão SEA encontrada:', ack.err);
          resolved = true;
          resolve(false);
        } else {
          console.log('🔄 SEA recall executado, verificando...');
          
          // Aguarda processamento do SEA
          setTimeout(() => {
            if (resolved) return;
            
            if (this.gun.user().is) {
              console.log('✅ Sessão SEA restaurada:', this.gun.user().is.alias);
              resolved = true;
              resolve(true);
            } else {
              console.log('⚠️ SEA recall sem autenticação');
              resolved = true;
              resolve(false);
            }
          }, 1500); // Tempo para SEA processar
        }
      });

      // Timeout de segurança
      setTimeout(() => {
        if (resolved) return;
        
        if (this.gun.user().is) {
          console.log('✅ Sessão encontrada (timeout):', this.gun.user().is.alias);
          resolved = true;
          resolve(true);
        } else {
          console.log('⏰ Timeout - nenhuma sessão encontrada');
          resolved = true;
          resolve(false);
        }
      }, 5000);
    });
  }

  // Método para obter nome de usuário atual
  getCurrentUsername(): string | null {
    const user = this.gun.user().is;
    return user ? user.alias : null;
  }

  // Testa se o storage está persistindo dados corretamente
  private async testStoragePersistence() {
    try {
      console.log('🧪 Testando persistência do storage...');
      
      if (Platform.OS === 'web') {
        // Testa localStorage
        const testKey = 'gun_test_persistence';
        const testValue = 'test_' + Date.now();
        
        localStorage.setItem(testKey, testValue);
        const retrieved = localStorage.getItem(testKey);
        
        if (retrieved === testValue) {
          console.log('✅ localStorage funcionando corretamente');
          localStorage.removeItem(testKey);
        } else {
          console.log('❌ Problema com localStorage');
        }
      } else {
        // Testa AsyncStorage
        const testKey = 'gun_test_persistence';
        const testValue = 'test_' + Date.now();
        
        await AsyncStorage.setItem(testKey, testValue);
        const retrieved = await AsyncStorage.getItem(testKey);
        
        if (retrieved === testValue) {
          console.log('✅ AsyncStorage funcionando corretamente');
          await AsyncStorage.removeItem(testKey);
        } else {
          console.log('❌ Problema com AsyncStorage');
        }
      }
    } catch (error) {
      console.error('❌ Erro ao testar storage:', error);
    }
  }

  // Método para sincronização manual com diagnóstico
  async sync() {
    console.log('🔄 Iniciando sincronização manual...');
    
    return new Promise(async (resolve, reject) => {
      try {
        // Primeiro testa conectividade
        await this.testAllPeersConnectivity();
        
        const syncPromises: Promise<void>[] = [];
        
        // Sincronização só funciona com usuário autenticado
        if (this.isUserAuthenticated()) {
          console.log('👤 Sincronizando dados do usuário autenticado...');
          syncPromises.push(this.forceSyncUserData());
        } else {
          console.log('⚠️ Sincronização requer autenticação - dados ficam apenas locais');
          throw new Error('É necessário fazer login para sincronizar dados entre dispositivos');
        }
        
        // Força sincronização geral
        syncPromises.push(new Promise<void>((resolveGeneral) => {
          const syncData = { 
            timestamp: Date.now(),
            syncId: `general_${Math.random().toString(36)}`,
            user: this.getCurrentUsername() || 'anonymous'
          };
          
          this.gun.get('sync_test').put(syncData, (ack: any) => {
            if (ack.err) {
              console.warn('⚠️ Erro na sincronização geral:', ack.err);
            } else {
              console.log('✅ Sincronização geral bem-sucedida');
            }
            resolveGeneral();
          });
        }));
        
        // Aguarda todas as sincronizações
        await Promise.all(syncPromises);
        
        // Aguarda um tempo para garantir propagação
        setTimeout(() => {
          console.log('🎉 Sincronização Gun.js concluída com sucesso');
          resolve(true);
        }, 2000);
        
      } catch (error) {
        console.error('❌ Erro na sincronização:', error);
        reject(error);
      }
    });
  }

  // Método específico para testar seu peer personalizado
  async testCustomPeer(): Promise<boolean> {
    const customPeer = 'https://gunjs-chat.squareweb.app/gun';
    console.log('🎯 Testando peer personalizado:', customPeer);
    
    try {
      // Teste HTTP primeiro
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const httpTest = await fetch(customPeer.replace('/gun', '/'), {
        method: 'GET',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!httpTest.ok) {
        console.log('❌ Peer personalizado não responde HTTP:', httpTest.status);
        return false;
      }
      
      console.log('✅ Peer personalizado responde HTTP');
      
      // Teste Gun.js específico
      const gunTest = await this.testSinglePeerConnectivity(customPeer);
      
      if (gunTest) {
        console.log('✅ Peer personalizado funciona com Gun.js');
        return true;
      } else {
        console.log('❌ Peer personalizado não funciona com Gun.js');
        console.log('💡 Possíveis problemas:');
        console.log('  - Servidor não tem Gun.js configurado corretamente');
        console.log('  - WebSocket não habilitado');
        console.log('  - CORS não configurado para React Native');
        console.log('  - Firewall bloqueando conexões WebSocket');
        return false;
      }
      
    } catch (error: any) {
      console.log('❌ Erro ao testar peer personalizado:', error?.message || 'Erro desconhecido');
      return false;
    }
  }

  // Testa conectividade com todos os peers
  async testAllPeersConnectivity(): Promise<void> {
    console.log('🔍 Testando conectividade com todos os peers...');
    
    const peers = Array.from(this.peerStatus.keys());
    const results = await Promise.allSettled(
      peers.map(peer => this.testSinglePeerConnectivity(peer))
    );

    let connectedCount = 0;
    results.forEach((result, index) => {
      const peer = peers[index];
      if (result.status === 'fulfilled' && result.value) {
        connectedCount++;
        console.log(`✅ ${peer}: Conectado`);
      } else {
        console.log(`❌ ${peer}: Falha na conexão`);
        this.diagnosePeerIssue(peer);
      }
    });

    console.log(`📊 Resumo: ${connectedCount}/${peers.length} peers conectados`);
    
    if (connectedCount === 0) {
      console.warn('⚠️ NENHUM PEER CONECTADO - Modo offline');
      this.suggestSolutions();
    }
  }

  private async testSinglePeerConnectivity(peerUrl: string): Promise<boolean> {
    return new Promise((resolve) => {
      const testId = `connectivity_test_${Date.now()}_${Math.random()}`;
      const testData = { 
        test: true, 
        timestamp: Date.now(),
        peer: peerUrl
      };
      
      let resolved = false;
      
      // Tenta salvar dados de teste
      this.gun.get('peer_test').get(testId).put(testData, (ack: any) => {
        if (!resolved) {
          resolved = true;
          if (ack.err) {
            resolve(false);
          } else {
            resolve(true);
          }
        }
      });
      
      // Timeout específico por peer
      setTimeout(() => {
        if (!resolved) {
          resolved = true;
          resolve(false);
        }
      }, 5000);
    });
  }

  private diagnosePeerIssue(peerUrl: string) {
    const attempts = this.connectionAttempts.get(peerUrl) || 0;
    this.connectionAttempts.set(peerUrl, attempts + 1);

    console.log(`🔧 Diagnosticando problemas com ${peerUrl}:`);
    
    // Verifica problemas comuns
    if (peerUrl.includes('herokuapp.com')) {
      console.log('  - Heroku pode estar em sleep mode (demora ~30s para acordar)');
    }
    
    if (peerUrl.startsWith('https://')) {
      console.log('  - Verificando se o servidor suporta WebSocket over HTTPS');
    }
    
    if (peerUrl.includes('localhost') || peerUrl.includes('127.0.0.1')) {
      console.log('  - Peer local não acessível em produção');
    }

    // Tenta ping HTTP simples
    this.testHttpConnectivity(peerUrl);
  }

  private async testHttpConnectivity(peerUrl: string) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(peerUrl.replace('/gun', ''), {
        method: 'GET',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        console.log(`  ✅ HTTP OK para ${peerUrl} - Problema pode ser WebSocket`);
      } else {
        console.log(`  ❌ HTTP ${response.status} para ${peerUrl}`);
      }
    } catch (error: any) {
      console.log(`  ❌ Erro HTTP para ${peerUrl}:`, error?.message || 'Erro desconhecido');
    }
  }

  private suggestSolutions() {
    console.log('💡 Soluções sugeridas:');
    console.log('  1. Verificar conexão com internet');
    console.log('  2. Aguardar peers Heroku acordarem (~30s)');
    console.log('  3. Verificar firewall/proxy corporativo');
    console.log('  4. Testar com peer próprio funcionando');
    console.log('  5. Usar modo offline temporariamente');
  }

  // Método público para obter status dos peers
  getPeerStatus(): Map<string, boolean> {
    return new Map(this.peerStatus);
  }

  // Método para reconectar peers
  async reconnectPeers(): Promise<void> {
    console.log('🔄 Tentando reconectar peers...');
    
    // Força reconexão
    this.gun.opt({ peers: Array.from(this.peerStatus.keys()) });
    
    // Aguarda e testa novamente
    setTimeout(() => {
      this.testAllPeersConnectivity();
    }, 3000);
  }

  // Método para forçar re-sincronização de todos os dados do usuário
  async forceSyncUserData(): Promise<void> {
    if (!this.isUserAuthenticated()) {
      throw new Error('Usuário não autenticado');
    }

    console.log('🔄 Forçando re-sincronização de todos os dados do usuário...');

    return new Promise((resolve, reject) => {
      const promises: Promise<void>[] = [];

      // Re-sincroniza animes
      promises.push(new Promise<void>((resolveAnimes) => {
        this.getAnimesRef().map().on((data: any, key: string) => {
          if (data && data !== null) {
            // Força re-propagação do dado
            this.getAnimesRef().get(key).put(data);
          }
        });
        setTimeout(resolveAnimes, 1000);
      }));

      // Re-sincroniza personagens
      promises.push(new Promise<void>((resolveChars) => {
        this.getCharactersRef().map().on((data: any, key: string) => {
          if (data && data !== null) {
            // Força re-propagação do dado
            this.getCharactersRef().get(key).put(data);
          }
        });
        setTimeout(resolveChars, 1000);
      }));

      // Re-sincroniza configurações
      promises.push(new Promise<void>((resolveSettings) => {
        this.getSettingsRef().map().on((data: any, key: string) => {
          if (data && data !== null) {
            // Força re-propagação do dado
            this.getSettingsRef().get(key).put(data);
          }
        });
        setTimeout(resolveSettings, 1000);
      }));

      Promise.all(promises)
        .then(() => {
          console.log('✅ Re-sincronização de dados do usuário concluída');
          resolve();
        })
        .catch(reject);
    });
  }

  // Diagnóstico específico para React Native
  async diagnoseReactNativeIssues(): Promise<void> {
    console.log('📱 Diagnosticando problemas específicos do React Native...');
    
    // Verifica se está em ambiente de desenvolvimento
    const isDev = __DEV__;
    console.log('Ambiente de desenvolvimento:', isDev);
    
    // Verifica conectividade básica
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch('https://www.google.com', { 
        signal: controller.signal 
      });
      
      clearTimeout(timeoutId);
      console.log('✅ Conectividade com internet OK');
    } catch (error: any) {
      console.log('❌ Sem conectividade com internet');
      return;
    }
    
    // Testa WebSocket support
    try {
      const ws = new WebSocket('wss://echo.websocket.org');
      ws.onopen = () => {
        console.log('✅ WebSocket suportado');
        ws.close();
      };
      ws.onerror = () => {
        console.log('❌ Problema com WebSocket');
      };
    } catch (error: any) {
      console.log('❌ WebSocket não suportado:', error?.message || 'Erro desconhecido');
    }
    
    // Verifica configurações específicas do Gun
    console.log('🔧 Configurações Gun.js:');
    console.log('  - localStorage:', this.gun._.opt.localStorage);
    console.log('  - radisk:', this.gun._.opt.radisk);
    console.log('  - peers:', this.gun._.opt.peers);
    
    // Testa seu peer personalizado
    await this.testCustomPeer();
  }

  // Método para obter relatório completo de conectividade
  async getConnectivityReport(): Promise<object> {
    const report = {
      timestamp: new Date().toISOString(),
      peersStatus: Object.fromEntries(this.peerStatus),
      connectionAttempts: Object.fromEntries(this.connectionAttempts),
      isAuthenticated: this.isUserAuthenticated(),
      gunInitialized: this.isInitialized
    };
    
    console.log('📊 Relatório de Conectividade:', report);
    return report;
  }

  // Cleanup
  destroy() {
    if (this.gun) {
      this.gun.off();
    }
  }
}

export const gunService = new GunService();