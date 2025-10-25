
// const apiKey:string = 'AIzaSyAvBo_HH8WPbPyyZ1oabVH0BXfBTCMi-dY';
import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { useSettingsStore } from '@app/hooks/useSettingsStore';



interface GeminiResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
}




export function useTranslator(targetLanguage: string = 'pt-br') {
  const [translatedText, setTranslatedText] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { settings,  isInitialized, initialize, updateSetting } = useSettingsStore();
  const apiKey:string = settings.gemini;
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`; 

async function callGemini(prompt: string): Promise<string | null> {
  if (apiKey === 'SUA_CHAVE_DE_API_GEMINI') {
    Alert.alert('Erro de Configuração', 'Por favor, substitua "SUA_CHAVE_DE_API_GEMINI" pela sua chave de API real.');
    return null;
  }
  
  const maxRetries = 3;
  let retries = 0;

  const payload = {
    contents: [{
      parts: [{ text: prompt }],
    }],
    generationConfig: { 
      temperature: 0.2, // Baixa temperatura para traduções diretas
      maxOutputTokens: 2048,
    }
  };

  while (retries < maxRetries) {
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorBody = await response.json();
        // Lançamos o erro para ser pego pelo catch e tentar novamente
        throw new Error(`API Gemini Error: ${response.status} - ${errorBody.error?.message || 'Erro desconhecido.'}`);
      }

      const data: GeminiResponse = await response.json();
      
      const translation = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

      // Se a resposta for válida, retornamos e saímos do loop
      return translation || null;

    } catch (error) {
      retries++;
      // O log de erro agora irá mostrar a mensagem de 'Invalid JSON payload received' se a correção falhar.
      console.error(`Tentativa ${retries} falhou:`, (error as Error).message);
      
      // Implementação do backoff exponencial: espera 2^retries segundos
      if (retries < maxRetries) {
        const delay = Math.pow(2, retries) * 1000;
        await new Promise(res => setTimeout(res, delay));
      }
    }
  }
  
  // Se esgotarmos as tentativas
  Alert.alert('Erro de Tradução', 'Não foi possível conectar ou obter a tradução após várias tentativas. Verifique a chave da API e os logs do console.');
  return null;
}

  const translate = useCallback(async (textToTranslate: string): Promise<string | null> => {
    if (!textToTranslate.trim()) {
      setTranslatedText(null);
      return null;
    }

    setIsLoading(true);
    setTranslatedText(null); // Limpa o resultado anterior

    // Cria o prompt baseado na sua estrutura
    const prompt = `traduza o texto a seguir para ${targetLanguage}. seja direto, apenas retorne a tradução do texto: ${textToTranslate}`;

    const translationResult = await callGemini(prompt);

    setIsLoading(false);

    if (translationResult) {
      setTranslatedText(translationResult);
      return translationResult;
    }

    return null;
  }, [targetLanguage]);

  return {
    translatedText,
    isLoading,
    translate,
    setTranslatedText,
  };
}