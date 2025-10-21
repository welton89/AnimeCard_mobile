// DescriptionInput.tsx
import React, { useState, useEffect } from 'react';
import { TextInput, useTheme } from 'react-native-paper';
import { StyleSheet, Platform } from 'react-native';

interface TextAreaInputProps {
  initialValue: string;
  onValueChange: (value: string) => void;
}

const TextAreaInput: React.FC<TextAreaInputProps> = ({ initialValue, onValueChange }) => {
  const theme = useTheme();
  // Estado local para evitar re-renderizar o pai (Modal/Portal)
  const [localText, setLocalText] = useState(initialValue); 

  // Sincroniza o estado local com o estado do formulário pai na montagem
  useEffect(() => {
    setLocalText(initialValue);
  }, [initialValue]); 

  const handleTextChange = (text: string) => {
    setLocalText(text);
    onValueChange(text); // Chama a função do pai para atualizar o formData
  };

  return (
    <TextInput
        // label="Sobre" // Adicione a label aqui
        value={localText} // Usa o estado local
        onChangeText={handleTextChange}
        multiline
        numberOfLines={10} // Valor menor é melhor para multiline
        style={{ 
            // marginBottom: 15,
            height: 300, // Altura fixa para estabilizar o layout multiline
            // width: '100%',
            borderRadius: 12,
            alignItems:'flex-start',
            backgroundColor: theme.colors.surfaceVariant,
            // writingDirection: 'ltr',
            // textAlign: 'left',
            // textAlignVertical: 'top',
        }}
    />
  );
};

export default TextAreaInput;