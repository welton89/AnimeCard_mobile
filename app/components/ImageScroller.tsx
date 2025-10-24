import React, { useCallback } from 'react';
import { View, StyleSheet, Alert, Dimensions,} from 'react-native';
import { Provider as PaperProvider, Surface, Text, IconButton,} from 'react-native-paper';
import { FlatList, Image } from 'react-native';


interface ImageScrollerProps {
  imageUrls: string[];
  onRemoveImage: (urlToRemove: string) => void;
}

const ITEM_WIDTH = Dimensions.get('window').width * 0.4;

export const ImageScroller: React.FC<ImageScrollerProps> = ({
  imageUrls,
  onRemoveImage,
}) => {
  const handleRemove = useCallback(
    (url: string) => {
      Alert.alert(
        'Remover Imagem',
        'Tem certeza que deseja remover esta imagem?',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Remover', style: 'destructive', onPress: () => onRemoveImage(url) },
        ],
      );
    },
    [onRemoveImage],
  );

  // Renderiza cada item da lista
  const renderItem = useCallback(
    ({ item }: { item: string }) => (
      <Surface style={styles.imageContainer} elevation={5}>

    <Image
    style={{ width: '100%', height: '100%',}}
    source={{ uri: item, }}
    resizeMode="cover" 
    />

        <IconButton
          icon="close-circle" 
          size={38}
          style={styles.removeButton}
          iconColor='red'
          onPress={() => handleRemove(item)}
        />
      </Surface>
    ),
    [handleRemove],
  );

  return (
    <View style={{ marginBottom: 20, borderRadius: 8,borderWidth: 0,}}>
      {imageUrls.length > 0 ? (
        <FlatList
          data={imageUrls}
          renderItem={renderItem}
          keyExtractor={(item) => item}
          horizontal
          showsHorizontalScrollIndicator={false}
        />
      ) : (
        <Text style={styles.emptyText}>Nenhuma imagem adicionada.</Text>
      )}
    </View>
  );
};


const styles = StyleSheet.create({
  imageContainer: {
    width: ITEM_WIDTH,
    height: 150,
    borderRadius: 8,
    marginRight: 10,
    overflow: 'hidden', // Importante para o borderRadius funcionar na Surface
    position: 'relative', // Para posicionar o botão 'X'
  },

  removeButton: {
    position: 'absolute',
    top: -6,
    right: -6,
    margin: 0,
    zIndex: 10, 
    borderTopEndRadius: 8,
  },

  emptyText: {
    textAlign: 'center',
    fontStyle: 'italic',
    color: '#777',
    paddingVertical: 20,
  },
});