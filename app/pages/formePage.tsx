
import React, { useEffect } from 'react';
import { View, Text, TextInput, Switch, ScrollView, ActivityIndicator, StyleSheet } from 'react-native';
import { useSettingsStore } from '@app/hooks/useSettingsStore';
import { ThemeContextProvider, useThemeToggle } from '@app/contexts/ThemeContext'; // Seu contexto de tema
import { AppTheme } from '@app/themes/themes';
import { useTheme } from 'react-native-paper';


export default function SettingsPage() {
  const { settings, isLoading, isInitialized, initialize, updateSetting } = useSettingsStore();
  const { toggleTheme } = useThemeToggle();
  const theme = useTheme() as AppTheme; 
  

  useEffect(() => {
    if (!isInitialized) {
      initialize();
    }
  }, [isInitialized, initialize]);

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

      {/* Campo: Name */}
      <Text style={styles.label}>Nome do Usuário</Text>
      <TextInput
        style={styles.input}
        value={settings.name}
        onChangeText={(text) => handleTextChange('name', text)}
        placeholder="Seu Nome" />

      <Text style={styles.label}>URL da API</Text>
      <TextInput
        style={styles.input}
        value={settings.API}
        onChangeText={(text) => handleTextChange('API', text)}
        placeholder="https://api.example.com/v1" />

      <Text style={styles.label}>Token de Acesso</Text>
      <TextInput
        style={styles.input}
        value={settings.Token}
        onChangeText={(text) => handleTextChange('Token', text)}
        placeholder="Token Secreto"
        // placeholderTextColor={theme.colors.surface}
        secureTextEntry />


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

      {/* <Text style={styles.label}>Cor Primária</Text> */}
      {/* <TextInput
        style={styles.input}
        value={JSON.parse(settings.Colors).primary} // Exemplo: lendo o JSON
        onChangeText={(text) => {
          const newColors = JSON.stringify({ ...JSON.parse(settings.Colors), primary: text });
          handleTextChange('Colors', newColors);
        } }
        placeholder="#6200ee" /> */}

    </ScrollView>
  );
}

