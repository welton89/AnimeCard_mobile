
// ThemeContext.tsx
import React, {
  createContext,
  useState,
  useMemo,
  useContext,
  ReactNode,
  useEffect,
} from 'react';
import { Appearance, useColorScheme } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import { LightTheme, DarkTheme, AppTheme } from '@app/themes/themes';
import { waitForSettingsInitialization, useSettingsStore } from '@app/hooks/useSettingsStore';


// 1. Definição do Tipo para o Contexto
interface ThemeContextProps {
  isDark: boolean;
  theme: AppTheme;
  toggleTheme: () => void;
}

const isValidHexColor = (color: unknown): color is string => {
  if (typeof color !== 'string') return false;
  return /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/.test(color);
};

// 2. Criação do Contexto com um valor inicial que corresponde ao tipo
export const ThemeContext = createContext<ThemeContextProps>({
  isDark:  true,
  theme: LightTheme,
  toggleTheme: () => {}, // Função mock
});

// 3. Criação do Provedor do Contexto
interface ThemeProviderProps {
  children: ReactNode;
}


export const ThemeContextProvider: React.FC<ThemeProviderProps> = ({
  children,
}) => {
  const DEFAULT_PRIMARY_COLOR = '#ff9d00ff';
  const colorScheme = useColorScheme(); 
  
  const [isDark, setIsDark] = useState(colorScheme === 'dark');
  const [colorPrimary, setColorPrimary] = useState(DEFAULT_PRIMARY_COLOR)
    const { settings, isLoading, isInitialized, initialize, updateSetting } = useSettingsStore();
  

  // Função para alternar o tema
  const toggleTheme = () => {
    setIsDark(prev => !prev);
  };




  useEffect(() => {
    const loadSettings = async () => {
      try {
        const settings = await waitForSettingsInitialization();
        
        // A. Define se o tema é escuro/claro (do banco)
        const initialIsDark = settings.Thema === 'dark';
        setIsDark(initialIsDark);

        // B. Define a cor primária (do banco)
        const customPrimaryColor = JSON.parse(settings.Colors).primary;
        
        if (isValidHexColor(customPrimaryColor)) {
            setColorPrimary(customPrimaryColor);
        } else {
            console.warn(`Cor primária inválida ('${customPrimaryColor}') carregada das configurações. Usando padrão: ${DEFAULT_PRIMARY_COLOR}`);
            setColorPrimary(DEFAULT_PRIMARY_COLOR);
        }

      } catch (error) {
        // Se houver erro no JSON.parse ou na busca, garante que o app continue com a cor padrão
        console.error("Erro ao carregar ou processar configurações de tema:", error);
        setColorPrimary(DEFAULT_PRIMARY_COLOR);
      }
    };

    loadSettings();
  }, [settings.Colors]);


  const theme = useMemo(() => {
    // 1. Escolhe a base (DarkTheme ou LightTheme)
    const baseTheme = isDark ? DarkTheme : LightTheme;

    // 2. Cria uma CÓPIA do tema base (evita mutação) e aplica a cor primária
    // Usamos o spread operator para copiar e sobrescrever as cores
    const customTheme = {
        ...baseTheme,
        colors: {
            ...baseTheme.colors,
            primary: colorPrimary, // Sobrescreve a cor primária
        },
    };
    
    return customTheme as AppTheme;

  }, [isDark, colorPrimary]); 
  // Valor do contexto
  const contextValue: ThemeContextProps = useMemo(
    () => ({
      isDark,
      theme,
      toggleTheme,
    }),
    [isDark, theme]
  );



  return (
    <ThemeContext.Provider value={contextValue}>
      {/* O PaperProvider envolve o aplicativo e fornece o tema para todos os componentes Paper */}
      <PaperProvider theme={theme}>{children}</PaperProvider>
    </ThemeContext.Provider>
  );
};

// 4. Hook customizado para fácil acesso ao tema
export const useThemeToggle = () => useContext(ThemeContext);