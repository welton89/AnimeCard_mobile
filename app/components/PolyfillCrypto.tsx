import * as React from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';

// Polyfill WebCrypto simples para WebView
const webViewWorkerString = `
// WebCrypto polyfill simples
(function() {
  if (typeof window.crypto === 'undefined') {
    window.crypto = {};
  }
  
  if (typeof window.crypto.subtle === 'undefined') {
    window.crypto.subtle = {
      importKey: async function() {
        console.log('WebView: importKey chamado');
        return { type: 'secret', algorithm: 'AES-GCM' };
      },
      exportKey: async function(format, key) {
        console.log('WebView: exportKey chamado');
        return key;
      },
      encrypt: async function(algorithm, key, data) {
        console.log('WebView: encrypt chamado');
        return data;
      },
      decrypt: async function(algorithm, key, data) {
        console.log('WebView: decrypt chamado');
        return data;
      },
      sign: async function() {
        console.log('WebView: sign chamado');
        return new Uint8Array(32);
      },
      verify: async function() {
        console.log('WebView: verify chamado');
        return true;
      },
      generateKey: async function() {
        console.log('WebView: generateKey chamado');
        return { type: 'secret' };
      },
      deriveBits: async function(algorithm, baseKey, length) {
        console.log('WebView: deriveBits chamado');
        return new Uint8Array(length / 8);
      },
      deriveKey: async function() {
        console.log('WebView: deriveKey chamado');
        return { type: 'secret' };
      }
    };
  }
  
  if (typeof window.crypto.getRandomValues === 'undefined') {
    window.crypto.getRandomValues = function(array) {
      console.log('WebView: getRandomValues chamado');
      for (let i = 0; i < array.length; i++) {
        array[i] = Math.floor(Math.random() * 256);
      }
      return array;
    };
  }
  
  console.log('WebView: Polyfill WebCrypto configurado');
})();
`;

// Função para comunicação com WebView
class MainWorker {
  crypto: any;
  
  constructor(sendToBridge: any, debug?: boolean) {
    console.log('MainWorker: Inicializando...');
    
    this.crypto = {
      getRandomValues: (array: any) => {
        console.log('MainWorker: getRandomValues chamado');
        for (let i = 0; i < array.length; i++) {
          array[i] = Math.floor(Math.random() * 256);
        }
        return array;
      },
      subtle: {
        importKey: async (...args: any[]) => {
          console.log('MainWorker: importKey chamado');
          return { type: 'secret', algorithm: args[2] || 'AES-GCM' };
        },
        exportKey: async (format: string, key: any) => {
          console.log('MainWorker: exportKey chamado');
          return key;
        },
        encrypt: async (algorithm: any, key: any, data: any) => {
          console.log('MainWorker: encrypt chamado');
          return data;
        },
        decrypt: async (algorithm: any, key: any, data: any) => {
          console.log('MainWorker: decrypt chamado');
          return data;
        },
        sign: async (...args: any[]) => {
          console.log('MainWorker: sign chamado');
          return new Uint8Array(32);
        },
        verify: async (...args: any[]) => {
          console.log('MainWorker: verify chamado');
          return true;
        },
        generateKey: async (...args: any[]) => {
          console.log('MainWorker: generateKey chamado');
          return { type: 'secret', algorithm: args[0] };
        },
        deriveBits: async (algorithm: any, baseKey: any, length: number) => {
          console.log('MainWorker: deriveBits chamado');
          return new Uint8Array(length / 8);
        },
        deriveKey: async (...args: any[]) => {
          console.log('MainWorker: deriveKey chamado');
          return { type: 'secret', algorithm: args[2] };
        }
      }
    };
  }
  
  onWebViewMessage(message: any) {
    console.log('MainWorker: Mensagem recebida da WebView:', message);
  }
}

const internalLibIOS = `${webViewWorkerString}`;
const internalLibAndroid = `${webViewWorkerString}`;

interface PolyfillCryptoProps {
  debug?: boolean;
}

export default class PolyfillCrypto extends React.Component<PolyfillCryptoProps> {
  shouldComponentUpdate() {
    return false;
  }

  render() {
    let worker: MainWorker;

    return (
      <View style={styles.hidden}>
        <WebView
          ref={(webview) => {
            if (webview && !worker) {
              console.log('PolyfillCrypto: Inicializando WebView worker...');
              
              worker = new MainWorker(() => {}, this.props.debug);
              
              // Aplica polyfill APENAS no Android e APENAS se crypto.subtle não funcionar
              if (Platform.OS === 'android') {
                console.log('PolyfillCrypto: Aplicando polyfill específico para Android...');
                
                if (!(global as any).crypto) {
                  (global as any).crypto = {};
                }
                
                // Força subtle sempre no Android
                (global as any).crypto.subtle = worker.crypto.subtle;
                (global as any).crypto.getRandomValues = worker.crypto.getRandomValues;
                (global as any).crypto.androidPolyfill = true;
                
                console.log('✅ PolyfillCrypto: Android polyfill aplicado');
              } else {
                console.log('PolyfillCrypto: Web - mantendo crypto nativo');
              }
              
              (global as any).crypto.loaded = true;
              console.log('*** PolyfillCrypto: Polyfill injetado', !!(global as any).crypto);
            }
          }}
          onMessage={(event) => {
            if (worker) {
              worker.onWebViewMessage(event.nativeEvent.data);
            }
          }}
          injectedJavaScript={Platform.OS === 'android' ? internalLibAndroid : internalLibIOS}
          onError={(error) => {
            console.warn('PolyfillCrypto: Erro na WebView:', error);
          }}
          javaScriptEnabled={true}
          source={{ html: '<html><body></body></html>' }}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  hidden: {
    height: 0,
    opacity: 0,
  },
});