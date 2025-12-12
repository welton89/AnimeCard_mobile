# Correção do Problema de Autenticação Android

## Problema Identificado
- Usuário existe (confirmado por "User already created")
- Login falha com "Wrong user or password"
- Contradição: Se Gun.js sabe que usuário existe, deveria conseguir logar

## Causa Raiz
AsyncStorage adapter implementado incorretamente, não seguindo o exemplo oficial do Gun.js para React Native.

## Correções Aplicadas

### 1. AsyncStorage Adapter Corrigido
**Antes:**
```javascript
// Usava prefixo gun_ e request.put incorreto
const data = await AsyncStorage.getItem(`gun_${key}`);
const key = request.put; // ERRADO
```

**Depois (seguindo exemplo oficial):**
```javascript
// SEM prefixo e usando request.get corretamente
const data = await AsyncStorage.getItem(key);
const key = request.get; // CORRETO
```

### 2. Configuração Gun.js Simplificada
**Antes:**
```javascript
this.gun = Gun({
  peers: peers,
  localStorage: true,
  radisk: false,
  axe: false,
  // ... muitas configurações
});
```

**Depois (seguindo exemplo oficial):**
```javascript
this.gun = Gun(peers); // Configuração mínima
```

### 3. Registro do Plugin Mantido Correto
```javascript
Gun.on('create', function(db) {
  this.to.next(db);
  
  const pluginInterop = function(middleware) {
    return function(request) {
      this.to.next(request);
      return middleware(request, db);
    };
  };

  db.on('get', pluginInterop(AsyncStorageAdapter.read));
  db.on('put', pluginInterop(AsyncStorageAdapter.write));
});
```

## Teste Recomendado

1. **Limpar dados do app** (para remover dados corrompidos)
2. **Criar usuário novo** no Android
3. **Testar login** - deve funcionar agora
4. **Testar persistência** com recall

## Baseado Em
Exemplo oficial do Gun.js para React Native:
- https://github.com/amark/gun/tree/master/examples/react-native

## Próximos Passos
Se ainda houver problemas, investigar:
1. Versão do Gun.js
2. Configuração do Metro bundler
3. Permissões do Android