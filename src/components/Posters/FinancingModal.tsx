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
    bank: 'Banco Nación',
    logo: 'https://www.ccres.org.ar/site/wp-content/uploads/2023/09/logo-banco-nacion.jpg',
    cards: [
      {
        name: 'Visa Classic',
        image: 'https://www.visa.com.ar/dam/VCOM/regional/lac/SPA/Default/Pay%20With%20Visa/Find%20a%20Card/Credit%20cards/Classic/visa_classic_card_400x225.jpg',
        plans: ['3 cuotas sin interés', '6 cuotas sin interés', '12 cuotas con 10% interés']
      }
    ]
  },
  {
    bank: 'American Express',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/American_Express_logo_%282018%29.svg/2052px-American_Express_logo_%282018%29.svg.png',
    cards: [
      {
        name: 'Corporate',
        image: 'https://www.americanexpress.com/content/dam/amex/es-ar/negocios/corp_green_ar_960x608.png',
        plans: ['3 cuotas sin interés', '6 cuotas con 5% interés']
      }
    ]
  },
  {
    bank: 'Naranja',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/f/f5/Logo_Naranja.png',
    cards: [
      {
        name: 'Naranja X',
        image: 'https://upload.wikimedia.org/wikipedia/commons/f/f5/Logo_Naranja.png',
        plans: ['3 cuotas sin interés', '6 cuotas sin interés', '12 cuotas con 15% interés']
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

                      {option.cards.map((card) => (
                        <div key={card.name} className="bg-gray-50 rounded-lg p-4 space-y-3">
                          <div className="flex items-center gap-4">
                            <img 
                              src={card.image} 
                              alt={card.name}
                              className="h-12 object-contain"
                            />
                            <h4 className="font-medium text-gray-800">{card.name}</h4>
                          </div>

                          {card.plans.map((plan) => {
                            const isSelected = selectedOptions.some(opt => 
                              opt.bank === option.bank && 
                              opt.cardName === card.name && 
                              opt.plan === plan
                            );

                            return (
                              <li 
                                key={plan}
                                onClick={() => handleSelect(option.bank, option.logo, card, plan)}
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
                      ))}
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