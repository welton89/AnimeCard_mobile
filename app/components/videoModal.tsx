import React from 'react';
import {
  Modal,
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Dimensions,
  SafeAreaView,
} from 'react-native';
// Importa o componente WebView
import WebView from 'react-native-webview';

// Define as propriedades que o componente irá receber
interface WebViewYoutubeModalProps {
  // A URL completa do vídeo do YouTube (ex: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ')
  videoUrl: string;
  isVisible: boolean;
  onClose: () => void;
}

const { width } = Dimensions.get('window');
// Altura em proporção 16:9, padrão para vídeos
const playerHeight = width * (9 / 16); 

// 1. Função utilitária para extrair o ID do vídeo da URL
const getYoutubeVideoId = (url: string): string | null => {
  if (!url) return null;

  // Regex para capturar o ID (funciona para 'watch?v=ID' e 'youtu.be/ID')
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);

  return (match && match[2].length === 11) ? match[2] : null;
};

const WebViewYoutubeModal: React.FC<WebViewYoutubeModalProps> = ({
  videoUrl,
  isVisible,
  onClose,
}) => {
  const videoId = getYoutubeVideoId(videoUrl);

  // 2. Cria o código HTML para incorporar o player do YouTube via iframe
  const generateIframeHtml = (id: string, screenWidth: number) => {
    // Usamos o link de embed do YouTube (https://www.youtube.com/embed/VIDEO_ID)
    // Parâmetros: 
    // - autoplay=1: Tenta reproduzir o vídeo automaticamente (pode ser bloqueado em alguns SOs)
    // - modestbranding=1: Remove o logo do YouTube na barra de controle
    // - rel=0: Não mostra vídeos relacionados ao final
    // - fs=1: Permite tela cheia
    const embedUrl = `https://www.youtube.com/embed/${id}?autoplay=1&modestbranding=1&rel=0&fs=1`;

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { margin: 0; padding: 0; background-color: black; }
            .video-container { 
              position: relative; 
              width: 100%; 
              height: ${playerHeight}px; 
            }
            iframe { 
              position: absolute; 
              top: 0; 
              left: 0; 
              width: 100%; 
              height: 100%; 
            }
          </style>
        </head>
        <body>
          <div class="video-container">
            <iframe 
              src="${embedUrl}" 
              frameborder="0" 
              allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" 
              allowfullscreen
            ></iframe>
          </div>
        </body>
      </html>
    `;
  };

  if (!videoId) {
    return null;
  }

  const htmlContent = generateIframeHtml(videoId, width);

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.centeredView}>
        <View style={styles.modalView}>

          {/* Botão de Fechar */}
          <TouchableOpacity 
            style={styles.closeButton} 
            onPress={onClose}
          >
            <Text style={styles.closeButtonText}>X</Text>
          </TouchableOpacity>

          {/* WebView para carregar o iFrame do YouTube */}
          <View style={styles.playerContainer}>
            <WebView
              originWhitelist={['*']} // Permite que a WebView carregue qualquer conteúdo
              source={{ html: htmlContent }}
              style={styles.webView}
              javaScriptEnabled={true}
              domStorageEnabled={true}
              allowsInlineMediaPlayback={true} // Importante para iOS
              allowsFullscreenVideo={true}     // Importante para Android/iOS para fullscreen
              // mediaPlaybackRequiresUserAction={false} // Descomente para tentar autoplay
            />
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    height:'100%',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
  },
  modalView: {
    width: '95%',
    backgroundColor: 'black',
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    paddingTop: 10,
  },
  closeButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    zIndex: 10,
    backgroundColor: '#333',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  },
  playerContainer: {
    width: '100%',
    height: playerHeight,
    // Adiciona margem inferior para não encostar na borda da modal
    marginBottom: 10, 
  },
  webView: {
    flex: 1,
    backgroundColor: 'black',
  }
});

export default WebViewYoutubeModal;