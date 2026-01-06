import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Loader2, Package, Send, Printer, PrinterIcon } from 'lucide-react';
import { LocationSelect } from './LocationSelect';
import { getSucursalesPorEmpresa, Sucursal } from '../../lib/supabaseClient-sucursalesCartelFisico';

interface SendingModalProps {
  isOpen: boolean;
  onClose: () => void;
  productsCount: number;
  company: string;
  empresaId: number;
}

type SendingStep = 'selection' | 'sending' | 'complete';

const PRINTERS = [
  {
    id: 'hp-laser',
    name: 'HP Color LaserJet',
    type: 'laser',
    formats: ['A4', 'Carta'],
    status: 'Disponible',
    icon: <PrinterIcon className="w-6 h-6 text-blue-600" />
  },
  {
    id: 'brother-a3',
    name: 'Brother HL-L8360CDW',
    type: 'a3',
    formats: ['A3'],
    status: 'Disponible',
    icon: <Printer className="w-6 h-6 text-purple-600" />
  },
  {
    id: 'hp-plotter',
    name: 'HP DesignJet',
    type: 'plotter',
    formats: ['Plotter'],
    status: 'Mantenimiento',
    icon: <svg className="w-6 h-6 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 6h18M3 12h18M3 18h18M19 3v18M5 3v18"/>
    </svg>
  },
  {
    id: 'brother-thermal',
    name: 'Brother QL-820NWB',
    type: 'termica',
    formats: ['Etiquetas'],
    status: 'Sin papel',
    icon: <svg className="w-6 h-6 text-red-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 6h16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z"/>
      <path d="M8 14h8"/>
    </svg>
  }
];

export const SendingModal: React.FC<SendingModalProps> = ({
  isOpen,
  onClose,
  productsCount,
  company,
  empresaId
}) => {
  console.log('SendingModal props:', { isOpen, company, empresaId });
  
  const [sentLocations, setSentLocations] = useState<Set<string>>(new Set());
  const [currentLocation, setCurrentLocation] = useState<number>(0);
  const [step, setStep] = useState<SendingStep>('selection');
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [selectedPrinter, setSelectedPrinter] = useState<string>('');
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);
  const [loading, setLoading] = useState(true);

  const locationOptions = sucursales.map(s => ({
    id: s.id.toString(),
    name: s.nombre,
    direccion: s.direccion,
    email: s.email
  }));

  console.log('Sucursales disponibles:', sucursales.length);
  console.log('Location options:', locationOptions);

  useEffect(() => {
    if (isOpen) {
      console.log('Modal abierto, empresaId:', empresaId);
      // Resetear estados
      setSentLocations(new Set());
      setCurrentLocation(0);
      setStep('selection');
      setSelectedLocations([]);
      setSelectedPrinter('');
      
      // Cargar sucursales
      const loadSucursales = async () => {
        try {
          console.log('Iniciando carga de sucursales...');
          setLoading(true);
          const data = await getSucursalesPorEmpresa(empresaId);
          console.log('Sucursales cargadas:', data);
          setSucursales(data);
        } catch (error) {
          console.error('Error al cargar sucursales:', error);
        } finally {
          setLoading(false);
        }
      };

      loadSucursales();
    }
  }, [isOpen, empresaId]);

  useEffect(() => {
    if (step === 'sending') {
        // Iniciar el envío inmediatamente
        const interval = setInterval(() => {
          setCurrentLocation(prev => {
            if (prev < selectedLocations.length) {
              setSentLocations(current => new Set([...current, selectedLocations[prev]]));
              return prev + 1;
            }
            clearInterval(interval);
            setStep('complete');
            return prev;
          });
        }, 500);

        return () => clearInterval(interval);
    }
  }, [step, selectedLocations]);

  const handleStartSending = () => {
    if (selectedLocations.length === 0) {
      alert('Por favor seleccione al menos una sucursal');
      return;
    }
    if (!selectedPrinter) {
      alert('Por favor seleccione una impresora');
      return;
    }
    setStep('sending');
  };

  const handleCancel = () => {
    setStep('selection');
    setSentLocations(new Set());
    setCurrentLocation(0);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (step === 'complete' && e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={handleBackdropClick}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-xl shadow-xl max-w-5xl w-full mx-4 overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">
                  {step === 'selection' && 'Seleccionar sucursales'}
                  {(step === 'sending' || step === 'complete') && 'Enviando a sucursales'}
                </h3>
                {(step === 'selection' || step === 'complete') && (
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-500 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>

            {/* Content */}
            {step === 'selection' && (
              <div className="grid grid-cols-5 gap-6">
                {/* Columna izquierda: Selección */}
                <div className="col-span-3 border-r border-gray-200">
                  <div className="p-6 space-y-6">
                    {/* Sección de Sucursales */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <label className="block text-lg font-medium text-gray-900">
                          Seleccionar Sucursales
                        </label>
                        {selectedLocations.length > 0 && (
                          <span className="text-sm text-gray-500">
                            {selectedLocations.length} {selectedLocations.length === 1 ? 'sucursal seleccionada' : 'sucursales seleccionadas'}
                          </span>
                        )}
                      </div>
                      
                      {loading ? (
                        <div className="flex items-center justify-center p-8 bg-gray-50 rounded-lg border border-gray-200">
                          <div className="flex flex-col items-center gap-3">
                            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                            <p className="text-sm text-gray-600">Cargando sucursales...</p>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-white rounded-lg border border-gray-200">
                          <LocationSelect
                            value={selectedLocations}
                            onChange={setSelectedLocations}
                            locations={locationOptions}
                            disabled={false}
                            isMulti={true}
                            className="bg-white border-gray-300"
                          />
                        </div>
                      )}
                    </div>

                    {/* Sección de Impresoras */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <label className="block text-lg font-medium text-gray-900">
                          Seleccionar Impresora
                        </label>
                        {selectedPrinter && (
                          <span className="text-sm text-gray-500">
                            {PRINTERS.find(p => p.id === selectedPrinter)?.name}
                          </span>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        {PRINTERS.map((printer) => {
                          const isAvailable = printer.status === 'Disponible';
                          return (
                            <button
                              key={printer.id}
                              onClick={() => isAvailable && setSelectedPrinter(printer.id)}
                              disabled={!isAvailable}
                              className={`flex items-start p-4 border rounded-lg transition-colors ${
                                selectedPrinter === printer.id
                                  ? 'border-indigo-600 bg-indigo-50 ring-1 ring-indigo-600'
                                  : isAvailable
                                    ? 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                    : 'border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed'
                              }`}
                            >
                              <div className="mr-4 mt-1">
                                {printer.icon}
                              </div>
                              <div className="text-left flex-1">
                                <div className="font-medium text-gray-900">{printer.name}</div>
                                <div className="text-sm text-gray-500 mt-1">
                                  Formatos: {printer.formats.join(', ')}
                                </div>
                                <div className={`text-sm mt-2 ${
                                  isAvailable ? 'text-green-600' : 'text-red-600'
                                }`}>
                                  {printer.status}
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Columna derecha: Resumen */}
                <div className="col-span-2">
                  <div className="p-6 space-y-6">
                    <div>
                      <h4 className="text-lg font-medium text-gray-900 mb-4">Resumen de envío</h4>
                      {selectedLocations.length > 0 ? (
                        <div className="space-y-4">
                          <div className="bg-indigo-50 rounded-lg p-4">
                            <div className="flex items-center gap-3 text-indigo-600 mb-2">
                              <Package className="w-5 h-5" />
                              <span className="font-medium">Detalles del envío</span>
                            </div>
                            <p className="text-sm text-gray-600">
                              {productsCount} {productsCount === 1 ? 'cartel' : 'carteles'} para {selectedLocations.length} {selectedLocations.length === 1 ? 'sucursal' : 'sucursales'}
                            </p>
                          </div>

                          <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-200 max-h-[calc(100vh-400px)] overflow-y-auto">
                            {selectedLocations.map(locId => {
                              const sucursal = sucursales.find(s => s.id.toString() === locId);
                              return sucursal ? (
                                <div key={locId} className="p-4 space-y-2">
                                  <div className="flex items-start gap-3">
                                    <span className="w-2 h-2 mt-2 rounded-full bg-indigo-500 shrink-0" />
                                    <div className="space-y-1 flex-1">
                                      <p className="font-medium text-gray-900">{sucursal.nombre}</p>
                                      <p className="text-sm text-gray-500">{sucursal.direccion}</p>
                                      <div className="flex items-center gap-2 text-gray-600">
                                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                          <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                        <span className="text-sm">{sucursal.email}</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ) : null;
                            })}
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                          <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-500">
                            Selecciona las sucursales para ver el resumen
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
            {(step === 'sending' || step === 'complete') && (
              <div className="p-6">
                <div className="max-w-4xl mx-auto space-y-8">
                  <div className="text-center mb-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {step === 'complete' ? 'Envío completado' : 'Enviando carteles...'}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {step === 'complete' 
                        ? `Se han enviado ${productsCount} carteles a ${selectedLocations.length} sucursales`
                        : `Enviando ${productsCount} carteles a ${selectedLocations.length} sucursales`}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-8">
                    {/* Columna de Impresión */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-gray-900">
                        <PrinterIcon className="w-5 h-5" />
                        <h4 className="font-medium">Estado de impresión</h4>
                      </div>
                      <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-100">
                        {selectedLocations.map((locId, index) => {
                          const sucursal = sucursales.find(s => s.id.toString() === locId);
                          const isPrinted = currentLocation > index;
                          const isPrinting = currentLocation === index;
                          
                          return sucursal && (
                            <div key={`print-${locId}`} className="p-4 flex items-center justify-between">
                              <div className="flex-1">
                                <p className="font-medium text-gray-900">{sucursal.nombre}</p>
                                <p className="text-sm text-gray-500">{sucursal.direccion}</p>
                              </div>
                              <div className="ml-4">
                                {isPrinted ? (
                                  <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="bg-green-100 p-2 rounded-full"
                                  >
                                    <Check className="w-4 h-4 text-green-600" />
                                  </motion.div>
                                ) : isPrinting ? (
                                  <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                  >
                                    <Loader2 className="w-5 h-5 text-indigo-600" />
                                  </motion.div>
                                ) : (
                                  <div className="w-5 h-5 rounded-full border-2 border-gray-200" />
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Columna de Notificaciones */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-gray-900">
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <h4 className="font-medium">Notificaciones por email</h4>
                      </div>
                      <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-100">
                        {selectedLocations.map((locId, index) => {
                          const sucursal = sucursales.find(s => s.id.toString() === locId);
                          const isNotified = currentLocation > index;
                          const isNotifying = currentLocation === index;
                          
                          return sucursal && (
                            <div key={`email-${locId}`} className="p-4 flex items-center justify-between">
                              <div className="flex-1">
                                <p className="font-medium text-gray-900">{sucursal.nombre}</p>
                                <div className="flex items-center gap-2 text-gray-500 mt-1">
                                  <span className="text-sm">{sucursal.email}</span>
                                </div>
                              </div>
                              <div className="ml-4">
                                {isNotified ? (
                                  <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="bg-green-100 p-2 rounded-full"
                                  >
                                    <Check className="w-4 h-4 text-green-600" />
                                  </motion.div>
                                ) : isNotifying ? (
                                  <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                  >
                                    <Loader2 className="w-5 h-5 text-indigo-600" />
                                  </motion.div>
                                ) : (
                                  <div className="w-5 h-5 rounded-full border-2 border-gray-200" />
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-500">
                  {step === 'selection' && `${selectedLocations.length} sucursales seleccionadas`}
                  {step === 'complete'
                    ? 'Envío completado'
                    : step === 'sending'
                    ? `Enviando a ${currentLocation + 1} de ${selectedLocations.length} sucursales...`
                    : ''}
                </div>
                {step === 'selection' ? (
                  <button
                    onClick={handleStartSending}
                    disabled={selectedLocations.length === 0 || !selectedPrinter}
                    className={`px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2
                      ${(selectedLocations.length === 0 || !selectedPrinter)
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        : 'bg-indigo-600 text-white hover:bg-indigo-700'
                      }`}
                  >
                    <Send className="w-4 h-4" />
                    Comenzar envío
                  </button>
                ) : step === 'complete' && (
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    onClick={onClose}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 
                             transition-colors text-sm font-medium"
                  >
                    Cerrar
                  </motion.button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}; 