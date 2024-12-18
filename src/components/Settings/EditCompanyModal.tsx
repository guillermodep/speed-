import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Select from 'react-select';
import { supabase } from '../../lib/supabaseClient';
import { EditSucursalModal } from './EditSucursalModal';

interface EditCompanyModalProps {
  company: any;
  onClose: () => void;
  onSave: () => void;
  showNotification: (type: 'success' | 'error', message: string) => void;
}

export const EditCompanyModal: React.FC<EditCompanyModalProps> = ({ company, onClose, onSave, showNotification }) => {
  const [formData, setFormData] = useState(company);
  const [sucursales, setSucursales] = useState<any[]>([]);
  const [selectedSucursal, setSelectedSucursal] = useState<any>(null);
  const [isEditSucursalModalOpen, setIsEditSucursalModalOpen] = useState(false);

  useEffect(() => {
    fetchSucursales(company.id);
  }, [company.id]);

  const fetchSucursales = async (empresaId: number) => {
    try {
      const { data, error } = await supabase
        .from('sucursales')
        .select('*')
        .eq('empresa_id', empresaId);
      if (error) throw error;
      setSucursales(data || []);
    } catch (err) {
      console.error('Error fetching sucursales:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from('empresas')
        .update(formData)
        .eq('id', company.id);

      if (error) throw error;
      showNotification('success', 'Empresa actualizada correctamente');
      onSave();
    } catch (err) {
      console.error('Error updating company:', err);
      showNotification('error', 'Error al actualizar la empresa');
    }
  };

  const sucursalOptions = sucursales.map(sucursal => ({
    value: sucursal.id,
    label: sucursal.direccion
  }));

  const getMapUrl = (sucursal: any) => {
    if (!sucursal || !sucursal.direccion) return '';
    const address = encodeURIComponent(sucursal.direccion);
    return `https://www.google.com/maps?q=${address}&hl=es&z=14&output=embed`;
  };

  const handleEditSucursal = (sucursalId: number) => {
    const sucursal = sucursales.find(s => s.id === sucursalId);
    if (sucursal) {
      setSelectedSucursal(sucursal);
      setIsEditSucursalModalOpen(true);
    }
  };

  const handleSaveSucursal = async (updatedSucursal: any) => {
    try {
      const { error } = await supabase
        .from('sucursales')
        .update({
          nombre: updatedSucursal.nombre,
          direccion: updatedSucursal.direccion,
          telefono: updatedSucursal.telefono
        })
        .eq('id', updatedSucursal.id);

      if (error) throw error;

      setIsEditSucursalModalOpen(false);
      showNotification('success', 'Sucursal actualizada correctamente');
      fetchSucursales(company.id); // Refresca la lista de sucursales
    } catch (err) {
      console.error('Error updating sucursal:', err);
      showNotification('error', 'Error al actualizar la sucursal');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
    >
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        exit={{ y: 100 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="bg-white rounded-lg shadow-xl max-w-7xl w-full p-6"
      >
        <h3 className="text-lg font-medium mb-4">Editar Empresa</h3>
        <div className="flex space-x-4">
          <form onSubmit={handleSubmit} className="space-y-4 flex-1">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
              <input
                type="text"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-violet-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
              <input
                type="text"
                value={formData.direccion}
                onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-violet-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
              <input
                type="text"
                value={formData.telefono}
                onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-violet-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-violet-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sitio Web</label>
              <input
                type="url"
                value={formData.sitio_web}
                onChange={(e) => setFormData({ ...formData, sitio_web: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-violet-500"
              />
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700"
              >
                Guardar
              </button>
            </div>
          </form>
          <div className="w-1/2">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Sucursales</h4>
            <Select
              options={sucursalOptions}
              value={selectedSucursal}
              onChange={setSelectedSucursal}
              placeholder="Buscar sucursal..."
              className="w-full"
            />
            {selectedSucursal && (
              <div className="mt-4">
                <h5 className="text-sm font-medium text-gray-700">Detalles de la Sucursal</h5>
                <p>Dirección: {selectedSucursal.label}</p>
                <p>Teléfono: {sucursales.find(s => s.id === selectedSucursal.value)?.telefono}</p>
                <div className="mt-2">
                  <iframe
                    width="100%"
                    height="200"
                    frameBorder="0"
                    src={getMapUrl(sucursales.find(s => s.id === selectedSucursal.value))}
                    allowFullScreen
                  ></iframe>
                </div>
                <button
                  onClick={() => handleEditSucursal(selectedSucursal.value)}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Editar Sucursal
                </button>
              </div>
            )}
          </div>
        </div>
      </motion.div>
      {isEditSucursalModalOpen && selectedSucursal && (
        <EditSucursalModal
          sucursal={selectedSucursal}
          onClose={() => setIsEditSucursalModalOpen(false)}
          onSave={handleSaveSucursal}
        />
      )}
    </motion.div>
  );
}; 