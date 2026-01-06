import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check } from 'lucide-react';

interface FinancingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (financing: FinancingOption[]) => void;
}

interface FinancingOption {
  bank: string;
  logo: string;
  cardName: string;
  cardImage: string;
  plan: string;
}

const FINANCING_OPTIONS = [
  {
    bank: 'American Express',
    logo: '/images/banks/amex-logo.png',
    cards: [
      {
        name: 'American Express',
        image: '/images/banks/amex-logo.png',
        plans: [
          '3 cuotas sin interés',
          '6 cuotas sin interés'
        ]
      }
    ]
  },
  {
    bank: 'Banco Nación',
    logo: '/images/banks/banco-nacion-logo.png',
    cards: [
      {
        name: 'Banco Nación',
        image: '/images/banks/banco-nacion-logo.png',
        plans: [
          '3 cuotas sin interés',
          '12 cuotas sin Interés'
        ]
      }
    ]
  },
  {
    bank: 'Visa',
    logo: '/images/banks/visa-logo.png',
    cards: [
      {
        name: 'Visa',
        image: '/images/banks/visa-logo.png',
        plans: [
          '6 cuotas con interés',
          '12 cuotas con Interés'
        ]
      }
    ]
  },
  {
    bank: 'Mastercard',
    logo: '/images/banks/mastercard-logo.png',
    cards: [
      {
        name: 'Mastercard',
        image: '/images/banks/mastercard-logo.png',
        plans: [
          '6 cuotas con interés',
          '12 cuotas con Interés'
        ]
      }
    ]
  }
];

export const FinancingModal: React.FC<FinancingModalProps> = ({ isOpen, onClose, onSelect }) => {
  const [selectedOptions, setSelectedOptions] = useState<FinancingOption[]>([]);

  const handleSelect = (bank: string, logo: string, card: { name: string, image: string }, plan: string) => {
    const option: FinancingOption = {
      bank,
      logo,
      cardName: card.name,
      cardImage: card.image,
      plan
    };

    setSelectedOptions(prev => {
      // Si ya existe una opción similar, la removemos
      const exists = prev.some(opt => 
        opt.bank === bank && 
        opt.cardName === card.name && 
        opt.plan === plan
      );

      if (exists) {
        return prev.filter(opt => 
          !(opt.bank === bank && 
            opt.cardName === card.name && 
            opt.plan === plan)
        );
      }

      // Si no existe, la agregamos
      return [...prev, option];
    });
  };

  const handleConfirm = () => {
    if (selectedOptions.length > 0) {
      onSelect(selectedOptions);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-25 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 flex items-center justify-center overflow-auto p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-auto">
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-800">Opciones de Financiación</h2>
                <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-8">
                <div className="grid grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto p-1">
                  {FINANCING_OPTIONS.map((option) => (
                    <div key={option.bank} className="space-y-4">
                      <div className="flex items-center gap-4">
                        <img 
                          src={option.logo} 
                          alt={option.bank}
                          className="h-8 object-contain"
                        />
                        <h3 className="text-lg font-medium text-gray-900">{option.bank}</h3>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                        {option.cards[0].plans.map((plan) => {
                          const isSelected = selectedOptions.some(opt => 
                            opt.bank === option.bank && 
                            opt.cardName === option.cards[0].name && 
                            opt.plan === plan
                          );

                          return (
                            <li 
                              key={plan}
                              onClick={() => handleSelect(option.bank, option.logo, option.cards[0], plan)}
                              className={`flex items-center justify-between p-2 rounded-lg cursor-pointer
                                ${isSelected 
                                  ? 'bg-indigo-50 text-indigo-700'
                                  : 'hover:bg-gray-100'
                                }`}
                            >
                              <div className="flex items-center gap-2">
                                <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
                                {plan}
                              </div>
                              {isSelected && (
                                <Check className="w-5 h-5 text-indigo-600" />
                              )}
                            </li>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 border-t border-gray-200 flex justify-end gap-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={selectedOptions.length === 0}
                  className={`px-4 py-2 rounded-lg ${
                    selectedOptions.length > 0
                      ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                      : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Confirmar
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}; 