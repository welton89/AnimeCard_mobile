
import { Anime, AnimeData, Character } from '@app/_services/types';
import { CharacterData } from '@app/types/CharacterData';

import { Alert, KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { ActivityIndicator, Button, Card, Dialog, IconButton, Modal, Portal, useTheme,TextInput } from 'react-native-paper';
import { AppTheme } from '@app/themes/themes';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useData } from '@app/_services/DataContext';
import {ImageScroller} from '@components/ImageScroller'
import {Filter} from '@app/components/Filter'



interface CreateUpdateModalProps {
    externalVisible: boolean;
    type: string;
    item: Anime | Character | AnimeData | CharacterData ;
    operation: string;
    animeId:string | null;
    traslate: string | null;
    onClose: (visible: boolean) => void;

}



export default function CreateUpdateModal({ externalVisible, type, item, operation, animeId, traslate, onClose }: CreateUpdateModalProps) {
    const { addChar, addAnime, updateChar, updateAnime } = useData();

    const theme = useTheme() as AppTheme;
    const [internalVisible, setInternalVisible] = useState(false); // Inicia como false
    const [loading, setloading] = useState(false); // Inicia como false
    const [filter, setFilter] = useState('list');



    const initialData = useMemo(() => {
        if (!item) return {};

        switch (type) {
            case 'char':
                const char = item as (Character);
                return {
                    id: char.id,
                    name: char.name,
                    images: char.images || '',
                    description: char.description,
                    animeId: char.animeId
                };
            case 'anime':
                const anime = item as (Anime);
                setFilter(anime.status!)
                return {
                    id: anime.id,
                    name: anime.name,
                    images: anime.images || '',
                    description: traslate || anime.description,
                    status: anime.status
                };
            case 'charApi':
                const charApi = item as (CharacterData);
                return {
                    id: charApi.mal_id,
                    name: charApi.name,
                    images: charApi.images.jpg.large_image_url || charApi.images.jpg.image_url || '',
                    description: charApi.about,
                    animeId: animeId,
                };
            case 'animeApi':
                const animeApi = item as (AnimeData);
                return {
                    id: animeApi.mal_id,
                    name: animeApi.title_english || animeApi.title,
                    images: animeApi.images.jpg || animeApi.images.webp || '',
                    description: animeApi.synopsis,
                    status: 'list'
                };
            default:
                return {};
        }
    }, [item, type]);

    const [formData, setFormData] = useState({
        id: initialData.id,
        name: initialData.name,
        images: initialData.images,
        description: traslate || initialData.description,
        animeId: initialData.animeId,
        status: initialData.status
    });

    const listImages = typeof formData.images === 'string' ? formData.images.split("\n").filter((uri: string) => uri.trim() !== "") : [];
    const [imageLinks, setImageLinks] = useState<string[]>(listImages);
    const [newImageUrl, setNewImageUrl] = useState('');


    const handleRemoveImage = useCallback((urlToRemove: string) => {
        setImageLinks((currentLinks: string[]) => currentLinks.filter((link) => link !== urlToRemove)
        );
    }, []);


    const handleManualAddImage = () => {
        const url = newImageUrl.trim();

        if (url === '') {
            Alert.alert('Atenção', 'Por favor, insira um link de imagem válido.');
            return;
        }

        if (imageLinks.includes(url)) {
            Alert.alert('Aviso', 'Esta imagem já foi adicionada.');
            setNewImageUrl(''); // Limpa o campo mesmo assim
            return;
        }

        setImageLinks((currentLinks: string[]) => {
            const newLinks = [...currentLinks, url];
            setFormData(prev => ({
                ...prev,
                images: newLinks.join('\n')
            }));
            return newLinks;
        });
        setNewImageUrl('');
    };


    const handleChange = (field: keyof Character, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    useEffect(() => {
        setInternalVisible(externalVisible);
    }, [externalVisible]);


    useEffect(() => {
        if (traslate)
       handleChange('description', traslate!)
    }, [traslate]);

    


    // Função que será chamada ao fechar o modal
    const handleDismiss = () => {
        setInternalVisible(false); 
        onClose(false); 
    };

    async function headleSetAnime() {
        setloading(true);
        const newAnime: Anime = {
            id: formData.id!.toString(),
            name: formData.name!,
            description: formData.description!,
            images: imageLinks.join('\n'), //formData.images!.toString(),
            status: filter
        };
        try {
            await addAnime(newAnime);
            setloading(false);
            setInternalVisible(false);
            Alert.alert('Criou, Anime', newAnime.name);

        } catch (e) {
            setloading(false);
            setInternalVisible(false);
            console.log('Algo de errado não deu certo!!! - ', e);
            Alert.alert('Algo de errado não deu certo!!! - ', `erro: ${e}`);
        }

    }

    async function headleSetChar() {
        setloading(true);
        const newChar: Character = {
            id: formData.id!.toString(),
            name: formData.name!,
            description: formData.description!,
            images: imageLinks.join('\n'), 
            animeId: formData.animeId!.toString()
        };
        try {
            await addChar(newChar);
            setloading(false);
            setInternalVisible(false);
            Alert.alert("Tudo Pronto!", `${formData.name} Add`);

        } catch (e) {
            setloading(false);
            setInternalVisible(false);
            console.log('Algo de errado não deu certo!!! - ', e);
            Alert.alert('Algo de errado não deu certo!!! - ', `erro: ${e}`);
        }

    }

    async function headleUpdateChar() {
        setloading(true);
        const newChar: Character = {
            id: formData.id!.toString(),
            name: formData.name!,
            description: formData.description!,
            images: imageLinks.join('\n'), 
            animeId: formData.animeId!.toString()
        };
        try {
            await updateChar(newChar);
            setloading(false);
            setInternalVisible(false);
            Alert.alert("Tudo Pronto!", `${formData.name} Atualizado`);

        } catch (e) {
            setloading(false);
            setInternalVisible(false);
            console.log('Algo de errado não deu certo!!! - ', e);
            Alert.alert('Algo de errado não deu certo!!! - ', `erro: ${e}`);
        }


    }

    async function headleUpdateAnime() {
        setloading(true);
        const newAnime: Anime = {
            id: formData.id!.toString(),
            name: formData.name!,
            description: formData.description!,
            images: imageLinks.join('\n'), // formData.images!.toString(),
            status: filter
        };
        try {
            await updateAnime(newAnime);
            setloading(false);
            setInternalVisible(false);
            Alert.alert("Tudo Pronto!", `${formData.name} Atualizado`);

        } catch (e) {
            setloading(false);
            setInternalVisible(false);
            console.log('Algo de errado não deu certo!!! - ', e);
            Alert.alert('Algo de errado não deu certo!!! - ', `erro: ${e}`);
        }

    }

    return (

        <Portal>
            <Modal
                visible={internalVisible}
                onDismiss={handleDismiss}
                contentContainerStyle={{
                    backgroundColor: theme.colors.card,
                    padding: 20,
                    flex: 1,
                    margin: 20,
                    borderRadius: 14
                }}
                theme={{ colors: { backdrop: 'rgba(0, 0, 0, 0.8)' } }}
            >
                {/* <KeyboardAvoidingView
                    style={{ flex: 1, }}
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0} // Ajuste o offset conforme necessário
                > */}

                    <ScrollView style={{ flex: 1, }}>
                        <Text style={{
                            color: theme.colors.secondary,
                            fontSize: 24,
                            alignSelf: 'center',
                        }}>
                        { operation == 'create' ?  ' Adicionar ao Catálogo' : 'Editar'}

                        </Text>


                        <TextInput
                            label="Nome"
                            defaultValue={formData.name!}
                            mode="outlined"
                            outlineStyle={{
                                borderRadius: 12,
                                backgroundColor: theme.colors.surfaceVariant,
                            }}
                            onChangeText={(text) => handleChange('name', text)}
                            style={{
                                marginBottom: 15,
                                flex: 1,
                                color: theme.colors.secondary,
                                borderRadius: 12,
                                backgroundColor: theme.colors.surfaceVariant,
                            }} />


                        <TextInput
                            label="Sobre"
                            key='sobre'
                            defaultValue={formData.description!}
                            onChangeText={(text) => handleChange('description', text)}
                            multiline
                            mode="outlined"
                            outlineStyle={{
                                borderRadius: 12,
                                // height: 250,
                                backgroundColor: theme.colors.surfaceVariant,
                            }}
                            numberOfLines={28}
                            style={{
                                marginBottom: 15,
                                borderRadius: 12,
                                height: 250,
                                width: '100%',
                                marginEnd: 20,
                                textAlignVertical: 'top',
                                color: theme.colors.secondary,
                                backgroundColor: theme.colors.surfaceVariant,
                            }} />


                            {
                                type == 'anime' || type == 'animeApi' ?
                                <View style={{marginBottom:10}}>
                                     
                            <Filter filter={filter}
                            edit={true}
                            setFilter={setFilter}/>
                            </View>
                            : null
                        }
        

                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20, position: 'relative' }}>
                            <TextInput
                                label="URL Imagem"
                                defaultValue={newImageUrl} 
                                mode="outlined"
                                onChangeText={setNewImageUrl} 
                                placeholder="Cole o link da imagem aqui"
                                outlineStyle={{
                                    borderRadius: 12,
                                    backgroundColor: theme.colors.surfaceVariant,
                                    height: 50,
                                }}
                                style={{
                                    flex: 1, 
                                    height: 40,
                                    width: '100%',
                                }} />
                            <IconButton
                                icon="plus-circle"
                                iconColor={theme.colors.primary}
                                size={30}
                                style={{
                                    position: 'absolute',
                                    right: 0,
                                    top: 2,
                                    backgroundColor: theme.colors.surfaceVariant,
                                    borderTopRightRadius: 12,
                                    borderBottomRightRadius: 12,
                                    borderTopLeftRadius: 0,
                                }}
                                onPress={handleManualAddImage}
                                disabled={newImageUrl.trim() === ''} />
                        </View>
                        <ImageScroller
                            imageUrls={imageLinks}
                            onRemoveImage={handleRemoveImage} />


                    </ScrollView>
                {/* </KeyboardAvoidingView> */}
                {loading ?
                    <ActivityIndicator animating={true} color={theme.colors.primary} style={{ margin: 20 }} />
                    : null}
                {operation == 'create' ?

                    <Button
                        onPress={() => type == 'charApi' ?
                            headleSetChar() :
                            headleSetAnime()}
                        mode="contained" style={{ marginTop: 10 }}>
                        {!loading ? 'Adicionar' : 'Adicionando'}
                    </Button>

                    :
                    <Button
                        disabled={loading}
                        onPress={() => type == 'char' ?
                            headleUpdateChar() :
                            headleUpdateAnime()}
                        mode="contained" style={{ marginTop: 10 }}>
                        {!loading ? 'Salvar' : 'Salvando...'}

                    </Button>}
            </Modal>

        </Portal>
    );
}