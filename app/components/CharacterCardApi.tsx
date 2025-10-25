import { AnimeData, Anime } from "@app/(services)/types";
import { memo, useState } from "react";
import { View, Text,Image, StyleSheet, Dimensions, Alert } from "react-native";
import {  ActivityIndicator, Button, Dialog, IconButton, Portal, useTheme} from "react-native-paper";
import { AppTheme } from '@app/themes/themes';
import { useData } from '@app/(services)/DataContext';
import { router } from "expo-router";
import { getAnimeCharacters, JikanCharacter } from '@app/(services)/jikanApi'; // Sua nova API

const { width } = Dimensions.get('window');

interface CharCardApiProps {
  char: JikanCharacter;
}

export const CharCardApi: React.FC<CharCardApiProps> = memo(({ char }) => {
    const imageUrl = char.character.images?.jpg?.image_url ;
    const theme = useTheme() as AppTheme; 
    const [visible, setVisible] = useState(false);


const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: theme.colors.card,
    borderRadius: 12,
    flexDirection: 'row',
    marginBottom: 10,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  image: {
    width: width * 0.3, 
    height: width * 0.45, 
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  infoContainer: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  primaryTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.onSurface,
    marginBottom: 4,
  },
  yearText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  genreText: {
    fontSize: 13,
    color: '#888',
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
    color: '#999',
  },
  noRatingText: {
    fontSize: 14,
    color: '#aaa',
    marginTop: 4,
  },

});



      const handleViewCharacters = () => {
        if (char.character.mal_id) {
    
          // 🎯 Rota configurada: /characters/[id].tsx
          router.push(`/pages/characters/charDetail/${char.character.mal_id}`); 
          // router.push(`/pages/characters/${item.id}`); 
        } else {
          Alert.alert('Erro', 'ID do Anime não encontrado para navegação.');
        }
      };
    






  return (
    <View style={styles.cardContainer}>
      <Image
        style={styles.image}
        source={{ uri: imageUrl }}
        resizeMode="cover"
      />
      <View style={styles.infoContainer}>
        <Text style={styles.primaryTitle} numberOfLines={2} ellipsizeMode="tail">
          {char.character.name}
        </Text>
           <Button onPress={handleViewCharacters} mode="text" style={{ marginLeft: 8 }}>
            Ver Mais
        </Button>
        {/* <Text style={styles.yearText}>
          {anime.type}, {anime.episodes ? `${anime.episodes} eps` : '?? eps'} ({startYear})
        </Text>
        <Text style={styles.genreText} numberOfLines={1} ellipsizeMode="tail">
          Gêneros: {genreList}
        </Text> */}
        
        {/* Renderiza a avaliação SOMENTE se os dados estiverem disponíveis (Score / Scored_by) */}
        {/* {hasScore ? (
            <View style={styles.ratingContainer}>
                <Text style={styles.ratingText}>⭐ {anime.score!.toFixed(2)}</Text>
                <Text style={styles.voteText}>({anime.scored_by!.toLocaleString()} votos)</Text>
                <IconButton 
                icon={"plus-circle"}
                onPress={()=>setVisible(!visible)}
                style={{flex:1,alignSelf:'flex-end'}}
                />


                 <Button onPress={handleViewCharacters} mode="text" style={{ marginLeft: 8 }}>
            Ver Mais
        </Button>
            </View>
        ) : (
            <Text style={styles.noRatingText}>Sem avaliação disponível</Text>
        )} */}
      </View>
    
    </View>
  );
});




