import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { 
  Modal, 
  Portal, 
  Text, 
  TextInput, 
  Button, 
  useTheme, 
  SegmentedButtons,
  HelperText,
  ActivityIndicator
} from 'react-native-paper';
import { useGunAuth } from '@app/hooks/useGunAuth';

interface AuthModalProps {
  visible: boolean;
  onDismiss: () => void;
}

export function AuthModal({ visible, onDismiss }: AuthModalProps) {
  const theme = useTheme();
  const { createAccount, login, isLoading, error, clearError } = useGunAuth();
  
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = async () => {
    clearError();
    
    if (!username.trim() || !password.trim()) {
      return;
    }

    if (mode === 'register' && password !== confirmPassword) {
      return;
    }

    let success = false;
    
    if (mode === 'register') {
      success = await createAccount(username.trim(), password);
    } else {
      success = await login(username.trim(), password);
    }

    if (success) {
      setUsername('');
      setPassword('');
      setConfirmPassword('');
      onDismiss();
    }
  };

  const handleDismiss = () => {
    setUsername('');
    setPassword('');
    setConfirmPassword('');
    clearError();
    onDismiss();
  };

  const isFormValid = () => {
    if (!username.trim() || !password.trim()) return false;
    if (mode === 'register' && password !== confirmPassword) return false;
    return true;
  };

  const styles = StyleSheet.create({
    container: {
      backgroundColor: theme.colors.surface,
      padding: 24,
      margin: 20,
      borderRadius: 16,
    },
    title: {
      textAlign: 'center',
      marginBottom: 24,
      fontSize: 24,
      fontWeight: 'bold',
    },
    input: {
      marginBottom: 16,
    },
    button: {
      marginTop: 16,
    },
    segmentedButtons: {
      marginBottom: 24,
    },
    errorText: {
      color: theme.colors.error,
      textAlign: 'center',
      marginBottom: 16,
    }
  });

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={handleDismiss}
        contentContainerStyle={styles.container}
      >
        <Text style={styles.title}>
          Conta Gun.js
        </Text>

        <SegmentedButtons
          value={mode}
          onValueChange={(value) => setMode(value as 'login' | 'register')}
          buttons={[
            { value: 'login', label: 'Entrar' },
            { value: 'register', label: 'Criar Conta' },
          ]}
          style={styles.segmentedButtons}
        />

        <TextInput
          label="Nome de usuário"
          value={username}
          onChangeText={setUsername}
          mode="outlined"
          style={styles.input}
          autoCapitalize="none"
          autoCorrect={false}
        />

        <TextInput
          label="Senha"
          value={password}
          onChangeText={setPassword}
          mode="outlined"
          secureTextEntry
          style={styles.input}
        />

        {mode === 'register' && (
          <>
            <TextInput
              label="Confirmar senha"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              mode="outlined"
              secureTextEntry
              style={styles.input}
            />
            <HelperText type="error" visible={password !== confirmPassword && confirmPassword.length > 0}>
              As senhas não coincidem
            </HelperText>
          </>
        )}

        {error && (
          <Text style={styles.errorText}>
            {error}
          </Text>
        )}

        {isLoading && (
          <ActivityIndicator 
            animating={true} 
            color={theme.colors.primary} 
            style={{ marginVertical: 16 }}
          />
        )}

        <Button
          mode="contained"
          onPress={handleSubmit}
          disabled={!isFormValid() || isLoading}
          style={styles.button}
        >
          {isLoading 
            ? (mode === 'register' ? 'Criando...' : 'Entrando...') 
            : (mode === 'register' ? 'Criar Conta' : 'Entrar')
          }
        </Button>

        <Button
          mode="text"
          onPress={handleDismiss}
          disabled={isLoading}
          style={styles.button}
        >
          Cancelar
        </Button>

        <Text style={{ 
          textAlign: 'center', 
          marginTop: 16, 
          fontSize: 12, 
          color: theme.colors.outline 
        }}>
          {mode === 'register' 
            ? 'Sua conta será criptografada e sincronizada de forma segura'
            : 'Entre com sua conta para sincronizar dados'
          }
        </Text>
      </Modal>
    </Portal>
  );
}