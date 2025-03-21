import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FileText, Upload, Smartphone, Plus, ArrowLeft, AlertCircle } from 'lucide-react';
import { ManualForm } from './ManualForm';
import { Product } from '../../types/product';
import { BulkUpload } from './BulkUpload';
import { MobileScanner } from './MobileScanner';

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddProduct: (product: Product | Product[]) => void;
}

interface MethodProps {
  onSubmit: (product: Product) => void;
  onBack: () => void;
}

interface BulkMethodProps {
  onSubmit: (products: Product[]) => void;
  onBack: () => void;
}

type AddMethod = 'manual' | 'bulk' | 'mobile' | null;

const WarningBanner: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="absolute -top-20 left-1/2 -translate-x-1/2 w-full max-w-md"
    >
      <motion.div
        animate={{
          backgroundColor: ['#fef2f2', '#fee2e2', '#fef2f2'],
          scale: [1, 1.02, 1],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg shadow-lg"
      >
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ rotate: [0, 5, -5, 5, 0] }}
            transition={{
              duration: 1,
              repeat: Infinity,
              repeatDelay: 1
            }}
            className="flex-shrink-0"
          >
            <AlertCircle className="h-5 w-5 text-red-400" />
          </motion.div>
          <div>
            <p className="text-sm font-medium text-red-800">
              No se pueden agregar productos
            </p>
            <p className="text-sm text-red-600 mt-1">
              Por favor, contacte al administrador del sistema
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

const AddProductModal: React.FC<AddProductModalProps> = ({ isOpen, onClose, onAddProduct }) => {
  const [selectedMethod, setSelectedMethod] = useState<AddMethod>(null);

  const methods = [
    {
      id: 'manual',
      name: 'Agregar Manualmente',
      description: 'Ingresa los datos del producto uno por uno',
      icon: Plus,
    },
    {
      id: 'bulk',
      name: 'Importar CSV',
      description: 'Sube un archivo CSV con múltiples productos',
      icon: FileText,
    },
    {
      id: 'mobile',
      name: 'Usar Dispositivo Móvil',
      description: 'Escanea productos usando la cámara',
      icon: Smartphone,
    },
  ];

  const renderMethodContent = () => {
    switch (selectedMethod) {
      case 'manual':
        return <ManualForm onSubmit={(product) => onAddProduct(product)} onBack={() => setSelectedMethod(null)} />;
      case 'bulk':
        return <BulkUpload onSubmit={(products) => onAddProduct(products)} onBack={() => setSelectedMethod(null)} />;
      case 'mobile':
        return <MobileScanner onSubmit={(product) => onAddProduct(product)} onBack={() => setSelectedMethod(null)} />;
      default:
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {methods.map((method) => (
              <motion.button
                key={method.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedMethod(method.id as AddMethod)}
                className="p-6 bg-white/5 rounded-xl border border-white/10 hover:border-white/20 
                         text-left transition-colors"
              >
                <method.icon className="w-8 h-8 text-purple-400 mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">{method.name}</h3>
                <p className="text-white/60 text-sm">{method.description}</p>
              </motion.button>
            ))}
          </div>
        );
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          <AnimatePresence>
            <WarningBanner />
          </AnimatePresence>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="relative bg-slate-900 rounded-2xl shadow-xl w-full max-w-4xl 
                     border border-white/10 overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-6 border-b border-white/10 flex justify-between items-center">
              <h2 className="text-xl font-medium text-white">
                {selectedMethod ? methods.find(m => m.id === selectedMethod)?.name : 'Agregar Producto'}
              </h2>
              <button
                onClick={onClose}
                className="text-white/60 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              {renderMethodContent()}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AddProductModal; 