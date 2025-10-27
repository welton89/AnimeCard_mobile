import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ListRenderItem,
  ColorValue, 
} from 'react-native';
import { useSettingsStore } from '@app/hooks/useSettingsStore';


// 1. Definição da Paleta de Cores
const COLOR_PALETTE: ColorValue[] = [
  '#ff9d00ff', // Vermelho-alaranjado
  '#FF5733', // Vermelho-alaranjado
  '#33FF57', // Verde brilhante
  '#3357FF', // Azul vibrante
  '#FF33A1', // Rosa choque
  '#33FFF6', // Ciano
  '#F3FF33', // Amarelo
  '#A133FF', // Roxo
  '#808080', // Cinza
  '#000000', // Preto
  '#FFFFFF', // Branco (para demonstração, pode precisar de borda)
];

// 2. Definição das Props do Componente
interface ColorPickerProps {
  initialColor?: ColorValue;
  onColorChange: (color: ColorValue) => void;
  title?: string;
}

// 3. O Componente ColorPicker
const ColorPicker: React.FC<ColorPickerProps> = ({
  onColorChange,
}) => {
    const { settings } = useSettingsStore();
  const [selectedColor, setSelectedColor] = useState<ColorValue>(JSON.parse(settings.Colors).primary);

  // Função para lidar com a seleção de uma nova cor
  const handleColorSelect = (color: ColorValue) => {
    setSelectedColor(color);
    onColorChange(color); 
  };

  // Função de renderização para cada item (cor) na FlatList
  const renderColorItem: ListRenderItem<ColorValue> = ({ item: color }) => {
    const isSelected = color === selectedColor;

    return (
      <TouchableOpacity
        style={[
          styles.colorItem,
          { backgroundColor: color },
          color === '#FFFFFF' && styles.whiteBorder,
          isSelected && styles.selectedBorder,
        ]}
        onPress={() => handleColorSelect(color)}
        accessibilityLabel={`Cor: ${color.toString()}. ${isSelected ? 'Selecionada.' : ''}`}
      >
        {isSelected && <Text style={styles.checkMark}>✓</Text>}
      </TouchableOpacity>
    );
  };

  return (
    
    <View style={styles.container}>
      

      {/* Lista Horizontal de Cores */}
      <FlatList
        data={COLOR_PALETTE}
        renderItem={renderColorItem}
        keyExtractor={(item) => item.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

// 4. Estilos
const styles = StyleSheet.create({
  container: {
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  previewContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  previewText: {
    marginRight: 10,
    fontSize: 16,
    color: '#555',
  },
  colorPreview: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
    // Sombra para dar destaque
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  hexCode: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  listContent: {
    paddingVertical: 5,
  },
  colorItem: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    marginHorizontal: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent', 
  },
  whiteBorder: {
    borderColor: '#ccc', 
  },
  selectedBorder: {
    borderColor: '#333', 
    borderWidth: 4,
  },
  checkMark: {
    color: '#FFF', 
    fontSize: 20,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.75)', 
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});

export default ColorPicker;