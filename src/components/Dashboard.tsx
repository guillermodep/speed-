import React, { useState, useMemo } from 'react';
import { ArrowLeft, LogOut, Plus, Package2, Tags, Star, Clock, FileText, Sun, Moon, LayoutTemplate, Settings, Send, FileEdit, Printer, X, BarChart3, Search, InboxIcon, Monitor } from 'lucide-react';
import { motion } from 'framer-motion';
import { Header } from './shared/Header';
import { COMPANIES } from '../data/companies';
import { PrintModal } from './PrintModal';
import { NotificationModal } from './NotificationModal';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { PrintAnimation } from './Dashboard/PrintAnimation';
import { PrintDetailsModal } from './Dashboard/PrintDetailsModal';
import { 
  LineChart, CartesianGrid, XAxis, YAxis, Tooltip, ReferenceLine, Line, 
  ResponsiveContainer, BarChart, Bar, Cell, PieChart, Pie, Sector 
} from 'recharts';
import Select from 'react-select';
import { Chatbot } from './Chatbot/Chatbot';
import { NewsModal } from './NewsModal';
import { isCompanyEnabled } from '../lib/companySettings';

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
  onDigitalPoster: () => void; // Nueva función para el carrusel digital
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
  carteles: {
    total: number;
    fisicos: number;
    digitales: number;
    playlists: number;
    lastWeek: number;
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

interface Location {
  id: string;
  name: string;
  type: 'CC' | 'Region';
  company: string;
}

const LOCATIONS: Location[] = [
  // Centros Comerciales
  { id: 'uni', name: 'Unicenter', type: 'CC', company: 'Jumbo' },
  { id: 'dot', name: 'DOT Baires', type: 'CC', company: 'Jumbo' },
  { id: 'abasto', name: 'Abasto', type: 'CC', company: 'Jumbo' },
  { id: 'plaza', name: 'Plaza Oeste', type: 'CC', company: 'Jumbo' },
  { id: 'Palermo', name: 'Palermo', type: 'CC', company: 'Easy' },
  { id: 'san_justo', name: 'San Justo', type: 'CC', company: 'Easy' },
  { id: 'alto_avellaneda', name: 'Alto Avellaneda', type: 'CC', company: 'Jumbo' },
  { id: 'plaza_oeste', name: 'Plaza Oeste', type: 'CC', company: 'Easy' },
  { id: 'portal_palermo', name: 'Portal Palermo', type: 'CC', company: 'Disco' },
  { id: 'plaza_liniers', name: 'Plaza Liniers', type: 'CC', company: 'Vea' },
  
  // Regiones
  { id: 'norte', name: 'Zona Norte', type: 'Region', company: 'Disco' },
  { id: 'sur', name: 'Zona Sur', type: 'Region', company: 'Disco' },
  { id: 'oeste', name: 'Zona Oeste', type: 'Region', company: 'Vea' },
  { id: 'caba', name: 'CABA', type: 'Region', company: 'Vea' },
  { id: 'pilar', name: 'Pilar', type: 'Region', company: 'Jumbo' },
  { id: 'escobar', name: 'Escobar', type: 'Region', company: 'Easy' },
  { id: 'tigre', name: 'Tigre', type: 'Region', company: 'Jumbo' },
  { id: 'moreno', name: 'Moreno', type: 'Region', company: 'Easy' },
  { id: 'lomas', name: 'Lomas de Zamora', type: 'Region', company: 'Disco' },
  { id: 'quilmes', name: 'Quilmes', type: 'Region', company: 'Vea' },
];

const easyLogo = COMPANIES.find(c => c.id === 'easy-mdh')?.logo;

// Constantes para los logos
const LOGOS = {
  easy: easyLogo || 'https://upload.wikimedia.org/wikipedia/commons/8/89/Easy_logo.png',
  jumbo: 'https://upload.wikimedia.org/wikipedia/commons/d/d3/Logo_Jumbo_Cencosud.png',
  disco: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Disco-Supermarket-Logo.svg/2048px-Disco-Supermarket-Logo.svg.png',
  vea: 'https://upload.wikimedia.org/wikipedia/commons/f/fc/Logo_Vea_Cencosud.png'
};

// Agregar después de la definición de LOGOS y antes de cualquier componente
// Funciones auxiliares para colores
const getComplianceColor = (compliance: number) => {
  if (compliance >= 90) return 'bg-green-100 text-green-600';
  if (compliance >= 80) return 'bg-yellow-100 text-yellow-600';
  return 'bg-red-100 text-red-600';
};

// Modificar la función getComplianceColorHex para usar más degradados
const getComplianceColorHex = (compliance: number) => {
  if (compliance >= 90) {
    // Degradado de azul indigo a violeta
    return ['#818cf8', '#6366f1', '#4f46e5'];
  } else if (compliance >= 80) {
    // Degradado de violeta a púrpura
    return ['#a78bfa', '#8b5cf6', '#7c3aed'];
  } else {
    // Degradado de rojo a rosa oscuro para valores bajos
    return ['#f87171', '#ef4444', '#dc2626'];
  }
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
      { name: 'Palermo', printed: false }
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
      { name: 'Palermol', printed: false },
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
  onPrint?: (id: string, locationName: string) => void;
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
              ${allPrinted ? 'bg-green-100 text-green-600' : 
                somePrinted ? 'bg-yellow-100 text-yellow-600' : 
                'bg-red-100 text-red-600'}`}
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
                    ? 'bg-green-100 text-green-600 border border-green-200' 
                    : 'bg-red-100 text-red-600 border border-red-200'}`}
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

// Agregar después de isPilarUser
const isEasyPilarUser = (email?: string) => {
  return email?.toLowerCase().includes('easypilar');
};

// Primero, agreguemos un componente para agrupar actividades por fecha
const ActivityGroup: React.FC<{
  date: string;
  activities: Activity[];
  onPrint: (id: string, locationName: string) => void;
}> = ({ date, activities, onPrint }) => (
  <div className="mb-6 last:mb-0">
    <div className="px-6 py-2 bg-gray-50 border-y border-gray-200">
      <h4 className="text-sm font-medium text-gray-600">{date}</h4>
    </div>
    {activities.map((activity) => (
      <ActivityItem 
        key={activity.id} 
        activity={activity}
        onPrint={onPrint}
      />
    ))}
  </div>
);

// Agregar más datos de ejemplo para el cumplimiento por sucursal
const STORE_COMPLIANCE_DATA = {
  all: {
    stores: [
      // Centros Comerciales
      { name: 'Unicenter', compliance: 95, total: 450, printed: 427 },
      { name: 'DOT Baires', compliance: 88, total: 380, printed: 334 },
      { name: 'Abasto', compliance: 92, total: 420, printed: 386 },
      { name: 'Plaza Oeste', compliance: 85, total: 320, printed: 272 },
      { name: 'Palermo', compliance: 91, total: 290, printed: 264 },
      { name: 'San Justo', compliance: 89, total: 310, printed: 276 },
      { name: 'Alto Avellaneda', compliance: 93, total: 280, printed: 260 },
      { name: 'Portal Palermo', compliance: 87, total: 340, printed: 296 },
      { name: 'Plaza Liniers', compliance: 90, total: 260, printed: 234 },
      
      // Regiones
      { name: 'Zona Norte', compliance: 94, total: 850, printed: 799 },
      { name: 'Zona Sur', compliance: 89, total: 780, printed: 694 },
      { name: 'Zona Oeste', compliance: 91, total: 720, printed: 655 },
      { name: 'CABA', compliance: 93, total: 920, printed: 856 },
      { name: 'Pilar', compliance: 88, total: 480, printed: 422 },
      { name: 'Escobar', compliance: 90, total: 380, printed: 342 },
      { name: 'Tigre', compliance: 92, total: 420, printed: 386 },
      { name: 'Moreno', compliance: 86, total: 340, printed: 292 },
      { name: 'Lomas de Zamora', compliance: 89, total: 560, printed: 498 },
      { name: 'Quilmes', compliance: 87, total: 490, printed: 426 }
    ]
  },
  promotions: {
    'Promo Banco Santander': {
      stores: [
        // Centros Comerciales
        { name: 'Unicenter', compliance: 100, total: 20, printed: 20 },
        { name: 'DOT Baires', compliance: 75, total: 20, printed: 15 },
        { name: 'Abasto', compliance: 90, total: 20, printed: 18 },
        { name: 'Plaza Oeste', compliance: 80, total: 20, printed: 16 },
        { name: 'Palermol', compliance: 85, total: 20, printed: 17 },
        { name: 'San Justo', compliance: 95, total: 20, printed: 19 },
        { name: 'Alto Avellaneda', compliance: 88, total: 20, printed: 18 },
        { name: 'Portal Palermo', compliance: 92, total: 20, printed: 18 },
        { name: 'Plaza Liniers', compliance: 85, total: 20, printed: 17 },
        
        // Regiones
        { name: 'Zona Norte', compliance: 93, total: 45, printed: 42 },
        { name: 'Zona Sur', compliance: 88, total: 40, printed: 35 },
        { name: 'Zona Oeste', compliance: 91, total: 35, printed: 32 },
        { name: 'CABA', compliance: 94, total: 50, printed: 47 },
        { name: 'Pilar', compliance: 89, total: 25, printed: 22 },
        { name: 'Escobar', compliance: 87, total: 20, printed: 17 },
        { name: 'Tigre', compliance: 90, total: 25, printed: 23 },
        { name: 'Moreno', compliance: 85, total: 20, printed: 17 },
        { name: 'Lomas de Zamora', compliance: 92, total: 30, printed: 28 },
        { name: 'Quilmes', compliance: 86, total: 25, printed: 22 }
      ]
    },
    'Black Friday': {
      stores: [
        // Centros Comerciales
        { name: 'Unicenter', compliance: 93, total: 15, printed: 14 },
        { name: 'DOT Baires', compliance: 87, total: 15, printed: 13 },
        { name: 'Abasto', compliance: 100, total: 15, printed: 15 },
        { name: 'Plaza Oeste', compliance: 80, total: 15, printed: 12 },
        { name: 'Palermol', compliance: 93, total: 15, printed: 14 },
        { name: 'San Justo', compliance: 87, total: 15, printed: 13 },
        { name: 'Alto Avellaneda', compliance: 91, total: 15, printed: 14 },
        { name: 'Portal Palermo', compliance: 89, total: 15, printed: 13 },
        { name: 'Plaza Liniers', compliance: 86, total: 15, printed: 13 },
        
        // Regiones
        { name: 'Zona Norte', compliance: 95, total: 35, printed: 33 },
        { name: 'Zona Sur', compliance: 91, total: 35, printed: 32 },
        { name: 'Zona Oeste', compliance: 89, total: 35, printed: 31 },
        { name: 'CABA', compliance: 97, total: 35, printed: 34 },
        { name: 'Pilar', compliance: 86, total: 35, printed: 30 },
        { name: 'Escobar', compliance: 89, total: 35, printed: 31 },
        { name: 'Tigre', compliance: 91, total: 35, printed: 32 },
        { name: 'Moreno', compliance: 83, total: 35, printed: 29 },
        { name: 'Lomas de Zamora', compliance: 94, total: 35, printed: 33 },
        { name: 'Quilmes', compliance: 89, total: 35, printed: 31 }
      ]
    },
    'Cyber Monday': {
      stores: [
        // Centros Comerciales
        { name: 'Unicenter', compliance: 96, total: 25, printed: 24 },
        { name: 'DOT Baires', compliance: 92, total: 25, printed: 23 },
        { name: 'Abasto', compliance: 88, total: 25, printed: 22 },
        { name: 'Plaza Oeste', compliance: 84, total: 25, printed: 21 },
        { name: 'Palermol', compliance: 96, total: 25, printed: 24 },
        { name: 'San Justo', compliance: 92, total: 25, printed: 23 },
        { name: 'Alto Avellaneda', compliance: 94, total: 25, printed: 24 },
        { name: 'Portal Palermo', compliance: 90, total: 25, printed: 23 },
        { name: 'Plaza Liniers', compliance: 88, total: 25, printed: 22 },
        
        // Regiones
        { name: 'Zona Norte', compliance: 97, total: 40, printed: 39 },
        { name: 'Zona Sur', compliance: 93, total: 40, printed: 37 },
        { name: 'Zona Oeste', compliance: 90, total: 40, printed: 36 },
        { name: 'CABA', compliance: 95, total: 40, printed: 38 },
        { name: 'Pilar', compliance: 88, total: 40, printed: 35 },
        { name: 'Escobar', compliance: 91, total: 40, printed: 36 },
        { name: 'Tigre', compliance: 93, total: 40, printed: 37 },
        { name: 'Moreno', compliance: 85, total: 40, printed: 34 },
        { name: 'Lomas de Zamora', compliance: 92, total: 40, printed: 37 },
        { name: 'Quilmes', compliance: 89, total: 40, printed: 36 }
      ]
    },
    'Hot Sale': {
      stores: [
        // Centros Comerciales
        { name: 'Unicenter', compliance: 89, total: 30, printed: 27 },
        { name: 'DOT Baires', compliance: 93, total: 30, printed: 28 },
        { name: 'Abasto', compliance: 87, total: 30, printed: 26 },
        { name: 'Plaza Oeste', compliance: 90, total: 30, printed: 27 },
        { name: 'Palermol', compliance: 87, total: 30, printed: 26 },
        { name: 'San Justo', compliance: 93, total: 30, printed: 28 },
        { name: 'Alto Avellaneda', compliance: 91, total: 30, printed: 27 },
        { name: 'Portal Palermo', compliance: 88, total: 30, printed: 26 },
        { name: 'Plaza Liniers', compliance: 85, total: 30, printed: 26 },
        
        // Regiones
        { name: 'Zona Norte', compliance: 94, total: 45, printed: 42 },
        { name: 'Zona Sur', compliance: 90, total: 45, printed: 41 },
        { name: 'Zona Oeste', compliance: 88, total: 45, printed: 40 },
        { name: 'CABA', compliance: 96, total: 45, printed: 43 },
        { name: 'Pilar', compliance: 87, total: 45, printed: 39 },
        { name: 'Escobar', compliance: 89, total: 45, printed: 40 },
        { name: 'Tigre', compliance: 92, total: 45, printed: 41 },
        { name: 'Moreno', compliance: 84, total: 45, printed: 38 },
        { name: 'Lomas de Zamora', compliance: 91, total: 45, printed: 41 },
        { name: 'Quilmes', compliance: 88, total: 45, printed: 40 }
      ]
    },
    'Descuentos Bancarios': {
      stores: [
        // Centros Comerciales
        { name: 'Unicenter', compliance: 91, total: 18, printed: 16 },
        { name: 'DOT Baires', compliance: 89, total: 18, printed: 16 },
        { name: 'Abasto', compliance: 94, total: 18, printed: 17 },
        { name: 'Plaza Oeste', compliance: 83, total: 18, printed: 15 },
        { name: 'Palermol', compliance: 89, total: 18, printed: 16 },
        { name: 'San Justo', compliance: 94, total: 18, printed: 17 },
        { name: 'Alto Avellaneda', compliance: 92, total: 18, printed: 17 },
        { name: 'Portal Palermo', compliance: 88, total: 18, printed: 16 },
        { name: 'Plaza Liniers', compliance: 86, total: 18, printed: 15 },
        
        // Regiones
        { name: 'Zona Norte', compliance: 95, total: 25, printed: 24 },
        { name: 'Zona Sur', compliance: 92, total: 25, printed: 23 },
        { name: 'Zona Oeste', compliance: 89, total: 25, printed: 22 },
        { name: 'CABA', compliance: 96, total: 25, printed: 24 },
        { name: 'Pilar', compliance: 88, total: 25, printed: 22 },
        { name: 'Escobar', compliance: 90, total: 25, printed: 23 },
        { name: 'Tigre', compliance: 93, total: 25, printed: 23 },
        { name: 'Moreno', compliance: 85, total: 25, printed: 21 },
        { name: 'Lomas de Zamora', compliance: 91, total: 25, printed: 23 },
        { name: 'Quilmes', compliance: 87, total: 25, printed: 22 }
      ]
    },
    'Ofertas Semanales': {
      stores: [
        // Centros Comerciales
        { name: 'Unicenter', compliance: 95, total: 40, printed: 38 },
        { name: 'DOT Baires', compliance: 88, total: 40, printed: 35 },
        { name: 'Abasto', compliance: 93, total: 40, printed: 37 },
        { name: 'Plaza Oeste', compliance: 85, total: 40, printed: 34 },
        { name: 'Palermol', compliance: 90, total: 40, printed: 36 },
        { name: 'San Justo', compliance: 93, total: 40, printed: 37 },
        { name: 'Alto Avellaneda', compliance: 91, total: 40, printed: 36 },
        { name: 'Portal Palermo', compliance: 89, total: 40, printed: 36 },
        { name: 'Plaza Liniers', compliance: 87, total: 40, printed: 35 },
        
        // Regiones
        { name: 'Zona Norte', compliance: 96, total: 55, printed: 53 },
        { name: 'Zona Sur', compliance: 93, total: 55, printed: 51 },
        { name: 'Zona Oeste', compliance: 91, total: 55, printed: 50 },
        { name: 'CABA', compliance: 97, total: 55, printed: 53 },
        { name: 'Pilar', compliance: 89, total: 55, printed: 49 },
        { name: 'Escobar', compliance: 92, total: 55, printed: 51 },
        { name: 'Tigre', compliance: 94, total: 55, printed: 52 },
        { name: 'Moreno', compliance: 86, total: 55, printed: 47 },
        { name: 'Lomas de Zamora', compliance: 93, total: 55, printed: 51 },
        { name: 'Quilmes', compliance: 90, total: 55, printed: 50 }
      ]
    },
    'Promociones 3x2': {
      stores: [
        // Centros Comerciales
        { name: 'Unicenter', compliance: 92, total: 22, printed: 20 },
        { name: 'DOT Baires', compliance: 86, total: 22, printed: 19 },
        { name: 'Abasto', compliance: 95, total: 22, printed: 21 },
        { name: 'Plaza Oeste', compliance: 82, total: 22, printed: 18 },
        { name: 'Palermol', compliance: 91, total: 22, printed: 20 },
        { name: 'San Justo', compliance: 95, total: 22, printed: 21 },
        { name: 'Alto Avellaneda', compliance: 89, total: 22, printed: 20 },
        { name: 'Portal Palermo', compliance: 86, total: 22, printed: 19 },
        { name: 'Plaza Liniers', compliance: 84, total: 22, printed: 18 },
        
        // Regiones
        { name: 'Zona Norte', compliance: 94, total: 35, printed: 33 },
        { name: 'Zona Sur', compliance: 90, total: 35, printed: 32 },
        { name: 'Zona Oeste', compliance: 87, total: 35, printed: 30 },
        { name: 'CABA', compliance: 95, total: 35, printed: 33 },
        { name: 'Pilar', compliance: 85, total: 35, printed: 30 },
        { name: 'Escobar', compliance: 88, total: 35, printed: 31 },
        { name: 'Tigre', compliance: 91, total: 35, printed: 32 },
        { name: 'Moreno', compliance: 83, total: 35, printed: 29 },
        { name: 'Lomas de Zamora', compliance: 89, total: 35, printed: 31 },
        { name: 'Quilmes', compliance: 86, total: 35, printed: 30 }
      ]
    }
  }
};

// Primero, definir el componente GaugeChart
interface GaugeChartProps {
  value: number;
  total: number;
  printed: number;
  size?: number;
}

const GaugeChart: React.FC<GaugeChartProps> = ({ value, total, printed, size = 300 }) => {
  const data = [{ value: value }, { value: 100 - value }];
  const color = getComplianceColorHex(value);

  return (
    <div className="relative flex flex-col items-center">
      <PieChart width={size} height={size/1.6}>
        <defs>
          <linearGradient id="gaugeGradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={color[0]} stopOpacity={0.8} />
            <stop offset="50%" stopColor={color[1]} stopOpacity={0.9} />
            <stop offset="100%" stopColor={color[2]} stopOpacity={1} />
          </linearGradient>
        </defs>
        <Pie
          data={data}
          cx={size/2}
          cy={size/1.6}
          startAngle={180}
          endAngle={0}
          innerRadius={size*0.38}
          outerRadius={size*0.42}
          cornerRadius={6}
          paddingAngle={0}
          dataKey="value"
          stroke="none"
          isAnimationActive={true}
          animationDuration={1000}
        >
          <Cell fill="url(#gaugeGradient)" />
          <Cell fill="#f3f4f6" />
        </Pie>
        <text
          x={size/2}
          y={size/1.6 - size*0.08}
          textAnchor="middle"
          fill={color[0]}
          className="text-5xl font-bold"
        >
          {value}%
        </text>
        <text
          x={size/2}
          y={size/1.6 + size*0.08}
          textAnchor="middle"
          fill="#6B7280"
          className="text-sm"
        >
          {printed} de {total} impresos
        </text>
      </PieChart>
    </div>
  );
};

// Modificar el PrintComplianceChart para manejar datos por sucursal
const PrintComplianceChart: React.FC<{
  locationId: string;
  selectedPromotion: string;
  selectedCompany: string;
  userEmail?: string;
  className?: string;
}> = ({ locationId, selectedPromotion, selectedCompany, userEmail, className }) => {
  const location = locationId === 'all' ? null : LOCATIONS.find(loc => loc.id === locationId);
  const isPilar = isPilarUser(userEmail);

  // Obtener datos según la promoción y ubicación seleccionada
  const complianceData = React.useMemo(() => {
    let data = selectedPromotion === 'all' 
      ? STORE_COMPLIANCE_DATA.all.stores
      : STORE_COMPLIANCE_DATA.promotions[selectedPromotion as keyof typeof STORE_COMPLIANCE_DATA.promotions].stores;

    // Filtrar por empresas habilitadas
    const companyIdMap: { [key: string]: string } = {
      'easy': '20',
      'jumbo': '17',
      'disco': '18',
      'vea': '19'
    };
    
    data = data.filter(store => {
      const storeLocation = LOCATIONS.find(loc => 
        loc.name.toLowerCase() === store.name.toLowerCase()
      );
      
      if (storeLocation) {
        const companyLower = storeLocation.company.toLowerCase();
        const companyId = companyIdMap[companyLower];
        
        // Si la empresa tiene un ID mapeado, verificar si está habilitada
        if (companyId && !isCompanyEnabled(companyId)) {
          return false;
        }
      }
      
      return true;
    });

    // Filtrar por empresa si está seleccionada
    if (selectedCompany !== 'all') {
      data = data.filter(store => {
        const storeLocation = LOCATIONS.find(loc => 
          loc.name.toLowerCase() === store.name.toLowerCase()
        );
        return storeLocation?.company.toLowerCase() === selectedCompany.toLowerCase();
      });
    }

    // Filtrar por ubicación específica si está seleccionada
    if (locationId !== 'all' && location) {
      data = data.filter(store => 
        store.name.toLowerCase() === location.name.toLowerCase()
      );
      
      // Si no hay datos para esta ubicación, crear un registro vacío
      if (data.length === 0) {
        return [{
          name: location.name,
          compliance: 0,
          total: 0,
          printed: 0
        }];
      }
    }

    return data;
  }, [selectedPromotion, selectedCompany, locationId, location, isPilar]);

  // Calcular totales para el gauge
  const totals = React.useMemo(() => {
    const total = complianceData.reduce((acc, store) => acc + store.total, 0);
    const printed = complianceData.reduce((acc, store) => acc + store.printed, 0);
    const compliance = total > 0 ? Math.round((printed / total) * 100) : 0;
    return { total, printed, compliance };
  }, [complianceData]);

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900">
            Cumplimiento de Impresión por Sucursal
          </h3>
          <p className="text-sm text-gray-500">
            {location ? location.name : 'Todas las sucursales'} - {selectedPromotion === 'all' ? 'General' : selectedPromotion}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {selectedPromotion !== 'all' ? (
          <>
            {/* Gráfico gauge para promoción específica */}
            <div className="flex items-center justify-center">
              <GaugeChart 
                value={totals.compliance}
                total={totals.total}
                printed={totals.printed}
                size={300}
              />
            </div>

            {/* Gráfico de barras pequeño */}
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={complianceData}
                  layout="vertical"
                  margin={{ top: 10, right: 30, left: 100, bottom: 10 }}
                >
                  <defs>
                    {complianceData.map((entry, index) => {
                      const colors = getComplianceColorHex(entry.compliance);
                      return (
                        <linearGradient
                          key={`gradient-${index}`}
                          id={`gradient-${index}`}
                          x1="0"
                          y1="0"
                          x2="1"
                          y2="0"
                        >
                          <stop offset="0%" stopColor={colors[0]} stopOpacity={0.8} />
                          <stop offset="50%" stopColor={colors[1]} stopOpacity={0.9} />
                          <stop offset="100%" stopColor={colors[2]} stopOpacity={1} />
                        </linearGradient>
                      );
                    })}
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis type="number" domain={[0, 100]} unit="%" />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    width={100}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        // Encontrar la ubicación y su empresa correspondiente
                        const storeLocation = LOCATIONS.find(loc => 
                          loc.name.toLowerCase() === data.name.toLowerCase()
                        );
                        const companyLogo = storeLocation ? LOGOS[storeLocation.company.toLowerCase() as keyof typeof LOGOS] : '';

                        return (
                          <div className="bg-white/90 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-gray-100/50">
                            <div className="flex items-center gap-3 mb-3 pb-2 border-b border-gray-100/50">
                              {companyLogo && (
                                <div className="relative w-12 h-12 flex items-center justify-center">
                                  <div className="absolute inset-0 bg-gradient-to-br from-white/80 to-gray-50/80 rounded-lg" />
                                  <img 
                                    src={companyLogo}
                                    alt={storeLocation?.company}
                                    className="w-10 h-10 object-contain relative z-10"
                                  />
                                </div>
                              )}
                              <div>
                                <p className="font-medium text-gray-900">{data.name}</p>
                                <p className="text-sm text-gray-500">{storeLocation?.company}</p>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Cumplimiento:</span>
                                <span className={`font-medium ${
                                  data.compliance >= 90 ? 'text-indigo-600' :
                                  data.compliance >= 80 ? 'text-violet-600' :
                                  'text-red-600'
                                }`}>
                                  {data.compliance}%
                                </span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Impresos:</span>
                                <span className="font-medium text-gray-900">
                                  {data.printed} de {data.total}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                    cursor={{ 
                      stroke: '#9CA3AF', 
                      strokeWidth: 1,
                      strokeDasharray: '5 5'
                    }}
                    wrapperStyle={{ 
                      outline: 'none',
                      filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))'
                    }}
                  />
                  <Bar 
                    dataKey="compliance" 
                    radius={[0, 4, 4, 0]}
                    animationDuration={1000}
                    isAnimationActive={true}
                  >
                    {complianceData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={`url(#gradient-${index})`}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>
        ) : (
          // Gráfico original para vista general
          <div className="h-[400px] col-span-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={complianceData}
                layout="vertical"
                margin={{ top: 10, right: 30, left: 100, bottom: 10 }}
              >
                <defs>
                  {complianceData.map((entry, index) => {
                    const colors = getComplianceColorHex(entry.compliance);
                    return (
                      <linearGradient
                        key={`gradient-${index}`}
                        id={`gradient-${index}`}
                        x1="0"
                        y1="0"
                        x2="1"
                        y2="0"
                      >
                        <stop offset="0%" stopColor={colors[0]} stopOpacity={0.8} />
                        <stop offset="50%" stopColor={colors[1]} stopOpacity={0.9} />
                        <stop offset="100%" stopColor={colors[2]} stopOpacity={1} />
                      </linearGradient>
                    );
                  })}
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis type="number" domain={[0, 100]} unit="%" />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  width={100}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      // Encontrar la ubicación y su empresa correspondiente
                      const storeLocation = LOCATIONS.find(loc => 
                        loc.name.toLowerCase() === data.name.toLowerCase()
                      );
                      const companyLogo = storeLocation ? LOGOS[storeLocation.company.toLowerCase() as keyof typeof LOGOS] : '';

                      return (
                        <div className="bg-white/90 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-gray-100/50">
                          <div className="flex items-center gap-3 mb-3 pb-2 border-b border-gray-100/50">
                            {companyLogo && (
                              <div className="relative w-12 h-12 flex items-center justify-center">
                                <div className="absolute inset-0 bg-gradient-to-br from-white/80 to-gray-50/80 rounded-lg" />
                                <img 
                                  src={companyLogo}
                                  alt={storeLocation?.company}
                                  className="w-10 h-10 object-contain relative z-10"
                                />
                              </div>
                            )}
                            <div>
                              <p className="font-medium text-gray-900">{data.name}</p>
                              <p className="text-sm text-gray-500">{storeLocation?.company}</p>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">Cumplimiento:</span>
                              <span className={`font-medium ${
                                data.compliance >= 90 ? 'text-indigo-600' :
                                data.compliance >= 80 ? 'text-violet-600' :
                                'text-red-600'
                              }`}>
                                {data.compliance}%
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">Impresos:</span>
                              <span className="font-medium text-gray-900">
                                {data.printed} de {data.total}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                  cursor={{ 
                    stroke: '#9CA3AF', 
                    strokeWidth: 1,
                    strokeDasharray: '5 5'
                  }}
                  wrapperStyle={{ 
                    outline: 'none',
                    filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))'
                  }}
                />
                <Bar 
                  dataKey="compliance" 
                  radius={[0, 4, 4, 0]}
                  animationDuration={1000}
                  isAnimationActive={true}
                >
                  {complianceData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={`url(#gradient-${index})`}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
};

// Definir la estructura de las opciones de empresa
const COMPANY_OPTIONS = [
  { value: 'all', label: '', logo: null },
  { value: 'easy', label: 'Easy', logo: LOGOS.easy },
  { value: 'jumbo', label: 'Jumbo', logo: LOGOS.jumbo },
  { value: 'disco', label: 'Disco', logo: LOGOS.disco },
  { value: 'vea', label: 'Vea', logo: LOGOS.vea },
];

// Modificar el componente CompanyButton
const CompanyButton: React.FC<{
  company: { value: string; label: string; logo: string | null };
  isSelected: boolean;
  onClick: () => void;
}> = ({ company, isSelected, onClick }) => {
  const [isSpinning, setIsSpinning] = useState(false);

  const handleClick = () => {
    setIsSpinning(true);
    onClick();
    setTimeout(() => setIsSpinning(false), 500);
  };

  return (
    <button
      onClick={handleClick}
      className={`relative flex items-center justify-center p-5 rounded-xl transition-all duration-200
        ${isSelected 
          ? 'bg-white/30 shadow-lg scale-105 ring-2 ring-indigo-500/50 after:absolute after:inset-0 after:rounded-xl after:shadow-[0_0_15px_rgba(99,102,241,0.5)] after:animate-pulse' 
          : 'bg-white/10 hover:bg-white/15 hover:scale-105'
        }
      `}
    >
      {company.logo ? (
        <img 
          src={company.logo}
          alt={company.label}
          className={`w-12 h-12 object-contain transition-transform duration-500
            ${isSpinning ? 'rotate-360' : ''}
          `}
          style={{
            transform: isSpinning ? 'rotate(360deg)' : 'rotate(0deg)'
          }}
        />
      ) : (
        <div className="w-10 h-10 flex items-center justify-center text-gray-600 font-medium">
          Todas
        </div>
      )}
      <span className={`absolute -bottom-5 text-xs font-medium
        ${isSelected ? 'text-indigo-600 font-semibold' : 'text-gray-600'}`}>
        {company.label}
      </span>
    </button>
  );
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
  onAnalytics,
  onDigitalPoster
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
    carteles: {
      total: 856,
      fisicos: 650,
      digitales: 206,
      playlists: 45,
      lastWeek: 28
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

  // Agregar estados para los filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCompany, setSelectedCompany] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [selectedPromotion, setSelectedPromotion] = useState('all');

  const [showNewsModal, setShowNewsModal] = useState(() => {
    // Verificar si es la primera vez que el usuario inicia sesión en esta sesión
    const hasSeenNews = localStorage.getItem('hasSeenNews');
    return !hasSeenNews;
  });

  const handleCloseNewsModal = () => {
    setShowNewsModal(false);
    // Guardar en localStorage que el usuario ya vio las novedades
    localStorage.setItem('hasSeenNews', 'true');
  };

  // Filtrar empresas habilitadas para mostrar en los botones
  const filteredCompanyOptions = useMemo(() => {
    return COMPANY_OPTIONS.filter(company => {
      // Siempre mostrar "Todas"
      if (company.value === 'all') {
        return true;
      }
      
      // Mapear el valor del botón al empresaId en localStorage
      // Los valores son: 'easy', 'jumbo', 'disco', 'vea'
      // Los empresaId son: 20, 17, 18, 19
      const companyIdMap: { [key: string]: string } = {
        'easy': '20',    // Easy (MDH)
        'jumbo': '17',   // Jumbo
        'disco': '18',   // Disco
        'vea': '19'      // Vea
      };
      
      const companyId = companyIdMap[company.value];
      if (!companyId) return true; // Si no está en el mapa, mostrar por defecto
      
      // Verificar si la empresa está habilitada usando su ID
      return isCompanyEnabled(companyId);
    });
  }, []);

  // Filtrar las actividades basado en el usuario
  const filteredActivities = React.useMemo(() => {
    return activities.filter(activity => {
      // Filtro por empresas habilitadas
      const companyIdMap: { [key: string]: string } = {
        'easy': '20',
        'jumbo': '17',
        'disco': '18',
        'vea': '19'
      };
      
      const companyLower = activity.company.toLowerCase();
      const companyId = companyIdMap[companyLower];
      
      // Si la empresa tiene un ID mapeado, verificar si está habilitada
      if (companyId && !isCompanyEnabled(companyId)) {
        return false;
      }
      
      // Filtro por usuario Pilar
      if (isPilarUser(userEmail) && !activity.locations.some(loc => 
        loc.name.toLowerCase().includes('pilar'))) {
        return false;
      }

      // Filtro por búsqueda
      if (searchTerm && !activity.title.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }

      // Filtro por empresa
      if (selectedCompany !== 'all' && activity.company.toLowerCase() !== selectedCompany) {
        return false;
      }

      // Filtro por promoción
      if (selectedPromotion !== 'all' && !activity.title.includes(selectedPromotion)) {
        return false;
      }

      // Filtro por sucursal
      if (selectedLocation !== 'all') {
        const location = LOCATIONS.find(loc => loc.id === selectedLocation);
        if (!location) return false;
        
        const matchesLocation = activity.locations.some(loc => 
          loc.name.toLowerCase().includes(location.name.toLowerCase())
        );
        if (!matchesLocation) return false;
      }

      // Filtro por estado
      if (selectedStatus !== 'all') {
        if (selectedStatus === 'printed' && activity.printStatus !== 'printed') return false;
        if (selectedStatus === 'pending' && activity.printStatus !== 'not_printed') return false;
      }

      return true;
    });
  }, [activities, userEmail, searchTerm, selectedCompany, selectedPromotion, selectedLocation, selectedStatus]);

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

  // Modificar el estilo base de los filtros
  const filterBaseStyle = `
    flex-1 px-4 py-2.5
    bg-white/10 backdrop-blur-md
    border border-white/20
    rounded-xl
    text-sm text-gray-700
    transition-all duration-200
    hover:bg-white/20
    focus:outline-none
    focus:ring-2 focus:ring-white/30
    focus:border-transparent
    appearance-none
    bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNNy40MSA4LjU5TDEyIDEzLjE3bDQuNTktNC41OEwxOCAxMGwtNiA2LTYtNiAxLjQxLTEuNDF6IiBmaWxsPSJjdXJyZW50Q29sb3IiLz48L3N2Zz4=')] 
    bg-[length:16px_16px] 
    bg-no-repeat 
    bg-[right_12px_center]
    min-w-[160px]
    [&>option]:bg-white
    [&>option]:text-gray-700
    [&>optgroup]:bg-white
    [&>optgroup]:text-gray-700
    [&>optgroup>option]:pl-6
    [&>option]:flex
    [&>option]:items-center
    [&>option]:gap-2
    [&>option]:py-2
    [&>option]:px-4
    [&>option]:bg-no-repeat
    [&>option]:bg-[length:20px]
    [&>option]:bg-[12px_center]
  `;

  const handleLogoutClick = () => {
    if (window.confirm('¿Estás seguro de que deseas cerrar sesión?')) {
      // Limpiar el estado de las novedades al cerrar sesión
      localStorage.removeItem('hasSeenNews');
      onLogout();
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header onBack={onBack} onLogout={handleLogoutClick} onSettings={onSettings} />
      
      {/* Agregar el Modal de Novedades */}
      <NewsModal 
        isOpen={showNewsModal}
        onClose={handleCloseNewsModal}
      />

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
          <div className="text-center mb-12">
            <span className="text-4xl font-bold text-gray-900">
              Bienvenido a{' '}
            </span>
            <span className="bg-gradient-to-r from-orange-500 via-orange-600 to-amber-600 bg-clip-text text-transparent">
              Smart
            </span>
            <span className="bg-gradient-to-r from-gray-600 to-gray-700 bg-clip-text text-transparent">
              {' '}Digital Signage
            </span>
            <span className="text-4xl font-bold text-gray-900">
              {' '}👋
            </span>
            <p className="text-gray-600 mt-2"></p>
          </div>
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
            Todos los carteles físicos y digitales en un solo lugar.
          </p>
        </motion.div>

        {/* Action Buttons Section */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-8 lg:gap-12 mb-8 sm:mb-12 py-6 sm:py-12 px-4">
          {/* Botón de Productos - Siempre activo para easypilar */}
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
            className="group flex flex-col items-center w-56 px-8 py-8 rounded-3xl
              bg-gradient-to-br from-white to-gray-50 border-gray-100 shadow-[0_0_20px_rgba(0,0,0,0.1)]
              transition-all duration-300"
          >
            <div className="mb-4 p-4 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600
              transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
              <Package2 className="w-10 h-10 text-white" />
            </div>
            <span className="text-xl font-semibold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              Productos
            </span>
          </motion.button>

          {/* Botón de Promociones - Siempre activo para easypilar */}
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
            className="group flex flex-col items-center w-56 px-8 py-8 rounded-3xl
              bg-gradient-to-br from-white to-gray-50 border-gray-100 shadow-[0_0_20px_rgba(0,0,0,0.1)]
              transition-all duration-300"
          >
            <div className="mb-4 p-4 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600
              transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
              <Tags className="w-10 h-10 text-white" />
            </div>
            <span className="text-xl font-semibold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              Promociones
            </span>
          </motion.button>

          {/* Botón de Cartel */}
          <motion.button
            whileHover={!isEasyPilarUser(userEmail) ? { scale: 1.05 } : {}}
            whileTap={!isEasyPilarUser(userEmail) ? { scale: 0.95 } : {}}
            onClick={!isEasyPilarUser(userEmail) ? onNewPoster : undefined}
            className={`group flex flex-col items-center w-56 px-8 py-8 rounded-3xl
              ${!isEasyPilarUser(userEmail)
                ? 'bg-gradient-to-br from-violet-500 to-violet-600 text-white hover:shadow-[0_0_35px_rgba(139,92,246,0.4)]'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
            disabled={isEasyPilarUser(userEmail)}
          >
            <div className={`mb-4 p-4 rounded-2xl ${
              !isEasyPilarUser(userEmail)
                ? 'bg-white/20 transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300'
                : 'bg-gray-300'
            }`}>
              <FileText className={`w-10 h-10 ${!isEasyPilarUser(userEmail) ? 'text-white' : 'text-gray-400'}`} />
            </div>
            <span className="text-xl font-semibold">
              Cartel
            </span>
          </motion.button>

          {/* Botón de Cartel Digital */}
          <motion.button
            whileHover={!isEasyPilarUser(userEmail) ? { scale: 1.05 } : {}}
            whileTap={!isEasyPilarUser(userEmail) ? { scale: 0.95 } : {}}
            onClick={!isEasyPilarUser(userEmail) ? onDigitalPoster : undefined}
            className={`group flex flex-col items-center w-56 px-8 py-8 rounded-3xl
              ${!isEasyPilarUser(userEmail)
                ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white hover:shadow-[0_0_35px_rgba(16,185,129,0.4)]'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
            disabled={isEasyPilarUser(userEmail)}
          >
            <div className={`mb-4 p-4 rounded-2xl ${
              !isEasyPilarUser(userEmail)
                ? 'bg-white/20 transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300'
                : 'bg-gray-300'
            }`}>
              <Monitor className={`w-10 h-10 ${!isEasyPilarUser(userEmail) ? 'text-white' : 'text-gray-400'}`} />
            </div>
            <span className="text-xl font-semibold">
              Cartel Digital
            </span>
          </motion.button>

          {/* Botón de Builder */}
          <motion.button
            whileHover={!isEasyPilarUser(userEmail) ? { scale: 1.05 } : {}}
            whileTap={!isEasyPilarUser(userEmail) ? { scale: 0.95 } : {}}
            onClick={!isEasyPilarUser(userEmail) ? onNewTemplate : undefined}
            className={`group flex flex-col items-center w-56 px-8 py-8 rounded-3xl
              ${!isEasyPilarUser(userEmail)
                ? 'bg-gradient-to-br from-white to-gray-100 border border-gray-200 shadow-[0_0_20px_rgba(0,0,0,0.1)] hover:shadow-lg'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
            disabled={isEasyPilarUser(userEmail)}
          >
            <div className={`mb-4 p-4 rounded-2xl ${
              !isEasyPilarUser(userEmail)
                ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300'
                : 'bg-gray-300'
            }`}>
              <LayoutTemplate className={`w-10 h-10 ${!isEasyPilarUser(userEmail) ? 'text-white' : 'text-gray-400'}`} />
            </div>
            <span className={`text-xl font-semibold ${!isEasyPilarUser(userEmail) ? 'bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent' : ''}`}>
              Builder
            </span>
          </motion.button>

          {/* Botón de Config */}
          <motion.button
            whileHover={!isEasyPilarUser(userEmail) ? { scale: 1.05 } : {}}
            whileTap={!isEasyPilarUser(userEmail) ? { scale: 0.95 } : {}}
            onClick={!isEasyPilarUser(userEmail) ? onSettings : undefined}
            className={`group flex flex-col items-center w-56 px-8 py-8 rounded-3xl
              ${!isEasyPilarUser(userEmail)
                ? 'bg-gradient-to-br from-white to-gray-100 border border-gray-200 shadow-[0_0_20px_rgba(0,0,0,0.1)] hover:shadow-lg'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
            disabled={isEasyPilarUser(userEmail)}
          >
            <div className={`mb-4 p-4 rounded-2xl ${
              !isEasyPilarUser(userEmail)
                ? 'bg-gradient-to-br from-yellow-500 to-yellow-600 transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300'
                : 'bg-gray-300'
            }`}>
              <Settings className={`w-10 h-10 ${!isEasyPilarUser(userEmail) ? 'text-white' : 'text-gray-400'}`} />
            </div>
            <span className={`text-xl font-semibold ${!isEasyPilarUser(userEmail) ? 'bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent' : ''}`}>
              Config
            </span>
          </motion.button>

          {/* Botón de Analítica */}
          <motion.button
            whileHover={!isEasyPilarUser(userEmail) ? { scale: 1.05 } : {}}
            whileTap={!isEasyPilarUser(userEmail) ? { scale: 0.95 } : {}}
            onClick={!isEasyPilarUser(userEmail) ? onAnalytics : undefined}
            className={`group flex flex-col items-center w-56 px-8 py-8 rounded-3xl
              ${!isEasyPilarUser(userEmail)
                ? 'bg-gradient-to-br from-white to-gray-100 border border-gray-200 shadow-[0_0_20px_rgba(0,0,0,0.1)] hover:shadow-lg'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
            disabled={isEasyPilarUser(userEmail)}
          >
            <div className={`mb-4 p-4 rounded-2xl ${
              !isEasyPilarUser(userEmail)
                ? 'bg-gradient-to-br from-purple-500 to-purple-600 transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300'
                : 'bg-gray-300'
            }`}>
              <BarChart3 className={`w-10 h-10 ${!isEasyPilarUser(userEmail) ? 'text-white' : 'text-gray-400'}`} />
            </div>
            <span className={`text-xl font-semibold ${!isEasyPilarUser(userEmail) ? 'bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent' : ''}`}>
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

          {/* Templates Stats - Reemplazar por Carteles Stats */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className={`rounded-xl p-6 transition-colors border
              bg-white border-slate-200 shadow-lg`}
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 
                            flex items-center justify-center shadow-lg shadow-violet-500/20">
                <Monitor className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className={`text-lg font-medium text-slate-900 flex items-center gap-2`}>
                  Carteles
                  <span className="text-xs px-2 py-0.5 bg-violet-100 text-violet-600 rounded-full">
                    Físicos y Digitales
                  </span>
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
                    {stats.carteles.total}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={`text-slate-500`}>Físicos</span>
                  <span className="text-slate-900">
                    {stats.carteles.fisicos}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={`text-slate-500`}>Digitales</span>
                  <span className="text-slate-900">
                    {stats.carteles.digitales}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={`text-slate-500`}>Playlists</span>
                  <span className="text-slate-900">
                    {stats.carteles.playlists}
                  </span>
                </div>
              </div>
              <div className={`text-sm text-slate-500`}>
                <span className="text-emerald-400">+{stats.carteles.lastWeek}</span> nuevos esta semana
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Filtros y búsqueda */}
        <div className="mb-8 backdrop-blur-sm bg-white/20 rounded-2xl border border-gray-100/20 shadow-lg shadow-gray-100/10">
          <div className="px-6 py-3 border-b border-gray-100/20">
            <h3 className="text-sm font-medium text-gray-900">Filtros de búsqueda</h3>
          </div>

          <div className="p-4">
            <div className="flex flex-col gap-4">
              {/* Fila de botones de empresas */}
              <div className="flex items-center gap-4 pb-6 pt-2">
                {filteredCompanyOptions.map(company => (
                  <CompanyButton
                    key={company.value}
                    company={company}
                    isSelected={selectedCompany === company.value}
                    onClick={() => setSelectedCompany(company.value)}
                  />
                ))}
              </div>

              {/* Resto de los filtros */}
              <div className="flex items-center gap-4 overflow-x-auto pb-2 scrollbar-hide">
                {/* Búsqueda */}
                <div className="relative group flex-1">
                  <Search className="w-5 h-5 text-gray-400/70 absolute left-3 top-1/2 -translate-y-1/2 
                           transition-colors group-hover:text-indigo-500" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar actividad..."
                    className={`w-full pl-10 pr-4 ${filterBaseStyle}`}
                  />
                </div>

                {/* Promociones */}
                <select
                  value={selectedPromotion}
                  onChange={(e) => setSelectedPromotion(e.target.value)}
                  className={filterBaseStyle}
                >
                  <option value="all" className="py-2 px-4 hover:bg-white/20">Todas las promociones</option>
                  {Object.keys(STORE_COMPLIANCE_DATA.promotions).map(promo => (
                    <option key={promo} value={promo} className="py-2 px-4 hover:bg-white/20">
                      {promo}
                    </option>
                  ))}
                </select>

                {/* Sucursales */}
                <select 
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className={filterBaseStyle}
                >
                  <option value="all">Todas las sucursales</option>
                  <optgroup label="Centros Comerciales">
                    {LOCATIONS
                      .filter(loc => loc.type === 'CC')
                      .filter(loc => selectedCompany === 'all' || loc.company.toLowerCase() === selectedCompany)
                      .map(location => (
                        <option key={location.id} value={location.id}>
                          {location.name} ({location.company})
                        </option>
                      ))
                    }
                  </optgroup>
                  <optgroup label="Regiones">
                    {LOCATIONS
                      .filter(loc => loc.type === 'Region')
                      .filter(loc => selectedCompany === 'all' || loc.company.toLowerCase() === selectedCompany)
                      .map(location => (
                        <option key={location.id} value={location.id}>
                          {location.name} ({location.company})
                        </option>
                      ))
                    }
                  </optgroup>
                </select>

                {/* Estado */}
                <select 
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className={filterBaseStyle}
                >
                  <option value="all">Todos los estados</option>
                  <option value="printed">Impreso</option>
                  <option value="pending">Pendiente</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Gráfico de cumplimiento siempre visible */}
        <div className="mb-6">
          <PrintComplianceChart 
            locationId={selectedLocation}
            selectedPromotion={selectedPromotion}
            selectedCompany={selectedCompany}
            userEmail={userEmail}
            className="mx-2 md:mx-0"
          />
        </div>

        {/* Recent Activity */}
        <div className="mt-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="rounded-xl border overflow-hidden backdrop-blur-sm bg-white/50 border-gray-200 mx-2 md:mx-0"
          >
            {/* Header de la sección */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-50 rounded-lg">
                  <Clock className="w-5 h-5 text-indigo-500" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {isPilarUser(userEmail) ? 'Actividad Reciente - Pilar' : 'Actividad Reciente'}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {isPilarUser(userEmail) 
                      ? 'Seguimiento de las últimas actualizaciones en sucursales de Pilar'
                      : 'Seguimiento de las últimas actualizaciones y cambios'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className={`px-3 py-1.5 rounded-full text-sm font-medium
                  ${userRole === 'admin' 
                    ? 'bg-indigo-100 text-indigo-800' 
                    : 'bg-yellow-100 text-yellow-800'}`}
                >
                  {filteredPlantillas.filter(p => p.estado === 'no_impreso').length} pendientes
                </div>
                
                <button className="text-sm text-indigo-600 hover:text-indigo-700 font-medium 
                        transition-colors duration-200 flex items-center gap-2">
                  Ver todo
                  <ArrowLeft className="w-4 h-4 rotate-180" />
                </button>
              </div>
            </div>

            {/* Lista de actividades */}
            <div className="divide-y divide-gray-200">
              {filteredActivities.length > 0 ? (
                <ActivityGroup 
                  date="Hoy"
                  activities={filteredActivities}
                  onPrint={handlePrint}
                />
              ) : (
                <div className="p-12 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <InboxIcon className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-1">
                    No hay actividades recientes
                  </h3>
                  <p className="text-gray-500">
                    Las nuevas actividades aparecerán aquí
                  </p>
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
                        ? 'bg-green-100 text-green-600 border border-green-200' 
                        : 'bg-yellow-100 text-yellow-600 border border-yellow-200'
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

      {/* Agregar el Chatbot */}
      <Chatbot userEmail={userEmail} />
    </div>
  );
}