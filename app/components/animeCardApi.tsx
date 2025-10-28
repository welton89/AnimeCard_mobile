import { AnimeData, Anime } from "@app/_services/types";
import { memo, useState } from "react";
import { View, Text,Image, StyleSheet, Dimensions, Alert, TouchableOpacity } from "react-native";
import {  ActivityIndicator, Button, Dialog, Icon, IconButton, Portal, useTheme} from "react-native-paper";
import { AppTheme } from '@app/themes/themes';
import { useData } from '@app/_services/DataContext';
import { router } from "expo-router";

const { width } = Dimensions.get('window');

interface AnimeCardProps {
  anime: AnimeData;
}

export const AnimeCardApi: React.FC<AnimeCardProps> = memo(({ anime }) => {
    // Pega a URL da imagem JPG em tamanho normal (ou pequena como fallback)
    const imageUrl = anime.images?.jpg?.large_image_url || anime.images?.jpg?.small_image_url || 'https://placehold.co/80x120/cccccc/333333?text=Sem+Capa';
    const hasScore = anime.score !== null && anime.scored_by !== null && anime.scored_by > 0;
    const startYear = anime.aired?.from ? new Date(anime.aired.from).getFullYear() : 'N/A';
    // Mapeia os objetos de gênero para uma string simples
    const genreList = anime.genres.map(g => g.name).join(', ');
    const theme = useTheme() as AppTheme; 
    const {animes} = useData()
    const isAnimeInList = animes.some(item => item.id.toString() === anime.mal_id.toString());




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



      const handleViewAnime = () => {
        if (anime.mal_id) {
          router.push(`/pages/animes/animeDetail/${anime.mal_id}`); 
        } else {
          Alert.alert('Erro', 'ID do Anime não encontrado para navegação.');
        }
      };
    






  return (
      <TouchableOpacity onPress={handleViewAnime} activeOpacity={0.6}>
    <View style={styles.cardContainer}>
      <Image
        style={styles.image}
        source={{ uri: imageUrl }}
        resizeMode="cover"
        />
      <View style={styles.infoContainer}>
        <Text style={styles.primaryTitle} numberOfLines={2} ellipsizeMode="tail">
          {anime.title_english || anime.title}
        </Text>
        <Text style={styles.yearText}>
          Tipo: {anime.type} 
        </Text>
        <Text style={styles.yearText}>
         Epsódios: {anime.episodes ? `${anime.episodes} eps` : '?? eps'} 
        </Text>
        <Text style={styles.yearText}>
         Ano: {startYear}
        </Text>
        <Text style={styles.genreText} numberOfLines={1} ellipsizeMode="tail">
          Gêneros: {genreList}
        </Text>
        
        {/* Renderiza a avaliação SOMENTE se os dados estiverem disponíveis (Score / Scored_by) */}
        {hasScore ? (
          <View style={styles.ratingContainer}>
                <Text style={styles.ratingText}>⭐ {anime.score!.toFixed(2)}</Text>
                <Text style={styles.voteText}>({anime.scored_by!.toLocaleString()} votos)</Text>
            </View>
        ) : (
          <Text style={styles.noRatingText}>Sem avaliação disponível</Text>
        )}
      </View>




{isAnimeInList &&
  
       <Icon
    source="book-check-outline"
    color={theme.colors.primary}
    size={28}
  />
}


    
    </View>

        </TouchableOpacity>
  );
});




