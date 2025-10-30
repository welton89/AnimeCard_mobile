import React, { useState, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { BottomNavigation,  FAB, useTheme,  Provider as PaperProvider } from 'react-native-paper';
import { useRouter } from 'expo-router';

// import { DataProvider } from '@app/services/DataContext';
import { ThemeContextProvider, useThemeToggle } from '@app/contexts/ThemeContext';
import PersonagemPage from '@app/pages/personagemPage';
import ExplorerPage from '@app/pages/animes/listAnimes/explorerPage';
import AnimePage from '@app/pages/animePage';
import SettingsPage from '@app/pages/formePage';

import { AppTheme } from '@app/themes/themes';
// const { width: SCREEN_WIDTH } = Dimensions.get('window');

// --- 1. Mapeamento das rotas para o BottomNavigation do Paper ---
const routes = [
    { key: 'personagens', title: 'Personagens', focusedIcon: 'account-group', unfocusedIcon: 'account-group-outline' },
    { key: 'animes', title: 'Animes', focusedIcon: 'cat', unfocusedIcon: 'cat' },
    { key: 'explore', title: 'Explorar', focusedIcon: 'cloud-search', unfocusedIcon: 'cloud-search-outline' },
    { key: 'settings', title: 'Opções', focusedIcon: 'cog', unfocusedIcon: 'cog-outline' },
];

// --- 2. Renderização das cenas/páginas ---
const renderScene = BottomNavigation.SceneMap({
    personagens: PersonagemPage,
    animes: AnimePage,
    explore: ExplorerPage,
    settings: SettingsPage,

});

export default function AppContent  ()  {
    const [index, setIndex] = useState(0);
    const [navigationRoutes] = useState(routes);
    const router = useRouter();
    
    const theme = useTheme() as AppTheme;



    // Use o useMemo para otimizar o FAB (evita recriação desnecessária)
    // const fabProps = useMemo(() => ({
    //     style: [styles.fab, { backgroundColor: theme.colors.secondary }], 
    //     icon: 'plus', // Ícone do MaterialCommunityIcons (equivalente ao AddIcon)
    //     onPress: () => {
    //          toggleTheme(); // 💡 Sua função para alternar o tema!
    //          console.log('Tema alternado e FAB pressionado');
    //     },
    //     accessibilityLabel: 'Alternar Tema',
    // }), [toggleTheme, theme.colors.secondary]);

    return (

        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            
            <BottomNavigation
                navigationState={{ index, routes: navigationRoutes }}
                onIndexChange={setIndex}
                renderScene={renderScene}
                sceneAnimationEnabled={true}
                sceneAnimationType='shifting'

                barStyle={[styles.bottomBar, { backgroundColor: theme.colors.elevation.level2 }]}
                // Customização opcional dos ícones/cores se necessário:
                // getLabelText={({ route }) => route.title}
                activeColor={theme.colors.primary}
                // inactiveColor={theme.colors.onSurface}
            />

            {/* <FAB
                {...fabProps}
                visible={index !== 3} // Exemplo: Esconde o FAB na aba "Outros"
            /> */}
        </View>
    );
};


const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop:35,
        // O background deve ser definido pelo tema
    },
    // Estilos para o BottomNavigation (barStyle)
    bottomBar: {
        // O Paper BottomNavigation é responsivo, mas você pode adicionar customizações:
        // elevation: 8, // A elevação é padrão, mas pode ser ajustada
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8,
        overflow: 'hidden', // Importante para o borderRadius
    },
    // Estilo para o FAB
    fab: {
        position: 'absolute',
        margin: 16,
        right: 0,
        bottom: 70, // Ajusta para ficar acima da barra de navegação
        // A cor de fundo será definida pelo theme.colors.secondary no AppContent
    },
    // Estilo para as páginas de demonstração
    fillerPage: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    }
});


