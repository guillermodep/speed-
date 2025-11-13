import React, { useState } from 'react';
import { addFalabellaToDatabase, addFalabellaChileToDatabase, deleteFalabellaFromDatabase, getFalabellaData } from '../../lib/addFalabellaData';
import { toast } from 'react-hot-toast';
import { Download, Trash2, RefreshCw, CheckCircle, Globe } from 'lucide-react';

export const FalabellaDataLoader: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleAddFalabella = async () => {
    try {
      setLoading(true);
      const result = await addFalabellaToDatabase();
      setResult(result);
      
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al agregar Falabella');
    } finally {
      setLoading(false);
    }
  };

  const handleGetFalabella = async () => {
    try {
      setLoading(true);
      const data = await getFalabellaData();
      setResult({
        success: true,
        message: 'Datos de Falabella obtenidos',
        ...data
      });
      toast.success('Datos cargados exitosamente');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al obtener datos de Falabella');
    } finally {
      setLoading(false);
    }
  };

  const handleAddFalabellaChile = async () => {
    try {
      setLoading(true);
      const result = await addFalabellaChileToDatabase();
      setResult(result);
      
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al agregar sucursales de Chile');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFalabella = async () => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar Falabella y todas sus sucursales?')) {
      return;
    }

    try {
      setLoading(true);
      const result = await deleteFalabellaFromDatabase();
      setResult(result);
      
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al eliminar Falabella');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg border border-gray-200">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Gestor de Datos - Falabella</h2>
        <p className="text-gray-600">Administra la información de Falabella en la base de datos</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <button
          onClick={handleAddFalabella}
          disabled={loading}
          className="flex items-center justify-center gap-2 px-4 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download className="w-5 h-5" />
          {loading ? 'Agregando...' : 'Perú (10)'}
        </button>

        <button
          onClick={handleAddFalabellaChile}
          disabled={loading}
          className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Globe className="w-5 h-5" />
          {loading ? 'Agregando...' : 'Chile (12)'}
        </button>

        <button
          onClick={handleGetFalabella}
          disabled={loading}
          className="flex items-center justify-center gap-2 px-4 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw className="w-5 h-5" />
          {loading ? 'Cargando...' : 'Ver Datos'}
        </button>

        <button
          onClick={handleDeleteFalabella}
          disabled={loading}
          className="flex items-center justify-center gap-2 px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Trash2 className="w-5 h-5" />
          {loading ? 'Eliminando...' : 'Eliminar'}
        </button>
      </div>

      {result && (
        <div className={`p-4 rounded-lg border-2 ${result.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
          <div className="flex items-start gap-3">
            {result.success && <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />}
            <div className="flex-1">
              <h3 className={`font-semibold ${result.success ? 'text-green-900' : 'text-red-900'}`}>
                {result.message}
              </h3>
              
              {result.empresa && (
                <div className="mt-4 space-y-2 text-sm">
                  <div className="bg-white p-3 rounded border border-gray-200">
                    <h4 className="font-semibold text-gray-900 mb-2">Información de la Empresa:</h4>
                    <ul className="space-y-1 text-gray-700">
                      <li><strong>ID:</strong> {result.empresa.id}</li>
                      <li><strong>Nombre:</strong> {result.empresa.nombre}</li>
                      <li><strong>Email:</strong> {result.empresa.email}</li>
                      <li><strong>Teléfono:</strong> {result.empresa.telefono}</li>
                      <li><strong>Estado:</strong> {result.empresa.estado}</li>
                    </ul>
                  </div>
                </div>
              )}

              {result.sucursales && result.sucursales.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Sucursales ({result.sucursales.length}):
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-96 overflow-y-auto">
                    {result.sucursales.map((sucursal: any) => (
                      <div key={sucursal.id} className="bg-white p-2 rounded border border-gray-200 text-xs">
                        <p className="font-semibold text-gray-900">{sucursal.nombre}</p>
                        <p className="text-gray-600">{sucursal.direccion}</p>
                        <p className="text-gray-500">{sucursal.email}</p>
                        <p className="text-gray-500">{sucursal.telefono}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {result.sucursalesCount && (
                <div className="mt-4 p-3 bg-white rounded border border-gray-200">
                  <p className="text-sm text-gray-700">
                    <strong>Total de sucursales creadas:</strong> {result.sucursalesCount}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-semibold text-blue-900 mb-2">ℹ️ Información:</h4>
        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
          <li>Falabella incluye 10 sucursales principales en Perú</li>
          <li>Todas las sucursales tienen coordenadas GPS y mapas</li>
          <li>Los datos se pueden eliminar para testing</li>
          <li>La operación requiere permisos de administrador</li>
        </ul>
      </div>
    </div>
  );
};
