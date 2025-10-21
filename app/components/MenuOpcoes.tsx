
// MenuOpcoes.tsx
import { useState } from 'react';
import { View, Alert, StyleSheet } from 'react-native';
import { Menu, Button, IconButton } from 'react-native-paper';



export function MenuOpcoes() {
  const [visible, setVisible] = useState(false);

  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  const handleEdit = () => {
    closeMenu();
    Alert.alert('Ação', 'Editando...');
  };

  const handleDelete = () => {
    Alert.alert('Confirmação', 'Tem certeza que deseja excluir?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', onPress: () => {
        console.log('excluindo...');
      }},
    ]);
    closeMenu(); 
  };

  return (
    <View style={styles.container}>
      {/* 4. O componente Menu. Ele NÃO precisa de Backdrop. */}
      <Menu
        visible={visible} 
        onDismiss={closeMenu}
        anchor={
          <IconButton style={styles.icon}
            icon="dots-vertical" 
            onPress={openMenu}
          />
        }
      >
        <Menu.Item onPress={handleEdit} title="Editar" />
        <Menu.Item onPress={handleDelete} title="Excluir" />
        {/* Adicione um Separator se necessário: <Menu.Item title="Separador" disabled /> */}
      </Menu>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    // É importante que o container do Menu tenha uma posição que não o restrinja.
    // 'flex-end' é comum para menus de opções.
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
  },
  icon: {
    position:'absolute',
    right:-30,
    top:-10,
    // backgroundColor:'red',
    marginEnd:40,
  },
});