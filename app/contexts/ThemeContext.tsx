
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
import { waitForSettingsInitialization } from '@app/hooks/useSettingsStore';


// 1. Definição do Tipo para o Contexto
interface ThemeContextProps {
  isDark: boolean;
  theme: AppTheme;
  toggleTheme: () => void;
}
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
  // Use o useColorScheme do React Native para pegar a preferência do sistema
  const colorScheme = useColorScheme(); 
  
  // Inicializa o estado com base na preferência do sistema ou default para 'light'
  const [isDark, setIsDark] = useState(colorScheme === 'dark');

  // Função para alternar o tema
  const toggleTheme = () => {
    setIsDark(prev => !prev);
  };





useEffect(() => {
    const loadSettings = async () => {
      try {
        const settings = await waitForSettingsInitialization();
        const initialIsDark = settings.Thema === 'dark';
        
        setIsDark(initialIsDark);
        // setTheme(initialIsDark ? DarkTheme : LightTheme);
      } catch (error) {
        console.error("Erro ao carregar configurações de tema:", error);
      } finally {
        // setIsReady(true); // Marca que o carregamento inicial está completo
      }
    };

    loadSettings();
  }, []);






  // Determina qual tema usar com base no estado 'isDark'
  const theme = useMemo(() => (isDark ? DarkTheme : LightTheme), [isDark]);

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