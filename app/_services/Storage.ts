import AsyncStorage from '@react-native-async-storage/async-storage';

export class StorageService {
  // Salvar dados
  static async setItem(key: string, value: any): Promise<void> {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem(key, jsonValue);
    } catch (error) {
      console.error('Erro ao salvar dados:', error);
      throw error;
    }
  }

  // Recuperar dados
  static async getItem<T>(key: string): Promise<T | null> {
    try {
      const jsonValue = await AsyncStorage.getItem(key);
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (error) {
      console.error('Erro ao recuperar dados:', error);
      return null;
    }
  }

  // Remover item
  static async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('Erro ao remover dados:', error);
      throw error;
    }
  }

  // Limpar tudo
  static async clear(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Erro ao limpar dados:', error);
      throw error;
    }
  }

  // Listar todas as chaves
  static async getAllKeys(): Promise<string[]> {
    try {
      return await AsyncStorage.getAllKeys();
    } catch (error) {
      console.error('Erro ao listar chaves:', error);
      return [];
    }
  }

  // Operações em lote
  static async multiSet(keyValuePairs: [string, any][]): Promise<void> {
    try {
      const pairs: [string, string][] = keyValuePairs.map(([key, value]) => [
        key,
        JSON.stringify(value)
      ]);
      await AsyncStorage.multiSet(pairs);
    } catch (error) {
      console.error('Erro ao salvar múltiplos dados:', error);
      throw error;
    }
  }

  static async multiGet(keys: string[]): Promise<Record<string, any>> {
    try {
      const pairs = await AsyncStorage.multiGet(keys);
      const result: Record<string, any> = {};
      
      pairs.forEach(([key, value]) => {
        if (value !== null) {
          try {
            result[key] = JSON.parse(value);
          } catch {
            result[key] = value;
          }
        }
      });
      
      return result;
    } catch (error) {
      console.error('Erro ao recuperar múltiplos dados:', error);
      return {};
    }
  }
}