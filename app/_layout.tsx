
import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider as PaperProvider } from 'react-native-paper';
import { Stack } from 'expo-router';
import Toast, { BaseToast, BaseToastProps } from 'react-native-toast-message';
import { useSettingsStore } from '@app/hooks/useSettingsStore';

import { DataProvider } from '@app/_services/DataContext';
import { ThemeContextProvider } from '@app/contexts/ThemeContext';

export default function App() {
      const { isInitialized, initialize } = useSettingsStore();
      useEffect(() => {
        if (!isInitialized) {
          initialize();
        }
      }, [isInitialized, initialize]);
   return (
  <>
  
    <SafeAreaProvider>
        <PaperProvider> 
            <ThemeContextProvider> 
                 <DataProvider>
                    <Stack >
                        <Stack.Screen 
                          name="index" 
                          options={{
                            headerShown: false,
                            animation:'slide_from_right', 
                          }}
                        /> 
                            
                        <Stack.Screen 
                            name="pages/characters/listChars/[id]" 
                              options={{ 
                                title: 'Lista Personagens',
                                headerShown:false,
                                animation:'slide_from_bottom'
                              }} 
                        />

                        <Stack.Screen 
                            name="pages/animes/animeDetail/[id]" 
                              options={{ 
                                title: 'Detalhes Anime',
                                headerShown:false,
                                animation:'fade',
                                animationMatchesGesture:true,
                              }} 
                        />

                        <Stack.Screen 
                            name="pages/characters/charDetail/[id]" 
                              options={{ 
                                title: 'Detalhes Personagem',
                                headerShown:false,
                                animation:'fade',
                                animationDuration:100,
                              }} 
                        />

                    </Stack>
                    <StatusBar hidden={false} />
                 </DataProvider>
            </ThemeContextProvider>
        </PaperProvider>
    </SafeAreaProvider>
    <Toast config={toastConfig} />
      </>
    );
}

const toastConfig = {

  success: (props: React.JSX.IntrinsicAttributes & BaseToastProps) => (
    <BaseToast
      {...props}
      style={{ 
        marginTop:50,
        height:90,
        padding:15,
        width:'95%',
        backgroundColor:'#2f2f2fff',
        borderLeftColor: '#7cff85ff',
        borderColor: '#7cff85ff',
        borderLeftWidth:40,
        borderWidth:1,
        borderRadius:26,
        opacity:0.9

    }} 
    text2NumberOfLines={3}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{
        fontSize: 20,
        color:'#c9c9c9ff',
        fontWeight: '200',
        textAlign:'center'
      }}
      text2Style={{
        fontSize: 16,
        color:'#d3d3d3ff',
        fontWeight: '200',
        

      }}
    />
  ),
  info: (props: React.JSX.IntrinsicAttributes & BaseToastProps) => (
    <BaseToast
      {...props}
      style={{ 
        marginTop:50,
        height:90,
        padding:15,
        width:'95%',
        backgroundColor:'#2f2f2fff',
        borderLeftColor: '#7caaffff',
        borderColor: '#7caaffff',
        borderLeftWidth:40,
        borderWidth:1,
        borderRadius:26,
        opacity:0.9

    }} 
    text2NumberOfLines={3}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{
        fontSize: 20,
        color:'#c9c9c9ff',
        fontWeight: '200',
        textAlign:'center'
      }}
      text2Style={{
        fontSize: 16,
        color:'#d3d3d3ff',
        fontWeight: '200',
        

      }}
    />
  ),
  error: (props: React.JSX.IntrinsicAttributes & BaseToastProps) => (
    <BaseToast
      {...props}
      style={{ 
        marginTop:50,
        height:90,
        padding:15,
        width:'95%',
        backgroundColor:'#2f2f2fff',
        borderLeftColor: '#f84141ff',
        borderColor: '#f84141ff',
        borderLeftWidth:40,
        borderWidth:1,
        borderRadius:26,
        opacity:0.9

    }} 
    text2NumberOfLines={3}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{
        fontSize: 20,
        color:'#c9c9c9ff',
        fontWeight: '200',
        textAlign:'center'
      }}
      text2Style={{
        fontSize: 16,
        color:'#d3d3d3ff',
        fontWeight: '200',
        

      }}
    />
  ),

  
}