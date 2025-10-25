import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  ListRenderItem,
} from 'react-native';
import { Searchbar, useTheme } from 'react-native-paper';
import { AppTheme } from '@app/themes/themes';

import { AnimeApiResponse, AnimeData, } from '@app/(services)/types'
import {AnimeCardApi} from '@components/animeCardApi'

const BASE_URL = 'https://api.jikan.moe/v4/anime?order_by=popularity&sfw=true';
const SEARCH_BASE_URL = 'https://api.jikan.moe/v4/anime?sfw=true'; 


const InfiniteScrollList: React.FC = () => {
    const [titles, setTitles] = useState<AnimeData[]>([]);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [hasNextPage, setHasNextPage] = useState<boolean>(true);
    const [isLoading, setIsLoading] = useState(false);
    const [isThrottled, setIsThrottled] = useState(false); // Novo: Controla o intervalo entre chamadas
    const [error, setError] = useState<string | null>(null);
    const [isInitialLoad, setIsInitialLoad] = useState(true);
    const [searchQuery, setSearchQuery] = useState(''); // Texto digitado pelo usuário
    const [searchTerm, setSearchTerm] = useState(''); // Termo final usado para a API
    const theme = useTheme() as AppTheme; 



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


  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.onSurface,
    textAlign: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.onSurface,
  },
  listContent: {
    paddingHorizontal: 10,
    paddingVertical: 10,
    flexGrow: 1, 
  },


  infoContainer: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  primaryTitle: {
    fontSize: 18,
    fontWeight: '700',
    // color: '#1a1a1a',
    marginBottom: 4,
  },
  yearText: {
    fontSize: 14,
    // color: '#666',
    marginBottom: 2,
  },
  genreText: {
    fontSize: 13,
    // color: '#888',
    fontStyle: 'italic',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#F4B400', // Cor de estrela/avaliação
    marginRight: 8,
  },
  voteText: {
    fontSize: 12,
    // color: '#999',
  },
  noRatingText: {
    fontSize: 14,
    // color: '#aaa',
    marginTop: 4,
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
    // color: '#888',
  },
  loadingText: {
    marginTop: 8,
    // color: '#666',
    fontSize: 14,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#D93025',
    marginBottom: 10,
  },
  errorText: {
    fontSize: 16,
    // color: '#333',
    textAlign: 'center',
    marginBottom: 5,
  },
  errorSmallText: {
    fontSize: 12,
    // color: '#888',
    textAlign: 'center',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    // color: '#888',
  }
});
  // Função para buscar dados da API (usada para páginas subsequentes)
  const fetchTitles = useCallback(async (page: number) => {
    // Se não houver próxima página ou estiver carregando/throttled, aborta
    if (!hasNextPage) return;
    if (isLoading || isThrottled) return; 

    setIsLoading(true);
    setIsThrottled(true); // Ativa o throttle para evitar chamadas imediatas em cascata
    setError(null);

    let url = `${BASE_URL}&page=${page}`;

    console.log('Buscando animes da URL:', url);

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Erro de rede: ${response.status}`);
      }
      const data: AnimeApiResponse = await response.json();

      setTitles(prevTitles => [...prevTitles, ...data.data]);
      
      // Atualiza a página e se há próxima página
      setCurrentPage(data.pagination.current_page);
      setHasNextPage(data.pagination.has_next_page);
      
    } catch (e: any) {
      console.error('Erro ao buscar dados:', e.message);
      // O Jikan API retorna erro 429 se houver muitas requisições
      if (e.message.includes('429')) {
          setError('Limite de requisições atingido (Jikan API). Tente novamente em alguns segundos.');
      } else {
          setError(`Falha ao carregar dados: ${e.message}`);
      }
      setHasNextPage(false); // Assume que não há mais páginas após erro
    } finally {
      setIsLoading(false);
      // Desativa o throttle após 500ms para permitir a próxima chamada (debounce)
      setTimeout(() => {
          setIsThrottled(false);
      }, 500);
    }
  }, [hasNextPage, isLoading, isThrottled]); // Adiciona isThrottled como dependência



useEffect(() => {
    const fetchData = async () => {
        // 1. Resetar o estado para uma nova busca ou carga inicial
        if (!isInitialLoad) {
            setTitles([]);
            setCurrentPage(1);
            setHasNextPage(true);
        }
        
        setIsLoading(true);
        setError(null);
        setIsThrottled(true); 

        try {
            // 2. Constrói a URL para a página 1
            let url = SEARCH_BASE_URL;
            if (searchTerm) {
                url += `&q=${encodeURIComponent(searchTerm)}`;
            } else {
                url = BASE_URL;
            }
            
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Erro de rede: ${response.status}`);
            }
            const data: AnimeApiResponse = await response.json();

            setTitles(data.data);
            setCurrentPage(data.pagination.current_page);
            setHasNextPage(data.pagination.has_next_page);
        } catch (e: any) {
            console.error('Erro ao buscar dados:', e.message);
            if (e.message.includes('429')) {
                setError('Limite de requisições atingido (Jikan API). Tente novamente em alguns segundos.');
            } else {
                setError(`Falha ao carregar dados: ${e.message}`);
            }
            setHasNextPage(false);
        } finally {
            setIsLoading(false);
            setIsInitialLoad(false);
            // Throttle é ativado brevemente após a primeira busca para evitar chamadas extras do FlatList
            setTimeout(() => setIsThrottled(false), 500); 
        }
    };
    fetchData();
  }, [searchTerm]); // Depende do termo de
  // Função chamada ao se aproximar do final da lista
  const handleLoadMore = () => {
    // Só carrega mais se houver próxima página E o throttle estiver inativo
    if (hasNextPage && !isThrottled) {
      console.log('Fim da lista atingido. Carregando página:', currentPage + 1);
      fetchTitles(currentPage + 1);
    } else if (!hasNextPage) {
      console.log('Não há mais páginas para carregar.');
    }
  };

  const renderItem: ListRenderItem<AnimeData> = ({ item }) => <AnimeCardApi anime={item} />;

  // Renderiza o indicador de carregamento no rodapé da lista
  const renderFooter = () => {
    // Só mostra o footer se estiver carregando E não for o carregamento inicial (que usa o screen loader)
    if (!isLoading || isInitialLoad) return null;
    if (!hasNextPage) return <Text style={styles.endOfListText}>Fim da lista de Animes Populares.</Text>;

    return (
      <View style={styles.loadingFooter}>
        <ActivityIndicator size="large" color="#4285F4" />
        <Text style={styles.loadingText}>Carregando mais animes...</Text>
      </View>
    );
  };

  // Carregamento inicial em tela cheia
  // Usa isInitialLoad para garantir que esta tela só apareça na primeira vez
  if (isInitialLoad && isLoading) {
    return (
      <View style={[styles.container, styles.centerScreen]}>
        <ActivityIndicator size="large" color="#4285F4" />
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
          placeholder="Pesquisar animes em jikan.moe..."
          style={{width:'95%',backgroundColor:theme.colors.surfaceDisabled,alignSelf:'center' }}
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
          // Aciona a pesquisa quando o usuário pressiona 'Enter' ou o botão de pesquisa do teclado
          onSubmitEditing={() => setSearchTerm(searchQuery)} 
          autoCorrect={false}
          autoCapitalize="none"
          returnKeyType="search"
        />
 
      <FlatList
        data={titles}
        renderItem={renderItem}
        keyExtractor={(item) => item.mal_id.toString()}
        // Configuração de Paginação Infinita
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5} // Aciona quando o scroll atinge 50% do final da lista
        ListFooterComponent={renderFooter}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={<Text style={styles.emptyText}>Nenhum anime encontrado.</Text>}
      />
    </View>
  );
};


export default InfiniteScrollList;
