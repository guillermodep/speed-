import React, { useState } from 'react';
import { ArrowLeft, LogOut, Plus, Package2, Tags, Star, Clock, FileText, Sun, Moon, LayoutTemplate, Settings, Send, FileEdit, Printer, X, BarChart3 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Header } from './shared/Header';
import { COMPANIES } from '../data/companies';
import { PrintModal } from './PrintModal';
import { NotificationModal } from './NotificationModal';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { PrintAnimation } from './Dashboard/PrintAnimation';
import { PrintDetailsModal } from './Dashboard/PrintDetailsModal';

interface DashboardProps {
  onLogout: () => void;
  onNewTemplate: () => void;
  onNewPoster: () => void;
  onProducts: () => void;
  onPromotions: () => void;
  onBack: () => void;
  userEmail?: string;
  onSettings: () => void;
  userRole: 'admin' | 'limited';
  onAnalytics: () => void;
}

interface PlantillaReciente {
  id: string;
  nombre: string;
  tipo: 'envio' | 'edicion' | 'impresion';
  tiempoAtras: string;
  sucursal?: string;
  cantidad?: number;
  estado: 'impreso' | 'no_impreso';
  empresa: {
    nombre: string;
    logo: string;
  };
}

interface DashboardStats {
  products: {
    total: number;
    active: number;
    lastWeek: number;
  };
  promotions: {
    total: number;
    active: number;
    expiringSoon: number;
  };
  templates: {
    total: number;
    recentlyUsed: number;
    mostUsed: string;
  };
}

interface Activity {
  id: string;
  type: 'poster' | 'template' | 'promotion';
  title: string;
  description: string;
  timestamp: Date;
  status: 'success' | 'pending' | 'error';
  locations: Array<{
    name: string;
    printed: boolean;
    timestamp?: Date;
    printer?: string;
  }>;
  company: string;
  companyLogo?: string;
  printStatus: 'printed' | 'not_printed';
  printerName?: string;
  onPrint?: (id: string, locationName: string) => void;
}

const easyLogo = COMPANIES.find(c => c.id === 'easy-mdh')?.logo;

// Constantes para los logos
const LOGOS = {
  easy: easyLogo || 'https://upload.wikimedia.org/wikipedia/commons/8/89/Easy_logo.png',
  jumbo: 'https://upload.wikimedia.org/wikipedia/commons/d/d3/Logo_Jumbo_Cencosud.png',
  disco: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Disco-Supermarket-Logo.svg/2048px-Disco-Supermarket-Logo.svg.png',
  vea: 'https://upload.wikimedia.org/wikipedia/commons/9/94/Logo-VEA-Supermercados.png'
};

const plantillasRecientes: PlantillaReciente[] = [
  // Easy
  {
    id: '1',
    nombre: 'Carteles Coca Cola',
    tipo: 'envio',
    tiempoAtras: 'hace 2h',
    sucursal: 'Easy San Martín',
    cantidad: 5,
    estado: 'no_impreso',
    empresa: {
      nombre: 'Easy',
      logo: LOGOS.easy
    }
  },
  // Jumbo
  {
    id: '2',
    nombre: 'Carteles Ofertas Semanales',
    tipo: 'envio',
    tiempoAtras: 'hace 3h',
    sucursal: 'Jumbo Quilmes',
    cantidad: 10,
    estado: 'impreso',
    empresa: {
      nombre: 'Jumbo',
      logo: LOGOS.jumbo
    }
  },
  // Disco
  {
    id: '3',
    nombre: 'Carteles Black Friday',
    tipo: 'edicion',
    tiempoAtras: 'hace 4h',
    sucursal: 'Disco Belgrano',
    cantidad: 8,
    estado: 'no_impreso',
    empresa: {
      nombre: 'Disco',
      logo: LOGOS.disco
    }
  },
  // Vea
  {
    id: '4',
    nombre: 'Carteles Navidad',
    tipo: 'impresion',
    tiempoAtras: 'hace 5h',
    sucursal: 'Vea Caballito',
    cantidad: 12,
    estado: 'impreso',
    empresa: {
      nombre: 'Vea',
      logo: LOGOS.vea
    }
  },
  // Easy
  {
    id: '5',
    nombre: 'Carteles Electrodomésticos',
    tipo: 'envio',
    tiempoAtras: 'hace 6h',
    sucursal: 'Easy San Justo',
    cantidad: 20,
    estado: 'no_impreso',
    empresa: {
      nombre: 'Easy',
      logo: LOGOS.easy
    }
  },
  // Jumbo
  {
    id: '6',
    nombre: 'Carteles Bebidas',
    tipo: 'edicion',
    tiempoAtras: 'hace 8h',
    sucursal: 'Jumbo Palermo',
    cantidad: 15,
    estado: 'impreso',
    empresa: {
      nombre: 'Jumbo',
      logo: LOGOS.jumbo
    }
  },
  // ... continuar hasta 20 actividades con diferentes empresas y sucursales
  {
    id: '7',
    nombre: 'Carteles Tecnología',
    tipo: 'envio',
    tiempoAtras: 'hace 10h',
    sucursal: 'Disco Núñez',
    cantidad: 6,
    estado: 'no_impreso',
    empresa: {
      nombre: 'Disco',
      logo: LOGOS.disco
    }
  },
  {
    id: '8',
    nombre: 'Carteles Ofertas Verano',
    tipo: 'impresion',
    tiempoAtras: 'hace 12h',
    sucursal: 'Vea Flores',
    cantidad: 15,
    estado: 'impreso',
    empresa: {
      nombre: 'Vea',
      logo: LOGOS.vea
    }
  },
  {
    id: '9',
    nombre: 'Carteles Productos Frescos',
    tipo: 'edicion',
    tiempoAtras: 'hace 14h',
    sucursal: 'Jumbo Pilar',
    cantidad: 18,
    estado: 'no_impreso',
    empresa: {
      nombre: 'Jumbo',
      logo: LOGOS.jumbo
    }
  },
  {
    id: '10',
    nombre: 'Carteles Jardín',
    tipo: 'envio',
    tiempoAtras: 'hace 16h',
    sucursal: 'Easy Córdoba',
    cantidad: 25,
    estado: 'no_impreso',
    empresa: {
      nombre: 'Easy',
      logo: LOGOS.easy
    }
  },
  {
    id: '11',
    nombre: 'Carteles Lácteos',
    tipo: 'impresion',
    tiempoAtras: 'hace 18h',
    sucursal: 'Disco Rosario',
    cantidad: 10,
    estado: 'no_impreso',
    empresa: {
      nombre: 'Disco',
      logo: LOGOS.disco
    }
  },
  {
    id: '12',
    nombre: 'Carteles Ofertas Fin de Mes',
    tipo: 'edicion',
    tiempoAtras: 'hace 20h',
    sucursal: 'Vea Mendoza',
    cantidad: 22,
    estado: 'no_impreso',
    empresa: {
      nombre: 'Vea',
      logo: LOGOS.vea
    }
  },
  {
    id: '13',
    nombre: 'Carteles Herramientas',
    tipo: 'envio',
    tiempoAtras: 'hace 22h',
    sucursal: 'Easy Tucumán',
    cantidad: 14,
    estado: 'no_impreso',
    empresa: {
      nombre: 'Easy',
      logo: LOGOS.easy
    }
  },
  {
    id: '14',
    nombre: 'Carteles Pescadería',
    tipo: 'impresion',
    tiempoAtras: 'hace 1d',
    sucursal: 'Jumbo Neuquén',
    cantidad: 8,
    estado: 'no_impreso',
    empresa: {
      nombre: 'Jumbo',
      logo: LOGOS.jumbo
    }
  },
  {
    id: '15',
    nombre: 'Carteles Panadería',
    tipo: 'edicion',
    tiempoAtras: 'hace 1d',
    sucursal: 'Disco Mar del Plata',
    cantidad: 12,
    estado: 'impreso',
    empresa: {
      nombre: 'Disco',
      logo: LOGOS.disco
    }
  },
  {
    id: '16',
    nombre: 'Carteles Limpieza',
    tipo: 'envio',
    tiempoAtras: 'hace 1d',
    sucursal: 'Vea San Juan',
    cantidad: 16,
    estado: 'no_impreso',
    empresa: {
      nombre: 'Vea',
      logo: LOGOS.vea
    }
  },
  {
    id: '17',
    nombre: 'Carteles Decoración',
    tipo: 'impresion',
    tiempoAtras: 'hace 2d',
    sucursal: 'Easy Salta',
    cantidad: 20,
    estado: 'no_impreso',
    empresa: {
      nombre: 'Easy',
      logo: LOGOS.easy
    }
  },
  {
    id: '18',
    nombre: 'Carteles Carnicería',
    tipo: 'edicion',
    tiempoAtras: 'hace 2d',
    sucursal: 'Jumbo La Plata',
    cantidad: 9,
    estado: 'no_impreso',
    empresa: {
      nombre: 'Jumbo',
      logo: LOGOS.jumbo
    }
  },
  {
    id: '19',
    nombre: 'Carteles Perfumería',
    tipo: 'envio',
    tiempoAtras: 'hace 2d',
    sucursal: 'Disco Bahía Blanca',
    cantidad: 11,
    estado: 'no_impreso',
    empresa: {
      nombre: 'Disco',
      logo: LOGOS.disco
    }
  },
  {
    id: '20',
    nombre: 'Carteles Bebidas',
    tipo: 'impresion',
    tiempoAtras: 'hace 2d',
    sucursal: 'Vea Santa Fe',
    cantidad: 13,
    estado: 'impreso',
    empresa: {
      nombre: 'Vea',
      logo: LOGOS.vea
    }
  },
  // Nuevas actividades para Jumbo Pilar
  {
    id: '21',
    nombre: 'Carteles Ofertas Semanales',
    tipo: 'envio',
    tiempoAtras: 'hace 1h',
    sucursal: 'Jumbo Pilar',
    cantidad: 15,
    estado: 'no_impreso',
    empresa: {
      nombre: 'Jumbo',
      logo: LOGOS.jumbo
    }
  },
  {
    id: '22',
    nombre: 'Carteles Frutas y Verduras',
    tipo: 'impresion',
    tiempoAtras: 'hace 3h',
    sucursal: 'Jumbo Pilar',
    cantidad: 8,
    estado: 'impreso',
    empresa: {
      nombre: 'Jumbo',
      logo: LOGOS.jumbo
    }
  },

  // Nuevas actividades para Disco Pilar
  {
    id: '23',
    nombre: 'Carteles Lácteos',
    tipo: 'envio',
    tiempoAtras: 'hace 2h',
    sucursal: 'Disco Pilar',
    cantidad: 12,
    estado: 'no_impreso',
    empresa: {
      nombre: 'Disco',
      logo: LOGOS.disco
    }
  },
  {
    id: '24',
    nombre: 'Carteles Limpieza',
    tipo: 'edicion',
    tiempoAtras: 'hace 4h',
    sucursal: 'Disco Pilar',
    cantidad: 6,
    estado: 'no_impreso',
    empresa: {
      nombre: 'Disco',
      logo: LOGOS.disco
    }
  },

  // Nuevas actividades para Easy Pilar
  {
    id: '25',
    nombre: 'Carteles Herramientas',
    tipo: 'envio',
    tiempoAtras: 'hace 30m',
    sucursal: 'Easy Pilar',
    cantidad: 20,
    estado: 'no_impreso',
    empresa: {
      nombre: 'Easy',
      logo: LOGOS.easy
    }
  },
  {
    id: '26',
    nombre: 'Carteles Jardín',
    tipo: 'impresion',
    tiempoAtras: 'hace 5h',
    sucursal: 'Easy Pilar',
    cantidad: 15,
    estado: 'impreso',
    empresa: {
      nombre: 'Easy',
      logo: LOGOS.easy
    }
  },
  {
    id: '27',
    nombre: 'Carteles Electrodomésticos',
    tipo: 'edicion',
    tiempoAtras: 'hace 6h',
    sucursal: 'Easy Pilar',
    cantidad: 10,
    estado: 'no_impreso',
    empresa: {
      nombre: 'Easy',
      logo: LOGOS.easy
    }
  }
];

const getIconByType = (tipo: PlantillaReciente['tipo']) => {
  switch (tipo) {
    case 'envio':
      return <Send className="w-4 h-4 text-white" />;
    case 'edicion':
      return <FileEdit className="w-4 h-4 text-white" />;
    case 'impresion':
      return <Printer className="w-4 h-4 text-white" />;
    default:
      return <FileText className="w-4 h-4 text-white" />;
  }
};

const getTextByType = (template: PlantillaReciente) => {
  switch (template.tipo) {
    case 'envio':
      return `${template.cantidad} carteles enviados a ${template.sucursal}`;
    case 'edicion':
      return `Editados para ${template.sucursal}`;
    case 'impresion':
      return `${template.cantidad} carteles impresos para ${template.sucursal}`;
    default:
      return template.nombre;
  }
};

// Datos de ejemplo
const recentActivity: Activity[] = [
  {
    id: '1',
    type: 'poster',
    title: 'Cartel Promoción Banco Santander',
    description: 'Enviado a 5 sucursales',
    timestamp: new Date('2024-01-15T14:30:00'),
    status: 'success',
    printStatus: 'not_printed',
    locations: [
      { name: 'Palermo', printed: true, timestamp: new Date(), printer: 'HP LaserJet Pro M404n' },
      { name: 'Belgrano', printed: true, timestamp: new Date(), printer: 'HP LaserJet Pro M404n' },
      { name: 'Recoleta', printed: false },
      { name: 'San Isidro', printed: false },
      { name: 'Vicente López', printed: true, timestamp: new Date(), printer: 'HP LaserJet Pro M404n' }
    ],
    company: 'Jumbo',
    companyLogo: LOGOS.jumbo
  },
  {
    id: '2',
    type: 'template',
    title: 'Plantilla Ofertas Semanales',
    description: 'Enviado a 8 sucursales',
    timestamp: new Date('2024-01-15T13:45:00'),
    status: 'pending',
    printStatus: 'not_printed',
    locations: [
      { name: 'Caballito', printed: false },
      { name: 'Flores', printed: false },
      { name: 'Floresta', printed: false },
      { name: 'Villa Devoto', printed: false },
      { name: 'Villa del Parque', printed: false },
      { name: 'Villa Urquiza', printed: false },
      { name: 'Saavedra', printed: false },
      { name: 'Núñez', printed: false }
    ],
    company: 'Disco',
    companyLogo: LOGOS.disco
  },
  {
    id: '3',
    type: 'promotion',
    title: 'Promoción 3x2 Limpieza',
    description: 'Enviado a 3 sucursales',
    timestamp: new Date('2024-01-15T12:15:00'),
    status: 'success',
    printStatus: 'printed',
    locations: [
      { name: 'Martínez', printed: true, timestamp: new Date(), printer: 'HP LaserJet Pro M404n' },
      { name: 'San Isidro', printed: true, timestamp: new Date(), printer: 'HP LaserJet Pro M404n' },
      { name: 'Vicente López', printed: true, timestamp: new Date(), printer: 'HP LaserJet Pro M404n' }
    ],
    company: 'Vea',
    companyLogo: LOGOS.vea
  },
  {
    id: '4',
    type: 'poster',
    title: 'Carteles Herramientas',
    description: 'Enviado a 4 sucursales',
    timestamp: new Date('2024-01-15T11:30:00'),
    status: 'error',
    printStatus: 'not_printed',
    locations: [
      { name: 'San Martín', printed: false },
      { name: 'Villa Lynch', printed: false },
      { name: 'Villa Ballester', printed: false },
      { name: 'San Andrés', printed: false }
    ],
    company: 'Easy',
    companyLogo: LOGOS.easy
  },
  {
    id: '5',
    type: 'template',
    title: 'Plantilla Productos Frescos',
    description: 'Enviado a 6 sucursales',
    timestamp: new Date('2024-01-15T10:45:00'),
    status: 'success',
    printStatus: 'printed',
    locations: [
      { name: 'Belgrano', printed: true, timestamp: new Date(), printer: 'HP LaserJet Pro M404n' },
      { name: 'Núñez', printed: true, timestamp: new Date(), printer: 'HP LaserJet Pro M404n' },
      { name: 'Saavedra', printed: true, timestamp: new Date(), printer: 'HP LaserJet Pro M404n' },
      { name: 'Villa Urquiza', printed: true, timestamp: new Date(), printer: 'HP LaserJet Pro M404n' },
      { name: 'Villa Pueyrredón', printed: true, timestamp: new Date(), printer: 'HP LaserJet Pro M404n' },
      { name: 'Villa Devoto', printed: true, timestamp: new Date(), printer: 'HP LaserJet Pro M404n' }
    ],
    company: 'Jumbo',
    companyLogo: LOGOS.jumbo
  },
  {
    id: '6',
    type: 'poster',
    title: 'Carteles Ofertas Semanales',
    description: 'Enviado a 6 sucursales',
    timestamp: new Date('2024-01-15T10:15:00'),
    status: 'success',
    printStatus: 'not_printed',
    locations: [
      { name: 'Pilar Centro', printed: false },
      { name: 'Pilar Este', printed: false },
      { name: 'Pilar Oeste', printed: false },
      { name: 'Pilar Norte', printed: false },
      { name: 'Pilar Sur', printed: false },
      { name: 'Pilar Shopping', printed: false }
    ],
    company: 'Jumbo',
    companyLogo: LOGOS.jumbo
  },
  {
    id: '7',
    type: 'promotion',
    title: 'Promoción Banco Galicia',
    description: 'Enviado a 4 sucursales',
    timestamp: new Date('2024-01-15T09:45:00'),
    status: 'success',
    printStatus: 'printed',
    locations: [
      { name: 'Pilar Centro', printed: true, timestamp: new Date() },
      { name: 'Pilar Shopping', printed: true, timestamp: new Date() },
      { name: 'San Isidro', printed: true, timestamp: new Date() },
      { name: 'Vicente López', printed: true, timestamp: new Date() }
    ],
    company: 'Disco',
    companyLogo: LOGOS.disco
  },
  {
    id: '8',
    type: 'template',
    title: 'Carteles Black Friday',
    description: 'Enviado a 5 sucursales',
    timestamp: new Date('2024-01-15T09:30:00'),
    status: 'pending',
    printStatus: 'not_printed',
    locations: [
      { name: 'Pilar', printed: false },
      { name: 'Belgrano', printed: false },
      { name: 'Palermo', printed: false },
      { name: 'Recoleta', printed: false },
      { name: 'Núñez', printed: false }
    ],
    company: 'Easy',
    companyLogo: LOGOS.easy
  },
  {
    id: '9',
    type: 'poster',
    title: 'Carteles Electro',
    description: 'Enviado a 3 sucursales',
    timestamp: new Date('2024-01-15T09:15:00'),
    status: 'success',
    printStatus: 'printed',
    locations: [
      { name: 'Pilar', printed: true, timestamp: new Date() },
      { name: 'San Isidro', printed: true, timestamp: new Date() },
      { name: 'Vicente López', printed: true, timestamp: new Date() }
    ],
    company: 'Easy',
    companyLogo: LOGOS.easy
  },
  {
    id: '10',
    type: 'promotion',
    title: 'Promoción 3x2 Limpieza',
    description: 'Enviado a 7 sucursales',
    timestamp: new Date('2024-01-15T09:00:00'),
    status: 'success',
    printStatus: 'not_printed',
    locations: [
      { name: 'Pilar Centro', printed: false },
      { name: 'Pilar Este', printed: false },
      { name: 'Belgrano', printed: false },
      { name: 'Palermo', printed: false },
      { name: 'Recoleta', printed: false },
      { name: 'Núñez', printed: false },
      { name: 'Caballito', printed: false }
    ],
    company: 'Vea',
    companyLogo: LOGOS.vea
  },
  {
    id: '11',
    type: 'poster',
    title: 'Carteles Navidad',
    description: 'Enviado a 4 sucursales',
    timestamp: new Date('2024-01-15T08:45:00'),
    status: 'success',
    printStatus: 'printed',
    locations: [
      { name: 'Pilar Shopping', printed: true, timestamp: new Date() },
      { name: 'Unicenter', printed: true, timestamp: new Date() },
      { name: 'Alto Palermo', printed: true, timestamp: new Date() },
      { name: 'Abasto', printed: true, timestamp: new Date() }
    ],
    company: 'Jumbo',
    companyLogo: LOGOS.jumbo
  },
  {
    id: '12',
    type: 'template',
    title: 'Carteles Año Nuevo',
    description: 'Enviado a 5 sucursales',
    timestamp: new Date('2024-01-15T08:30:00'),
    status: 'success',
    printStatus: 'not_printed',
    locations: [
      { name: 'Pilar', printed: false },
      { name: 'Martinez', printed: false },
      { name: 'San Isidro', printed: false },
      { name: 'Olivos', printed: false },
      { name: 'Vicente López', printed: false }
    ],
    company: 'Disco',
    companyLogo: LOGOS.disco
  },
  {
    id: '13',
    type: 'promotion',
    title: 'Promoción Banco Provincia',
    description: 'Enviado a 6 sucursales',
    timestamp: new Date('2024-01-15T08:15:00'),
    status: 'success',
    printStatus: 'not_printed',
    locations: [
      { name: 'Pilar Centro', printed: false },
      { name: 'Pilar Este', printed: false },
      { name: 'Pilar Oeste', printed: false },
      { name: 'San Fernando', printed: false },
      { name: 'Tigre', printed: false },
      { name: 'Pacheco', printed: false }
    ],
    company: 'Vea',
    companyLogo: LOGOS.vea
  },
  {
    id: '14',
    type: 'poster',
    title: 'Carteles Verano',
    description: 'Enviado a 3 sucursales',
    timestamp: new Date('2024-01-15T08:00:00'),
    status: 'success',
    printStatus: 'printed',
    locations: [
      { name: 'Pilar', printed: true, timestamp: new Date() },
      { name: 'Nordelta', printed: true, timestamp: new Date() },
      { name: 'San Isidro', printed: true, timestamp: new Date() }
    ],
    company: 'Easy',
    companyLogo: LOGOS.easy
  },
  {
    id: '15',
    type: 'template',
    title: 'Carteles Back to School',
    description: 'Enviado a 5 sucursales',
    timestamp: new Date('2024-01-15T07:45:00'),
    status: 'pending',
    printStatus: 'not_printed',
    locations: [
      { name: 'Pilar Shopping', printed: false },
      { name: 'Unicenter', printed: false },
      { name: 'Plaza Oeste', printed: false },
      { name: 'Alto Avellaneda', printed: false },
      { name: 'Soleil', printed: false }
    ],
    company: 'Jumbo',
    companyLogo: LOGOS.jumbo
  },
  {
    id: '16',
    type: 'poster',
    title: 'Carteles Tecnología',
    description: 'Enviado a 5 sucursales',
    timestamp: new Date('2024-01-15T07:30:00'),
    status: 'success',
    printStatus: 'not_printed',
    locations: [
      { name: 'Pilar Shopping', printed: false },
      { name: 'Pilar Centro', printed: false },
      { name: 'San Isidro', printed: false },
      { name: 'Unicenter', printed: false },
      { name: 'Alto Palermo', printed: false }
    ],
    company: 'Easy',
    companyLogo: LOGOS.easy
  },
  {
    id: '17',
    type: 'promotion',
    title: 'Promoción Banco ICBC',
    description: 'Enviado a 4 sucursales',
    timestamp: new Date('2024-01-15T07:15:00'),
    status: 'success',
    printStatus: 'printed',
    locations: [
      { name: 'Pilar Shopping', printed: true, timestamp: new Date() },
      { name: 'Nordelta', printed: true, timestamp: new Date() },
      { name: 'San Isidro', printed: true, timestamp: new Date() },
      { name: 'Vicente López', printed: true, timestamp: new Date() }
    ],
    company: 'Jumbo',
    companyLogo: LOGOS.jumbo
  },
  {
    id: '18',
    type: 'template',
    title: 'Carteles Hogar',
    description: 'Enviado a 6 sucursales',
    timestamp: new Date('2024-01-15T07:00:00'),
    status: 'success',
    printStatus: 'not_printed',
    locations: [
      { name: 'Pilar Este', printed: false },
      { name: 'Pilar Oeste', printed: false },
      { name: 'Pilar Norte', printed: false },
      { name: 'Pilar Sur', printed: false },
      { name: 'Pilar Centro', printed: false },
      { name: 'Pilar Shopping', printed: false }
    ],
    company: 'Easy',
    companyLogo: LOGOS.easy
  },
  {
    id: '19',
    type: 'poster',
    title: 'Carteles Panadería',
    description: 'Enviado a 3 sucursales',
    timestamp: new Date('2024-01-15T06:45:00'),
    status: 'success',
    printStatus: 'printed',
    locations: [
      { name: 'Pilar Centro', printed: true, timestamp: new Date() },
      { name: 'San Fernando', printed: true, timestamp: new Date() },
      { name: 'Tigre', printed: true, timestamp: new Date() }
    ],
    company: 'Disco',
    companyLogo: LOGOS.disco
  },
  {
    id: '20',
    type: 'promotion',
    title: 'Promoción 2x1 Bebidas',
    description: 'Enviado a 5 sucursales',
    timestamp: new Date('2024-01-15T06:30:00'),
    status: 'pending',
    printStatus: 'not_printed',
    locations: [
      { name: 'Pilar Shopping', printed: false },
      { name: 'Pilar Centro', printed: false },
      { name: 'Pilar Este', printed: false },
      { name: 'Pilar Oeste', printed: false },
      { name: 'Pilar Norte', printed: false }
    ],
    company: 'Vea',
    companyLogo: LOGOS.vea
  },
  {
    id: '21',
    type: 'template',
    title: 'Carteles Mascotas',
    description: 'Enviado a 4 sucursales',
    timestamp: new Date('2024-01-15T06:15:00'),
    status: 'success',
    printStatus: 'printed',
    locations: [
      { name: 'Pilar', printed: true, timestamp: new Date() },
      { name: 'San Isidro', printed: true, timestamp: new Date() },
      { name: 'Vicente López', printed: true, timestamp: new Date() },
      { name: 'Olivos', printed: true, timestamp: new Date() }
    ],
    company: 'Jumbo',
    companyLogo: LOGOS.jumbo
  },
  {
    id: '22',
    type: 'poster',
    title: 'Carteles Deportes',
    description: 'Enviado a 7 sucursales',
    timestamp: new Date('2024-01-15T06:00:00'),
    status: 'success',
    printStatus: 'not_printed',
    locations: [
      { name: 'Pilar Shopping', printed: false },
      { name: 'Pilar Centro', printed: false },
      { name: 'Unicenter', printed: false },
      { name: 'Alto Palermo', printed: false },
      { name: 'Abasto', printed: false },
      { name: 'Soleil', printed: false },
      { name: 'Plaza Oeste', printed: false }
    ],
    company: 'Easy',
    companyLogo: LOGOS.easy
  },
  {
    id: '23',
    type: 'promotion',
    title: 'Promoción Banco Macro',
    description: 'Enviado a 5 sucursales',
    timestamp: new Date('2024-01-15T05:45:00'),
    status: 'success',
    printStatus: 'printed',
    locations: [
      { name: 'Pilar', printed: true, timestamp: new Date() },
      { name: 'San Fernando', printed: true, timestamp: new Date() },
      { name: 'Tigre', printed: true, timestamp: new Date() },
      { name: 'Pacheco', printed: true, timestamp: new Date() },
      { name: 'Nordelta', printed: true, timestamp: new Date() }
    ],
    company: 'Disco',
    companyLogo: LOGOS.disco
  },
  {
    id: '24',
    type: 'template',
    title: 'Carteles Juguetería',
    description: 'Enviado a 6 sucursales',
    timestamp: new Date('2024-01-15T05:30:00'),
    status: 'pending',
    printStatus: 'not_printed',
    locations: [
      { name: 'Pilar Shopping', printed: false },
      { name: 'Pilar Centro', printed: false },
      { name: 'Pilar Este', printed: false },
      { name: 'Pilar Oeste', printed: false },
      { name: 'Pilar Norte', printed: false },
      { name: 'Pilar Sur', printed: false }
    ],
    company: 'Jumbo',
    companyLogo: LOGOS.jumbo
  },
  {
    id: '25',
    type: 'poster',
    title: 'Carteles Ferretería',
    description: 'Enviado a 4 sucursales',
    timestamp: new Date('2024-01-15T05:15:00'),
    status: 'success',
    printStatus: 'printed',
    locations: [
      { name: 'Pilar', printed: true, timestamp: new Date() },
      { name: 'San Isidro', printed: true, timestamp: new Date() },
      { name: 'Vicente López', printed: true, timestamp: new Date() },
      { name: 'Olivos', printed: true, timestamp: new Date() }
    ],
    company: 'Easy',
    companyLogo: LOGOS.easy
  }
];

// Componente de Actividad
const ActivityItem: React.FC<{ 
  activity: Activity;
  onPrint: (id: string, locationName: string) => void;
}> = ({ activity, onPrint }) => {
  const [selectedLocation, setSelectedLocation] = useState<{
    name: string;
    timestamp: Date;
  } | null>(null);

  const allPrinted = activity.locations.every(loc => loc.printed);
  const somePrinted = activity.locations.some(loc => loc.printed);
  const printedCount = activity.locations.filter(loc => loc.printed).length;

  return (
    <>
      <div className="flex items-start gap-4 p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
        {/* Icono o Logo */}
        <div className="flex-shrink-0">
          {activity.companyLogo ? (
            <img 
              src={activity.companyLogo} 
              alt={activity.company}
              className="w-10 h-10 rounded-lg object-contain"
            />
          ) : (
            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-indigo-600" />
            </div>
          )}
        </div>

        {/* Contenido */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900 truncate">
                {activity.title}
              </h4>
              <p className="text-sm text-gray-500">
                {activity.description}
              </p>
            </div>
            <div className="flex flex-col items-end">
              {/* Fecha formateada */}
              <time className="text-xs text-gray-500">
                {format(activity.timestamp, "d 'de' MMMM", { locale: es })}
              </time>
              {/* Hora formateada */}
              <time className="text-xs font-medium text-gray-900">
                {format(activity.timestamp, "HH:mm 'hs'")}
              </time>
            </div>
          </div>

          {/* Detalles adicionales */}
          <div className="mt-2 flex items-center gap-2 flex-wrap">
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium
              ${allPrinted ? 'bg-green-100 text-green-800' : 
                somePrinted ? 'bg-yellow-100 text-yellow-800' : 
                'bg-red-100 text-red-800'}`}
            >
              <Printer className="w-3 h-3 mr-1" />
              {allPrinted ? 'Todo impreso' : 
               somePrinted ? `${printedCount}/${activity.locations.length} impresos` : 
               'Pendiente de impresión'}
            </span>

            {/* Cantidad de sucursales */}
            <span className="text-xs text-gray-500">
              {activity.locations.length} sucursales
            </span>
          </div>

          {/* Lista de sucursales con estado de impresión */}
          <div className="mt-2 flex flex-wrap gap-1">
            {activity.locations.map((location, index) => (
              <div key={index} className="flex items-center gap-1">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
                  ${location.printed 
                    ? 'bg-green-100 text-green-800 border border-green-200' 
                    : 'bg-red-100 text-red-800 border border-red-200'}`}
                >
                  {location.name}
                  {location.printed ? (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => location.timestamp && setSelectedLocation({
                        name: location.name,
                        timestamp: location.timestamp
                      })}
                      className="ml-1 p-1 hover:bg-green-200 rounded-full"
                    >
                      <Printer className="w-3 h-3" />
                    </motion.button>
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => onPrint(activity.id, location.name)}
                      className="ml-1 p-1 hover:bg-red-200 rounded-full"
                    >
                      <Printer className="w-3 h-3" />
                    </motion.button>
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal de detalles de impresión */}
      {selectedLocation && (
        <PrintDetailsModal
          isOpen={!!selectedLocation}
          onClose={() => setSelectedLocation(null)}
          locationName={selectedLocation.name}
          timestamp={selectedLocation.timestamp}
        />
      )}
    </>
  );
};

// Primero, agregar una función de utilidad para verificar si es usuario Pilar
const isPilarUser = (email?: string) => {
  return email?.toLowerCase().includes('pilar');
};

export default function Dashboard({ 
  onLogout, 
  onNewTemplate, 
  onNewPoster, 
  onProducts, 
  onPromotions, 
  onBack, 
  userEmail,
  onSettings,
  userRole,
  onAnalytics
}: DashboardProps) {
  // Datos de ejemplo
  const stats: DashboardStats = {
    products: {
      total: 1234,
      active: 856,
      lastWeek: 45
    },
    promotions: {
      total: 68,
      active: 24,
      expiringSoon: 5
    },
    templates: {
      total: 12,
      recentlyUsed: 3,
      mostUsed: 'Promoción Bancaria'
    }
  };

  const [selectedActivity, setSelectedActivity] = useState<PlantillaReciente | null>(null);
  const [printModalActivity, setPrintModalActivity] = useState<PlantillaReciente | null>(null);
  const [showNotificationModal, setShowNotificationModal] = useState(true);
  const [plantillas, setPlantillas] = useState(plantillasRecientes);
  const [activities, setActivities] = useState(recentActivity);
  const [printingLocation, setPrintingLocation] = useState<{
    id: string;
    name: string;
  } | null>(null);

  // Filtrar las actividades basado en el usuario
  const filteredActivities = React.useMemo(() => {
    if (!isPilarUser(userEmail)) {
      return activities;
    }

    return activities.filter(activity => {
      // Verificar si alguna ubicación contiene "Pilar"
      return activity.locations.some(location => 
        location.name.toLowerCase().includes('pilar')
      );
    });
  }, [activities, userEmail]);

  // Filtrar las plantillas recientes
  const filteredPlantillas = React.useMemo(() => {
    if (!isPilarUser(userEmail)) {
      return plantillasRecientes;
    }

    return plantillasRecientes.filter(plantilla => 
      plantilla.sucursal?.toLowerCase().includes('pilar')
    );
  }, [userEmail]);

  const handlePrint = (id: string, locationName: string) => {
    setPrintingLocation({ id, name: locationName });
    
    // La actualización real se hará cuando la animación termine
  };

  const handlePrintAnimationComplete = () => {
    if (!printingLocation) return;

    setActivities(prev => prev.map(activity => {
      if (activity.id !== printingLocation.id) return activity;

      const updatedLocations = activity.locations.map(loc => 
        loc.name === printingLocation.name
          ? { 
              ...loc, 
              printed: true, 
              timestamp: new Date()
            }
          : loc
      );

      const allPrinted = updatedLocations.every(loc => loc.printed);

      return {
        ...activity,
        locations: updatedLocations,
        printStatus: allPrinted ? 'printed' : 'not_printed'
      };
    }));

    setPrintingLocation(null);
  };

  const handlePrintFromNotification = (activity: PlantillaReciente) => {
    setPrintModalActivity(activity);
    setShowNotificationModal(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-pink-500/5
        animate-gradient-xy pointer-events-none" />
      
      <Header onBack={onBack} onLogout={onLogout} onSettings={onSettings} />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto px-4 py-12"
      >
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8 flex items-center gap-3"
        >
          <h2 className="text-3xl font-medium text-slate-900">
            Bienvenido de nuevo, <span className="text-violet-400">{userEmail?.split('@')[0]}</span>
          </h2>
          <motion.span
            animate={{
              rotate: [0, 14, -8, 14, -4, 10, 0],
              transformOrigin: "bottom right"
            }}
            transition={{
              duration: 2,
              ease: "easeInOut",
              repeat: Infinity,
              repeatDelay: 1
            }}
            className="text-3xl"
          >
            👋
          </motion.span>
          <p className="text-slate-500">
            Aquí está lo que sucede con tus plantillas.
          </p>
        </motion.div>

        {/* Action Buttons Section */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-8 lg:gap-12 mb-8 sm:mb-12 py-6 sm:py-12 px-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              type: "spring",
              stiffness: 260,
              damping: 20,
              delay: 0.1
            }}
            onClick={onProducts}
            className={`group flex flex-col items-center w-56 px-8 py-8 rounded-3xl
              bg-gradient-to-br from-white to-gray-50 border-gray-100 shadow-[0_0_20px_rgba(0,0,0,0.1)]
              transition-all duration-300`}
          >
            <div className="mb-4 p-4 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600
              transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
              <Package2 className="w-10 h-10 text-white" />
            </div>
            <span className={`text-xl font-semibold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent`}>
              Productos
            </span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              type: "spring",
              stiffness: 260,
              damping: 20,
              delay: 0.2
            }}
            onClick={onPromotions}
            className={`group flex flex-col items-center w-56 px-8 py-8 rounded-3xl
              bg-gradient-to-br from-white to-gray-50 border-gray-100 shadow-[0_0_20px_rgba(0,0,0,0.1)]
              transition-all duration-300`}
          >
            <div className="mb-4 p-4 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600
              transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
              <Tags className="w-10 h-10 text-white" />
            </div>
            <span className={`text-xl font-semibold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent`}>
              Promociones
            </span>
          </motion.button>

          <motion.button
            whileHover={userRole === 'admin' ? { scale: 1.05 } : {}}
            whileTap={userRole === 'admin' ? { scale: 0.95 } : {}}
            onClick={userRole === 'admin' ? onNewPoster : undefined}
            className={`group flex flex-col items-center w-56 px-8 py-8 rounded-3xl
              ${userRole === 'admin' 
                ? 'bg-gradient-to-br from-violet-500 to-violet-600 text-white hover:shadow-[0_0_35px_rgba(139,92,246,0.4)]' 
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
          >
            <div className="mb-4 p-4 rounded-2xl bg-white/20
              transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300
              backdrop-blur-lg">
              <FileText className="w-10 h-10 text-white" />
            </div>
            <span className="text-xl font-semibold">
              Cartel
            </span>
          </motion.button>

          <motion.button
            whileHover={userRole === 'admin' ? { scale: 1.05 } : {}}
            whileTap={userRole === 'admin' ? { scale: 0.95 } : {}}
            onClick={userRole === 'admin' ? onNewTemplate : undefined}
            className={`group flex flex-col items-center w-56 px-8 py-8 rounded-3xl
              ${userRole === 'admin' 
                ? 'bg-gradient-to-br from-white to-gray-100 border border-gray-200 shadow-[0_0_20px_rgba(0,0,0,0.1)] hover:shadow-lg' 
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
          >
            <div className="mb-4 p-4 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600
              transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
              <LayoutTemplate className="w-10 h-10 text-white" />
            </div>
            <span className={`text-xl font-semibold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent`}>
              Builder
            </span>
          </motion.button>

          <motion.button
            whileHover={userRole === 'admin' ? { scale: 1.05 } : {}}
            whileTap={userRole === 'admin' ? { scale: 0.95 } : {}}
            onClick={userRole === 'admin' ? onSettings : undefined}
            className={`group flex flex-col items-center w-56 px-8 py-8 rounded-3xl
              ${userRole === 'admin' 
                ? 'bg-gradient-to-br from-white to-gray-100 border border-gray-200 shadow-[0_0_20px_rgba(0,0,0,0.1)] hover:shadow-lg' 
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
          >
            <div className="mb-4 p-4 rounded-2xl bg-gradient-to-br from-yellow-500 to-yellow-600
              transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
              <Settings className="w-10 h-10 text-white" />
            </div>
            <span className={`text-xl font-semibold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent`}>
              Configuración
            </span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              type: "spring",
              stiffness: 260,
              damping: 20,
              delay: 0.2
            }}
            onClick={onAnalytics}
            className={`group flex flex-col items-center w-56 px-8 py-8 rounded-3xl
              bg-gradient-to-br from-white to-gray-100 border border-gray-200 
              shadow-[0_0_20px_rgba(0,0,0,0.1)] hover:shadow-lg
              transition-all duration-300`}
          >
            <div className="mb-4 p-4 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600
              transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
              <BarChart3 className="w-10 h-10 text-white" />
            </div>
            <span className={`text-xl font-semibold bg-gradient-to-r from-gray-800 to-gray-600 
              bg-clip-text text-transparent`}>
              Analítica
            </span>
          </motion.button>
        </div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8 mb-12 px-2 md:px-0"
        >
          {/* Productos Stats */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="rounded-xl p-6 transition-all duration-300
              bg-white border-gray-200 shadow-lg hover:shadow-xl border"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-500 to-blue-500 
                            flex items-center justify-center shadow-lg shadow-sky-500/20">
                <Package2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-slate-900">
                  Productos
                </h3>
                <p className="text-slate-500">
                  Vista general
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-slate-500">Total</span>
                  <span className="text-2xl font-semibold text-slate-900">
                    {stats.products.total}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Activos</span>
                  <span className="text-slate-900">
                    {stats.products.active}
                  </span>
                </div>
              </div>
              <div className="text-sm text-slate-500">
                <span className="text-emerald-400">+{stats.products.lastWeek}</span> nuevos esta semana
              </div>
            </div>
          </motion.div>

          {/* Promociones Stats */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className={`rounded-xl p-6 transition-colors border
              bg-white border-slate-200 shadow-lg`}
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500 to-pink-500 
                            flex items-center justify-center shadow-lg shadow-rose-500/20">
                <Tags className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className={`text-lg font-medium text-slate-900`}>
                  Promociones
                </h3>
                <p className={`text-slate-500`}>
                  Vista general
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className={`text-slate-500`}>Total</span>
                  <span className={`text-2xl font-semibold text-slate-900`}>
                    {stats.promotions.total}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={`text-slate-500`}>Activas</span>
                  <span className="text-slate-900">
                    {stats.promotions.active}
                  </span>
                </div>
              </div>
              <div className={`text-sm text-slate-500`}>
                <span className="text-amber-400">{stats.promotions.expiringSoon}</span> por vencer pronto
              </div>
            </div>
          </motion.div>

          {/* Templates Stats */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className={`rounded-xl p-6 transition-colors border
              bg-white border-slate-200 shadow-lg`}
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 
                            flex items-center justify-center shadow-lg shadow-violet-500/20">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className={`text-lg font-medium text-slate-900`}>
                  Templates
                </h3>
                <p className={`text-slate-500`}>
                  Vista general
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className={`text-slate-500`}>Total</span>
                  <span className={`text-2xl font-semibold text-slate-900`}>
                    {stats.templates.total}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={`text-slate-500`}>Recientes</span>
                  <span className="text-slate-900">
                    {stats.templates.recentlyUsed}
                  </span>
                </div>
              </div>
              <div className={`text-sm text-slate-500`}>
                Más usado: <span className="text-slate-900">{stats.templates.mostUsed}</span>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Recent Activity */}
        <div className="mt-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="rounded-xl border overflow-hidden backdrop-blur-sm bg-white/50 border-gray-200 mx-2 md:mx-0"
          >
            <div className="flex flex-col items-center mb-8">
              <div className="flex items-center gap-3 mb-2">
                <Clock className="w-5 h-5 text-indigo-500" />
                <h3 className="text-xl font-semibold bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 
                               bg-clip-text text-transparent">
                  {isPilarUser(userEmail) ? 'Actividad Reciente - Pilar' : 'Actividad Reciente'}
                </h3>
                <div className={`px-2 py-1 rounded-full text-sm font-medium
                  ${userRole === 'admin' 
                    ? 'bg-indigo-100 text-indigo-800' 
                    : 'bg-yellow-100 text-yellow-800'}`}
                >
                  {filteredPlantillas.filter(p => p.estado === 'no_impreso').length} pendientes
                </div>
              </div>
              <p className="text-sm text-gray-500">
                {isPilarUser(userEmail) 
                  ? 'Seguimiento de las últimas actualizaciones en sucursales de Pilar'
                  : 'Seguimiento de las últimas actualizaciones y cambios'}
              </p>
              <div className="mt-4">
                <button className="text-sm text-indigo-500 hover:text-indigo-600 font-medium 
                                  transition-colors duration-200 flex items-center gap-2">
                  Ver historial completo
                  <ArrowLeft className="w-4 h-4 rotate-180" />
                </button>
              </div>
            </div>
            <div className={`rounded-xl border overflow-hidden
              bg-white border-gray-200`}>
              {filteredActivities.map((activity) => (
                <ActivityItem 
                  key={activity.id} 
                  activity={activity}
                  onPrint={handlePrint}
                />
              ))}
              
              {filteredActivities.length === 0 && (
                <div className="p-8 text-center text-gray-500">
                  No hay actividades recientes para mostrar
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {selectedActivity && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedActivity(null)}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.5, y: 100 }}
              animate={{ 
                opacity: 1, 
                scale: 1, 
                y: 0,
                transition: {
                  type: "spring",
                  duration: 0.5,
                  bounce: 0.3
                }
              }}
              exit={{ 
                opacity: 0, 
                scale: 0.8, 
                y: -100,
                transition: { duration: 0.2 }
              }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-xl p-6 max-w-lg w-full mx-4 relative
                        shadow-2xl shadow-indigo-500/20"
            >
              <motion.button 
                whileHover={{ rotate: 90 }}
                transition={{ duration: 0.2 }}
                onClick={() => setSelectedActivity(null)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </motion.button>

              <motion.div 
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="flex items-center gap-4 mb-6"
              >
                <motion.div 
                  whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                  className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 
                            flex items-center justify-center shadow-lg shadow-indigo-500/20"
                >
                  {getIconByType(selectedActivity.tipo)}
                </motion.div>
                <div>
                  <h3 className="text-xl font-medium text-gray-900">{selectedActivity.nombre}</h3>
                  <p className="text-sm text-gray-500">{selectedActivity.sucursal}</p>
                </div>
              </motion.div>

              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="space-y-4"
              >
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Empresa</span>
                  <div className="flex items-center gap-2">
                    <img 
                      src={selectedActivity.empresa.logo}
                      alt={selectedActivity.empresa.nombre}
                      className="w-6 h-6 object-contain"
                    />
                    <span className="text-gray-900">{selectedActivity.empresa.nombre}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Cantidad</span>
                  <span className="text-gray-900">{selectedActivity.cantidad} carteles</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Tiempo</span>
                  <span className="text-gray-900">{selectedActivity.tiempoAtras}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Estado</span>
                  <motion.div 
                    className={`px-2 py-1 rounded-full text-xs ${
                      selectedActivity.estado === 'impreso' 
                        ? 'bg-green-100 text-green-800 border border-green-200' 
                        : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                    }`}
                  >
                    {selectedActivity.estado === 'impreso' ? (
                      <div className="flex items-center gap-1">
                        <span>✓</span>
                        <span>Impreso</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        <span>No impreso</span>
                      </div>
                    )}
                  </motion.div>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        )}

        <PrintModal
          isOpen={!!printModalActivity}
          onClose={() => setPrintModalActivity(null)}
          activity={printModalActivity!}
          onPrint={handlePrint}
        />

        {userRole === 'limited' && (
          <NotificationModal
            isOpen={showNotificationModal}
            onClose={() => setShowNotificationModal(false)}
            activities={filteredPlantillas}
            onPrint={handlePrintFromNotification}
          />
        )}

        <PrintAnimation 
          isVisible={!!printingLocation}
          onComplete={handlePrintAnimationComplete}
          locationName={printingLocation?.name || ''}
        />
      </motion.div>
    </div>
  );
}