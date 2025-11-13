import { useEffect, useState } from 'react';
import { getEmpresas } from '../lib/supabaseClient-sucursales';
import { addFalabellaToDatabase } from '../lib/addFalabellaData';

/**
 * Hook para inicializar Falabella en la base de datos si no existe
 * Se ejecuta una sola vez al cargar la aplicación
 */
export const useInitializeFalabella = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const initializeFalabella = async () => {
      try {
        console.log('🔍 Iniciando verificación de Falabella...');
        
        // Verificar si Falabella ya existe
        const empresas = await getEmpresas();
        console.log('📊 Empresas obtenidas:', empresas.length, empresas.map(e => e.nombre));
        
        const falabellaExists = empresas.some(emp => emp.nombre === 'Falabella');
        console.log('🔎 ¿Falabella existe?', falabellaExists);

        if (!falabellaExists) {
          console.log('🏢 Falabella no encontrada. Inicializando...');
          const result = await addFalabellaToDatabase();
          console.log('📝 Resultado de inserción:', result);
          
          if (result.success) {
            console.log('✅ Falabella inicializada exitosamente');
          } else {
            console.warn('⚠️  Falabella ya existe o hubo un problema:', result.message);
          }
        } else {
          console.log('✅ Falabella ya existe en la base de datos');
        }

        if (isMounted) {
          setIsInitialized(true);
        }
      } catch (err) {
        console.error('❌ Error al inicializar Falabella:', err);
        console.error('📋 Error details:', {
          message: err instanceof Error ? err.message : 'Error desconocido',
          stack: err instanceof Error ? err.stack : 'No stack trace'
        });
        
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Error desconocido');
          setIsInitialized(true);
        }
      }
    };

    initializeFalabella();

    return () => {
      isMounted = false;
    };
  }, []);

  return { isInitialized, error };
};
