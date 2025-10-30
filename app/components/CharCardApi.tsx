import { useState } from "react";
import { View, Text,Image, StyleSheet, Dimensions, TouchableOpacity } from "react-native";
import { Icon, useTheme} from "react-native-paper";
import { router } from "expo-router";
import Toast from "react-native-toast-message";

import { AppTheme } from '@app/themes/themes';
import { useData } from '@app/_services/DataContext';
import { JikanCharacter } from '@app/_services/jikanApi';

const { width } = Dimensions.get('window');

interface CharCardApiProps {
  char: JikanCharacter;
  animeId:string;
}

export const CharCardApi: React.FC<CharCardApiProps> = (({ char, animeId }) => {
  const imageUrl = char.character.images?.jpg?.image_url ;
  const theme = useTheme() as AppTheme; 
  const [visible, setVisible] = useState(false);
  const {characters} = useData()
  const isCharInList = characters.some(item => item.id.toString() === char.character.mal_id.toString());


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
      router.push(`/pages/characters/charDetail/${char.character.mal_id}?animeId=${animeId}`); 
    }else{
      Toast.show({
        type: 'error',
        text1: 'Ops! Algo de errado não ta certo. 😬',
        text2: `ID do personagem não encontrado para navegação.`,
      });
    }
  };


  return (
    <TouchableOpacity onPress={handleViewCharacters}>

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
          
        <Text style={styles.yearText}>
         ID: {char.character.mal_id}
        </Text>
        <Text style={styles.yearText}>
         Papel: {char.role == 'Main' ? 'Elenco Principal' : 'Coadjuvante ou figurante'}
        </Text>
        <Text style={styles.yearText}>
         Favoritado: {char.favorites} Vezes
        </Text>

      </View>

       {isCharInList &&
            <View style={{margin:10}}>
              <Icon
                source="book-check-outline"
                color={theme.colors.primary}
                size={28}
                theme={{}}
              />
            </View>
        }
    
    </View>
        </TouchableOpacity>
  );
});




