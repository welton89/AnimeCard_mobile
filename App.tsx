
// import React, { useState, useMemo } from 'react';
// import { StyleSheet, View, Text, SafeAreaView, Dimensions } from 'react-native';

// import { 
//     BottomNavigation, 
//     FAB, 
//     useTheme, 
//     Provider as PaperProvider // Importado para garantir que o FAB use o tema corretamente
// } from 'react-native-paper';
// // import Icon from 'react-native-vector-icons/MaterialCommunityIcons'; // Para ícones personalizados, se necessário

// // Seus contextos e páginas
// import { DataProvider } from '@app/services/DataContext';
// import { ThemeContextProvider, useThemeToggle } from '@app/contexts/ThemeContext'; // Seu contexto de tema
// import PersonagemPage from '@app/pages/personagemPage';
// import AnimePage from './app/pages/animePage';

// // Importação da sua tipagem de tema (para acessar cores customizadas se necessário)
// import { AppTheme } from '@app/themes/themes';
// const { width: SCREEN_WIDTH } = Dimensions.get('window');

// // --- 1. Mapeamento das rotas para o BottomNavigation do Paper ---
// const routes = [
//     { key: 'personagens', title: 'Personagens', focusedIcon: 'account-group', unfocusedIcon: 'account-group-outline' },
//     { key: 'animes', title: 'Animes', focusedIcon: 'heart', unfocusedIcon: 'heart-outline' },
//     { key: 'settings', title: 'Outros', focusedIcon: 'menu', unfocusedIcon: 'menu-outline' },
// ];

// // --- 2. Renderização das cenas/páginas ---
// const renderScene = BottomNavigation.SceneMap({
//     personagens: PersonagemPage,
//     animes: AnimePage,
//     settings: () => (
//         <View style={styles.fillerPage}>
//             <Text style={{ color: 'black' }}>Conteúdo da Terceira Aba</Text>
//         </View>
//     ),
// });

// // --- 3. Componente Principal (App com lógica de navegação) ---
// const AppContent = () => {
//     // 💡 useThemeToggle é o seu hook que dá acesso ao toggleTheme
//     const { toggleTheme } = useThemeToggle();
//     const [index, setIndex] = useState(0);
//     const [navigationRoutes] = useState(routes);
    
//     // Obtém o tema atual do Paper (útil para cores e FAB)
//     const theme = useTheme() as AppTheme;

//     // Use o useMemo para otimizar o FAB (evita recriação desnecessária)
//     const fabProps = useMemo(() => ({
//         style: [styles.fab, { backgroundColor: theme.colors.secondary }], // Customiza cor do FAB com o tema
//         icon: 'plus', // Ícone do MaterialCommunityIcons (equivalente ao AddIcon)
//         onPress: () => {
//              toggleTheme(); // 💡 Sua função para alternar o tema!
//              console.log('Tema alternado e FAB pressionado');
//         },
//         accessibilityLabel: 'Alternar Tema',
//     }), [toggleTheme, theme.colors.secondary]);

//     return (
//         // O BottomNavigation do Paper não precisa de Views complexas para layout.
//         // Ele gerencia o layout da navegação e das páginas automaticamente.
//         <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            
//             <BottomNavigation
//                 navigationState={{ index, routes: navigationRoutes }}
//                 onIndexChange={setIndex}
//                 renderScene={renderScene}
//                 // Ajustes de estilo para a barra inferior
//                 barStyle={[styles.bottomBar, { backgroundColor: theme.colors.elevation.level2 }]}
//                 // Customização opcional dos ícones/cores se necessário:
//                 // getLabelText={({ route }) => route.title}
//                 // activeColor={theme.colors.primary}
//                 // inactiveColor={theme.colors.onSurface}
//             />

//             {/* 💡 Floating Action Button (FAB) do Paper - Posição absoluta */}
//             <FAB
//                 {...fabProps}
//                 visible={index !== 2} // Exemplo: Esconde o FAB na aba "Outros"
//             />
//         </View>
//     );
// };

// // --- 4. Componente Wrapper com Contextos ---
// export default function App() {
//    return (
//         // 1. PaperProvider deve envolver tudo o que usa componentes Paper (FAB, BottomNavigation)
//         // Se você usa temas customizados, passe-os para o PaperProvider (não mostrado aqui)
//         // Se você não está passando um tema customizado para o PaperProvider, ele usará o default.
//         <PaperProvider> 
//             {/* 2. Seu ThemeContext deve envolver o componente que usa o useThemeToggle */}
//             <ThemeContextProvider> 
//                 {/* 3. Seu DataContext (se for usado dentro do AppContent) */}
//                  <DataProvider>
//                     {/* Agora o AppContent pode usar useThemeToggle() e useTheme() do paper */}
//                     <AppContent /> 
//                  </DataProvider>
//             </ThemeContextProvider>
//         </PaperProvider>
//     );
// }

// // --- 5. Estilos ---
// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//         // O background deve ser definido pelo tema
//     },
//     // Estilos para o BottomNavigation (barStyle)
//     bottomBar: {
//         // O Paper BottomNavigation é responsivo, mas você pode adicionar customizações:
//         // elevation: 8, // A elevação é padrão, mas pode ser ajustada
//         borderTopLeftRadius: 8,
//         borderTopRightRadius: 8,
//         overflow: 'hidden', // Importante para o borderRadius
//     },
//     // Estilo para o FAB
//     fab: {
//         position: 'absolute',
//         margin: 16,
//         right: 0,
//         bottom: 70, // Ajusta para ficar acima da barra de navegação
//         // A cor de fundo será definida pelo theme.colors.secondary no AppContent
//     },
//     // Estilo para as páginas de demonstração
//     fillerPage: {
//         flex: 1,
//         justifyContent: 'center',
//         alignItems: 'center',
//     }
// });


