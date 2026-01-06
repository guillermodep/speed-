import React, { useState, useEffect } from 'react';
import { ArrowLeft, LayoutGrid, List, Minus, Plus, LayoutTemplate, Search } from 'lucide-react';
import { CompanySelect } from './CompanySelect';
import { RegionSelect } from './RegionSelect';
import { LocationSelect } from './LocationSelect';
import { PromotionSelect } from './PromotionSelect';
import { ProductSelect } from './ProductSelect';
import { CategorySelect } from './CategorySelect';
import { PosterPreview } from './PosterPreview';
import { useNavigate } from 'react-router-dom';
import { Header } from '../shared/Header';
import { useTheme } from '../../hooks/useTheme';
import { ProductSelectorModal } from '../Products/ProductSelectorModal';
import { PosterModal } from './PosterModal';
import { COMPANIES } from '../../data/companies';
import { LOCATIONS, REGIONS } from '../../data/locations';
import { LoadingModal } from '../LoadingModal';
import { products } from '../../data/products';
import { SendingModal } from './SendingModal';
import { TemplateSelect } from './TemplateSelect';
import { FinancingModal } from './FinancingModal';
import { CreditCard } from 'lucide-react';
import { POSTER_TEMPLATES } from '../../constants/templates';
import { HeaderProvider } from '../shared/HeaderProvider';
import { toast } from 'react-hot-toast';
import { uploadToBucket } from '../../lib/supabaseClient-carteles';
import domtoimage from 'dom-to-image-improved';
import { Product } from '../../types/product';
import { Promotion } from '../../types/promotion';
import { supabase } from '../../lib/supabaseClient';
import { ExportPoster } from './ExportPoster';
import ReactDOM from 'react-dom/client';
import { FinancingOption } from '../../types/financing';
import { getEmpresas, type Empresa } from '../../lib/supabaseClient-sucursales';
import { FalabellaDebug } from '../Debug/FalabellaDebug';
import { filterEnabledCompanies, initializeCompanySetting } from '../../lib/companySettings';

interface PosterEditorProps {
  onBack: () => void;
  onLogout: () => void;
  initialProducts?: string[];
  initialPromotion?: any;
  userEmail: string;
  userName: string;
}

const PAPER_FORMATS = [
  { id: 'A2', width: '420mm', height: '594mm', name: 'A2 (420 × 594 mm)' },
  { id: 'A3', width: '297mm', height: '420mm', name: 'A3 (297 × 420 mm)' },
  { id: 'A4', width: '210mm', height: '297mm', name: 'A4 (210 × 297 mm)' },
  { id: 'letter', width: '215.9mm', height: '279.4mm', name: 'Carta (215.9 × 279.4 mm)' },
  { id: 'legal', width: '215.9mm', height: '355.6mm', name: 'Legal (215.9 × 355.6 mm)' }
];

const PROMOTIONS: Promotion[] = [
  {
    id: '1',
    title: 'American Express 25% OFF',
    description: 'Comprá cuando quieras y programá tu entrega los días Jueves.',
    discount: '25% OFF',
    imageUrl: 'https://images.unsplash.com/photo-1580828343064-fde4fc206bc6?w=500&auto=format&fit=crop&q=60',
    category: 'Bancaria',
    conditions: ['Tope de reintegro $2000', 'Válido solo los jueves'],
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    bank: 'American Express',
    cardType: 'Todas las tarjetas',
    isActive: true,
    selectedBanks: ['American Express'],
    cardOptions: ['Todas las tarjetas']
  },
  {
    id: '2',
    title: 'Hasta 40% OFF en Especiales de la semana',
    description: 'Descuentos especiales en productos seleccionados',
    discount: 'Hasta 40% OFF',
    imageUrl: 'https://images.unsplash.com/photo-1607082349566-187342175e2f?w=500&auto=format&fit=crop&q=60',
    category: 'Especial',
    conditions: ['Válido solo los jueves'],
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    isActive: true,
    selectedBanks: [],
    cardOptions: []
  },
  {
    id: '3',
    title: 'Tarjeta Cencosud 20% OFF',
    description: 'Realizá tus compras los días Miércoles',
    discount: '20% OFF',
    imageUrl: 'https://images.unsplash.com/photo-1556742502-ec7c0e9f34b1?w=500&auto=format&fit=crop&q=60',
    category: 'Bancaria',
    conditions: ['Válido solo los miércoles'],
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    bank: 'Cencosud',
    isActive: false,
    selectedBanks: ['Cencosud'],
    cardOptions: ['Todas las tarjetas']
  },
  {
    id: '4',
    title: '2do al 70% en Almacén, Bebidas y más',
    description: 'En la segunda unidad de productos seleccionados',
    discount: '70% OFF',
    imageUrl: 'https://images.unsplash.com/photo-1579113800032-c38bd7635818?w=500&auto=format&fit=crop&q=60',
    category: 'Especial',
    conditions: ['Valido solo comprando dos productos iguales el segundo al 70%'],
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    isActive: true,
    selectedBanks: [],
    cardOptions: []
  },
  {
    id: '5',
    title: 'Hasta 35% y Hasta 12 CSI',
    description: 'Descuentos especiales en productos seleccionados con cuotas sin interés',
    discount: '35% OFF',
    imageUrl: 'https://images.unsplash.com/photo-1556742044-3c52d6e88c62?w=500&auto=format&fit=crop&q=60',
    category: 'Bancaria',
    conditions: ['Válido solo los jueves'],
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    bank: 'Banco Nación',
    isActive: true,
    selectedBanks: ['Banco Nación'],
    cardOptions: ['Todas las tarjetas']
  },
  {
    id: '6',
    title: 'Santander 30% OFF',
    description: 'Todos los días con Tarjetas Santander',
    discount: '30% OFF',
    imageUrl: 'https://images.unsplash.com/photo-1556742393-d75f468bfcb0?w=500&auto=format&fit=crop&q=60',
    category: 'Bancaria',
    conditions: ['Válido solo los días'],
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    bank: 'Santander',
    isActive: true,
    selectedBanks: ['Santander'],
    cardOptions: ['Todas las tarjetas']
  },
  {
    id: '7',
    title: 'BBVA 25% OFF',
    description: 'Descuentos exclusivos para clientes BBVA',
    discount: '25% OFF',
    imageUrl: 'https://images.unsplash.com/photo-1556742111-a301076d9d18?w=500&auto=format&fit=crop&q=60',
    category: 'Bancaria',
    conditions: ['Válido solo los jueves'],
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    bank: 'BBVA',
    isActive: true,
    selectedBanks: ['BBVA'],
    cardOptions: ['Todas las tarjetas']
  },
  {
    id: '8',
    title: 'Banco Provincia 30% OFF',
    description: 'Miércoles y Sábados con Banco Provincia',
    discount: '30% OFF',
    imageUrl: 'https://images.unsplash.com/photo-1556741533-6e6a62bd8b49?w=500&auto=format&fit=crop&q=60',
    category: 'Bancaria',
    conditions: ['Válido solo los miércoles y sábados'],
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    bank: 'Banco Provincia',
    isActive: true,
    selectedBanks: ['Banco Provincia'],
    cardOptions: ['Todas las tarjetas']
  },
  {
    id: '9',
    title: 'Banco Nación 25% OFF',
    description: 'Descuentos especiales con Banco Nación',
    discount: '25% OFF',
    imageUrl: 'https://images.unsplash.com/photo-1556742205-e7530469f4eb?w=500&auto=format&fit=crop&q=60',
    category: 'Bancaria',
    conditions: ['Válido solo los jueves'],
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    bank: 'Banco Nación',
    isActive: true,
    selectedBanks: ['Banco Nación'],
    cardOptions: ['Todas las tarjetas']
  },
  {
    id: '10',
    title: '2da Unidad 70% OFF',
    description: 'En la segunda unidad de productos seleccionados',
    discount: '70% OFF',
    imageUrl: 'https://images.unsplash.com/photo-1607082349566-187342175e2f?w=500&auto=format&fit=crop&q=60',
    category: 'Especial',
    conditions: ['Válido en la compra de dos unidades iguales', 'Productos seleccionados'],
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    type: 'second-70',
    isActive: true,
    selectedBanks: [],
    cardOptions: []
  },
  {
    id: '11',
    title: '2x1 en Productos Seleccionados',
    description: 'Llevá 2 y pagá 1 en productos seleccionados',
    discount: '2x1',
    imageUrl: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=500&auto=format&fit=crop&q=60',
    category: 'Especial',
    conditions: ['Válido en productos seleccionados', 'Llevando dos unidades iguales'],
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    type: '2x1',
    isActive: true,
    selectedBanks: [],
    cardOptions: []
  },
  {
    id: '12',
    title: '3x2 en Productos Seleccionados',
    description: 'Llevá 3 y pagá 2 en productos seleccionados',
    discount: '3x2',
    imageUrl: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=500&auto=format&fit=crop&q=60',
    category: 'Especial',
    conditions: ['Válido en productos seleccionados', 'Llevando tres unidades iguales'],
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    type: '3x2',
    isActive: true,
    selectedBanks: [],
    cardOptions: []
  }
];

console.log('Importación de productos:', { products });

// Extraer categorías únicas de los productos
const CATEGORIES = Array.from(new Set(products.map(p => p.category)));
console.log('Categorías encontradas:', CATEGORIES);

const FINANCING_OPTIONS: FinancingOption[] = [
  {
    bank: 'American Express',
    logo: '/images/banks/amex-logo.png',
    cardName: 'American Express',
    cardImage: '/images/banks/amex-logo.png',
    plan: '25% OFF'
  },
  {
    bank: 'Banco Nación',
    logo: '/images/banks/banco-nacion-logo.png',
    cardName: 'Banco Nación',
    cardImage: '/images/banks/banco-nacion-logo.png',
    plan: 'Hasta 12 cuotas sin interés'
  },
  {
    bank: 'Visa',
    logo: '/images/banks/visa-logo.png',
    cardName: 'Visa',
    cardImage: '/images/banks/visa-logo.png',
    plan: 'Hasta 6 cuotas sin interés'
  },
  {
    bank: 'Mastercard',
    logo: '/images/banks/mastercard-logo.png',
    cardName: 'Mastercard',
    cardImage: '/images/banks/mastercard-logo.png',
    plan: 'Hasta 3 cuotas sin interés'
  }
];

// Función para limpiar el texto para el nombre del archivo
const cleanFileName = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[áéíóúñü]/g, c => ({ 'á': 'a', 'é': 'e', 'í': 'i', 'ó': 'o', 'ú': 'u', 'ñ': 'n', 'ü': 'u' })[c] || c)
    .replace(/[^a-z0-9]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
};

export const PosterEditor: React.FC<PosterEditorProps> = ({ 
  onBack, 
  onLogout, 
  initialProducts = [], 
  initialPromotion,
  userEmail,
  userName
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [company, setCompany] = useState('');
  const [promotion, setPromotion] = useState(initialPromotion?.id || '');
  const [selectedProducts, setSelectedProducts] = useState<string[]>(initialProducts);
  const [selectedCategory, setSelectedCategory] = useState('');
  const navigate = useNavigate();
  const [showLogo, setShowLogo] = useState(true);
  const [showPesosCheck, setShowPesosCheck] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isProductSelectorOpen, setIsProductSelectorOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSendingModalOpen, setIsSendingModalOpen] = useState(false);
  const [selectedPoster, setSelectedPoster] = useState<Product | null>(null);
  const [selectedFormat, setSelectedFormat] = useState(PAPER_FORMATS[2]); // A4 por defecto
  const [showFormatSelector, setShowFormatSelector] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [cardSize, setCardSize] = useState(0.85);
  const [isLandscape, setIsLandscape] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [isFinancingModalOpen, setIsFinancingModalOpen] = useState(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [selectedFinancing, setSelectedFinancing] = useState<FinancingOption[]>([]);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<Array<{
    name: string;
    url: string;
    created_at: string;
  }>>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [allPosters, setAllPosters] = useState<Array<{
    name: string;
    url: string;
    created_at: string;
  }>>([]);
  const [empresasFromDB, setEmpresasFromDB] = useState<Empresa[]>([]);;

  console.log('LOCATIONS imported:', LOCATIONS); // Debug
  console.log('COMPANIES imported:', COMPANIES); // Debug
  console.log('Productos disponibles:', products);

  // Limpiar empresa cuando cambia
  const handleCompanyChange = (newCompany: string) => {
    setCompany(newCompany);
  };

  // Filtrar ubicaciones basado en la empresa seleccionada
  const availableRegions = React.useMemo(() => {
    console.log('Calculating regions for company:', company);
    const locations = company && company !== 'no-logo'
      ? LOCATIONS.filter(loc => {
          const matches = loc.id.startsWith(company.toLowerCase());
          console.log(`Checking location ${loc.id} for regions: ${matches}`);
          return matches;
        })
      : LOCATIONS;
      
    const regions = new Set(locations.map(loc => loc.region));
    console.log('Available regions:', regions);
    
    const result = [
      { id: 'todos', name: 'Todas las Regiones' },
      ...REGIONS.filter(r => r.id !== 'todos' && regions.has(r.id))
    ];
    console.log('Final regions list:', result);
    return result;
  }, [company]);

  const selectedPromotion = PROMOTIONS.find(p => p.id === promotion) as Promotion | undefined;

  // Modificar el mapeo de productos para asegurar que tienen todos los campos requeridos
  const mappedProducts = selectedProducts.map(productId => {
    const product = products.find(p => p.id === productId);
    if (product) {
      // Asegurarnos de que el producto tiene todos los campos requeridos
      return {
        ...product,
        description: product.description || product.name,
        sku: product.sku || product.id,
        imageUrl: product.imageUrl || product.image || '',
      } as Product;
    }
    return undefined;
  }).filter((p): p is Product => p !== undefined);

  const handlePrint = () => {
    const printData = {
      products: mappedProducts,
      promotion: selectedPromotion
    };
    navigate('/print-view', { state: printData });
  };

  // Combinar empresas estáticas con empresas de Supabase
  const combinedCompanies = React.useMemo(() => {
    const staticCompanies = COMPANIES;
    
    // Inicializar empresas estáticas en localStorage
    staticCompanies.forEach(company => {
      initializeCompanySetting(String(company.empresaId), company.name);
    });
    
    const dbCompanies = empresasFromDB.map(emp => ({
      id: emp.nombre.toLowerCase().replace(/\s+/g, '-'),
      name: emp.nombre,
      logo: emp.logo || 'https://via.placeholder.com/40',
      empresaId: emp.id
    }));
    
    console.log('🔄 Combinando empresas:');
    console.log('  - Estáticas:', staticCompanies.length, staticCompanies.map(c => c.name));
    console.log('  - De BD:', dbCompanies.length, dbCompanies.map(c => c.name));
    
    // Separar Falabella del resto
    const falabella = dbCompanies.find(c => c.name.toLowerCase() === 'falabella');
    const otherDbCompanies = dbCompanies.filter(c => c.name.toLowerCase() !== 'falabella');
    
    // Combinar: Falabella primero, luego estáticas, luego el resto de BD
    const combined: typeof staticCompanies = [];
    if (falabella) {
      combined.push(falabella);
    }
    combined.push(...staticCompanies);
    otherDbCompanies.forEach(dbComp => {
      if (!combined.find(c => c.name.toLowerCase() === dbComp.name.toLowerCase())) {
        combined.push(dbComp);
      }
    });
    
    console.log('  - Total combinadas:', combined.length, combined.map(c => c.name));
    
    // Filtrar solo empresas habilitadas
    const enabledCompanies = filterEnabledCompanies(combined);
    console.log('  - Empresas habilitadas:', enabledCompanies.length, enabledCompanies.map(c => c.name));
    
    return enabledCompanies;
  }, [empresasFromDB]);

  const companyDetails = combinedCompanies.find(c => c.id === company);
  const empresaId = companyDetails?.empresaId || 0;
  console.log('Company selected:', company);
  console.log('Company details:', companyDetails);
  console.log('Empresa ID:', empresaId);

  const handlePreview = (product: Product) => {
    navigate('/poster-preview', {
      state: {
        product,
        promotion: selectedPromotion,
        company: companyDetails,
        showLogo
      }
    });
  };

  const handleSelectProduct = (productId: string) => {
    setSelectedProducts(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId);
      }
      return [...prev, productId];
    });
  };

  // Cargar empresas desde Supabase
  useEffect(() => {
    const loadEmpresas = async () => {
      try {
        // Primero, intentar inicializar Falabella
        console.log('🔍 Verificando si Falabella existe...');
        const { addFalabellaToDatabase } = await import('../../lib/addFalabellaData');
        
        try {
          const empresasActuales = await getEmpresas();
          const falabellaExists = empresasActuales.some(emp => emp.nombre === 'Falabella');
          
          if (!falabellaExists) {
            console.log('🏢 Falabella no encontrada. Insertando...');
            const result = await addFalabellaToDatabase();
            console.log('📝 Resultado:', result);
          } else {
            console.log('✅ Falabella ya existe');
          }
        } catch (initError) {
          console.error('⚠️  Error al inicializar Falabella:', initError);
        }

        // Inicializar Sodimac
        console.log('🔍 Verificando si Sodimac existe...');
        const { addSodimacToDatabase } = await import('../../lib/addSodimacData');
        
        try {
          const empresasActuales = await getEmpresas();
          const sodimacExists = empresasActuales.some(emp => emp.nombre === 'Sodimac');
          
          if (!sodimacExists) {
            console.log('🏢 Sodimac no encontrada. Insertando...');
            const result = await addSodimacToDatabase();
            console.log('📝 Resultado:', result);
          } else {
            console.log('✅ Sodimac ya existe');
          }
        } catch (initError) {
          console.error('⚠️  Error al inicializar Sodimac:', initError);
        }
        
        // Luego, cargar todas las empresas
        console.log('📊 Cargando todas las empresas...');
        const empresas = await getEmpresas();
        console.log('✅ Empresas cargadas:', empresas.length, empresas.map(e => e.nombre));
        setEmpresasFromDB(empresas);
      } catch (error) {
        console.error('❌ Error al cargar empresas:', error);
      }
    };

    loadEmpresas();
  }, []);

  // Simular carga inicial
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3000); // Cambiado de 2000 a 2500 para que dure 2.5 segundos

    return () => clearTimeout(timer);
  }, []);

  // Modificar handleSavePosters para usar dom-to-image en lugar de html2canvas
  const handleSavePosters = async () => {
    try {
      setIsLoading(true);
      const toastId = toast.loading('Guardando cartel...');

      const posterElement = document.querySelector('.poster-content');
      
      if (!posterElement) {
        throw new Error('No se encontró el elemento del cartel');
      }

      // Esperar a que todas las imágenes estén cargadas
      const images = Array.from(posterElement.getElementsByTagName('img'));
      await Promise.all(images.map(img => {
        if (img.complete) return Promise.resolve();
        return new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
        });
      }));

      const result = await domtoimage.toPng(posterElement, {
        quality: 1,
        bgcolor: '#ffffff',
        cacheBust: true,
        scale: window.devicePixelRatio * 2,
        style: {
          transform: 'none'
        }
      });

      // Convertir dataUrl a Blob
      const response = await fetch(result);
      const blob = await response.blob();

      // Obtener los detalles necesarios para el nombre del archivo
      const companyName = companyDetails?.name || 'sin_empresa';
      
      // Si hay productos seleccionados, crear un archivo por cada producto
      if (selectedProducts.length > 0) {
        for (const productId of selectedProducts) {
          const product = products.find(p => p.id === productId);
          if (product) {
            const productName = cleanFileName(product.name);
            const sku = product.sku || product.id;
            const fileName = `${cleanFileName(companyName)}_${productName}_${sku}.png`;

            await uploadToBucket(fileName, blob);
            toast.success(`Cartel guardado: ${fileName}`, { id: toastId });
          }
        }
      } else if (selectedCategory) {
        // Si es un cartel de categoría
        const fileName = `${cleanFileName(companyName)}_categoria_${cleanFileName(selectedCategory)}.png`;
        await uploadToBucket(fileName, blob);
        toast.success(`Cartel guardado: ${fileName}`, { id: toastId });
      }

    } catch (error: any) {
      console.error('Error al guardar el cartel:', error);
      toast.error(error.message || 'Error al guardar el cartel');
    } finally {
      setIsLoading(false);
    }
  };

  // Modificar donde se usan los productos
  const filteredProducts = selectedCategory === 'Todos' || !selectedCategory 
    ? products
    : products.filter(p => p.category === selectedCategory);

  console.log('Categoría seleccionada:', selectedCategory);
  console.log('Productos filtrados:', filteredProducts);

  // Agregar el handler para enviar a sucursales
  const handleSendToLocations = () => {
    if (!selectedProducts.length || !company) {
      alert('Por favor seleccione al menos un producto y una empresa');
      return;
    }

    // Cerrar el modal si está abierto y volver a abrirlo para reiniciar la animación
    setIsSendingModalOpen(false);
    setTimeout(() => {
      setIsSendingModalOpen(true);
    }, 100);
  };

  // Agregar las funciones de zoom
  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.1, 2));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.1, 0.5));

  const handleCardSizeChange = (newSize: number) => {
    // Redondeamos al múltiplo de 5 más cercano
    const roundedSize = Math.round(newSize * 20) / 20;
    // Limitamos entre 50% y 120%
    setCardSize(Math.max(0.5, Math.min(roundedSize, 1.2)));
  };

  const handleCCChange = (selectedIds: string[]) => {
    setCC(selectedIds);
  };

  const selectedTemplateDetails = POSTER_TEMPLATES.find(t => t.id === selectedTemplate);

  const renderPosters = () => {
    if (selectedProducts.length > 0) {
      // Renderizar carteles de productos seleccionados
      return mappedProducts.map(product => (
        <div key={product.id} className={`flex justify-center ${viewMode === 'list' ? 'bg-gray-100 rounded-lg p-4' : ''}`}>
          <PosterPreview
            product={product}
            promotion={selectedPromotion}
            company={companyDetails}
            showTopLogo={showLogo}
            pricePerUnit={`${product.price * 2}`}
            points="49"
            origin="ARGENTINA"
            barcode="7790895000782"
            compact={viewMode === 'list'}
            selectedFormat={selectedFormat}
            zoom={zoom}
            cardSize={cardSize}
            isLandscape={isLandscape}
            financing={selectedFinancing}
          />
        </div>
      ));
    } else if (selectedCategory) {
      // Renderizar cartel de categoría
      return (
        <div className="flex justify-center">
          <PosterPreview
            category={selectedCategory}
            promotion={selectedPromotion}
            company={companyDetails}
            showTopLogo={showLogo}
            selectedFormat={selectedFormat}
            zoom={zoom}
            cardSize={cardSize}
            isLandscape={isLandscape}
            financing={selectedFinancing}
          />
        </div>
      );
    }
    
    return null;
  };

  // Agregar la función de descarga
  const handleDownload = async () => {
    try {
      const toastId = toast.loading('Preparando descarga...');

      const posterElement = document.querySelector('.poster-content');
      if (!posterElement) {
        throw new Error('No se encontró el elemento del cartel');
      }

      // Esperar a que todas las imágenes estén cargadas
      const images = Array.from(posterElement.getElementsByTagName('img'));
      await Promise.all(images.map(img => {
        if (img.complete) return Promise.resolve();
        return new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
        });
      }));

      const result = await domtoimage.toPng(posterElement as HTMLElement, {
        quality: 1,
        bgcolor: '#ffffff',
        cacheBust: true,
        scale: window.devicePixelRatio * 2,
        style: {
          transform: 'none'
        }
      });

      // Crear el enlace de descarga
      const link = document.createElement('a');
      
      // Generar nombre del archivo
      const companyName = companyDetails?.name || 'sin_empresa';
      let fileName;

      if (selectedProducts.length > 0) {
        const product = products.find(p => p.id === selectedProducts[0]);
        if (product) {
          const productName = cleanFileName(product.name);
          const sku = product.sku || product.id;
          fileName = `${cleanFileName(companyName)}_${productName}_${sku}.png`;
        } else {
          fileName = `${cleanFileName(companyName)}_cartel.png`;
        }
      } else if (selectedCategory) {
        fileName = `${cleanFileName(companyName)}_categoria_${cleanFileName(selectedCategory)}.png`;
      } else {
        fileName = `${cleanFileName(companyName)}_cartel.png`;
      }

      link.download = fileName;
      link.href = result;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('Cartel descargado exitosamente', { id: toastId });
    } catch (error: any) {
      console.error('Error al descargar el cartel:', error);
      toast.error(error.message || 'Error al descargar el cartel');
    }
  };

  const handleSearchPosters = async () => {
    let toastId: string | undefined;
    try {
      setIsSearchModalOpen(true);
      toastId = toast.loading('Buscando carteles...');
      
      const { data, error } = await supabase
        .storage
        .from('posters')
        .list();

      if (error) {
        throw error;
      }

      if (data) {
        const sortedResults = await Promise.all(data
          .filter(file => file.name.endsWith('.png'))
          .map(async file => {
            const { data: urlData } = supabase.storage.from('posters').getPublicUrl(file.name);
            return {
              name: file.name,
              url: urlData.publicUrl,
              created_at: file.created_at || ''
            };
          }));

        const orderedResults = sortedResults
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

        setAllPosters(orderedResults);
        setSearchResults(orderedResults);
        if (toastId) {
          toast.success(`Se encontraron ${orderedResults.length} carteles`, { id: toastId });
        }
      }
    } catch (error: any) {
      console.error('Error al buscar carteles:', error);
      if (toastId) {
        toast.error(error.message || 'Error al buscar carteles', { id: toastId });
      }
      setIsSearchModalOpen(false);
    }
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    if (!term.trim()) {
      setSearchResults(allPosters);
      return;
    }
    
    const filtered = allPosters.filter(poster => 
      poster.name.toLowerCase().includes(term.toLowerCase())
    );
    setSearchResults(filtered);
  };

  const handlePosterSelect = async (poster: { name: string; url: string }) => {
    try {
      const toastId = toast.loading('Cargando cartel...');
      
      // Extraer información del nombre del archivo
      const [companyName, ...rest] = poster.name.split('_');
      
      // Si es un cartel de categoría
      if (rest.includes('categoria')) {
        const categoryName = rest[rest.length - 1].replace('.png', '');
        setSelectedCategory(categoryName);
        setSelectedProducts([]);
      } else {
        // Si es un cartel de producto
        const sku = rest[rest.length - 1].replace('.png', '');
        const product = products.find(p => p.sku === sku || p.id === sku);
        if (product) {
          setSelectedProducts([product.id]);
          setSelectedCategory(product.category);
        }
      }
      
      // Establecer la empresa
      const company = COMPANIES.find(c => 
        cleanFileName(c.name).toLowerCase() === companyName.toLowerCase()
      );
      if (company) {
        setCompany(company.id);
      }
      
      setIsSearchModalOpen(false);
      toast.success('Cartel cargado exitosamente', { id: toastId });
    } catch (error) {
      console.error('Error al cargar el cartel:', error);
      toast.error('Error al cargar el cartel');
    }
  };

  return (
    <HeaderProvider userEmail={userEmail} userName={userName}>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-violet-900">
        <Header onBack={onBack} onLogout={onLogout} />
        <div className="poster-editor-container min-h-screen flex flex-col bg-white">
          <main className="pt-10 px-6 pb-6 max-w-7xl mx-auto space-y-6 min-h-[1000px]">
            <div className="flex items-center justify-between gap-4 mb-8">
              <h2 className="text-2xl font-medium text-gray-900">Editor de Carteles</h2>
              {/* Botón de Buscar Cartel */}
              <button
                onClick={handleSearchPosters}
                className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-indigo-500 to-indigo-600 
                          text-white font-medium hover:from-indigo-600 hover:to-indigo-700 
                          transition-all flex items-center gap-2 shadow-md"
              >
                <Search className="w-5 h-5" />
                Buscar Cartel
              </button>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 space-y-6 border border-gray-200">
              {/* Primera fila: Solo empresa */}
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">
                    Empresa
                  </label>
                  <CompanySelect
                    value={company}
                    onChange={handleCompanyChange}
                    companies={combinedCompanies}
                  />
                </div>
              </div>

              {/* Segunda fila: Plantilla y botón de Financiación */}
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setIsTemplateModalOpen(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 
                        rounded-lg hover:bg-gray-50 transition-colors text-gray-700 w-64"
                    >
                      <LayoutTemplate className="w-5 h-5 text-gray-500 shrink-0" />
                      <span className="truncate">
                        {selectedTemplateDetails?.name || "Seleccionar plantilla..."}
                      </span>
                    </button>
                    <button
                      onClick={() => setIsFinancingModalOpen(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 
                        rounded-lg hover:bg-gray-50 transition-colors text-gray-700"
                    >
                      <CreditCard className="w-5 h-5 text-gray-500" />
                      <span>
                        {selectedFinancing.length > 0
                          ? `${selectedFinancing.length} financiación${selectedFinancing.length > 1 ? 'es' : ''}`
                          : "Ver financiación"
                        }
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Promoción:
                  </label>
                  <PromotionSelect
                    value={promotion}
                    onChange={setPromotion}
                    promotions={PROMOTIONS.filter(p => p.isActive)}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-white/30"
                  />
                </div>

                {selectedPromotion && (
                  <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                    <div className="flex items-start gap-6">
                      <img 
                        src={selectedPromotion.imageUrl}
                        alt={selectedPromotion.title}
                        className="w-32 h-32 object-cover rounded-lg"
                      />
                      <div className="flex-1 space-y-4">
                        <div>
                          <div className="flex items-center gap-3">
                            <h3 className="text-lg font-medium text-gray-900">
                              {selectedPromotion.title}
                            </h3>
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700">
                              {selectedPromotion.category}
                            </span>
                          </div>
                          <p className="text-gray-600 mt-1">{selectedPromotion.description}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <h4 className="text-sm font-medium text-gray-700 mb-1">Descuento</h4>
                            <p className="text-2xl font-bold text-indigo-600">{selectedPromotion.discount}</p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-gray-700 mb-1">Vigencia</h4>
                            <p className="text-gray-900">
                              {new Date(selectedPromotion.startDate).toLocaleDateString()} - {new Date(selectedPromotion.endDate).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        {selectedPromotion.category === 'Bancaria' && (
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <h4 className="text-sm font-medium text-gray-700 mb-1">Banco</h4>
                              <p className="text-gray-900">{selectedPromotion.bank}</p>
                            </div>
                            <div>
                              <h4 className="text-sm font-medium text-gray-700 mb-1">Tarjetas</h4>
                              <p className="text-gray-900">{selectedPromotion.cardType}</p>
                            </div>
                          </div>
                        )}

                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Condiciones</h4>
                          <ul className="space-y-1">
                            {selectedPromotion.conditions.map((condition, index) => (
                              <li key={index} className="text-gray-600 text-sm flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                                {condition}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="border-t border-gray-200 pt-6">
                <div className="grid grid-cols-4 gap-4">
                  <div className="col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Categoría:
                    </label>
                    <CategorySelect
                      value={selectedCategory}
                      onChange={setSelectedCategory}
                      categories={CATEGORIES}
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-white/30"
                    />
                  </div>
                  <div className="col-span-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Productos:
                    </label>
                    <div className="relative">
                      <ProductSelect
                        value={selectedProducts}
                        onChange={setSelectedProducts}
                        products={filteredProducts}
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-white/30"
                        menuPlacement="top"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {(selectedCategory || mappedProducts.length > 0) && (
              <div className="border-t border-gray-200 pt-6">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-4">
                    {/* Controles agrupados */}
                    <div className="flex items-center gap-4">
                      {/* Vista grilla/lista */}
                      <div className="flex bg-gray-200 rounded-lg p-1">
                        <button
                          onClick={() => setViewMode('grid')}
                          className={`p-2 rounded-md transition-colors ${
                            viewMode === 'grid' ? 'bg-gray-300 text-gray-700' : 'text-gray-500 hover:text-gray-700'
                          }`}
                        >
                          <LayoutGrid className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setViewMode('list')}
                          className={`p-2 rounded-md transition-colors ${
                            viewMode === 'list' ? 'bg-gray-300 text-gray-700' : 'text-gray-500 hover:text-gray-700'
                          }`}
                        >
                          <List className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Separador vertical */}
                      <div className="h-8 w-px bg-gray-200"></div>

                      {/* Selector de formato */}
                      <div className="relative">
                        <button
                          onClick={() => setShowFormatSelector(!showFormatSelector)}
                          className="bg-gray-200 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-300 transition-colors flex items-center gap-2"
                        >
                          {selectedFormat.id}
                          <span className="text-xs text-gray-500">
                            {selectedFormat.width} × {selectedFormat.height}
                          </span>
                          <svg className="w-4 h-4 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </button>

                        {/* Menú desplegable de formatos */}
                        {showFormatSelector && (
                          <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 w-64 z-50">
                            {PAPER_FORMATS.map(format => (
                              <button
                                key={format.id}
                                onClick={() => {
                                  setSelectedFormat(format);
                                  setShowFormatSelector(false);
                                }}
                                className={`w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center justify-between ${
                                  selectedFormat.id === format.id ? 'bg-gray-50 text-indigo-600' : 'text-gray-700'
                                }`}
                              >
                                <span className="font-medium">{format.name}</span>
                                <span className="text-xs text-gray-500">
                                  {format.width} × {format.height}
                                </span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Separador vertical */}
                      <div className="h-8 w-px bg-gray-200"></div>

                      {/* Control de orientación */}
                      <button
                        onClick={() => setIsLandscape(!isLandscape)}
                        className="p-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition-colors flex items-center gap-2"
                      >
                        <svg 
                          className={`w-4 h-4 transition-transform ${isLandscape ? 'rotate-90' : ''}`} 
                          viewBox="0 0 24 24" 
                          fill="none" 
                          stroke="currentColor"
                        >
                          <rect x="4" y="5" width="16" height="14" rx="2" strokeWidth="2"/>
                        </svg>
                        <span className="text-sm">
                          {isLandscape ? 'Horizontal' : 'Vertical'}
                        </span>
                      </button>

                      {/* Separador vertical */}
                      <div className="h-8 w-px bg-gray-200"></div>

                      {/* Controles de zoom */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleZoomOut}
                          className="p-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="text-sm text-gray-600 min-w-[3rem] text-center">
                          {Math.round(zoom * 100)}%
                        </span>
                        <button
                          onClick={handleZoomIn}
                          className="p-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Separador vertical */}
                      <div className="h-8 w-px bg-gray-200"></div>

                      {/* Controles de tamaño del cartel */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleCardSizeChange(cardSize - 0.05)}
                          className="p-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="text-sm text-gray-600 min-w-[3rem] text-center">
                          {Math.round(cardSize * 100)}%
                        </span>
                        <button
                          onClick={() => handleCardSizeChange(cardSize + 0.05)}
                          className="p-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Controles del lado derecho */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="show-logo"
                      checked={showLogo}
                      onChange={(e) => setShowLogo(e.target.checked)}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <label htmlFor="show-logo" className="text-sm text-gray-700">
                      Mostrar logo
                    </label>
                  </div>

                  {/* Botones de acción */}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleSendToLocations}
                      disabled={!selectedProducts.length || !company}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors
                        ${(!selectedProducts.length || !company)
                          ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                          : 'bg-indigo-600 text-white hover:bg-indigo-700'
                        }`}
                    >
                      Enviar a Sucursales
                    </button>

                    {/* Botones agrupados */}
                    <div className="flex items-center gap-2">
                      {/* Botón de Descargar */}
                      <button
                        onClick={handleDownload}
                        className="px-4 py-2 rounded-lg font-medium bg-emerald-600 text-white 
                                  hover:bg-emerald-700 transition-colors flex items-center gap-2"
                      >
                        <svg 
                          className="w-5 h-5" 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth={2} 
                            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                          />
                        </svg>
                        Descargar
                      </button>

                      {/* Botón de Guardar Cartel */}
                      <button
                        onClick={handleSavePosters}
                        className="px-4 py-2 rounded-lg font-medium bg-blue-600 text-white 
                                  hover:bg-blue-700 transition-colors flex items-center gap-2"
                      >
                        <svg 
                          className="w-5 h-5" 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth={2} 
                            d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
                          />
                        </svg>
                        Guardar Cartel
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div id="poster-container" className="h-[800px] w-[1080px] mx-auto overflow-y-auto">
              <div className={viewMode === 'grid' ? 'space-y-8' : 'space-y-4'}>
                {renderPosters()}
              </div>
            </div>

            <ProductSelectorModal
              isOpen={isProductSelectorOpen}
              onClose={() => setIsProductSelectorOpen(false)}
              products={selectedCategory === 'Todos' || !selectedCategory 
                ? products
                : products.filter(p => p.category === selectedCategory)
              }
              selectedProducts={selectedProducts}
              onSelectProduct={handleSelectProduct}
              category={selectedCategory}
            />

            <SendingModal
              isOpen={isSendingModalOpen}
              onClose={() => setIsSendingModalOpen(false)}
              productsCount={selectedProducts.length}
              company={company}
              empresaId={empresaId}
            />

            <PosterModal
              isOpen={!!selectedPoster}
              onClose={() => setSelectedPoster(null)}
              product={selectedPoster!}
              promotion={selectedPromotion}
              company={companyDetails}
              showLogo={showLogo}
            />

            <FinancingModal
              isOpen={isFinancingModalOpen}
              onClose={() => setIsFinancingModalOpen(false)}
              onSelect={setSelectedFinancing}
            />

            <TemplateSelect
              isOpen={isTemplateModalOpen}
              onClose={() => setIsTemplateModalOpen(false)}
              value={selectedTemplate}
              onChange={setSelectedTemplate}
            />

            {/* Modal de Búsqueda de Carteles */}
            {isSearchModalOpen && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-white rounded-xl shadow-xl max-w-6xl w-full mx-4 overflow-hidden">
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-medium text-gray-900">
                        Carteles Guardados
                      </h3>
                      <button
                        onClick={() => {
                          setIsSearchModalOpen(false);
                          setSearchTerm('');
                        }}
                        className="text-gray-400 hover:text-gray-500 transition-colors"
                      >
                        <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                    <div className="mt-4">
                      <div className="relative">
                        <input
                          type="text"
                          value={searchTerm}
                          onChange={(e) => handleSearch(e.target.value)}
                          placeholder="Buscar cartel por nombre..."
                          className="w-full px-4 py-2 pl-10 pr-4 text-sm border border-gray-300 rounded-lg 
                                   focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                        <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
                    <div className="grid grid-cols-4 gap-4">
                      {searchResults.map((poster, index) => (
                        <div 
                          key={index}
                          className="bg-white border border-gray-200 rounded-lg p-4 hover:border-indigo-500 transition-all cursor-pointer shadow-sm hover:shadow-md"
                          onClick={() => handlePosterSelect(poster)}
                        >
                          <img 
                            src={poster.url}
                            alt={poster.name}
                            className="w-full h-48 object-contain mb-3 bg-gray-50 rounded"
                          />
                          <div className="space-y-1">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {poster.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(poster.created_at).toLocaleDateString()}
                            </p>
                            <button
                              className="mt-2 w-full px-3 py-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-700 
                                        bg-indigo-50 hover:bg-indigo-100 rounded-md transition-colors"
                            >
                              Editar Cartel
                            </button>
                          </div>
                        </div>
                      ))}
                      {searchResults.length === 0 && (
                        <div className="col-span-4 text-center py-12">
                          <p className="text-gray-500">No se encontraron carteles</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
        <FalabellaDebug />
      </div>
    </HeaderProvider>
  );
}; 