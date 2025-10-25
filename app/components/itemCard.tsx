
import { View, Dimensions, StyleSheet, Alert, ScrollView, TouchableOpacity } from 'react-native';
import { Card, Text, IconButton, useTheme, Avatar, Modal, Portal, Button} from 'react-native-paper';
import { useState } from 'react';
import { router } from 'expo-router'; //
   

import { Character, Anime } from '@app/_services/types';; 
import { useData } from '@app/_services/DataContext';; 
import { ImageCarousel } from './ImageCarrousel'; 
import { AppTheme } from '@app/themes/themes';


const WIDTH = Dimensions.get('window').width;

interface ItemCardProps {
  item: Character | Anime;
}


export function ItemCard({ item }: ItemCardProps) {
  const { animes, characters } = useData();
  const theme = useTheme() as AppTheme; 
 
  const isAnime = 'animeId' in item ? false : true;
  const anime = isAnime 
    ? undefined 
    : animes.find(c => {
        const char = item as Character;
        return c.id.toString() === char.animeId.toString();
    });
  const animeImg = anime == undefined ? [] : anime?.images.split("\n").filter((uri) => uri.trim() !== "");
  const imageUris = item.images == null ? [] : item.images.split("\n").filter((uri) => uri.trim() !== "") || ''



  const renderAvatar = () => {
    if (isAnime || !animeImg || animeImg.length === 0) {
      return null;
    }
    return (
      <TouchableOpacity
      onPress={()=>{router.push(`/pages/animes/animeDetail/${anime?.id}`)}}
      >
      <Avatar.Image
        size={40} // Tamanho fixo para o avatar
        source={{ uri: animeImg[0] }}
        style={{ backgroundColor: theme.colors.surfaceDisabled }}
        />
        </TouchableOpacity>
    );
  };

  const handleViewMore = () => {
    if (isAnime) {
      router.push(`/pages/animes/animeDetail/${item.id}`);
    }
    else if(!isAnime){
      router.push(`/pages/characters/charDetail/${item.id}`);
    } else {
      Alert.alert('Erro', 'ID do Anime não encontrado para navegação.');
    }
  };


  const styles = StyleSheet.create({
  
    cardContainer: {
        borderRadius: WIDTH > 545 ? 4 : 1,
        // width: '100%',
        maxWidth: 545,
        backgroundColor:theme.colors.card
   
    },
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
         backgroundColor:theme.colors.card,
        paddingRight: 8,
    },
    menuAction: {
        marginLeft: 'auto',
    },
    title: {
        fontSize: 16, 
        fontWeight: 'bold',
    },
    subTitle: {
        fontSize: 12, // Um pouco menor
    },
    cardContent: {
      padding:15,
      paddingBottom:1,
       backgroundColor:theme.colors.card
    },
    cardActions: {
      justifyContent:'space-between'
        // Estilos para as ações, Paper já tem bons padrões.
    },
    cardDescription: {
      backgroundColor:theme.colors.card,
        // A cor de texto será automaticamente ajustada pelo tema Paper
    },
    icons: {
      borderColor:'#ffffff08',
      borderStyle:'dotted',
      padding:0
    },
    expandAction: {
        marginLeft: 'auto',
    },
    modalContainer: {
        backgroundColor:theme.colors.card,
        padding: 20,
        margin: 20,
        borderRadius: 14
    },
    buttonSpacer: {
      // Estilo para forçar o espaçamento entre os botões de ação do Card
      flexDirection: 'row',
      alignItems: 'center',
    }
});

  return (

    <Card style={[styles.cardContainer]}>
      
      {/* 3. CardHeader (Substituído por Card.Title) */}
      <View style={styles.headerContainer}>
        <Card.Title
          title={

            animes.find(a => a.id.toString() === item.id.toString())?.name 
            ||
            characters.find(c => c.id.toString() === item.id.toString())?.name
            
            // item.name
          
          }
          subtitle={anime?.name || ''}
          left={renderAvatar}
          titleStyle={styles.title}
          subtitleStyle={styles.subTitle}
        />
      
      </View>
      
      {/* 4. CardMedia (Usando seu ImageCarousel) */}
      <ImageCarousel data={imageUris} height={isAnime ? 550 : 450} />
      
      {/* 5. CardContent (Descrição) */}
      <Card.Content style={styles.cardContent}>
        <Text variant="bodyMedium" numberOfLines={3} style={styles.cardDescription}>
          {item.description}
        </Text>
      </Card.Content>
      <Card.Actions style={styles.cardActions}>
{isAnime ?
        <Text variant="bodyLarge" style={styles.cardDescription}>
          {(item as Anime).status == 'list' ? 'Na Lista' : (item as Anime).status == 'watching' ? 'Assistindo' : 'Finalizado'}
        </Text>
: 

 <IconButton 
          icon={ "youtube-tv"} 
          disabled={true}
          onPress={() => {  }} 
          style={styles.icons} 
          size={30} 
        />  


}
        {/* <Text variant="bodyLarge" style={styles.cardDescription}>
          {anime?.status == 'list' ? 'Na Lista' : anime?.status == 'watching' ? 'Assistindo' : 'Finalizado'}
        </Text>
         */}
        
        
      

        <Button onPress={handleViewMore} mode="text" style={{ marginLeft: 8 }}>
            Ver Mais
        </Button>

      </Card.Actions>
      
    </Card>
 
  );
}

