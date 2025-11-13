import React, { useState, useEffect } from 'react';
import { addFalabellaToDatabase, getFalabellaData } from '../../lib/addFalabellaData';
import { getEmpresas } from '../../lib/supabaseClient-sucursales';
import { toast } from 'react-hot-toast';

export const FalabellaDebug: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [empresas, setEmpresas] = useState<any[]>([]);
  const [falabellaData, setFalabellaData] = useState<any>(null);

  const handleAddFalabella = async () => {
    try {
      setLoading(true);
      console.log('🔧 DEBUG: Iniciando inserción de Falabella...');
      const result = await addFalabellaToDatabase();
      console.log('🔧 DEBUG: Resultado:', result);
      toast.success('Falabella agregada');
      await handleLoadEmpresas();
    } catch (error) {
      console.error('🔧 DEBUG: Error:', error);
      toast.error('Error al agregar Falabella');
    } finally {
      setLoading(false);
    }
  };

  const handleLoadEmpresas = async () => {
    try {
      setLoading(true);
      console.log('🔧 DEBUG: Cargando empresas...');
      const data = await getEmpresas();
      console.log('🔧 DEBUG: Empresas cargadas:', data);
      setEmpresas(data);
      toast.success(`${data.length} empresas cargadas`);
    } catch (error) {
      console.error('🔧 DEBUG: Error al cargar empresas:', error);
      toast.error('Error al cargar empresas');
    } finally {
      setLoading(false);
    }
  };

  const handleGetFalabellaData = async () => {
    try {
      setLoading(true);
      console.log('🔧 DEBUG: Obteniendo datos de Falabella...');
      const data = await getFalabellaData();
      console.log('🔧 DEBUG: Datos de Falabella:', data);
      setFalabellaData(data);
      toast.success('Datos de Falabella obtenidos');
    } catch (error) {
      console.error('🔧 DEBUG: Error:', error);
      toast.error('Error al obtener datos de Falabella');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleLoadEmpresas();
  }, []);

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg border border-gray-200 m-4">
      <h2 className="text-2xl font-bold mb-4">🔧 Debug Falabella</h2>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <button
          onClick={handleAddFalabella}
          disabled={loading}
          className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg disabled:opacity-50"
        >
          {loading ? 'Agregando...' : 'Agregar Falabella'}
        </button>
        <button
          onClick={handleLoadEmpresas}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg disabled:opacity-50"
        >
          {loading ? 'Cargando...' : 'Cargar Empresas'}
        </button>
        <button
          onClick={handleGetFalabellaData}
          disabled={loading}
          className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg disabled:opacity-50"
        >
          {loading ? 'Cargando...' : 'Obtener Datos Falabella'}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="font-bold mb-2">Empresas Cargadas ({empresas.length})</h3>
          <div className="max-h-64 overflow-y-auto text-sm">
            {empresas.map((emp: any) => (
              <div key={emp.id} className="p-2 bg-white rounded mb-1 border border-gray-200">
                <p><strong>{emp.nombre}</strong></p>
                <p className="text-xs text-gray-600">ID: {emp.id} | Estado: {emp.estado}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="font-bold mb-2">Datos de Falabella</h3>
          <div className="max-h-64 overflow-y-auto text-sm">
            {falabellaData ? (
              <>
                <div className="p-2 bg-white rounded mb-1 border border-gray-200">
                  <p><strong>Empresa:</strong> {falabellaData.empresa?.nombre}</p>
                  <p className="text-xs text-gray-600">ID: {falabellaData.empresa?.id}</p>
                </div>
                <div className="p-2 bg-white rounded border border-gray-200">
                  <p><strong>Sucursales:</strong> {falabellaData.sucursales?.length || 0}</p>
                  {falabellaData.sucursales?.map((suc: any) => (
                    <p key={suc.id} className="text-xs text-gray-600">{suc.nombre}</p>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-gray-500">No hay datos</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
