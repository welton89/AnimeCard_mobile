import { ScrollView, StyleSheet, View, Text } from 'react-native';
import { ActivityIndicator, Button, Dialog, Portal, useTheme } from 'react-native-paper';
import { AppTheme } from '@app/themes/themes';
import { useGunData } from '@app/_services/GunDataContext';
import { useLocalSearchParams } from 'expo-router';
import { Character } from '@app/_services/types'; 
import { ImageCarousel } from '@components/ImageCarrousel';
import { useState } from 'react';
import { useCharacterData } from '@app/hooks/useCharacterData';
import CreateUpdateModal from '@app/components/createUpdateModal'
import { useTranslator } from '@app/hooks/useTranslator';
import { useGunStore } from '@app/hooks/useGunStore';
import Toast from 'react-native-toast-message';


type CharDetailParams = {
  id: string;     
  animeId: string; 
};
export default function CharDetail() {
  const { id, animeId } = useLocalSearchParams<CharDetailParams>();
  
  const theme = useTheme() as AppTheme; 
  const { characters, delChar, updateChar, toggleCharacterFavorite } = useGunData();
  const [visible, setVisible] = useState(false);
  const [visibleDel, setVisibleDel] = useState(false);
  const [apagando, setApagando] = useState(false);
  
  const { characterData} = useCharacterData(id);
  const char:Character  = characters.find(a => a.id.toString() == id)!;
  const charImg = char?.images.split("\n").filter((uri) => uri.trim() !== "")
  const imageUris = [characterData?.images.jpg.large_image_url ||characterData?.images.jpg.image_url ]
  const { translatedText, isLoading, translate, setTranslatedText } = useTranslator();
  const { settings } = useGunStore();

    
    const hideDialog = () => setVisible(false);
    const headleTrans = async ()=> {
      if (char?.description!.trim() != '' || characterData?.about!.trim() != '') {
        translate(char?.description || characterData?.about || '')
      }
      await translate(char?.description || characterData?.about!);
    }
    
    console.log(imageUris)
  const headleOriginal = async ()=> {
  setTranslatedText(null)
  }
 


const headleDel = async () => {
  const title = char?.name
  setApagando(true)
  try{
    await delChar(id)
    setVisibleDel(false);
    setApagando(false)
    Toast.show({
      type: 'info',
      text1: 'Tudo Certo 😁👍',
      text2: `${title} apagado!`,
    });
  }catch(e){
    setApagando(false)
     Toast.show({
          type: 'error',
          text1: 'Ops! Algo de errado não ta certo. 😬',
          text2: `erro: ${e} `,
     });
  }

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

  return (
    <ScrollView 
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      contentContainerStyle={styles.scrollContent}>

         <ImageCarousel data={ charImg || imageUris  
        } height={600}/>

      <View style={[styles.contentCard, { backgroundColor: theme.colors.surfaceVariant }]}>
        
        <Text style={[styles.title, { color: theme.colors.onSurfaceVariant }]}>
          {char?.name || characterData.name}
        </Text>

        {
            characterData.name_kanji &&
        <Text style={[styles.descriptionText, { color: theme.colors.onSurfaceVariant }]}>
            Nome Kanji: {characterData.name_kanji}
        </Text>
      

        }
        {
            characterData.nicknames.length != 0  &&
        <Text style={[styles.descriptionText, { color: theme.colors.onSurfaceVariant }]}>
            Apelidos: {characterData.nicknames.join(", ")}
        </Text>
      

        }
        <Text style={[styles.descriptionText, { color: theme.colors.onSurfaceVariant }]}>
            Favoritos na API: {characterData.favorites}
        </Text>

        {/* Controles do Personagem - só aparece se estiver no catálogo */}
        {char && (
          <View style={{ marginVertical: 20, alignItems: 'center' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
              <Button
                mode={char.favorite ? 'contained' : 'outlined'}
                icon={char.favorite ? 'heart' : 'heart-outline'}
                onPress={() => toggleCharacterFavorite(char.id)}
                style={{ marginRight: 16 }}
              >
                {char.favorite ? 'Favorito' : 'Adicionar aos Favoritos'}
              </Button>
            </View>

            {/* Sistema de Avaliação */}
            <View style={{ alignItems: 'center' }}>
              <Text style={[styles.descriptionText, { color: theme.colors.onSurfaceVariant, marginBottom: 8 }]}>
                Sua Avaliação:
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
                  <Button
                    key={star}
                    mode="text"
                    icon={star <= (char.rating || 0) ? 'star' : 'star-outline'}
                    onPress={() => updateChar({ ...char, rating: star })}
                    style={{ minWidth: 30 }}
                  />
                ))}
              </View>
              <Text style={[styles.descriptionText, { color: theme.colors.primary }]}>
                {char.rating || 0}/10
              </Text>
            </View>
          </View>
        )}


       
         <View  style={{flex:1, flexDirection:'row', marginTop: 20,alignContent:'center', width:'100%', justifyContent:'space-between'}} >
        
                <Text style={[styles.sectionTitle, { color: theme.colors.onSurfaceVariant, marginTop: 0 }]}>
                  Sinopse
                </Text>
        
             {   isLoading ?
                <ActivityIndicator animating={true} color={theme.colors.primary} style={{ margin: 2 }} />
                      :
               ( !char &&
                 <Button  onPress={translatedText ? headleOriginal : headleTrans}
                      mode= 'text'
                      disabled={settings.gemini != '' ? false : true}
                      style={{   marginRight: -8,  }}>
                      { translatedText ? 'Original' : 'Traduzir'}
        
                </Button>)
                }
                </View>
        <Text style={[styles.descriptionText, { color: theme.colors.onSurfaceVariant }]}>
          {  translatedText || char?.description || characterData?.about || 'Nada Sobre'}
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
        animeId={animeId}
        traslate={translatedText}
        onClose={hideDialog } 
 />


   <Portal>
      <Dialog visible={visibleDel} onDismiss={()=>setVisibleDel(!visibleDel)}>
        <Dialog.Icon icon="alert" size={40} />
        <Dialog.Content>
          <Text style={[{ fontSize: 18,
                  fontWeight: '400',
                  color:theme.colors.secondary
                  }]}>
                    Apagar {char?.name} do catálogo?
            </Text>
        </Dialog.Content>

        {
  apagando ?

  <ActivityIndicator animating={true} color={theme.colors.primary} style={{marginBottom:10}}/>
  
                 
  :

        <Dialog.Actions>
          <Button onPress={() => setVisibleDel(!visibleDel)}>Cancel</Button>
          <Button onPress={headleDel}>Apagar</Button>
        </Dialog.Actions>
}
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