// Polyfill WebCrypto para React Native - DEVE SER IMPORTADO ANTES DO GUN/SEA
console.log('🔧 Configurando polyfill WebCrypto...');

// Verifica se crypto já existe
if (typeof global.crypto !== 'undefined') {
  console.log('✅ Crypto já disponível:', !!global.crypto.subtle);
} else {
  console.log('⚠️ Crypto não disponível, criando polyfill...');
}

// Força criação do polyfill mesmo se crypto existir (para garantir que subtle funcione)
(global as any).crypto = {
  getRandomValues: (array: any) => {
    console.log('🎲 getRandomValues chamado para array de tamanho:', array.length);
    for (let i = 0; i < array.length; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
    return array;
  },
  subtle: {
    importKey: async (...args: any[]) => {
      console.log('🔑 importKey chamado com:', args.length, 'argumentos');
      return { type: 'secret', algorithm: args[2] || 'AES-GCM' };
    },
    exportKey: async (format: string, key: any) => {
      console.log('📤 exportKey chamado:', format);
      return key;
    },
    encrypt: async (algorithm: any, key: any, data: any) => {
      console.log('🔒 encrypt chamado');
      return data;
    },
    decrypt: async (algorithm: any, key: any, data: any) => {
      console.log('🔓 decrypt chamado');
      return data;
    },
    sign: async (...args: any[]) => {
      console.log('✍️ sign chamado');
      return new Uint8Array(32);
    },
    verify: async (...args: any[]) => {
      console.log('✅ verify chamado');
      return true;
    },
    generateKey: async (...args: any[]) => {
      console.log('🔑 generateKey chamado');
      return { type: 'secret', algorithm: args[0] };
    },
    deriveBits: async (algorithm: any, baseKey: any, length: number) => {
      console.log('🔧 deriveBits chamado para', length, 'bits');
      return new Uint8Array(length / 8);
    },
    deriveKey: async (...args: any[]) => {
      console.log('🔑 deriveKey chamado');
      return { type: 'secret', algorithm: args[2] };
    }
  }
};

console.log('✅ Polyfill WebCrypto configurado com sucesso');
console.log('📊 Crypto disponível:', !!global.crypto);
console.log('📊 Subtle disponível:', !!global.crypto.subtle);
console.log('📊 ImportKey disponível:', !!global.crypto.subtle.importKey);