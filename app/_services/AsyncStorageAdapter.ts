import AsyncStorage from '@react-native-async-storage/async-storage';

// AsyncStorage Adapter para Gun.js React Native
// Baseado no exemplo oficial do repositório Gun.js
const AsyncStorageAdapter = {
  read: async (request: any, db: any) => {
    const key = request.get;
    if (!key) return;
    
    // Converte key para string se for objeto
    const keyString = typeof key === 'string' ? key : JSON.stringify(key);
    
    try {
      console.log('📖 Gun.js lendo do AsyncStorage:', keyString);
      const data = await AsyncStorage.getItem(keyString);
      return data ? JSON.parse(data) : undefined;
    } catch (error) {
      console.warn('❌ Erro ao ler AsyncStorage:', error);
      return undefined;
    }
  },

  write: async (request: any, db: any) => {
    const key = request.get;
    const data = request.put;
    
    if (!key || !data) return false;
    
    // Converte key para string se for objeto
    const keyString = typeof key === 'string' ? key : JSON.stringify(key);
    
    try {
      console.log('💾 Gun.js salvando no AsyncStorage:', keyString);
      await AsyncStorage.setItem(keyString, JSON.stringify(data));
      return true;
    } catch (error) {
      console.warn('❌ Erro ao salvar AsyncStorage:', error);
      return false;
    }
  }
};

export default AsyncStorageAdapter;