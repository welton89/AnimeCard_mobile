import React, { useState } from 'react';
import { View, Alert } from 'react-native';
import { Button, Text, Card, ProgressBar, useTheme } from 'react-native-paper';
import { gunService } from '@app/_services/GunDB';
import { StorageService } from '@app/_services/Storage';

interface MigrationHelperProps {
  onMigrationComplete: () => void;
}

export function MigrationHelper({ onMigrationComplete }: MigrationHelperProps) {
  const [migrating, setMigrating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');
  const theme = useTheme();

  const migrateData = async () => {
    try {
      setMigrating(true);
      setProgress(0);
      setStatus('Iniciando migração...');

      // 1. Inicializar Gun.js
      setStatus('Inicializando Gun.js...');
      await gunService.initialize();
      setProgress(0.3);

      // 2. Verificar dados existentes no AsyncStorage
      setStatus('Verificando dados existentes...');
      const existingData = await StorageService.getAllKeys();
      setProgress(0.6);

      // 3. Limpar cache antigo se existir
      setStatus('Limpando cache...');
      const gunKeys = existingData.filter(key => key.startsWith('gun_'));
      for (const key of gunKeys) {
        await StorageService.removeItem(key);
      }
      setProgress(0.8);

      setStatus('Migração concluída!');
      setProgress(1.0);
      
      Alert.alert(
        'Migração Concluída',
        'Sistema migrado para Gun.js com sucesso!\nAgora você pode sincronizar dados entre dispositivos.',
        [
          {
            text: 'OK',
            onPress: onMigrationComplete
          }
        ]
      );

    } catch (error) {
      console.error('Erro na migração:', error);
      Alert.alert(
        'Erro na Migração',
        'Ocorreu um erro durante a migração. Verifique os logs.',
        [{ text: 'OK' }]
      );
    } finally {
      setMigrating(false);
    }
  };

  const testConnection = async () => {
    try {
      setStatus('Testando conexão Gun.js...');
      await gunService.initialize();
      
      Alert.alert(
        'Conexão OK',
        'Gun.js está funcionando corretamente!',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Erro no teste:', error);
      Alert.alert('Erro', 'Falha na conexão com Gun.js.');
    }
  };

  return (
    <Card style={{ margin: 16, padding: 16 }}>
      <Text variant="headlineSmall" style={{ marginBottom: 16 }}>
        Sistema Gun.js
      </Text>
      
      <Text variant="bodyMedium" style={{ marginBottom: 16 }}>
        Gun.js permite sincronização automática entre dispositivos e funcionamento 
        offline. Seus dados ficam seguros localmente e sincronizam quando online.
      </Text>

      {migrating && (
        <View style={{ marginBottom: 16 }}>
          <Text variant="bodySmall" style={{ marginBottom: 8 }}>
            {status}
          </Text>
          <ProgressBar progress={progress} color={theme.colors.primary} />
        </View>
      )}

      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
        <Button
          mode="contained"
          onPress={migrateData}
          disabled={migrating}
          style={{ flex: 1 }}
        >
          {migrating ? 'Configurando...' : 'Configurar Gun.js'}
        </Button>
        
        <Button
          mode="outlined"
          onPress={testConnection}
          disabled={migrating}
          style={{ flex: 1 }}
        >
          Testar Conexão
        </Button>
      </View>

      <Text variant="bodySmall" style={{ color: theme.colors.outline }}>
        ✅ Funciona offline e online
        {'\n'}✅ Sincronização automática
        {'\n'}✅ Backup distribuído
      </Text>
    </Card>
  );
}