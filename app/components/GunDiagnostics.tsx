import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { 
  Card, 
  Text, 
  Button, 
  useTheme, 
  ActivityIndicator,
  Chip,
  Divider
} from 'react-native-paper';
import { gunService } from '@app/_services/GunDB';

export function GunDiagnostics() {
  const theme = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [peerStatus, setPeerStatus] = useState<Map<string, boolean>>(new Map());
  const [report, setReport] = useState<any>(null);

  useEffect(() => {
    // Carrega status inicial
    loadPeerStatus();
  }, []);

  const loadPeerStatus = () => {
    const status = gunService.getPeerStatus();
    setPeerStatus(status);
  };

  const runFullDiagnostic = async () => {
    setIsLoading(true);
    try {
      console.log('🔍 Iniciando diagnóstico completo...');
      
      // Testa conectividade com todos os peers
      await gunService.testAllPeersConnectivity();
      
      // Testa peer personalizado especificamente
      await gunService.testCustomPeer();
      
      // Diagnóstico React Native
      await gunService.diagnoseReactNativeIssues();
      
      // Gera relatório
      const connectivityReport = await gunService.getConnectivityReport();
      setReport(connectivityReport);
      
      // Atualiza status dos peers
      loadPeerStatus();
      
    } catch (error) {
      console.error('Erro no diagnóstico:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const reconnectPeers = async () => {
    setIsLoading(true);
    try {
      await gunService.reconnectPeers();
      setTimeout(() => {
        loadPeerStatus();
        setIsLoading(false);
      }, 3000);
    } catch (error) {
      console.error('Erro ao reconectar:', error);
      setIsLoading(false);
    }
  };

  const testSync = async () => {
    setIsLoading(true);
    try {
      await gunService.sync();
    } catch (error) {
      console.error('Erro no teste de sync:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const styles = StyleSheet.create({
    container: {
      padding: 16,
    },
    card: {
      marginBottom: 16,
    },
    peerItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 8,
    },
    peerUrl: {
      flex: 1,
      fontSize: 12,
    },
    buttonRow: {
      flexDirection: 'row',
      gap: 8,
      marginBottom: 16,
    },
    button: {
      flex: 1,
    },
    reportText: {
      fontFamily: 'monospace',
      fontSize: 12,
      backgroundColor: theme.colors.surfaceVariant,
      padding: 8,
      borderRadius: 4,
    }
  });

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Title title="Gun.js Diagnósticos" />
        <Card.Content>
          <View style={styles.buttonRow}>
            <Button 
              mode="contained" 
              onPress={runFullDiagnostic}
              disabled={isLoading}
              style={styles.button}
            >
              Diagnóstico Completo
            </Button>
            <Button 
              mode="outlined" 
              onPress={reconnectPeers}
              disabled={isLoading}
              style={styles.button}
            >
              Reconectar
            </Button>
          </View>
          
          <Button 
            mode="text" 
            onPress={testSync}
            disabled={isLoading}
          >
            Testar Sincronização
          </Button>

          {isLoading && (
            <ActivityIndicator 
              animating={true} 
              style={{ marginVertical: 16 }}
            />
          )}
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Title title="Status dos Peers" />
        <Card.Content>
          {Array.from(peerStatus.entries()).map(([peer, connected]) => (
            <View key={peer} style={styles.peerItem}>
              <Text style={styles.peerUrl}>{peer}</Text>
              <Chip 
                icon={connected ? 'check' : 'close'}
                textStyle={{ fontSize: 10 }}
                style={{ 
                  backgroundColor: connected 
                    ? theme.colors.primaryContainer 
                    : theme.colors.errorContainer 
                }}
              >
                {connected ? 'Conectado' : 'Desconectado'}
              </Chip>
            </View>
          ))}
          
          {peerStatus.size === 0 && (
            <Text>Execute o diagnóstico para ver o status dos peers</Text>
          )}
        </Card.Content>
      </Card>

      {report && (
        <Card style={styles.card}>
          <Card.Title title="Relatório de Conectividade" />
          <Card.Content>
            <Text style={styles.reportText}>
              {JSON.stringify(report, null, 2)}
            </Text>
          </Card.Content>
        </Card>
      )}

      <Card style={styles.card}>
        <Card.Title title="Problemas Comuns e Soluções" />
        <Card.Content>
          <Text variant="titleSmall">Heroku Peers em Sleep Mode:</Text>
          <Text variant="bodySmall" style={{ marginBottom: 8 }}>
            • Peers Heroku dormem após 30min de inatividade{'\n'}
            • Primeira conexão pode demorar 30-60 segundos{'\n'}
            • Aguarde ou use peer próprio sempre ativo
          </Text>

          <Divider style={{ marginVertical: 8 }} />

          <Text variant="titleSmall">WebSocket Bloqueado:</Text>
          <Text variant="bodySmall" style={{ marginBottom: 8 }}>
            • Firewall corporativo pode bloquear WebSocket{'\n'}
            • Proxy pode interferir na conexão{'\n'}
            • Teste em rede móvel para confirmar
          </Text>

          <Divider style={{ marginVertical: 8 }} />

          <Text variant="titleSmall">Peer Personalizado:</Text>
          <Text variant="bodySmall">
            • Verifique se Gun.js está rodando no servidor{'\n'}
            • Confirme se CORS está configurado{'\n'}
            • Teste HTTP primeiro, depois WebSocket{'\n'}
            • Verifique logs do servidor
          </Text>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}