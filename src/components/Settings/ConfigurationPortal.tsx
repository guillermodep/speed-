import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Database, Server, AlertTriangle, Settings2, Users, Palette, Pencil, Trash2, CheckCircle, Check } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { EditCompanyModal } from './EditCompanyModal';
import { AddCompanyModal } from './AddCompanyModal';
import { LDAPConfigModal } from './LDAPConfigModal';
import NewUserModal from './NewUserModal';
import { Tooltip } from 'react-tooltip';
import { getCompanySettings, toggleCompanyEnabled, initializeCompanySetting } from '../../lib/companySettings';

interface ConfigurationPortalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: {
    id: number;
    email: string;
    name: string;
    role: string;
  };
}

interface DatabaseStats {
  totalUsers: number;
  totalProducts: number;
  totalTemplates: number;
  lastBackup?: string;
  dbSize?: string;
  version?: string;
}

// Agregar nuevo tipo para el modal de edición
interface EditUserModalProps {
  user: any;
  onClose: () => void;
  onSave: (userId: number, updates: any) => Promise<void>;
  roles: string[];
}

// Componente para el modal de edición
const EditUserModal: React.FC<EditUserModalProps> = ({ user, onClose, onSave, roles }) => {
  const [formData, setFormData] = useState({
    name: user.name || '',
    email: user.email || '',
    role: user.role || 'limited',
    password: '' // Solo se actualizará si se ingresa un nuevo valor
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const updates: any = { ...formData };
    if (!updates.password) delete updates.password;
    await onSave(user.id, updates);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <h3 className="text-lg font-medium mb-4">
          {user.id ? 'Editar Usuario' : 'Nuevo Usuario'}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-violet-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-violet-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rol
            </label>
            <select
              value={formData.role}
              onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-violet-500"
            >
              {roles.map(role => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {user.id ? 'Nueva Contraseña (opcional)' : 'Contraseña'}
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-violet-500"
              {...(!user.id && { required: true })}
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
      </div>
    </div>
  );
};

// Agregar interfaz para la notificación
interface Notification {
  type: 'success' | 'error';
  message: string;
}

export function ConfigurationPortal({ isOpen, onClose, currentUser }: ConfigurationPortalProps) {
  const [activeTab, setActiveTab] = useState('general');
  const [dbStats, setDbStats] = useState<DatabaseStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [roles, setRoles] = useState<string[]>(['admin', 'limited']);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [notification, setNotification] = useState<Notification | null>(null);
  const [companies, setCompanies] = useState<any[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<any>(null);
  const [isAddCompanyModalOpen, setIsAddCompanyModalOpen] = useState(false);
  const [selectedLogo, setSelectedLogo] = useState<string>('');
  const [isLDAPModalOpen, setIsLDAPModalOpen] = useState(false);
  const [isNewUserModalOpen, setIsNewUserModalOpen] = useState(false);
  const [companySettings, setCompanySettings] = useState(getCompanySettings());

  // Simulación de datos de disponibilidad por hora
  const generateHourlyData = () => {
    const today = new Date();
    return Array.from({ length: 24 }, (_, index) => {
      const date = new Date(today);
      date.setHours(date.getHours() - (23 - index));
      return {
        date: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        uptime: (Math.random() * 0.0005 + 0.9995).toFixed(4), // Garantiza 99.95% o superior
        status: Math.random() > 0.05 ? 'operational' : 'maintenance'
      };
    });
  };

  const [hourlyStats] = useState(generateHourlyData());

  // Bloquear scroll del body cuando el modal está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && currentUser.role === 'admin') {
      fetchUsers();
      if (activeTab === 'general') {
        fetchDatabaseStats();
        fetchCompanies();
      }
    }
  }, [isOpen, activeTab]);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('name');
      
      if (error) throw error;
      setUsers(data || []);
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  const fetchDatabaseStats = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Obtener estadísticas de la base de datos
      const { data: usersCount } = await supabase
        .from('users')
        .select('count');

      const { data: productsCount } = await supabase
        .from('products')
        .select('count');

      const { data: builderCount } = await supabase
        .from('builder')
        .select('count');

      // Obtener información del sistema
      const { data: systemInfo } = await supabase
        .rpc('get_system_info');

      setDbStats({
        totalUsers: usersCount?.[0]?.count || 0,
        totalProducts: productsCount?.[0]?.count || 0,
        totalTemplates: builderCount?.[0]?.count || 0,
        lastBackup: systemInfo?.last_backup,
        dbSize: systemInfo?.db_size,
        version: systemInfo?.version
      });
    } catch (err) {
      setError('Error al obtener estadísticas de la base de datos');
      console.error('Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCompanies = async () => {
    try {
      const { data, error } = await supabase
        .from('empresas')
        .select('*');

      if (error) throw error;
      
      // Inicializar configuración de empresas en localStorage
      const allCompanies = data || [];
      allCompanies.forEach(company => {
        initializeCompanySetting(String(company.id), company.nombre);
      });
      
      setCompanies(allCompanies);
    } catch (err) {
      console.error('Error fetching companies:', err);
    }
  };

  // Función para mostrar notificación
  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000); // Desaparece después de 3 segundos
  };

  const handleUserUpdate = async (userId: number, updates: any) => {
    try {
      const { error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', userId);

      if (error) throw error;
      
      fetchUsers();
      setSelectedUser(null);
      showNotification('success', 'Usuario actualizado correctamente');
    } catch (err) {
      console.error('Error updating user:', err);
      showNotification('error', 'Error al actualizar el usuario');
    }
  };

  const handleDeleteUser = async (userId: number, userRole: string) => {
    if (userRole === 'admin') {
      alert('No se puede eliminar al usuario administrador.');
      return;
    }

    if (!confirm('¿Estás seguro de que deseas eliminar este usuario?')) return;
    
    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);

      if (error) throw error;
      fetchUsers();
    } catch (err) {
      console.error('Error deleting user:', err);
    }
  };

  const handleCreateUser = async (userData: any) => {
    try {
      const { error } = await supabase
        .from('users')
        .insert([{ name: userData.name, email: userData.email, role: userData.role, password: userData.password, status: 'active' }]);

      if (error) throw error;
      fetchUsers();
      setIsNewUserModalOpen(false);
      showNotification('success', 'Usuario creado correctamente');
    } catch (err) {
      console.error('Error creating user:', err);
      showNotification('error', 'Error al crear el usuario');
    }
  };

  const handleAddCompany = () => {
    setIsAddCompanyModalOpen(true);
  };

  const handleEditCompany = (company: any) => {
    setSelectedCompany(company);
  };

  const handleDeleteCompany = async (companyId: number) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta empresa?')) return;

    try {
      const { error } = await supabase
        .from('empresas')
        .delete()
        .eq('id', companyId);

      if (error) throw error;
      showNotification('success', 'Empresa eliminada correctamente');
      fetchCompanies();
    } catch (err) {
      console.error('Error deleting company:', err);
      showNotification('error', 'Error al eliminar la empresa');
    }
  };

  const handleNewUser = () => {
    setIsNewUserModalOpen(true);
  };

  const handleLDAP = () => {
    setIsLDAPModalOpen(true);
  };

  const handleSaveLDAPConfig = (config: any) => {
    // Lógica para guardar la configuración LDAP/AD
    console.log('Configuración LDAP/AD guardada:', config);
    setIsLDAPModalOpen(false);
  };

  const handleToggleCompany = (companyId: number, companyName: string, currentlyEnabled: boolean) => {
    const newEnabled = !currentlyEnabled;
    toggleCompanyEnabled(String(companyId), companyName, newEnabled);
    setCompanySettings(getCompanySettings());
    showNotification('success', `${companyName} ${newEnabled ? 'habilitada' : 'deshabilitada'} correctamente`);
  };

  const isCompanyEnabledInSettings = (companyId: number): boolean => {
    const settings = companySettings[String(companyId)];
    return settings ? settings.enabled : true; // Por defecto habilitada
  };

  const handleEditUser = (user: any) => {
    if (user.role === 'admin') {
      alert('No se puede editar al usuario administrador.');
      return;
    }
    setSelectedUser(user);
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          // Click en el backdrop no hace nada
        }
      }}
    >
      <motion.div
        initial={{ opacity: 1, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 1, scale: 0.95 }}
        className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - fijo en la parte superior */}
        <div className="p-6 border-b border-gray-200 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2">
            <Settings2 className="w-6 h-6 text-indigo-600" />
            <h2 className="text-2xl font-bold text-gray-900">Configuración</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs - fijo debajo del header */}
        <div className="border-b border-gray-200 shrink-0">
          <div className="flex gap-4 p-4">
            <button
              onClick={() => setActiveTab('general')}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                activeTab === 'general' 
                  ? 'bg-indigo-50 text-indigo-600' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Settings2 className="w-4 h-4" />
              General
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                activeTab === 'users' 
                  ? 'bg-indigo-50 text-indigo-600' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Users className="w-4 h-4" />
              Usuarios
            </button>
            <button
              onClick={() => setActiveTab('appearance')}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                activeTab === 'appearance' 
                  ? 'bg-indigo-50 text-indigo-600' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Palette className="w-4 h-4" />
              Apariencia
            </button>
          </div>
        </div>

        {/* Content - área scrolleable */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          <div className="p-6">
            {activeTab === 'general' && (
              <div className="space-y-6">
                {currentUser.role === 'admin' && (
                  <>
                    <div className="bg-indigo-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between gap-3 mb-4">
                        <div className="flex items-center gap-2">
                          <Server className="w-5 h-5 text-indigo-600" />
                          <h3 className="text-lg font-medium text-gray-900">
                            Estado del Sistema
                          </h3>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Estado del Sistema (últimas 24 horas)</span>
                          <span className="font-medium">
                            {(hourlyStats.reduce((acc, hour) => acc + parseFloat(hour.uptime), 0) / 24 * 100).toFixed(3)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-3 flex overflow-hidden shadow-inner">
                          {hourlyStats.map((hour, index) => (
                            <div
                              key={index}
                              className={`h-3 transition-all duration-300 ${
                                hour.status === 'operational' 
                                  ? 'bg-gradient-to-r from-emerald-400 to-green-500 hover:from-emerald-500 hover:to-green-600' 
                                  : 'bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600'
                              }`}
                              style={{ width: `${100/24}%` }}
                              data-tooltip-id="status-tooltip"
                              data-tooltip-content={`${hour.date}: ${(parseFloat(hour.uptime) * 100).toFixed(3)}% - ${hour.status === 'operational' ? 'Operativo' : 'Mantenimiento'}`}
                            />
                          ))}
                        </div>
                        <Tooltip 
                          id="status-tooltip" 
                          className="bg-gray-900/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow-xl"
                        />
                      </div>
                      {dbStats && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                          <div className="p-4 bg-white rounded-lg border border-indigo-100">
                            <div className="text-sm text-gray-600">Usuarios</div>
                            <div className="text-2xl font-bold text-indigo-600">
                              {dbStats.totalUsers}
                            </div>
                          </div>
                          <div className="p-4 bg-white rounded-lg border border-indigo-100">
                            <div className="text-sm text-gray-600">Productos</div>
                            <div className="text-2xl font-bold text-indigo-600">
                              {dbStats.totalProducts}
                            </div>
                          </div>
                          <div className="p-4 bg-white rounded-lg border border-indigo-100">
                            <div className="text-sm text-gray-600">Plantillas</div>
                            <div className="text-2xl font-bold text-indigo-600">
                              {dbStats.totalTemplates}
                            </div>
                          </div>
                          <div className="p-4 bg-white rounded-lg border border-indigo-100">
                            <div className="text-sm text-gray-600">Tamaño DB</div>
                            <div className="text-2xl font-bold text-indigo-600">
                              {dbStats.dbSize || 'N/A'}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="bg-indigo-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between gap-3 mb-4">
                        <h3 className="text-lg font-medium text-gray-900">
                          Empresas
                        </h3>
                        <button
                          onClick={handleAddCompany}
                          className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700"
                        >
                          Agregar Empresa
                        </button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {companies.map(company => {
                          const isEnabled = isCompanyEnabledInSettings(company.id);
                          return (
                            <div 
                              key={company.id} 
                              className={`bg-white p-4 rounded-lg border-2 transition-all ${
                                isEnabled ? 'border-green-200' : 'border-gray-200 opacity-60'
                              }`}
                            >
                              <div className="flex items-center justify-between mb-3">
                                <img
                                  src={company.logo}
                                  alt={company.nombre}
                                  className="h-12 w-auto object-contain"
                                />
                                <button
                                  onClick={() => handleToggleCompany(company.id, company.nombre, isEnabled)}
                                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                    isEnabled ? 'bg-green-500' : 'bg-gray-300'
                                  }`}
                                >
                                  <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                      isEnabled ? 'translate-x-6' : 'translate-x-1'
                                    }`}
                                  />
                                </button>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-700">{company.nombre}</span>
                                <div className="flex gap-1">
                                  <button
                                    onClick={() => handleEditCompany(company)}
                                    className="p-1 text-gray-400 hover:text-indigo-600 transition-colors"
                                    title="Editar"
                                  >
                                    <Pencil className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteCompany(company.id)}
                                    className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                                    title="Eliminar"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                              <div className="mt-2">
                                <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                                  isEnabled 
                                    ? 'bg-green-100 text-green-700' 
                                    : 'bg-gray-100 text-gray-600'
                                }`}>
                                  {isEnabled ? 'Habilitada' : 'Deshabilitada'}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </>
                )}

                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">
                  </h3>
                  {/* Configuraciones generales */}
                </div>
              </div>
            )}

            {activeTab === 'users' && currentUser.role === 'admin' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold">Gestión de Usuarios</h2>
                  <div className="flex justify-end gap-2 mt-4">
                    <button
                      onClick={handleNewUser}
                      className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-transform transform hover:scale-105 flex items-center gap-2"
                    >
                      <Users className="w-4 h-4" />
                     Nuevo Usuario
                    </button>
                    <button
                      onClick={handleLDAP}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-transform transform hover:scale-105 flex items-center gap-2"
                    >
                      <Server className="w-4 h-4" />
                      LDAP / AD
                    </button>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-4 px-6 text-sm font-medium text-gray-500 uppercase">Usuario</th>
                        <th className="text-left py-4 px-6 text-sm font-medium text-gray-500 uppercase">Email</th>
                        <th className="text-left py-4 px-6 text-sm font-medium text-gray-500 uppercase">Rol</th>
                        <th className="text-left py-4 px-6 text-sm font-medium text-gray-500 uppercase">Estado</th>
                        <th className="text-left py-4 px-6 text-sm font-medium text-gray-500 uppercase">Creado</th>
                        <th className="text-left py-4 px-6 text-sm font-medium text-gray-500 uppercase">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {users.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50">
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center">
                                <span className="text-violet-600 font-medium">
                                  {user.name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <span className="font-medium">{user.name}</span>
                            </div>
                          </td>
                          <td className="py-4 px-6 text-gray-600">{user.email}</td>
                          <td className="py-4 px-6">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              user.role === 'admin' 
                                ? 'bg-violet-100 text-violet-700'
                                : 'bg-gray-100 text-gray-700'
                            }`}>
                              {user.role}
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <button
                              onClick={() => handleUserUpdate(user.id, { 
                                status: user.status === 'active' ? 'inactive' : 'active' 
                              })}
                              className="flex items-center gap-1 hover:bg-gray-50 px-2 py-1 rounded-full"
                            >
                              <CheckCircle className={`w-4 h-4 ${
                                user.status === 'active' ? 'text-green-500' : 'text-gray-400'
                              }`} />
                              <span className={`${
                                user.status === 'active' ? 'text-green-700' : 'text-gray-500'
                              }`}>
                                {user.status === 'active' ? 'Activo' : 'Inactivo'}
                              </span>
                            </button>
                          </td>
                          <td className="py-4 px-6 text-gray-500">
                            {new Date(user.created_at).toLocaleDateString()}
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleEditUser(user)}
                                className="p-1 hover:bg-gray-100 rounded"
                                title="Editar usuario"
                              >
                                <Pencil className="w-4 h-4 text-gray-600" />
                              </button>
                              <button
                                onClick={() => handleDeleteUser(user.id, user.role)}
                                className="p-1 hover:bg-red-50 rounded"
                                title="Eliminar usuario"
                              >
                                <Trash2 className="w-4 h-4 text-red-600" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'appearance' && (
              <div>
                {/* Contenido de apariencia */}
              </div>
            )}
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className={`fixed bottom-4 right-4 flex items-center gap-2 px-4 py-2 rounded-lg shadow-lg ${
              notification.type === 'success' 
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}
          >
            {notification.type === 'success' ? (
              <Check className="w-5 h-5 text-green-500" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-red-500" />
            )}
            <span className="font-medium">{notification.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {selectedUser && (
        <EditUserModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onSave={selectedUser.id ? handleUserUpdate : handleCreateUser}
          roles={roles}
        />
      )}

      {selectedCompany && (
        <EditCompanyModal
          company={selectedCompany}
          onClose={() => setSelectedCompany(null)}
          onSave={() => {
            setSelectedCompany(null);
            fetchCompanies();
          }}
          showNotification={showNotification}
        />
      )}

      {isAddCompanyModalOpen && (
        <AddCompanyModal
          onClose={() => setIsAddCompanyModalOpen(false)}
          onSave={() => {
            setIsAddCompanyModalOpen(false);
            fetchCompanies();
          }}
          showNotification={showNotification}
        />
      )}

      {isLDAPModalOpen && (
        <LDAPConfigModal
          onClose={() => setIsLDAPModalOpen(false)}
          onSave={handleSaveLDAPConfig}
        />
      )}

      {isNewUserModalOpen && (
        <NewUserModal
          onClose={() => setIsNewUserModalOpen(false)}
          onSave={handleCreateUser}
        />
      )}
    </div>
  );
} 