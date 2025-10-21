import { ScrollView, StyleSheet, View, Text, Image, Alert } from 'react-native';
import { ActivityIndicator, Button, Dialog, IconButton, Portal, useTheme } from 'react-native-paper';
import { AppTheme } from '@app/themes/themes';
import { useData } from '@app/services/DataContext';
import { router, useLocalSearchParams } from 'expo-router';
import { Character, Anime, AnimeApiResponse, AnimeData,JikanImages, Aired, Trailer } from '@app/services/types'; 
import { ImageCarousel } from '@components/ImageCarrousel';
import { useState, useEffect } from 'react';
import WebViewYoutubeModal from '@components/videoModal';



export default function AnimeDetail() {
  
  const theme = useTheme() as AppTheme; 
  const { animes, setAnimes, addAnime, delAnime } = useData();
  const [ animeJ, setAnimeJ ] = useState<AnimeData>();
  const [ animeIMG, setAnimeIMG ] = useState<string>();
  const [creatAnime, setcreatAnime] = useState(false);
  const [visible, setVisible] = useState(false);
  const [visibleDel, setVisibleDel] = useState(false);
  const [modalVideo, setModalVideo] = useState(false);
  
  const { id } = useLocalSearchParams<{ id: string }>();
  const anime = animes.find(a => a.id.toString() == id);
  const imageUris =  anime?.images.split("\n").filter((uri) => uri.trim() !== "")
   const startYear = animeJ?.aired?.from ? new Date(animeJ?.aired?.from).getFullYear() : 'N/A';
  const hideDialog = () => setVisible(false);
  const hideVideo = () => setModalVideo(false);
  const hideDialogDel = () => setVisibleDel(false);
  console.log('status do anime',anime?.status)
 

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
      Alert.alert('Erro', 'ID do Anime não encontrado para navegação.');
    }
  };

  const headleSetAnime = async (anime:AnimeData)=> {
    setcreatAnime(true)
    const novoAnime:Anime = {
        id: anime.mal_id.toString(),
        name: anime.title_english || anime.title,
        description: anime.synopsis!,
        images: animeJ?.images.jpg.toString() || '',
    };

    try{
      await addAnime(novoAnime);
      setcreatAnime(false)
      setVisible(false)
      Alert.alert("Tudo Pronto!",`${novoAnime.name} foi adicionado ao seu servidor`)

    }catch(e){
      setcreatAnime(false)
      setVisible(false)
      Alert.alert("ALgo de errado não tá certo! - "+e)
    }
}


const headleDel = async () => {
  const title = anime?.name
  await delAnime(id)
  hideDialogDel();
  // router.back();
    Alert.alert("Tudo Pronto!",`${title} apagado`)

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
        <Text style={[styles.sectionTitle, { color: theme.colors.onSurfaceVariant, marginTop: 20 }]}>
          Sinopse
        </Text>
        <Text style={[styles.descriptionText, { color: theme.colors.onSurfaceVariant }]}>
          {anime?.description || animeJ?.synopsis || 'Nenhuma sinopse detalhada fornecida.'}
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
        
      </View>
        <Portal>
      <Dialog visible={visibleDel} onDismiss={hideDialogDel}>
        <Dialog.Icon icon="alert" />
        <Dialog.Title style={styles.title}>Excluir</Dialog.Title>
        <Dialog.Content>
          <Text >Tá certo diiso?</Text>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={() => console.log('Cancel')}>Cancel</Button>
          <Button onPress={headleDel}>Apagar</Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>

          <Portal>
    <Dialog 
      visible={visible} 
      onDismiss={hideDialog} 
      style={{paddingHorizontal:25,borderRadius: 12,}}
      theme={{ colors: { backdrop: 'rgba(0, 0, 0, 0.8)'}}}
    >

         <Text style={styles.title} numberOfLines={3} ellipsizeMode="tail">
         Adicionar {animeJ?.title_english || animeJ?.title} ao seu catálogo pessoal?
        </Text>
        {
            creatAnime ? 
             <ActivityIndicator style={{margin:15}} animating={true} color={theme.colors.primary} />
             :

            <Dialog.Actions>
          <Button onPress={() => setVisible(!visible)}>Não adicionar</Button>
          <Button onPress={() => headleSetAnime(animeJ!)}>Sim, adicionar</Button>
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
