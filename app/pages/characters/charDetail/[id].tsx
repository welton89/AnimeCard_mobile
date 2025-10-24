import { ScrollView, StyleSheet, View, Text, Alert } from 'react-native';
import { ActivityIndicator, Button, Dialog, Portal, useTheme } from 'react-native-paper';
import { AppTheme } from '@app/themes/themes';
import { useData } from '@app/services/DataContext';
import { router, useLocalSearchParams } from 'expo-router';
import { Character } from '@app/services/types'; 
import { ImageCarousel } from '@components/ImageCarrousel';
import { useState, useEffect } from 'react';
import { useCharacterData } from '@app/hooks/useCharacterData';
import { CharacterData } from '@app/types/CharacterData';
import {CreateUpdateModal} from '@app/components/createUpdateModal'

export default function CharDetail() {
    const { id } = useLocalSearchParams<{ id: string }>();

  
  const theme = useTheme() as AppTheme; 
  const { characters, delChar} = useData();
  const [visible, setVisible] = useState(false);
  const [visibleDel, setVisibleDel] = useState(false);

  
  const { characterData, loading, error } = useCharacterData(id);
  const char:Character  = characters.find(a => a.id.toString() == id)!;
  const charImg = char?.images.split("\n").filter((uri) => uri.trim() !== "")
  const imageUris = [characterData?.images.jpg.image_url]
  //   const imageUrl = animeJ?.images?.jpg?.large_image_url || animeJ?.images?.jpg?.small_image_url || 'https://placehold.co/80x120/cccccc/333333?text=Sem+Capa';
  const [formData, setFormData] = useState<Character>({
    id:'',
    name: characterData?.name || '',
    description: '',
    images: '',
    animeId:''
  });


  
  const hideDialog = () => setVisible(false);

 


const headleDel = async () => {
  const title = char?.name
  await delChar(id)
  setVisibleDel(false);
  // router.back();
    Alert.alert("Tudo Pronto!",`${title} apagado`)

};



  if (!characterData) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.title, { color: theme.colors.onBackground }]}>
          Carregando...
        </Text>
        <ActivityIndicator 
          animating={true} 
          size="large" 
          color={theme.colors.primary} 
          style={{ marginTop: 20 }} 
        />
      </View>
    );
  }

  // --- Renderização dos detalhes do Anime ---
  return (
    <ScrollView 
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      contentContainerStyle={styles.scrollContent}>

        <ImageCarousel data={ charImg! || imageUris  
        } height={600}/>

      <View style={[styles.contentCard, { backgroundColor: theme.colors.surfaceVariant }]}>
        
        {/* Título */}
        <Text style={[styles.title, { color: theme.colors.onSurfaceVariant }]}>
          {/* {characterData?.name} */}
          {char?.name || characterData.name}
        </Text>

        {
            characterData.name_kanji ?
        <Text style={[styles.descriptionText, { color: theme.colors.onSurfaceVariant }]}>
            Nome Kanji: {characterData.name_kanji}
        </Text>
        : ''

        }
        {
            characterData.nicknames.length != 0  ?
        <Text style={[styles.descriptionText, { color: theme.colors.onSurfaceVariant }]}>
            Apelidos: {characterData.nicknames}
        </Text>
        : ''

        }
        <Text style={[styles.descriptionText, { color: theme.colors.onSurfaceVariant }]}>
            Favoritos: {characterData.favorites}
        </Text>


       
        <Text style={[styles.sectionTitle, { color: theme.colors.onSurfaceVariant, marginTop: 20 }]}>
          Sobre
        </Text>
        <Text style={[styles.descriptionText, { color: theme.colors.onSurfaceVariant }]}>
          { char?.description || characterData?.about || 'Nada Sobre'}
        </Text>

            

            { 
              !char ? 
              (<Button onPress={()=> setVisible(!visible)} mode="contained" style={{ marginTop: 10 }}>
                Adicionar ao catálogo
            </Button>) 
            : 
              (
                <View style={{ flex: 1, flexDirection: 'row', margin: 8 ,gap:10, justifyContent:'space-between'}}>
              <Button 
              onPress={() => setVisible(!visible)}
              mode= 'contained'
              style={{ width: '65%',  margin: 8 }}>
               Editar
                </Button>
              <Button 
              onPress={() => setVisibleDel(!visibleDel)}
              mode= 'contained' textColor='#ffff'
              style={{ width:'30%', margin: 8 , backgroundColor:'red',}}>
               Excluir
                </Button>
                </View>
                ) 
          }
        
      </View>

<CreateUpdateModal 
        externalVisible={visible}
        type={char ? 'char' : 'charApi'}
        item={!char ? characterData :char}
        operation={char ? 'update' : 'create'} 
        onClose={hideDialog } 
 />


   <Portal>
      <Dialog visible={visibleDel} onDismiss={()=>setVisibleDel(!visibleDel)}>
        <Dialog.Icon icon="alert" />
        <Dialog.Title style={styles.title}>Excluir</Dialog.Title>
        <Dialog.Content>
          <Text >Tá certo diiso?</Text>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={() => setVisibleDel(!visibleDel)}>Cancel</Button>
          <Button onPress={headleDel}>Apagar</Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>


    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingBottom: 40,
    alignItems: 'center',
  },
  coverImage: {
    width: '100%',
    aspectRatio: 4 / 5, // Ajuste para uma proporção de capa de anime
    marginBottom: -50, // Permite que o card de conteúdo suba um pouco
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  contentCard: {
    width: '95%',
    borderRadius: 20,
    padding: 20,
    marginTop: -40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 8,
    textAlign: 'center',
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 15,
  },
  ratingText: {
    fontSize: 18,
    fontWeight: '700',
  },
  genresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 20,
  },
  genrePill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 10,
  },
  descriptionText: {
    fontSize: 16,
    textAlign: 'justify',
  },
});
