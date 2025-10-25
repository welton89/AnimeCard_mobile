import React from 'react';
import {
  Modal,
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Dimensions,
} from 'react-native';
import WebView from 'react-native-webview';
import { SafeAreaView } from 'react-native-safe-area-context';
interface WebViewYoutubeModalProps {
  videoUrl: string;
  isVisible: boolean;
  onClose: () => void;
}

const { width } = Dimensions.get('window');
// Altura em proporção 16:9, padrão para vídeos
const playerHeight = width * (9 / 16); 




const WebViewYoutubeModal: React.FC<WebViewYoutubeModalProps> = ({
  videoUrl,
  isVisible,
  onClose,
}) => {

  console.log(videoUrl)

  const generateIframeHtml = ( screenWidth: number) => {

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
              src="${videoUrl}" 
              frameborder="0" 
              allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" 
              allowfullscreen
            ></iframe>
          </div>
        </body>
      </html>
    `;
  };


  const htmlContent = generateIframeHtml( width);

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.centeredView}>
        <View style={styles.modalView}>

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
              mediaPlaybackRequiresUserAction={false} // Descomente para tentar autoplay
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