import { ScrollView, StyleSheet, View, Text } from 'react-native';
import { ActivityIndicator, Button, Dialog, Portal, useTheme } from 'react-native-paper';
import { AppTheme } from '@app/themes/themes';
import { useData } from '@app/_services/DataContext';
import { router, useLocalSearchParams } from 'expo-router';
import { Anime, AnimeData,JikanImages, Aired, Trailer } from '@app/_services/types'; 
import { ImageCarousel } from '@components/ImageCarrousel';
import { useState, useEffect } from 'react';
import WebViewYoutubeModal from '@components/videoModal';
import  CreateUpdateModal  from '@components/createUpdateModal';
import { useTranslator } from '@app/hooks/useTranslator';
import { useSettingsStore } from '@app/hooks/useSettingsStore';
import Toast from 'react-native-toast-message';




export default function AnimeDetail() {
  
  const theme = useTheme() as AppTheme; 
  const { animes,delAnime } = useData();
  const [ animeJ, setAnimeJ ] = useState<AnimeData>();
  const [ animeIMG, setAnimeIMG ] = useState<string>();
  const [visible, setVisible] = useState(false);
  const [visibleDel, setVisibleDel] = useState(false);
    const [apagando, setApagando] = useState(false);

  const [modalVideo, setModalVideo] = useState(false);
  const { translatedText, isLoading, translate, setTranslatedText } = useTranslator();
  
  const { id } = useLocalSearchParams<{ id: string }>();
  const anime = animes.find(a => a.id.toString() == id);
  const imageUris =  anime?.images.split("\n").filter((uri) => uri.trim() !== "")
    const { settings, isInitialized, initialize, updateSetting } = useSettingsStore();

  // const [about, setAbout] = useState(anime?.description || animeJ?.synopsis || '');
  const hideDialog = () => setVisible(false);
  const hideVideo = () => setModalVideo(false);
  const hideDialogDel = () => setVisibleDel(false);
 

async function fetchAnimeById(id: string): Promise<AnimeData | null> {
    const url = `https://api.jikan.moe/v4/anime/${id}`;

    try {
        const response = await fetch(url);

        if (response.status === 404) {
             console.error(`Anime com ID ${id} não encontrado.`);
             return null;
        }

        if (!response.ok) {
            console.error(`Erro ao buscar anime: ${response.statusText}`);
            return null;
        }

        const json = await response.json();
        const apiData = json.data;

        // Mapeia os dados da API para o objeto Anime simplificado da aplicação
        const images: JikanImages = { jpg: apiData.images.jpg.large_image_url  ,
                                      webp:apiData.images.webp.image_url
        }
        const aired:Aired = {
          from: apiData.aired.from,
          string:apiData.aired.string,
        }
        const trailer:Trailer = {
          embed_url: apiData.trailer.embed_url,
        }
        const animeData: AnimeData = {
          mal_id: apiData.mal_id,
          title: apiData.title,
          synopsis: apiData.synopsis,
          score: apiData.score,
          genres: apiData.genres,
          images:images,
          url: null,
          trailer: trailer,
          title_english: null,
          type: apiData.type,
          episodes: apiData.episodes,
          aired: aired,
          scored_by: null
        };
        setAnimeJ(animeData)
        setAnimeIMG(apiData.images.jpg.large_image_url )
        
        return animeData;

    } catch (error) {
        console.error("Erro de rede ou processamento:", error);
        return null;
    }
}


useEffect(()=>{
  fetchAnimeById(id)
},[])


  const handleViewcharacters = () => {
    if (id) {
      router.push(`/pages/characters/listChars/${id.replace('.','')}`); 
    } else {
        Toast.show({
          type: 'error',
          text1: 'Ops! 😬',
          text2: `O id ${id} não foi encontrado.`,
        });
    }
  };

  const headleTrans = async ()=> {

    if (anime?.description!.trim() != '' || animeJ?.synopsis!.trim() != '') {
      translate(anime?.description || animeJ?.synopsis || '')
    }
    await translate(anime?.description || animeJ?.synopsis!);
}

  const headleOriginal = async ()=> {
  setTranslatedText(null)
}


const headleDel = async () => {
  const title = anime?.name
  setApagando(true)
  try{
  await delAnime(id)
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




  if (!animeJ && !anime) {
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

        <ImageCarousel data={
          imageUris! ||  [animeIMG] 
        } height={630}/>

      <View style={[styles.contentCard, { backgroundColor: theme.colors.surfaceVariant }]}>
        
        {/* Título */}
        <Text style={[styles.title, { color: theme.colors.onSurfaceVariant }]}>
          {anime?.name || animeJ?.title}
        </Text>

        {/* Avaliação */}
        <View style={styles.ratingContainer}>
          <Text style={[styles.ratingText, { color: theme.colors.primary }]}>
            Avaliação: {animeJ?.score} ⭐
          </Text>
        </View>

        {/* Gêneros */}
        <View style={styles.genresContainer}>
        </View>

        {/* Descrição */}
        <Text style={[styles.descriptionText, { color: theme.colors.onSurfaceVariant }]}>
            Epsódios: {animeJ?.episodes + ' eps.'} 
        </Text>
        <Text style={[styles.descriptionText, { color: theme.colors.onSurfaceVariant }]}>
            Tipo: {animeJ?.type} 
        </Text>
        <Text style={[styles.descriptionText, { color: theme.colors.onSurfaceVariant }]}>
            Generos: {animeJ?.genres.map(g => g.name).join(', ')}
        </Text>
        <Text style={[styles.descriptionText, { color: theme.colors.onSurfaceVariant }]}>
            Ano: {animeJ?.aired?.string } 
        </Text>


          { animeJ?.trailer?.embed_url != null ?

          (<View style={{flex:1,alignItems:'baseline', flexDirection:'row', justifyContent:'flex-start'}}>
            <Text style={ [styles.descriptionText, { color: theme.colors.onSurfaceVariant }]}>
                Trailer: 
            </Text>
              <Button 
                onPress={()=> (setModalVideo(!modalVideo))} 
                mode="text" 
                style={{ marginRight: 8 }}
                >Assistir Trailer
              </Button>
          </View>) : ''
            }

            <Button 
              onPress={handleViewcharacters} 
              mode="text" 
              style={{ marginTop: 12 }}
            >
                Ver Personagens
            </Button>



        <View  style={{flex:1, flexDirection:'row', marginTop: 20,alignContent:'center', width:'100%', justifyContent:'space-between'}} >

        <Text style={[styles.sectionTitle, { color: theme.colors.onSurfaceVariant, marginTop: 0 }]}>
          Sinopse
        </Text>

   

     {   isLoading ?


        <ActivityIndicator animating={true} color={theme.colors.primary} style={{ margin: 2 }} />
              :
      ( anime == undefined ?
         <Button  onPress={translatedText ? headleOriginal : headleTrans}
              mode= 'text'
              disabled={settings.gemini != ''  ? false : true}

              style={{   marginRight: -8,  }}>
              { translatedText ? 'Original' : 'Traduzir'}

        </Button> : null
        )
        }
        </View>
        <Text style={[styles.descriptionText, { color: theme.colors.onSurfaceVariant }]}>
          {translatedText || anime?.description || animeJ?.synopsis || 'Nenhuma sinopse detalhada fornecida.'}
        </Text>

            { 
              !anime ? 

              (<Button 
              onPress={() => setVisible(!visible)}
              mode= 'contained'
              style={{ flex: 1,  margin: 8 }}>
                Adicionar ao Catálogo
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
        

<CreateUpdateModal 
        externalVisible={visible}
        type={anime ? 'anime' : 'animeApi'}
        item={!anime ? animeJ! :anime}
        operation={anime ? 'update' : 'create'} 
        traslate={translatedText}
        animeId={null}
        onClose={hideDialog } 
 />




      </View>
        <Portal>
      <Dialog visible={visibleDel} onDismiss={()=>setVisibleDel(!visibleDel)}>
        <Dialog.Icon icon="alert" size={40} />
        <Dialog.Content>
          <Text style={[{ fontSize: 18,
                  fontWeight: '400',
                  color:theme.colors.secondary
                  }]}>
                    Apagar {anime?.name} do catálogo?
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


    <WebViewYoutubeModal videoUrl={animeJ?.trailer?.embed_url || ''}
    isVisible={modalVideo} 
    onClose={hideVideo }></WebViewYoutubeModal>


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
