
import { Anime, AnimeData, Character } from '@app/services/types';
import { CharacterData } from '@app/types/CharacterData';

import { Alert, ScrollView, Text } from 'react-native';
import { ActivityIndicator, Button, Card, Dialog, IconButton, Modal, Portal, useTheme,TextInput } from 'react-native-paper';
import { AppTheme } from '@app/themes/themes';
import { useEffect, useMemo, useState } from 'react';
import { useData } from '@app/services/DataContext';



interface CreateUpdateModalProps {
    externalVisible: boolean;
    type: string;
    item: Anime | Character | AnimeData | CharacterData ;
    operation: string;
    onClose: (visible: boolean) => void;

}



export const CreateUpdateModal = ({externalVisible,type, item, operation, onClose}:CreateUpdateModalProps)=>{
    const { characters, setCharacters, addChar, delChar} = useData();

    const theme = useTheme() as AppTheme;
    const [internalVisible, setInternalVisible] = useState(false); // Inicia como false
    const [loading, setloading] = useState(false); // Inicia como false


    const initialData = useMemo(() => {
    if (!item) return {}; 

    switch (type) {
        case 'char':
            const char = item as (Character); 
            return {
                id: char.id,
                name: char.name,
                images:char.images,
                description: char.description,
                animeId: char.animeId 
            };
        case 'anime':
            const anime = item as (Anime ); 
            return {
                id: anime.id,
                name: anime.name,
                images: anime.images,
                description: anime.description,
                status: anime.status 
            };
        case 'charApi':
            const charApi = item as (CharacterData);
            return {
                id: charApi.mal_id,
                name: charApi.name,
                images: charApi.images.jpg.large_image_url || charApi.images.jpg.image_url,
                description: charApi.about,
                animeId: charApi.anime[0],
                status: '' 
            };
        case 'animeApi':
            const animeApi = item as (AnimeData);
            return {
                id: animeApi.mal_id,
                name: animeApi.title_english ||animeApi.title,
                images: animeApi.images,
                description: animeApi.synopsis,
                status: 'list'
            };
        default:
            return {};
    }
}, [item, type]);

// 2. Gerenciando o estado do formulário
const [formData, setFormData] = useState({
    id: initialData.id,
    name: initialData.name,
    images: initialData.images,
    description: initialData.description,
    animeId: initialData.animeId,
    status: initialData.status
});


  const handleChange = (field: keyof Character, value: string ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  useEffect(() => {
    setInternalVisible(externalVisible);
  }, [externalVisible]);

  
  // Função que será chamada ao fechar o modal
  const handleDismiss = () => {
    setInternalVisible(false); // Fecha o estado interno
    onClose(false);            // ⭐️ Notifica o componente pai para atualizar seu estado
  };

    function headleSetAnime() {
        Alert.alert('Criou, Anime',)
        
    }
    
    async function headleSetChar() {
         setloading(true)
         const newChar:Character = {
             id: formData.id!.toString(),
             name: formData.name!,
             description: formData.description!,
             images: formData.images!.toString(),
             animeId: formData.animeId!.toString()
         }
    try{
        await addChar(newChar)
        setloading(false)
        setInternalVisible(false)
        Alert.alert("Tudo Pronto!",`${formData.name} Add`)

    }catch(e){
      setloading(false)
      setInternalVisible(false)
      console.log('Algo de errado não deu certo!!! - ',e)
       Alert.alert('Algo de errado não deu certo!!! - ',`erro: ${e}`)
    }
        Alert.alert('Criou',formData.name!)
        
    }
    
    function headleUpdateChar() {
        Alert.alert('Atualizou',)
        
    }
    
    function headleUpdateAnime( ) {
        Alert.alert('Atualizou')
        
    }

    return (

        
        
        <Portal>
        <Modal 
            visible={internalVisible} 
            onDismiss={handleDismiss} 
            contentContainerStyle={{ backgroundColor:theme.colors.card,
                padding: 20,
                margin: 20,
                borderRadius: 14}}
                theme={{ colors: { backdrop: 'rgba(0, 0, 0, 0.8)'}}}
                >
              <ScrollView>
            <Text style={{
                color:theme.colors.secondary,
                fontSize:24,
                alignSelf:'center',
                
            }}>
                Adicionar ao Catálogo

            </Text>

                {/* <Text style={{ color:theme.colors.secondary, margin:5, }}>
                    Nome:
                    </Text> */}
             <TextInput
             label="Nome"
             value={ formData.name!}
             mode="outlined"
             onChangeText={(text) => handleChange('name', text)}
             style={{ marginBottom: 15,
                flex:1,
                color:theme.colors.secondary,
                borderRadius: 12,
                backgroundColor: theme.colors.surfaceVariant,}}
                />

                 
             <TextInput
             label="Sobre"
             value={formData.description!}
             onChangeText={(text) => handleChange('description', text)}
             multiline
             mode="outlined"
             numberOfLines={28}
             style={{ marginBottom: 15,
                borderRadius: 12,
                color:theme.colors.secondary,
                backgroundColor: theme.colors.surfaceVariant,}}
                />

          </ScrollView>
          {operation == 'create' ?

            <Button onPress={()=>
                                type == 'char' || 'charApi' ?
                                headleSetChar() : 
                                headleSetAnime()
                            } mode="contained" style={{ marginTop: 10 }}>
                              {
                                !loading ?
                                'Adicionar' :
                                 <ActivityIndicator animating={true} color={theme.colors.primary} />
                              }  
            </Button>

                    :
            <Button onPress={()=>
                                type == 'char' ?
                                headleUpdateChar() : 
                                headleUpdateAnime()
                            } mode="contained" style={{ marginTop: 10 }}>
                              {
                                !loading ?
                                'Salvar' :
                                 <ActivityIndicator animating={true} color={theme.colors.primary} />
                              }  
            </Button>

            
            }
        </Modal>

</Portal>
        )
        }