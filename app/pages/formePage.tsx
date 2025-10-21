// import { View, StyleSheet, Dimensions, ScrollView, Alert } from 'react-native';
// import { 
//   Text, 
//   useTheme, 
//   TextInput, 
//   Button, 
//   Switch, 
//   Card,
//   Searchbar
// } from 'react-native-paper';
// import { AppTheme } from '@app/themes/themes';
// import { useState, useMemo } from 'react';

// const WIDTH = Dimensions.get('window').width;





import React, { useEffect } from 'react';
import { View, Text, TextInput, Switch, ScrollView, ActivityIndicator, StyleSheet } from 'react-native';
import { useSettingsStore } from '@app/hooks/useSettingsStore';
import { ThemeContextProvider, useThemeToggle } from '@app/contexts/ThemeContext'; // Seu contexto de tema


export const SettingsPage: React.FC = () => {
  const { settings, isLoading, isInitialized, initialize, updateSetting } = useSettingsStore();
  const { toggleTheme } = useThemeToggle();
  
  useEffect(() => {
    if (!isInitialized) {
      initialize();
    }
  }, [isInitialized, initialize]);

  if (isLoading || !isInitialized) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6200ee" />
        <Text>Carregando Configurações...</Text>
      </View>
    );
  }

  // Função helper para lidar com mudanças de texto
  const handleTextChange = (key: keyof typeof settings, value: string) => {
    updateSetting(key, value);
  };
  
  // Função helper para lidar com mudanças de Switch/Toggle
  const handleSwitchChange = (key: 'Thema', value: boolean) => {
    toggleTheme();
    const newThema = value ? 'dark' : 'light';
    updateSetting(key, newThema);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Configurações Gerais</Text>

      {/* Campo: Name */}
      <Text style={styles.label}>Nome do Usuário</Text>
      <TextInput
        style={styles.input}
        value={settings.name}
        onChangeText={(text) => handleTextChange('name', text)}
        placeholder="Seu Nome"
      />

      {/* Campo: API */}
      <Text style={styles.label}>URL da API</Text>
      <TextInput
        style={styles.input}
        value={settings.API}
        onChangeText={(text) => handleTextChange('API', text)}
        placeholder="https://api.example.com/v1"
      />

      {/* Campo: Token */}
      <Text style={styles.label}>Token de Acesso</Text>
      <TextInput
        style={styles.input}
        value={settings.Token}
        onChangeText={(text) => handleTextChange('Token', text)}
        placeholder="Token Secreto"
        secureTextEntry
      />

      {/* Campo: Thema */}
      <View style={styles.row}>
        <Text style={styles.label}>Modo Escuro</Text>
        <Switch
          value={settings.Thema == 'dark' }
          onValueChange={(value) => handleSwitchChange('Thema', value)}
          trackColor={{ false: '#767577', true: '#81b0ff' }}
          thumbColor={settings.Thema === 'dark' ? '#f5dd4b' : '#f4f3f4'}
        />
      </View>
      
      {/* Campo: Colors (Exemplo simples, pode ser mais complexo) */}
      <Text style={styles.label}>Cor Primária</Text>
      <TextInput
        style={styles.input}
        value={JSON.parse(settings.Colors).primary} // Exemplo: lendo o JSON
        onChangeText={(text) => {
            const newColors = JSON.stringify({ ...JSON.parse(settings.Colors), primary: text });
            handleTextChange('Colors', newColors);
        }}
        placeholder="#6200ee"
      />
      
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20, flex: 1, backgroundColor: '#fff' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  label: { fontSize: 16, marginTop: 15, marginBottom: 5, fontWeight: '600' },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
    fontSize: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 15,
  },
});

 