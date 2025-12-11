
import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Switch, ScrollView, ActivityIndicator, StyleSheet, ColorValue } from 'react-native';
import { useGunStore } from '@app/hooks/useGunStore';
import { useGunAuth } from '@app/hooks/useGunAuth';
import { GunSettings } from '@app/pages/settings/GunSettings';
import { ThemeContextProvider, useThemeToggle } from '@app/contexts/ThemeContext';
import { AppTheme } from '@app/themes/themes';
import { useTheme, Button, Card, Chip } from 'react-native-paper';
import ColorPicker from '@components/ui/ColorPicker';
import { AuthModal } from '@app/components/AuthModal';


export default function SettingsPage() {
  const { settings, isLoading, isInitialized, initialize, updateSetting } = useGunStore();
  const { isAuthenticated, username, logout, checkAuth } = useGunAuth();
  const { toggleTheme } = useThemeToggle();
  const theme = useTheme() as AppTheme; 

  const [currentColor, setCurrentColor] = useState<ColorValue>('#3357FF');
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleColorChange = (color: ColorValue) => {
    console.log('Nova cor selecionada:', color);
    setCurrentColor(color);
  };
  

  useEffect(() => {
    if (!isInitialized) {
      initialize();
    }
    checkAuth(); // Verifica autenticação ao carregar
  }, [isInitialized, initialize, checkAuth]);

  if (isLoading || !isInitialized) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={theme.colors.secondary} />
        <Text>Carregando Configurações...</Text>
      </View>
    );
  }

  const handleTextChange = (key: keyof typeof settings, value: string) => {
    updateSetting(key, value);
  };

  const handleSwitchChange = (key: 'Thema', value: boolean) => {
    toggleTheme();
    const newThema = value ? 'dark' : 'light';
    updateSetting(key, newThema);
  };


  const styles = StyleSheet.create({
  container: { padding: 20, flex: 1, backgroundColor: theme.colors.background },
  label: { fontSize: 16, marginTop: 15, marginBottom: 5, fontWeight: '600',color:theme.colors.secondary },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 12,
    color:theme.colors.secondary,
    fontSize: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 15,
  },
});

 

  return (
    <ScrollView style={styles.container}>
      <Text style={{color:theme.colors.secondary, fontSize: 24, fontWeight: 'bold', marginBottom: 20 }}>Configurações Gerais</Text>

      <Text style={styles.label}>Token Gemini</Text>
      <TextInput
        style={styles.input}
        value={settings.gemini}
        onChangeText={(text) => handleTextChange('gemini', text)}
        placeholder="Token Gemini"
                // placeholderTextColor={theme.colors.onSurface}

        secureTextEntry />

      <View style={styles.row}>
        <Text style={styles.label}>Modo Escuro</Text>
        <Switch
          value={settings.Thema == 'dark'}
          onValueChange={(value) => handleSwitchChange('Thema', value)}
          trackColor={{ false: '#767577', true: theme.colors.secondary }}
          thumbColor={settings.Thema === 'dark' ? theme.colors.primary : '#f4f3f4'} />
      </View>

      <Text style={styles.label}>Cor Primária</Text>
      {/* <TextInput
        style={styles.input}
        value={JSON.parse(settings.Colors).primary} // Exemplo: lendo o JSON
        onChangeText={(text) => {
          const newColors = JSON.stringify({ ...JSON.parse(settings.Colors), primary: text });
          handleTextChange('Colors', newColors);
        } }
        placeholder="#6200ee" /> */}


        <ColorPicker 
        initialColor={currentColor}
        onColorChange={(text)=>{  const newColors = JSON.stringify({ ...JSON.parse(settings.Colors), primary: text });
          handleTextChange('Colors', newColors);}}
        title="Escolha a Cor Principal"
      />

      {/* Seção Autenticação Gun.js */}
      <View style={{ marginTop: 30 }}>
        <Text style={{color:theme.colors.secondary, fontSize: 20, fontWeight: 'bold', marginBottom: 10 }}>
          Conta Gun.js
        </Text>
        
        <Card style={{ padding: 16, marginBottom: 16 }}>
          {isAuthenticated ? (
            <View>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                <Chip 
                  icon="account-check" 
                  style={{ backgroundColor: theme.colors.primary }}
                  textStyle={{ color: theme.colors.onPrimary }}
                >
                  Conectado como {username}
                </Chip>
              </View>
              
              <Text style={{ color: theme.colors.outline, marginBottom: 16 }}>
                Seus dados estão sendo sincronizados de forma segura e criptografada.
              </Text>
              
              <Button
                mode="outlined"
                onPress={logout}
                icon="logout"
              >
                Sair da Conta
              </Button>
            </View>
          ) : (
            <View>
              <Text style={{ color: theme.colors.outline, marginBottom: 16 }}>
                Entre ou crie uma conta para sincronizar seus dados entre dispositivos de forma segura.
              </Text>
              
              <Button
                mode="contained"
                onPress={() => setShowAuthModal(true)}
                icon="account-plus"
              >
                Entrar / Criar Conta
              </Button>
            </View>
          )}
        </Card>
      </View>

      {/* Seção Gun.js */}
      <View style={{ marginTop: 20 }}>
        <Text style={{color:theme.colors.secondary, fontSize: 20, fontWeight: 'bold', marginBottom: 10 }}>
          Sincronização Gun.js
        </Text>
        <GunSettings />
      </View>

      <AuthModal 
        visible={showAuthModal}
        onDismiss={() => setShowAuthModal(false)}
      />

    </ScrollView>
  );
}

