
import React, { useState, useMemo, useEffect } from 'react';
import { StyleSheet, View, Text, Dimensions, StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { BottomNavigation, Provider as PaperProvider } from 'react-native-paper';
import { Stack, useRouter } from 'expo-router';
import { useSettingsStore } from '@app/hooks/useSettingsStore';

import { DataProvider } from '@app/_services/DataContext';
import { ThemeContextProvider, useThemeToggle } from '@app/contexts/ThemeContext'; // Seu contexto de tema
import * as SplashScreen from 'expo-splash-screen';

// Set the animation options. This is optional.
SplashScreen.setOptions({
  duration: 1000,
  fade: true,
});
export default function App() {
      const { settings, isLoading, isInitialized, initialize, updateSetting } = useSettingsStore();
      useEffect(() => {
        if (!isInitialized) {
          initialize();
        }
      }, [isInitialized, initialize]);
   return (
  
    <SafeAreaProvider>
        <PaperProvider> 
            <ThemeContextProvider> 
                 <DataProvider>
                    <Stack>
                            <Stack.Screen name="index" options={{ headerShown: false }} /> 
                            
                            <Stack.Screen 
                                name="pages/characters/listChars/[id]" 
                                options={{ 
                                    title: 'Lista Personagens',
                                    headerShown:false,
                                }} 
                            />
                            <Stack.Screen 
                                name="pages/animes/animeDetail/[id]" 
                                options={{ 
                                    title: 'Detalhes Anime',
                                    headerShown:false,
                                }} 
                            />
                            <Stack.Screen 
                                name="pages/characters/charDetail/[id]" 
                                options={{ 
                                    title: 'Detalhes Personagem',
                                    headerShown:false,
                                }} 
                            />

                            {/* 3. Captura rotas não encontradas, se necessário */}
                            {/* <Stack.Screen name="+not-found" /> */}

                        </Stack>
                    <StatusBar hidden={false} />
                 </DataProvider>
            </ThemeContextProvider>
        </PaperProvider>
    </SafeAreaProvider>
    );
}

