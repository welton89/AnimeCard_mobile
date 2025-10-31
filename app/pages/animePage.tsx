import { FlatList, ListRenderItem, View } from 'react-native';
import { ActivityIndicator, Searchbar,  useTheme, Text } from 'react-native-paper';
import { useState } from 'react';

import { useData } from '@app/_services/DataContext';
import { ItemCard } from '@components/itemCard';
import { AppTheme } from '@app/themes/themes';
import { Anime } from '@app/_services/types';
import {Filter} from '@app/components/Filter'


export default  function AnimePage() {
    const { animes, loading } = useData();
    const [searchQuery, setSearchQuery] = useState('');
    const [filter, setFilter] = useState('all');
    const theme = useTheme() as AppTheme;

    const filteredAnimes = animes.filter((val) => {
      const matchesSearch = searchQuery === '' || val.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = filter === 'all' || val.status?.includes(filter);
      return matchesSearch && matchesFilter;
    });

    const renderItem: ListRenderItem<Anime> = ({ item }) => <ItemCard item={item}/>;
    return (

        <View style={{ 
            flex: 1,
            //  filter: 'blur(10px)',
            justifyContent:'center',
            position:'relative',
            alignItems:'center',
            gap:10,
          }}>
               
            <View style={{width:'95%', height:108, gap:10}}>
               <Searchbar
                  placeholder={`Pesquisar entre os ${filteredAnimes.length} Animes`}
                  onChangeText={setSearchQuery}
                  value={searchQuery}
                  style={{backgroundColor:theme.colors.surfaceDisabled }}
                />

                <Filter filter={filter}
                  setFilter={setFilter}
                />
            </View>
           
            <FlatList
                data={
                  filteredAnimes
                }
                extraData={animes}
                renderItem={renderItem}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={{flexGrow:1,gap:40,backgroundColor: theme.colors.background,}}
                ListEmptyComponent={
                loading ?
                  
                  <ActivityIndicator animating={true} size={'large'} color={theme.colors.primary} style={{width:350}} /> 
                    :
                    !loading && animes.length == 0 ? <Text> Nada Aqui meu chapa!</Text>
                    : null
                }/>
              </View>

  );
}

