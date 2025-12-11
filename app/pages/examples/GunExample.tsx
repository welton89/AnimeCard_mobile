import React, { useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Card, Text, Button, TextInput, useTheme, Divider } from 'react-native-paper';
import { useGunData } from '@app/_services/GunDataContext';
import { AnimeProgressTracker } from '@app/components/AnimeProgressTracker';
import { Anime, Character } from '@app/_services/types';

export function GunExample() {
  const theme = useTheme();
  const { 
    animes, 
    characters, 
    addAnime, 
    addChar, 
    updateAnime, 
    updateChar,
    updateAnimeProgress,
    toggleCharacterFavorite,
    loading 
  } = useGunData();

  const [newAnimeName, setNewAnimeName] = useState('');
  const [newCharName, setNewCharName] = useState('');

  const handleAddAnime = async () => {
    if (!newAnimeName.trim()) return;

    const newAnime: Anime = {
      id: `anime_${Date.now()}`,
      name: newAnimeName,
      images: '',
      description: 'Anime adicionado via Gun.js',
      status: 'plan_to_watch',
      totalEpisodes: 12,
      totalSeasons: 1,
      currentEpisode: 0,
      currentSeason: 1,
      rating: 0
    };

    try {
      await addAnime(newAnime);
      setNewAnimeName('');
    } catch (error) {
      console.error('Erro ao adicionar anime:', error);
    }
  };

  const handleAddCharacter = async () => {
    if (!newCharName.trim() || animes.length === 0) return;

    const newChar: Character = {
      id: `char_${Date.now()}`,
      name: newCharName,
      description: 'Personagem adicionado via Gun.js',
      images: '',
      animeId: animes[0].id, // Usa o primeiro anime
      favorite: false,
      rating: 0
    };

    try {
      await addChar(newChar);
      setNewCharName('');
    } catch (error) {
      console.error('Erro ao adicionar personagem:', error);
    }
  };

  const handleUpdateAnimeProgress = async (animeId: string, episode: number, season?: number) => {
    try {
      await updateAnimeProgress(animeId, episode, season);
    } catch (error) {
      console.error('Erro ao atualizar progresso:', error);
    }
  };

  const handleUpdateAnimeStatus = async (animeId: string, status: Anime['status']) => {
    const anime = animes.find(a => a.id === animeId);
    if (anime) {
      try {
        await updateAnime({ ...anime, status });
      } catch (error) {
        console.error('Erro ao atualizar status:', error);
      }
    }
  };

  const handleUpdateAnimeRating = async (animeId: string, rating: number) => {
    const anime = animes.find(a => a.id === animeId);
    if (anime) {
      try {
        await updateAnime({ ...anime, rating });
      } catch (error) {
        console.error('Erro ao atualizar avaliação:', error);
      }
    }
  };

  const handleUpdateAnimeNotes = async (animeId: string, notes: string) => {
    const anime = animes.find(a => a.id === animeId);
    if (anime) {
      try {
        await updateAnime({ ...anime, notes });
      } catch (error) {
        console.error('Erro ao atualizar notas:', error);
      }
    }
  };

  const handleToggleFavorite = async (charId: string) => {
    try {
      await toggleCharacterFavorite(charId);
    } catch (error) {
      console.error('Erro ao alterar favorito:', error);
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    section: {
      margin: 16,
      padding: 16,
    },
    input: {
      marginBottom: 8,
    },
    row: {
      flexDirection: 'row',
      gap: 8,
      marginBottom: 16,
    }
  });

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text variant="bodyLarge">Carregando dados do Gun.js...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Adicionar Novo Anime */}
      <Card style={styles.section}>
        <Text variant="titleMedium" style={{ marginBottom: 16 }}>
          Adicionar Novo Anime
        </Text>
        
        <TextInput
          mode="outlined"
          label="Nome do Anime"
          value={newAnimeName}
          onChangeText={setNewAnimeName}
          style={styles.input}
        />
        
        <Button
          mode="contained"
          onPress={handleAddAnime}
          disabled={!newAnimeName.trim()}
        >
          Adicionar Anime
        </Button>
      </Card>

      {/* Adicionar Novo Personagem */}
      <Card style={styles.section}>
        <Text variant="titleMedium" style={{ marginBottom: 16 }}>
          Adicionar Novo Personagem
        </Text>
        
        <TextInput
          mode="outlined"
          label="Nome do Personagem"
          value={newCharName}
          onChangeText={setNewCharName}
          style={styles.input}
        />
        
        <Button
          mode="contained"
          onPress={handleAddCharacter}
          disabled={!newCharName.trim() || animes.length === 0}
        >
          Adicionar Personagem
        </Button>
        
        {animes.length === 0 && (
          <Text variant="bodySmall" style={{ color: theme.colors.error, marginTop: 8 }}>
            Adicione um anime primeiro
          </Text>
        )}
      </Card>

      {/* Lista de Animes com Controle de Progresso */}
      <Card style={styles.section}>
        <Text variant="titleMedium" style={{ marginBottom: 16 }}>
          Animes ({animes.length})
        </Text>
        
        {animes.length === 0 ? (
          <Text variant="bodyMedium" style={{ color: theme.colors.outline }}>
            Nenhum anime cadastrado
          </Text>
        ) : (
          animes.map((anime) => (
            <AnimeProgressTracker
              key={anime.id}
              anime={anime}
              onUpdateProgress={(episode, season) => 
                handleUpdateAnimeProgress(anime.id, episode, season)
              }
              onUpdateStatus={(status) => 
                handleUpdateAnimeStatus(anime.id, status)
              }
              onUpdateRating={(rating) => 
                handleUpdateAnimeRating(anime.id, rating)
              }
              onUpdateNotes={(notes) => 
                handleUpdateAnimeNotes(anime.id, notes)
              }
            />
          ))
        )}
      </Card>

      {/* Lista de Personagens */}
      <Card style={styles.section}>
        <Text variant="titleMedium" style={{ marginBottom: 16 }}>
          Personagens ({characters.length})
        </Text>
        
        {characters.length === 0 ? (
          <Text variant="bodyMedium" style={{ color: theme.colors.outline }}>
            Nenhum personagem cadastrado
          </Text>
        ) : (
          characters.map((character) => (
            <Card key={character.id} style={{ marginBottom: 8, padding: 12 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ flex: 1 }}>
                  <Text variant="bodyLarge">{character.name}</Text>
                  <Text variant="bodySmall" style={{ color: theme.colors.outline }}>
                    {animes.find(a => a.id === character.animeId)?.name || 'Anime não encontrado'}
                  </Text>
                  {character.rating && character.rating > 0 && (
                    <Text variant="bodySmall">
                      ⭐ {character.rating}/10
                    </Text>
                  )}
                </View>
                
                <Button
                  mode={character.favorite ? 'contained' : 'outlined'}
                  compact
                  onPress={() => handleToggleFavorite(character.id)}
                  icon={character.favorite ? 'heart' : 'heart-outline'}
                >
                  {character.favorite ? 'Favorito' : 'Favoritar'}
                </Button>
              </View>
            </Card>
          ))
        )}
      </Card>

      {/* Estatísticas */}
      <Card style={styles.section}>
        <Text variant="titleMedium" style={{ marginBottom: 16 }}>
          Estatísticas
        </Text>
        
        <View style={styles.row}>
          <Text variant="bodyMedium">Total de Animes: {animes.length}</Text>
        </View>
        
        <View style={styles.row}>
          <Text variant="bodyMedium">
            Assistindo: {animes.filter(a => a.status === 'watching').length}
          </Text>
        </View>
        
        <View style={styles.row}>
          <Text variant="bodyMedium">
            Finalizados: {animes.filter(a => a.status === 'completed').length}
          </Text>
        </View>
        
        <View style={styles.row}>
          <Text variant="bodyMedium">
            Personagens Favoritos: {characters.filter(c => c.favorite).length}
          </Text>
        </View>
      </Card>
    </ScrollView>
  );
}