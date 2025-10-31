
import React, { useState,  } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  ListRenderItem
} from 'react-native';
import { Searchbar, useTheme } from 'react-native-paper';
import { AppTheme } from '@app/themes/themes';
import { AnimeData } from '@app/_services/types';
import { AnimeCardApi } from '@components/animeCardApi';

import { useAnimeData } from '@app/hooks/useAnimeData'; 

    function removeDuplicates(animes: AnimeData[]): AnimeData[] {
    const uniqueMap = new Map<string, AnimeData>();
    animes.forEach(anime => {
        uniqueMap.set(anime.mal_id, anime);
    });
    return Array.from(uniqueMap.values());
}



const InfiniteScrollList: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState(''); 
    const [searchTerm, setSearchTerm] = useState(''); 
    const theme = useTheme() as AppTheme; 

    const { animes, isLoading, error, isInitialLoad, hasNextPage, handleLoadMore } = useAnimeData(searchTerm); 
const animeData = removeDuplicates(animes)
    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.colors.background,
            gap:10,
        },
        centerScreen: {
            justifyContent: 'center',
            alignItems: 'center',
            padding: 20,
        },
        listContent: {
            paddingHorizontal: 10,
            paddingVertical: 10,
            flexGrow: 1, 
        },
        loadingFooter: {
            paddingVertical: 20,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 20,
        },
        endOfListText: {
            textAlign: 'center',
            padding: 15,
            fontSize: 14,
            color: theme.colors.onSurfaceVariant, 
        },
        loadingText: {
            marginTop: 8,
            color: theme.colors.secondary,
            fontSize: 22,
        },
        errorTitle: {
            fontSize: 20,
            fontWeight: 'bold',
            color: '#D93025',
            marginBottom: 10,
        },
        errorText: {
            fontSize: 16,
            color: theme.colors.onSurface,
            textAlign: 'center',
            marginBottom: 5,
        },
        errorSmallText: {
            fontSize: 12,
            color: theme.colors.onSurfaceVariant,
            textAlign: 'center',
        },
        emptyText: {
            textAlign: 'center',
            marginTop: 50,
            fontSize: 16,
            color: theme.colors.onSurfaceVariant,
        }
    });

    // Funções de Renderização
    const renderItem: ListRenderItem<AnimeData> = ({ item }) => <AnimeCardApi anime={item} />;

    const renderFooter = () => {
        if (!isLoading || isInitialLoad) return null;
        if (!hasNextPage) return <Text style={styles.endOfListText}>Fim da lista de Animes.</Text>;

        return (
            <View style={styles.loadingFooter}>
                <ActivityIndicator animating={true} size={'large'} color={theme.colors.primary} style={{width:350}} /> 
                <Text style={styles.loadingText}>Carregando mais animes...</Text>
            </View>
        );
    };


    // Carregamento inicial em tela cheia
    if (isInitialLoad && isLoading) {
        return (
            <View style={[styles.container, styles.centerScreen]}>
                <ActivityIndicator animating={true} size={'large'} color={theme.colors.primary} style={{width:350}} /> 
                <Text style={styles.loadingText}>Buscando os Animes...</Text>
            </View>
        );
    }

    // Tratamento de erro em tela cheia
    if (error) {
        return (
            <View style={[styles.container, styles.centerScreen]}>
                <Text style={styles.errorTitle}>Ops! Ocorreu um erro:</Text>
                <Text style={styles.errorText}>{error}</Text>
                <Text style={styles.errorSmallText}>Verifique sua conexão ou tente novamente mais tarde.</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>   
            
            <Searchbar
                placeholder="Pesquisar em myanimelist.net"
                style={{width:'95%',backgroundColor:theme.colors.surfaceDisabled,alignSelf:'center' }}
                placeholderTextColor="#999"
                value={searchQuery}
                onChangeText={setSearchQuery}
                onSubmitEditing={() => setSearchTerm(searchQuery)} 
                autoCorrect={false}
                autoCapitalize="none"
                returnKeyType="search"
            />
    
            <FlatList
                data={animeData}
                renderItem={renderItem}
                keyExtractor={(item) => item.mal_id.toString()}
                // Lógica de Paginação Infinita: acionando a função do hook
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.5} 
                ListFooterComponent={renderFooter}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={<Text style={styles.emptyText}>Nenhum anime encontrado.</Text>}
            />
        </View>
    );
};


export default InfiniteScrollList;