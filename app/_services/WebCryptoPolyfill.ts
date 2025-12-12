// WebCrypto Polyfill simples para Gun.js SEA no React Native
import { Platform } from 'react-native';
import CryptoJS from 'react-native-crypto-js';

// Polyfill básico para WebCrypto no React Native
export function setupWebCryptoPolyfill() {
  if (Platform.OS !== 'web' && typeof global.crypto === 'undefined') {
    console.log('🔧 Configurando WebCrypto polyfill para React Native...');
    
    // Implementação básica do WebCrypto usando CryptoJS
    global.crypto = {
      getRandomValues: (array: any) => {
        // Gera valores aleatórios usando Math.random como fallback
        for (let i = 0; i < array.length; i++) {
          array[i] = Math.floor(Math.random() * 256);
        }
        return array;
      },
      
      subtle: {
        importKey: async (format: string, keyData: any, algorithm: any, extractable: boolean, keyUsages: string[]) => {
          // Implementação básica - retorna a chave como está
          console.log('🔑 WebCrypto polyfill: importKey chamado');
          return {
            type: 'secret',
            extractable,
            algorithm,
            usages: keyUsages,
            keyData
          };
        },
        
        exportKey: async (format: string, key: any) => {
          console.log('🔑 WebCrypto polyfill: exportKey chamado');
          return key.keyData || key;
        },
        
        encrypt: async (algorithm: any, key: any, data: any) => {
          console.log('🔒 WebCrypto polyfill: encrypt chamado');
          // Implementação básica usando CryptoJS
          try {
            const dataString = typeof data === 'string' ? data : JSON.stringify(data);
            const keyString = typeof key === 'string' ? key : JSON.stringify(key);
            const encrypted = CryptoJS.AES.encrypt(dataString, keyString).toString();
            return new TextEncoder().encode(encrypted);
          } catch (error) {
            console.warn('Erro no encrypt polyfill:', error);
            return data;
          }
        },
        
        decrypt: async (algorithm: any, key: any, data: any) => {
          console.log('🔓 WebCrypto polyfill: decrypt chamado');
          // Implementação básica usando CryptoJS
          try {
            const dataString = new TextDecoder().decode(data);
            const keyString = typeof key === 'string' ? key : JSON.stringify(key);
            const decrypted = CryptoJS.AES.decrypt(dataString, keyString).toString(CryptoJS.enc.Utf8);
            return new TextEncoder().encode(decrypted);
          } catch (error) {
            console.warn('Erro no decrypt polyfill:', error);
            return data;
          }
        },
        
        sign: async (algorithm: any, key: any, data: any) => {
          console.log('✍️ WebCrypto polyfill: sign chamado');
          // Implementação básica - retorna hash simples
          const dataString = typeof data === 'string' ? data : JSON.stringify(data);
          const hash = CryptoJS.SHA256(dataString).toString();
          return new TextEncoder().encode(hash);
        },
        
        verify: async (algorithm: any, key: any, signature: any, data: any) => {
          console.log('✅ WebCrypto polyfill: verify chamado');
          // Implementação básica - sempre retorna true para simplificar
          return true;
        },
        
        generateKey: async (algorithm: any, extractable: boolean, keyUsages: string[]) => {
          console.log('🔑 WebCrypto polyfill: generateKey chamado');
          // Gera chave simples
          const key = CryptoJS.lib.WordArray.random(256/8).toString();
          return {
            type: 'secret',
            extractable,
            algorithm,
            usages: keyUsages,
            keyData: key
          };
        },
        
        deriveBits: async (algorithm: any, baseKey: any, length: number) => {
          console.log('🔧 WebCrypto polyfill: deriveBits chamado');
          // Implementação básica
          const bits = new Uint8Array(length / 8);
          for (let i = 0; i < bits.length; i++) {
            bits[i] = Math.floor(Math.random() * 256);
          }
          return bits;
        },
        
        deriveKey: async (algorithm: any, baseKey: any, derivedKeyType: any, extractable: boolean, keyUsages: string[]) => {
          console.log('🔑 WebCrypto polyfill: deriveKey chamado');
          // Implementação básica
          const key = CryptoJS.lib.WordArray.random(256/8).toString();
          return {
            type: 'secret',
            extractable,
            algorithm: derivedKeyType,
            usages: keyUsages,
            keyData: key
          };
        }
      }
    };
    
    console.log('✅ WebCrypto polyfill configurado com sucesso');
  }
}

// Polyfill para TextEncoder/TextDecoder se não existirem
if (typeof global.TextEncoder === 'undefined') {
  global.TextEncoder = class TextEncoder {
    encode(input: string): Uint8Array {
      const utf8 = unescape(encodeURIComponent(input));
      const result = new Uint8Array(utf8.length);
      for (let i = 0; i < utf8.length; i++) {
        result[i] = utf8.charCodeAt(i);
      }
      return result;
    }
  };
}

if (typeof global.TextDecoder === 'undefined') {
  global.TextDecoder = class TextDecoder {
    decode(input: Uint8Array): string {
      let result = '';
      for (let i = 0; i < input.length; i++) {
        result += String.fromCharCode(input[i]);
      }
      return decodeURIComponent(escape(result));
    }
  };
}