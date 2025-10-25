import { FlatList, ListRenderItem, View } from 'react-native';
import { useData } from '@app/_services/DataContext';
import { ItemCard } from '@components/itemCard';
import { ActivityIndicator, Searchbar,  useTheme, Text } from 'react-native-paper';
import { useState } from 'react';
import { AppTheme } from '@app/themes/themes';
import { Character } from '@app/_services/types';

export default function PersonagemPage() {
  const { characters, loading } = useData();
  const [searchQuery, setSearchQuery] = useState('');
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
               
                   <Searchbar
                    placeholder={`Pesquisar entre os ${characters.length} Personagem`}
                    onChangeText={setSearchQuery}
                    value={searchQuery}
                    style={{width:'95%',backgroundColor:theme.colors.surfaceDisabled }}
                  />
           
                <FlatList
                  data={
                       characters.filter((val)=>{
                          if(searchQuery === ''){
                            return val
                          }else if(val.name.toLowerCase().includes(searchQuery.toLowerCase())){
                            return val

                          }
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
                    !loading && characters.length == 0 ? <Text> Nada Aqui meu chapa!</Text>
                    : null
                }
                />
              </View>

  );
}

