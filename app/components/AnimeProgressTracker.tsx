import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, Button, IconButton, ProgressBar, useTheme, Chip, TextInput, Modal, Portal } from 'react-native-paper';
import { Anime } from '@app/_services/types';

interface AnimeProgressTrackerProps {
  anime: Anime;
  onUpdateProgress: (episode: number, season?: number) => void;
  onUpdateStatus: (status: Anime['status']) => void;
  onUpdateRating: (rating: number) => void;
  onUpdateNotes: (notes: string) => void;
}

export function AnimeProgressTracker({ 
  anime, 
  onUpdateProgress, 
  onUpdateStatus, 
  onUpdateRating,
  onUpdateNotes 
}: AnimeProgressTrackerProps) {
  const theme = useTheme();
  const [showDetails, setShowDetails] = useState(false);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [tempNotes, setTempNotes] = useState(anime.notes || '');

  const currentEpisode = anime.currentEpisode || 0;
  const totalEpisodes = anime.totalEpisodes || 0;
  const currentSeason = anime.currentSeason || 1;
  const totalSeasons = anime.totalSeasons || 1;
  const rating = anime.rating || 0;

  // Calcula progresso
  const episodeProgress = totalEpisodes > 0 ? currentEpisode / totalEpisodes : 0;
  const overallProgress = totalSeasons > 1 
    ? ((currentSeason - 1) / totalSeasons) + (episodeProgress / totalSeasons)
    : episodeProgress;

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'watching': return theme.colors.primary;
      case 'completed': return '#4CAF50';
      case 'dropped': return theme.colors.error;
      case 'plan_to_watch': return theme.colors.outline;
      default: return theme.colors.surfaceVariant;
    }
  };

  const getStatusLabel = (status?: string) => {
    switch (status) {
      case 'watching': return 'Assistindo';
      case 'completed': return 'Finalizado';
      case 'dropped': return 'Dropado';
      case 'plan_to_watch': return 'Pretendo Assistir';
      case 'list': return 'Na Lista';
      default: return 'Sem Status';
    }
  };

  const handleEpisodeChange = (increment: boolean) => {
    const newEpisode = increment 
      ? Math.min(currentEpisode + 1, totalEpisodes || 999)
      : Math.max(currentEpisode - 1, 0);
    
    onUpdateProgress(newEpisode, currentSeason);
    
    // Auto-atualiza status
    if (newEpisode === totalEpisodes && currentSeason === totalSeasons && totalEpisodes > 0) {
      onUpdateStatus('completed');
    } else if (newEpisode > 0 && anime.status !== 'watching') {
      onUpdateStatus('watching');
    }
  };

  const handleSeasonChange = (increment: boolean) => {
    const newSeason = increment 
      ? Math.min(currentSeason + 1, totalSeasons || 999)
      : Math.max(currentSeason - 1, 1);
    
    onUpdateProgress(currentEpisode, newSeason);
  };

  const handleRatingChange = (newRating: number) => {
    onUpdateRating(newRating);
  };

  const saveNotes = () => {
    onUpdateNotes(tempNotes);
    setShowNotesModal(false);
  };

  const styles = StyleSheet.create({
    card: {
      margin: 8,
      backgroundColor: theme.colors.surface,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    progressSection: {
      marginVertical: 8,
    },
    progressRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: 4,
    },
    progressText: {
      minWidth: 80,
      fontSize: 12,
    },
    progressBar: {
      flex: 1,
      marginHorizontal: 8,
      height: 8,
      borderRadius: 4,
    },
    controls: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: 8,
    },
    episodeControls: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    statusChip: {
      marginVertical: 4,
    },
    ratingSection: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: 8,
    },
    ratingStars: {
      flexDirection: 'row',
      marginLeft: 8,
    },
    modalContent: {
      backgroundColor: theme.colors.surface,
      padding: 20,
      margin: 20,
      borderRadius: 8,
    }
  });

  return (
    <>
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.header}>
            <Text variant="titleMedium" numberOfLines={1} style={{ flex: 1 }}>
              {anime.name}
            </Text>
            <IconButton
              icon={showDetails ? 'chevron-up' : 'chevron-down'}
              size={20}
              onPress={() => setShowDetails(!showDetails)}
            />
          </View>

          <Chip 
            style={[styles.statusChip, { backgroundColor: getStatusColor(anime.status) }]}
            textStyle={{ color: theme.colors.onPrimary }}
            compact
          >
            {getStatusLabel(anime.status)}
          </Chip>

          <View style={styles.progressSection}>
            {/* Progresso Geral */}
            <View style={styles.progressRow}>
              <Text style={styles.progressText}>Progresso:</Text>
              <ProgressBar 
                progress={overallProgress} 
                color={theme.colors.primary}
                style={styles.progressBar}
              />
              <Text style={{ fontSize: 12 }}>
                {Math.round(overallProgress * 100)}%
              </Text>
            </View>

            {/* Progresso de Episódios */}
            <View style={styles.progressRow}>
              <Text style={styles.progressText}>
                Ep: {currentEpisode}/{totalEpisodes || '?'}
              </Text>
              <ProgressBar 
                progress={episodeProgress} 
                color={theme.colors.secondary}
                style={styles.progressBar}
              />
            </View>

            {/* Progresso de Temporadas (se houver múltiplas) */}
            {totalSeasons > 1 && (
              <View style={styles.progressRow}>
                <Text style={styles.progressText}>
                  Temporada: {currentSeason}/{totalSeasons}
                </Text>
              </View>
            )}
          </View>

          {showDetails && (
            <>
              {/* Controles de Episódio */}
              <View style={styles.controls}>
                <View style={styles.episodeControls}>
                  <IconButton
                    icon="minus"
                    size={20}
                    onPress={() => handleEpisodeChange(false)}
                    disabled={currentEpisode <= 0}
                  />
                  <Text variant="bodyMedium" style={{ marginHorizontal: 8 }}>
                    Ep {currentEpisode}
                  </Text>
                  <IconButton
                    icon="plus"
                    size={20}
                    onPress={() => handleEpisodeChange(true)}
                    disabled={totalEpisodes > 0 && currentEpisode >= totalEpisodes}
                  />
                </View>

                {/* Controles de Temporada */}
                {totalSeasons > 1 && (
                  <View style={styles.episodeControls}>
                    <IconButton
                      icon="minus"
                      size={20}
                      onPress={() => handleSeasonChange(false)}
                      disabled={currentSeason <= 1}
                    />
                    <Text variant="bodyMedium" style={{ marginHorizontal: 8 }}>
                      T{currentSeason}
                    </Text>
                    <IconButton
                      icon="plus"
                      size={20}
                      onPress={() => handleSeasonChange(true)}
                      disabled={currentSeason >= totalSeasons}
                    />
                  </View>
                )}
              </View>

              {/* Sistema de Avaliação */}
              <View style={styles.ratingSection}>
                <Text variant="bodyMedium">Avaliação:</Text>
                <View style={styles.ratingStars}>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
                    <IconButton
                      key={star}
                      icon={star <= rating ? 'star' : 'star-outline'}
                      size={16}
                      iconColor={star <= rating ? '#FFD700' : theme.colors.outline}
                      onPress={() => handleRatingChange(star)}
                    />
                  ))}
                </View>
                <Text variant="bodySmall">{rating}/10</Text>
              </View>

              {/* Botões de Status */}
              <View style={{ flexDirection: 'row', gap: 4, marginTop: 8 }}>
                <Button
                  mode={anime.status === 'watching' ? 'contained' : 'outlined'}
                  compact
                  onPress={() => onUpdateStatus('watching')}
                  style={{ flex: 1 }}
                >
                  Assistindo
                </Button>
                <Button
                  mode={anime.status === 'completed' ? 'contained' : 'outlined'}
                  compact
                  onPress={() => onUpdateStatus('completed')}
                  style={{ flex: 1 }}
                >
                  Completo
                </Button>
                <Button
                  mode={anime.status === 'dropped' ? 'contained' : 'outlined'}
                  compact
                  onPress={() => onUpdateStatus('dropped')}
                  style={{ flex: 1 }}
                >
                  Drop
                </Button>
              </View>

              {/* Botão de Notas */}
              <Button
                mode="text"
                icon="note-text"
                onPress={() => setShowNotesModal(true)}
                style={{ marginTop: 8 }}
              >
                {anime.notes ? 'Editar Notas' : 'Adicionar Notas'}
              </Button>
            </>
          )}
        </Card.Content>
      </Card>

      {/* Modal de Notas */}
      <Portal>
        <Modal
          visible={showNotesModal}
          onDismiss={() => setShowNotesModal(false)}
          contentContainerStyle={styles.modalContent}
        >
          <Text variant="titleMedium" style={{ marginBottom: 16 }}>
            Notas - {anime.name}
          </Text>
          
          <TextInput
            mode="outlined"
            multiline
            numberOfLines={4}
            value={tempNotes}
            onChangeText={setTempNotes}
            placeholder="Adicione suas anotações sobre este anime..."
            style={{ marginBottom: 16 }}
          />
          
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Button
              mode="outlined"
              onPress={() => setShowNotesModal(false)}
              style={{ flex: 1 }}
            >
              Cancelar
            </Button>
            <Button
              mode="contained"
              onPress={saveNotes}
              style={{ flex: 1 }}
            >
              Salvar
            </Button>
          </View>
        </Modal>
      </Portal>
    </>
  );
}