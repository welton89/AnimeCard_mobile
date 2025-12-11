import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Card, Text, Button, Switch, useTheme, Divider, IconButton, Chip } from 'react-native-paper';
import { useGunStore } from '@app/hooks/useGunStore';
import { useGunAuth } from '@app/hooks/useGunAuth';
import { useGunData } from '@app/_services/GunDataContext';
import { MigrationHelper } from '@app/components/MigrationHelper';

export function GunSettings() {
  const theme = useTheme();
  const { settings, isOnline, sync } = useGunStore();
  const { isAuthenticated } = useGunAuth();
  const { animes, characters, loading } = useGunData();
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);

  const handleSync = async () => {
    setSyncing(true);
    setSyncError(null);
    
    try {
      console.log('🔄 Iniciando sincronização manual do botão...');
      await sync();
      setLastSync(new Date());
      console.log('✅ Sincronização manual concluída com sucesso');
    } catch (error: any) {
      const errorMessage = error?.message || 'Erro desconhecido na sincronização';
      console.error('❌ Erro na sincronização:', errorMessage);
      setSyncError(errorMessage);
    } finally {
      setSyncing(false);
    }
  };

  const getConnectionStatus = () => {
    if (loading) return { label: 'Carregando...', color: theme.colors.outline };
    if (isOnline) return { label: 'Online', color: '#4CAF50' };
    return { label: 'Offline', color: theme.colors.error };
  };

  const connectionStatus = getConnectionStatus();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    section: {
      margin: 16,
      padding: 16,
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginVertical: 8,
    },
    statCard: {
      margin: 8,
      padding: 16,
      backgroundColor: theme.colors.surfaceVariant,
    },
    statRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginVertical: 4,
    },
    statusChip: {
      alignSelf: 'flex-start',
    }
  });

  return (
    <ScrollView style={styles.container}>
      {/* Status da Conexão */}
      <Card style={styles.section}>
        <Text variant="titleMedium" style={{ marginBottom: 16 }}>
          Status da Sincronização
        </Text>
        
        <View style={styles.row}>
          <Text variant="bodyMedium">Status da Conexão:</Text>
          <Chip 
            style={[styles.statusChip, { backgroundColor: connectionStatus.color }]}
            textStyle={{ color: theme.colors.onPrimary }}
            compact
          >
            {connectionStatus.label}
          </Chip>
        </View>

        <View style={styles.row}>
          <Text variant="bodyMedium">Última Sincronização:</Text>
          <Text variant="bodySmall" style={{ color: theme.colors.outline }}>
            {lastSync ? lastSync.toLocaleString() : 'Nunca'}
          </Text>
        </View>

        <Divider style={{ marginVertical: 16 }} />

        <Button
          mode="contained"
          onPress={handleSync}
          loading={syncing}
          disabled={syncing || !isAuthenticated}
          icon="sync"
        >
          {syncing ? 'Sincronizando...' : 
           !isAuthenticated ? 'Faça login para sincronizar' : 
           'Sincronizar Agora'}
        </Button>
        
        {!isAuthenticated && (
          <Text variant="bodySmall" style={{ color: theme.colors.outline, marginTop: 8 }}>
            ⚠️ É necessário estar logado para sincronizar dados entre dispositivos.{'\n'}
            Sem login, os dados ficam apenas no dispositivo local.
          </Text>
        )}
        
        {syncError && (
          <Text variant="bodySmall" style={{ color: theme.colors.error, marginTop: 8 }}>
            Erro: {syncError}
          </Text>
        )}
        
        {lastSync && !syncError && (
          <Text variant="bodySmall" style={{ color: '#4CAF50', marginTop: 8 }}>
            ✅ Sincronização concluída com sucesso
          </Text>
        )}
      </Card>

      {/* Estatísticas dos Dados */}
      <Card style={styles.section}>
        <Text variant="titleMedium" style={{ marginBottom: 16 }}>
          Estatísticas dos Dados
        </Text>

        <View style={styles.statCard}>
          <View style={styles.statRow}>
            <Text variant="bodyMedium">Total de Animes:</Text>
            <Text variant="bodyMedium" style={{ fontWeight: 'bold' }}>
              {animes.length}
            </Text>
          </View>
          
          <View style={styles.statRow}>
            <Text variant="bodyMedium">Total de Personagens:</Text>
            <Text variant="bodyMedium" style={{ fontWeight: 'bold' }}>
              {characters.length}
            </Text>
          </View>

          <Divider style={{ marginVertical: 8 }} />

          <View style={styles.statRow}>
            <Text variant="bodySmall">Assistindo:</Text>
            <Text variant="bodySmall">
              {animes.filter(a => a.status === 'watching').length}
            </Text>
          </View>

          <View style={styles.statRow}>
            <Text variant="bodySmall">Finalizados:</Text>
            <Text variant="bodySmall">
              {animes.filter(a => a.status === 'completed').length}
            </Text>
          </View>

          <View style={styles.statRow}>
            <Text variant="bodySmall">Favoritos:</Text>
            <Text variant="bodySmall">
              {characters.filter(c => c.favorite).length}
            </Text>
          </View>
        </View>
      </Card>

      {/* Configurações Avançadas */}
      <Card style={styles.section}>
        <Text variant="titleMedium" style={{ marginBottom: 16 }}>
          Configurações Avançadas
        </Text>

        <Text variant="bodyMedium" style={{ marginBottom: 16, color: theme.colors.outline }}>
          Gun.js sincroniza automaticamente seus dados entre dispositivos usando uma rede 
          peer-to-peer descentralizada. {'\n\n'}
          🔐 <Text style={{ fontWeight: 'bold' }}>Com Login:</Text> Dados criptografados e sincronizados entre seus dispositivos{'\n'}
          💾 <Text style={{ fontWeight: 'bold' }}>Sem Login:</Text> Dados salvos apenas localmente no dispositivo
        </Text>

        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text variant="bodyMedium">Sincronização Automática</Text>
            <Text variant="bodySmall" style={{ color: theme.colors.outline }}>
              Sempre ativada no Gun.js
            </Text>
          </View>
          <Switch value={true} disabled />
        </View>

        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text variant="bodyMedium">Armazenamento Local</Text>
            <Text variant="bodySmall" style={{ color: theme.colors.outline }}>
              Dados salvos no dispositivo
            </Text>
          </View>
          <Switch value={true} disabled />
        </View>

        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text variant="bodyMedium">Backup Distribuído</Text>
            <Text variant="bodySmall" style={{ color: theme.colors.outline }}>
              Dados replicados na rede
            </Text>
          </View>
          <Switch value={isOnline} disabled />
        </View>
      </Card>

      {/* Ferramenta de Migração */}
      <MigrationHelper onMigrationComplete={() => {
        console.log('Migração concluída');
      }} />

      {/* Informações Técnicas */}
      <Card style={styles.section}>
        <Text variant="titleMedium" style={{ marginBottom: 16 }}>
          Informações Técnicas
        </Text>

        <Text variant="bodySmall" style={{ color: theme.colors.outline, lineHeight: 20 }}>
          • Gun.js v0.2020.1240{'\n'}
          • Armazenamento: AsyncStorage{'\n'}
          • Peers: gun-manhattan.herokuapp.com{'\n'}
          • Protocolo: WebRTC + WebSocket{'\n'}
          • Criptografia: SEA (Security, Encryption, Authorization){'\n'}
          • Resolução de Conflitos: CRDT (Conflict-free Replicated Data Type)
        </Text>
      </Card>
    </ScrollView>
  );
}