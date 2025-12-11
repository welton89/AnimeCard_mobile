import { useState, useEffect, useCallback } from 'react';
import { StorageService } from '../_services/Storage';

export function useStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Carregar valor inicial
  useEffect(() => {
    const loadStoredValue = async () => {
      try {
        setLoading(true);
        setError(null);
        const item = await StorageService.getItem<T>(key);
        if (item !== null) {
          setStoredValue(item);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar dados');
        console.error('Erro ao carregar do storage:', err);
      } finally {
        setLoading(false);
      }
    };

    loadStoredValue();
  }, [key]);

  // Função para salvar valor
  const setValue = useCallback(async (value: T | ((val: T) => T)) => {
    try {
      setError(null);
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      await StorageService.setItem(key, valueToStore);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar dados');
      console.error('Erro ao salvar no storage:', err);
    }
  }, [key, storedValue]);

  // Função para remover valor
  const removeValue = useCallback(async () => {
    try {
      setError(null);
      await StorageService.removeItem(key);
      setStoredValue(initialValue);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao remover dados');
      console.error('Erro ao remover do storage:', err);
    }
  }, [key, initialValue]);

  return {
    value: storedValue,
    setValue,
    removeValue,
    loading,
    error
  };
}

// Hook para múltiplos valores
export function useMultipleStorage(keys: string[]) {
  const [values, setValues] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadValues = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await StorageService.multiGet(keys);
        setValues(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar dados');
        console.error('Erro ao carregar múltiplos valores:', err);
      } finally {
        setLoading(false);
      }
    };

    if (keys.length > 0) {
      loadValues();
    }
  }, [keys]);

  const setMultipleValues = useCallback(async (keyValuePairs: [string, any][]) => {
    try {
      setError(null);
      await StorageService.multiSet(keyValuePairs);
      
      // Atualizar estado local
      const newValues = { ...values };
      keyValuePairs.forEach(([key, value]) => {
        newValues[key] = value;
      });
      setValues(newValues);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar dados');
      console.error('Erro ao salvar múltiplos valores:', err);
    }
  }, [values]);

  return {
    values,
    setMultipleValues,
    loading,
    error
  };
}