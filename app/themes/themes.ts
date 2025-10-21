// themes.ts
import { ImageBackground } from 'react-native';
import {
  MD3LightTheme as DefaultTheme,
  MD3DarkTheme,
  configureFonts,
} from 'react-native-paper';

// Opcional: Crie seus próprios temas personalizados estendendo os temas padrão
// Isso é útil para garantir que você tenha todas as propriedades esperadas do Paper
const fontConfig = {
  // Configuração de fontes se necessário
  // ...
};

export const LightTheme = {
  ...DefaultTheme,
  // O 'dark' deve ser false para o tema claro
  dark: false,
  colors: {
    ...DefaultTheme.colors,
    // Exemplo de customização de cores
     primary: '#ff9d00ff',
    accent: '#03DAC6',
    card:'#ffefe2d7',
    
  },
  fonts: configureFonts({config: fontConfig}),
};

export const DarkTheme = {
  ...MD3DarkTheme,
  // O 'dark' deve ser true para o tema escuro
  dark: true,
  colors: {
    ...MD3DarkTheme.colors,
    // Exemplo de customização de cores escuras
    primary: '#ff9d00ff',
    accent: '#03DAC6',
    card:'#1e1e1eff',
    background:'#2c2c2cff',
  },
  fonts: configureFonts({config: fontConfig}),
};

// Tipagem para usar no Context
export type AppTheme = typeof LightTheme;