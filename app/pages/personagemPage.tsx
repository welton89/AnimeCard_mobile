import { FlatList, ListRenderItem, View } from 'react-native';
import { useGunData } from '@app/_services/GunDataContext';
import { ItemCard } from '@components/itemCard';
import { ActivityIndicator, Searchbar, useTheme, Text, SegmentedButtons } from 'react-native-paper';
import { useState } from 'react';
import { AppTheme } from '@app/themes/themes';
import { Character } from '@app/_services/types';

export default function PersonagemPage() {
  const { characters, loading } = useGunData();
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const theme = useTheme() as AppTheme; 

  const renderItem: ListRenderItem<Character> = ({ item }) => <ItemCard item={item}/>;

  return (

            <View style={{ 
              flex: 1,
              backgroundColor: theme.colors.background,
              justifyContent:'center',
              alignItems:'center',
              gap:10,
              }}>
               
              <View style={{width:'95%', gap:10}}>
                <Searchbar
                  placeholder={`Pesquisar entre os ${characters?.length || 0} Personagens`}
                  onChangeText={setSearchQuery}
                  value={searchQuery}
                  style={{backgroundColor:theme.colors.surfaceDisabled }}
                />

                <SegmentedButtons
                  value={filter}
                  onValueChange={setFilter}
                  buttons={[
                    { value: 'all', label: 'Todos' },
                    { value: 'favorites', label: 'Favoritos', icon: 'heart' },
                  ]}
                  style={{ backgroundColor: theme.colors.surface }}
                />
              </View>
           
                <FlatList
                  data={
                       (characters || []).filter((val)=>{
                          const matchesSearch = searchQuery === '' || val.name.toLowerCase().includes(searchQuery.toLowerCase());
                          const matchesFilter = filter === 'all' || (filter === 'favorites' && val.favorite);
                          return matchesSearch && matchesFilter;
                        })
                  }
                  extraData={characters}
                  renderItem={renderItem}
                  keyExtractor={(item) => item.id.toString()}
  
                  contentContainerStyle={{flexGrow:1,gap:40,backgroundColor: theme.colors.background,}}
                  ListEmptyComponent={
                    loading ?
                  
                  <ActivityIndicator animating={true} size={'large'} color={theme.colors.primary} style={{width:350}} /> 
                    :
                    !loading && (characters?.length || 0) == 0 ? <Text> Nenhum Personagem Salvo!</Text>
                    : null
                }
                />
              </View>

  );
}

