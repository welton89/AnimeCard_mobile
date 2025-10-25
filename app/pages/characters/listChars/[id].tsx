// @app/screens/AnimeCharactersScreen/AnimeCharactersScreen.tsx

import React, { useState, useEffect } from 'react';
import { FlatList, View, Text, ListRenderItem } from 'react-native';
import { ActivityIndicator, useTheme, Searchbar } from 'react-native-paper';
import { useLocalSearchParams, Stack } from 'expo-router';
import { getAnimeCharacters, JikanCharacter } from '@app/_services/jikanApi';
import { AppTheme } from '@app/themes/themes';
import { CharCardApi } from '@components/CharacterCardApi';



// --- Tela Principal ---
export default function AnimeCharactersScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  
  const animeId = id ? parseInt(id, 10) : NaN;
  const theme = useTheme() as AppTheme; 
  const [characters, setCharacters] = useState<JikanCharacter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState(''); // Texto digitado pelo usuário
  const [searchTerm, setSearchTerm] = useState('');

  

  // useEffect para buscar dados da API
  useEffect(() => {
    if (isNaN(animeId)) {
      setError("ID do Anime inválido.");
      setLoading(false);
      return;
    }

    const loadCharacters = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getAnimeCharacters(animeId);
        setCharacters(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Ocorreu um erro desconhecido ao carregar.");
      } finally {
        setLoading(false);
      }
    };

    loadCharacters();
  }, [animeId]);

  // Renderização condicional para estados
  if (loading) {
    return (
      <View style={{flex: 1,
    justifyContent: 'center',
    backgroundColor: theme.colors.background,
    alignItems: 'center',}}>
        <ActivityIndicator size="large" />
        <Text>Carregando personagens...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={{flex: 1,
    justifyContent: 'center',
    backgroundColor: theme.colors.background,
    alignItems: 'center',}}>
        <Text style={{  color: 'red',
    margin: 20,
    textAlign: 'center',}}>{error}</Text>
        <Text style={{ marginTop: 10 }}>Tente recarregar a tela ou verifique o ID: {id}</Text>
      </View>
    );
  }
  
  // Se a lista estiver vazia
  if (characters.length === 0) {
    return (
      <View style={{flex: 1,
    justifyContent: 'center',
    backgroundColor: theme.colors.background,
    alignItems: 'center',}}>
        <Text>Nenhum personagem encontrado para este anime.</Text>
      </View>
    );
  }
const renderItem: ListRenderItem<any> = ({ item }) => <CharCardApi char={item} />;
  // Renderização da lista de personagens
  return (
    <View style={{flex: 1,backgroundColor: theme.colors.background,}}>
      {/* Configuração do Título da Barra de Navegação */}
      <Stack.Screen
        options={{
          title: `Personagens (ID: ${id})`,
          headerShown:true,
         header: (props) => (
                        <View 
                            // O estilo aqui garante que a SearchBar fique na área do cabeçalho
                            style={{ 
                                paddingTop:35, // Adiciona o padding da área segura
                                paddingHorizontal: 10, 
                                paddingBottom: 10,
                                backgroundColor: theme.colors.background, // Cor de fundo do cabeçalho
                                flexDirection: 'row',
                                alignItems: 'center',
                            }}
                        >
                            {/* Você pode adicionar um botão de Voltar aqui, 
                                ou usar headerLeft para o botão de voltar padrão */}

                            <Searchbar
                                placeholder={`Pesquisar entre os ${characters.length} personagens`}
                                style={{ 
                                    flex: 1,
                                    backgroundColor: theme.colors.surfaceDisabled,
                                    marginHorizontal: 5,
                                }}
                                placeholderTextColor={theme.colors.onSurfaceDisabled}
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                                // Aciona a pesquisa
                                onSubmitEditing={() => setSearchTerm(searchQuery)} 
                                autoCorrect={false}
                                autoCapitalize="none"
                                returnKeyType="search"
                            />
                        </View>
          )
        }}
      />
      
      <FlatList
        data={
           characters.filter((val)=>{
                          if(searchQuery === ''){
                            return val
                          }else if(val.character.name.toLowerCase().includes(searchQuery.toLowerCase())){
                            return val

                          }
                        })
                  
        }
        keyExtractor={(item) => item.character.mal_id.toString()}
        renderItem={({ item }) => <CharCardApi char={item} />}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
}



