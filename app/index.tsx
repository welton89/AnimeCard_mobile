import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { BottomNavigation, useTheme,  Provider as PaperProvider } from 'react-native-paper';

import PersonagemPage from '@app/pages/personagemPage';
import ExplorerPage from '@app/pages/animes/listAnimes/explorerPage';
import AnimePage from '@app/pages/animePage';
import SettingsPage from '@app/pages/formePage';
import { AppTheme } from '@app/themes/themes';

const routes = [
    { key: 'personagens', title: 'Personagens', focusedIcon: 'account-group', unfocusedIcon: 'account-group-outline' },
    { key: 'animes', title: 'Animes', focusedIcon: 'cat', unfocusedIcon: 'cat' },
    { key: 'explore', title: 'Explorar', focusedIcon: 'cloud-search', unfocusedIcon: 'cloud-search-outline' },
    { key: 'settings', title: 'Opções', focusedIcon: 'cog', unfocusedIcon: 'cog-outline' },
];

const renderScene = BottomNavigation.SceneMap({
    personagens: PersonagemPage,
    animes: AnimePage,
    explore: ExplorerPage,
    settings: SettingsPage,

});

export default function AppContent  ()  {
    const [index, setIndex] = useState(0);
    const [navigationRoutes] = useState(routes);
    const theme = useTheme() as AppTheme;
    return (

        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            
            <BottomNavigation
                navigationState={{ index, routes: navigationRoutes }}
                onIndexChange={setIndex}
                renderScene={renderScene}
                sceneAnimationEnabled={true}
                sceneAnimationType='shifting'
                barStyle={[styles.bottomBar, { backgroundColor: theme.colors.elevation.level2 }]}
                activeColor={theme.colors.primary}
            />

        </View>
    );
};


const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop:35,
    },
    bottomBar: {
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8,
        overflow: 'hidden',
    },
  
    fillerPage: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    }
});


