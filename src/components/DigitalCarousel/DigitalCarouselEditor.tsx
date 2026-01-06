import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Header } from '../shared/Header';
import { CompanySelect } from '../Posters/CompanySelect';
import { LocationSelect } from '../Posters/LocationSelect';
import { ArrowLeft, Monitor, Layout, MonitorPlay, Image as ImageIcon, Send, X, Check, ChevronLeft, ChevronRight, Maximize2, Minimize2, Video, ShoppingCart, Tablet, MonitorSmartphone, Layers, TouchpadOff, Search, Upload, Mail, GripVertical, Loader } from 'lucide-react';
import { getEmpresas, getSucursalesPorEmpresa, type Empresa, type Sucursal } from '../../lib/supabaseClient-sucursales';
import { toast } from 'react-hot-toast';
import Select from 'react-select';
import { filterEnabledCompanies, initializeCompanySetting, isCompanyEnabled } from '../../lib/companySettings';
import { supabaseAdmin } from '../../lib/supabaseClient-carteles';
import { motion, AnimatePresence } from 'framer-motion';
import { getLocalVideoDuration } from '../../lib/videoUtils';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface Company {
  id: string;
  name: string;
  logo: string;
}

type DeviceType = 'videowall' | 'caja-registradora' | 'self-checkout' | 'kiosko-digital' | 'tablet-carrito' | 'pantalla-interactiva' | 'punta-gondola';

interface Device {
  value: DeviceType;
  label: string;
  icon: React.ReactNode;
}

const devices: Device[] = [
  { 
    value: 'videowall', 
    label: 'Videowall', 
    icon: <Layers className="w-5 h-5" />
  },
  { 
    value: 'caja-registradora', 
    label: 'Pantalla de Caja Registradora', 
    icon: <Monitor className="w-5 h-5" />
  },
  { 
    value: 'self-checkout', 
    label: 'Self-Checkout (Caja de Autopago)', 
    icon: <ShoppingCart className="w-5 h-5" />
  },
  { 
    value: 'kiosko-digital', 
    label: 'Kiosco Digital', 
    icon: <MonitorSmartphone className="w-5 h-5" />
  },
  { 
    value: 'tablet-carrito', 
    label: 'Tablet/Pantalla en Carrito', 
    icon: <Tablet className="w-5 h-5" />
  },
  { 
    value: 'pantalla-interactiva', 
    label: 'Pantalla Interactiva', 
    icon: <TouchpadOff className="w-5 h-5" />
  },
  { 
    value: 'punta-gondola', 
    label: 'Punta de Góndola', 
    icon: <Layout className="w-5 h-5" />
  }
];

interface DigitalCarouselEditorProps {
  onBack: () => void;
  onLogout: () => void;
  userEmail: string;
  userName: string;
}

interface SelectedImage {
  url: string;
  name: string;
  type: 'image' | 'video';
  videoType?: 'local' | 'youtube';
  duration: number;
}

// Componente para items draggables
const SortableItem: React.FC<{
  img: SelectedImage;
  index: number;
  selectedImages: SelectedImage[];
  onUpdateDuration: (name: string, duration: number) => void;
  onRemove: (index: number) => void;
}> = ({ img, index, selectedImages, onUpdateDuration, onRemove }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: img.name });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative flex items-center gap-2 p-3 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
    >
      {/* Icono de arrastre */}
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 flex-shrink-0"
        title="Arrastra para reordenar"
      >
        <GripVertical className="w-5 h-5" />
      </button>

      {/* Número y tipo de elemento */}
      <div className="flex items-center gap-2 min-w-[24px] flex-shrink-0">
        <span className="text-sm text-gray-600">{index + 1}.</span>
        {img.type === 'image' ? (
          <ImageIcon className="w-4 h-4 text-blue-500" />
        ) : (
          <Video className="w-4 h-4 text-purple-500" />
        )}
      </div>

      {/* Nombre y duración */}
      <div className="flex-1 flex items-center justify-between min-w-0">
        <span className="truncate max-w-[200px] text-sm" title={img.name}>
          {img.name}
        </span>
        <div className="flex items-center gap-2 flex-shrink-0">
          <select
            value={img.duration}
            onChange={(e) => onUpdateDuration(img.name, Number(e.target.value))}
            className="px-2 py-1 text-sm border border-gray-300 rounded hover:border-blue-500 focus:border-blue-500"
          >
            {[2, 3, 5, 8, 10, 15, 20, 30, 45, 60].map((value) => (
              <option key={value} value={value}>
                {value}s
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Vista previa al hover */}
      <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-1">
          {img.type === 'image' ? (
            <img
              src={img.url}
              alt={img.name}
              className="w-48 h-32 object-contain bg-gray-100 rounded"
            />
          ) : (
            <div className="w-48 h-32 bg-gray-100 rounded flex items-center justify-center">
              {img.videoType === 'youtube' ? (
                <iframe
                  src={`${img.url.replace('watch?v=', 'embed/')}?autoplay=0`}
                  className="w-full h-full rounded"
                  allowFullScreen
                />
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <Video className="w-8 h-8 text-gray-400" />
                  <span className="text-xs text-gray-500">Vista previa no disponible</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Botón de eliminar */}
      <button
        onClick={() => onRemove(index)}
        className="p-1 rounded-full text-red-500 hover:bg-red-50 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
        title="Eliminar"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
};

const CarouselPreview: React.FC<{ 
  images: SelectedImage[];
  isFullscreen?: boolean;
  onFullscreenChange: (isFullscreen: boolean) => void;
}> = ({ 
  images, 
  isFullscreen = false,
  onFullscreenChange
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Asegurarse de que currentIndex sea válido cuando cambian las imágenes
  useEffect(() => {
    if (currentIndex >= images.length) {
      setCurrentIndex(0);
    }
  }, [images.length, currentIndex]);

  const nextSlide = useCallback(() => {
    if (images.length === 0) return;
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  }, [images.length]);

  const prevSlide = () => {
    if (images.length === 0) return;
    setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
  };

  useEffect(() => {
    if (images.length <= 1) return;
    if (!images[currentIndex]) return;
    if (images[currentIndex].type === 'video') return;
    
    const timer = setInterval(nextSlide, images[currentIndex].duration * 1000);
    return () => clearInterval(timer);
  }, [nextSlide, images, currentIndex]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      onFullscreenChange(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, [onFullscreenChange]);

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement && carouselRef.current) {
        await carouselRef.current.requestFullscreen();
      } else if (document.fullscreenElement) {
        await document.exitFullscreen();
      }
    } catch (error) {
      console.error('Error al cambiar el modo pantalla completa:', error);
    }
  };

  const handleVideoEnd = () => {
    if (images.length > 1) {
      nextSlide();
    } else if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play();
    }
  };

  // Si no hay imágenes, mostrar un mensaje
  if (images.length === 0) {
    return (
      <div className="w-full aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
        <p className="text-gray-500">No hay elementos en la playlist</p>
      </div>
    );
  }

  // Si el índice actual no es válido, resetear a 0
  if (!images[currentIndex]) {
    setCurrentIndex(0);
    return null;
  }

  const currentItem = images[currentIndex];

  return (
    <div 
      ref={carouselRef}
      className={`relative bg-black overflow-hidden group
        ${isFullscreen ? 'fixed inset-0 z-50' : 'w-full aspect-video rounded-lg'}`}
    >
      {/* Contenido del carrusel */}
      <div className="relative w-full h-full flex items-center justify-center">
        {images.map((item, index) => (
          <div
            key={item.name}
            className={`absolute inset-0 transition-opacity duration-500 ease-in-out flex items-center justify-center
              ${index === currentIndex ? 'opacity-100' : 'opacity-0'}`}
          >
            {item.type === 'image' ? (
              <img
                src={item.url}
                alt={item.name}
                className={`${isFullscreen ? 'max-h-screen max-w-screen' : 'w-full h-full'} object-contain`}
              />
            ) : item.videoType === 'youtube' ? (
              <iframe
                src={`${item.url.replace('watch?v=', 'embed/')}?autoplay=1&mute=1`}
                className="w-full h-full"
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              />
            ) : (
              <video
                ref={videoRef}
                src={item.url}
                className={`${isFullscreen ? 'max-h-screen max-w-screen' : 'w-full h-full'} object-contain`}
                controls
                autoPlay
                onEnded={handleVideoEnd}
              />
            )}
          </div>
        ))}
      </div>

      {/* Controles de navegación */}
      {images.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full
                     opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full
                     opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Indicadores de posición */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {images.map((item, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`flex items-center justify-center transition-all duration-300
                  ${index === currentIndex 
                    ? 'bg-white w-8' 
                    : 'bg-white/50 w-2'} h-2 rounded-full hover:bg-white/75`}
              >
                {index === currentIndex && item.type === 'video' && (
                  <div className="w-4 h-4 flex items-center justify-center">
                    <Video className="w-3 h-3 text-blue-500" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </>
      )}

      {/* Botón de pantalla completa */}
      <button
        onClick={toggleFullscreen}
        className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full
                 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
      >
        {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
      </button>
    </div>
  );
};

interface SendingProgress {
  sucursal: string;
  email: string;
  status: 'pending' | 'sending' | 'success' | 'error';
}

export const DigitalCarouselEditor: React.FC<DigitalCarouselEditorProps> = ({
  onBack,
  onLogout,
  userEmail,
  userName
}) => {
  // Configurar sensores para drag-drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      distance: 8,
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [selectedEmpresa, setSelectedEmpresa] = useState<string>('');
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);
  const [selectedSucursales, setSelectedSucursales] = useState<string[]>([]);
  const [selectedDevices, setSelectedDevices] = useState<DeviceType[]>([]);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [startTime, setStartTime] = useState<string>('08:00');
  const [endTime, setEndTime] = useState<string>('20:00');
  const [loading, setLoading] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);
  const [selectedImages, setSelectedImages] = useState<SelectedImage[]>([]);
  const [availableImages, setAvailableImages] = useState<SelectedImage[]>([]);
  const [sendingStatus, setSendingStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [sendingProgress, setSendingProgress] = useState<Record<string, SendingProgress>>({});
  const [carouselUrl, setCarouselUrl] = useState<string>('');
  const [carouselId, setCarouselId] = useState<string>('');
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const [videoType, setVideoType] = useState<'local' | 'youtube'>('youtube');
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [savedCarousels, setSavedCarousels] = useState<Array<{
    id: string;
    empresa_id: string;
    created_at: string;
    images: SelectedImage[];
    interval_time: number;
    start_date: string | null;
    end_date: string | null;
    start_time: string | null;
    end_time: string | null;
    devices: DeviceType[];
    sucursales: string[];
    name?: string;
  }>>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoadingCarousels, setIsLoadingCarousels] = useState(false);
  const [carouselName, setCarouselName] = useState<string>('Playlist sin nombre');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Handler para drag-drop
  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setSelectedImages((items) => {
        const oldIndex = items.findIndex((item) => item.name === active.id);
        const newIndex = items.findIndex((item) => item.name === over.id);

        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  // Cargar empresas al montar el componente
  useEffect(() => {
    const loadEmpresas = async () => {
      try {
        setLoading(true);

        // Inicializar Falabella si no existe
        try {
          const { addFalabellaToDatabase } = await import('../../lib/addFalabellaData');
          const empresasActuales = await getEmpresas();
          const falabellaExists = empresasActuales.some(emp => emp.nombre === 'Falabella');
          
          if (!falabellaExists) {
            console.log('🏢 Falabella no encontrada. Insertando...');
            await addFalabellaToDatabase();
          }
        } catch (initError) {
          console.error('⚠️ Error al inicializar Falabella:', initError);
        }

        // Inicializar Sodimac si no existe
        try {
          const { addSodimacToDatabase } = await import('../../lib/addSodimacData');
          const empresasActuales = await getEmpresas();
          const sodimacExists = empresasActuales.some(emp => emp.nombre === 'Sodimac');
          
          if (!sodimacExists) {
            console.log('🏢 Sodimac no encontrada. Insertando...');
            await addSodimacToDatabase();
          }
        } catch (initError) {
          console.error('⚠️ Error al inicializar Sodimac:', initError);
        }

        const data = await getEmpresas();
        
        // Inicializar empresas en localStorage
        data.forEach(empresa => {
          initializeCompanySetting(String(empresa.id), empresa.nombre);
        });
        
        const enabledData = filterEnabledCompanies(data);
        setEmpresas(enabledData);
      } catch (error) {
        console.error('Error al cargar empresas:', error);
        toast.error('Error al cargar las empresas');
      } finally {
        setLoading(false);
      }
    };

    loadEmpresas();
  }, []);

  // Cargar sucursales cuando se selecciona una empresa
  useEffect(() => {
    const loadSucursales = async () => {
      if (!selectedEmpresa) {
        setSucursales([]);
        return;
      }

      try {
        setLoading(true);
        const data = await getSucursalesPorEmpresa(parseInt(selectedEmpresa));
        setSucursales(data);
      } catch (error) {
        console.error('Error al cargar sucursales:', error);
        toast.error('Error al cargar las sucursales');
      } finally {
        setLoading(false);
      }
    };

    loadSucursales();
  }, [selectedEmpresa]);

  // Cargar imágenes disponibles del bucket de Supabase
  useEffect(() => {
    const loadImages = async () => {
      try {
        setLoading(true);
        const { data: files, error } = await supabaseAdmin.storage
          .from('posters')
          .list();

        if (error) throw error;

        const imagePromises = files
          .filter(file => file.name.match(/\.(jpg|jpeg|png|gif)$/i))
          .map(async file => {
            const { data: urlData } = supabaseAdmin.storage
              .from('posters')
              .getPublicUrl(file.name);

            // Verificar que la imagen sea válida
            try {
              const response = await fetch(urlData.publicUrl);
              if (!response.ok) throw new Error('Error al cargar la imagen');
              
              return {
                name: file.name,
                url: urlData.publicUrl,
                type: 'image' as const,
                duration: 3
              };
            } catch (err) {
              console.error(`Error al verificar imagen ${file.name}:`, err);
              return null;
            }
          });

        const images = (await Promise.all(imagePromises)).filter((img): img is SelectedImage => img !== null);
        setAvailableImages(images);
      } catch (error) {
        console.error('Error al cargar imágenes:', error);
        toast.error('Error al cargar las imágenes disponibles');
      } finally {
        setLoading(false);
      }
    };

    loadImages();
  }, []);

  // Generar URL única cuando se seleccionan imágenes
  useEffect(() => {
    if (selectedImages.length > 0) {
      if (!carouselId) {
        // Generar un ID único para el carrusel solo si no existe
        const newCarouselId = Math.random().toString(36).substring(2, 15);
        setCarouselId(newCarouselId);
        setCarouselUrl(`${window.location.origin}/playlist/${newCarouselId}`);
      }
    } else {
      setCarouselId('');
      setCarouselUrl('');
    }
  }, [selectedImages, carouselId]);

  const handleCompanyChange = (newCompany: string) => {
    setSelectedEmpresa(newCompany);
    setSelectedSucursales([]);
  };

  const formatDeviceOption = ({ label, icon }: Device) => (
    <div className="flex items-center gap-2">
      {icon}
      <span>{label}</span>
    </div>
  );

  const handleSendCarousel = async () => {
    if (!selectedDevices.length || !selectedImages.length || !selectedSucursales.length) {
      toast.error('Por favor complete todos los campos requeridos');
      return;
    }

    setShowSendModal(true);

    try {
      const { error } = await supabaseAdmin
        .from('carousels')
        .upsert({
          id: carouselId,
          name: carouselName,
          images: selectedImages,
          start_date: startDate || null,
          end_date: endDate || null,
          start_time: startTime || null,
          end_time: endTime || null,
          devices: selectedDevices,
          sucursales: selectedSucursales,
          empresa_id: selectedEmpresa,
          created_at: new Date().toISOString()
        });

      if (error) throw error;

      toast.success('Playlist guardada exitosamente');

    } catch (error) {
      console.error('Error al guardar la playlist:', error);
      toast.error('Error al guardar la playlist');
    }
  };

  const handleImageSelection = (image: Omit<SelectedImage, 'duration'>) => {
    try {
      // Verificar que la imagen sea accesible
      fetch(image.url)
        .then(response => {
          if (!response.ok) throw new Error('Error al acceder a la imagen');
          
          if (selectedImages.some(i => i.name === image.name)) {
            setSelectedImages(selectedImages.filter(i => i.name !== image.name));
            toast.success('Imagen removida de la playlist');
          } else {
            setSelectedImages([...selectedImages, { ...image, duration: 3 }]);
            toast.success('Imagen agregada a la playlist');
          }
        })
        .catch(error => {
          console.error('Error al verificar la imagen:', error);
          toast.error('Error al acceder a la imagen');
        });
    } catch (error) {
      console.error('Error al seleccionar la imagen:', error);
      toast.error('Error al seleccionar la imagen');
    }
  };

  const handleLocalImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const toastId = toast.loading('Subiendo imágenes...');
    const uploadedImages: SelectedImage[] = [];

    try {
      for (const file of files) {
        // Verificar si es una imagen
        if (!file.type.startsWith('image/')) {
          toast.error(`${file.name} no es una imagen válida`);
          continue;
        }

        // Verificar tamaño (máximo 5MB)
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`${file.name} excede el tamaño máximo de 5MB`);
          continue;
        }

        try {
          // Crear un objeto URL temporal para verificar la imagen
          const objectUrl = URL.createObjectURL(file);
          await new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = resolve;
            img.onerror = reject;
            img.src = objectUrl;
          });

          // Si llegamos aquí, la imagen es válida
          const newImage: SelectedImage = {
            name: file.name,
            url: objectUrl,
            type: 'image',
            duration: 3
          };

          uploadedImages.push(newImage);
        } catch (error) {
          console.error(`Error al procesar ${file.name}:`, error);
          toast.error(`Error al procesar ${file.name}`);
          continue;
        }
      }

      if (uploadedImages.length > 0) {
        setSelectedImages(prev => [...prev, ...uploadedImages]);
        toast.success(`${uploadedImages.length} imágenes agregadas exitosamente`, {
          id: toastId
        });
      } else {
        toast.error('No se pudo agregar ninguna imagen', {
          id: toastId
        });
      }
    } catch (error) {
      console.error('Error al cargar imágenes locales:', error);
      toast.error('Error al cargar las imágenes', {
        id: toastId
      });
    }

    // Limpiar el input
    event.target.value = '';
  };

  const updateImageDuration = (name: string, duration: number) => {
    setSelectedImages(selectedImages.map(img => 
      img.name === name ? { ...img, duration } : img
    ));
  };

  const ImageModal = () => {
    const [localSearchTerm, setLocalSearchTerm] = useState('');
    
    const filteredImages = React.useMemo(() => {
      const searchTermLower = localSearchTerm.toLowerCase();
      return availableImages.filter(image => 
        image.name.toLowerCase().includes(searchTermLower)
      );
    }, [localSearchTerm, availableImages]);

    return (
      <AnimatePresence>
        {showImageModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-xl max-w-7xl w-full max-h-[85vh] overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-medium text-gray-900">Seleccionar Imágenes</h3>
                  <div className="flex items-center gap-4">
                    {/* Vista Grid/Lista */}
                    <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
                      <button
                        onClick={() => setViewMode('grid')}
                        className={`p-2 rounded-md transition-colors ${
                          viewMode === 'grid' 
                            ? 'bg-white shadow-sm text-gray-900' 
                            : 'text-gray-500 hover:bg-gray-200'
                        }`}
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => setViewMode('list')}
                        className={`p-2 rounded-md transition-colors ${
                          viewMode === 'list' 
                            ? 'bg-white shadow-sm text-gray-900' 
                            : 'text-gray-500 hover:bg-gray-200'
                        }`}
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                      </button>
                    </div>
                    <button
                      onClick={() => setShowImageModal(false)}
                      className="text-gray-400 hover:text-gray-500"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                </div>

                {/* Barra de búsqueda */}
                <div className="relative">
                  <input
                    type="text"
                    value={localSearchTerm}
                    onChange={(e) => setLocalSearchTerm(e.target.value)}
                    placeholder="Buscar imágenes por nombre..."
                    className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              {/* Grid de imágenes con scroll */}
              <div className="flex-1 overflow-y-auto p-6">
                {filteredImages.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500">No se encontraron imágenes</p>
                  </div>
                ) : viewMode === 'grid' ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {filteredImages.map((image) => (
                      <div
                        key={image.name}
                        onClick={() => handleImageSelection(image)}
                        className={`group relative aspect-video rounded-lg overflow-hidden border cursor-pointer transition-all
                          ${selectedImages.some(i => i.name === image.name)
                            ? 'border-blue-500 ring-2 ring-blue-500 ring-opacity-50'
                            : 'border-gray-200 hover:border-blue-500'
                          }`}
                      >
                        <img
                          src={image.url}
                          alt={image.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                          <p className="text-xs text-white truncate">{image.name}</p>
                        </div>
                        {selectedImages.some(i => i.name === image.name) && (
                          <div className="absolute top-2 right-2">
                            <div className="bg-blue-500 text-white rounded-full p-1">
                              <Check className="w-4 h-4" />
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredImages.map((image) => (
                      <div
                        key={image.name}
                        onClick={() => handleImageSelection(image)}
                        className={`flex items-center gap-4 p-3 rounded-lg border cursor-pointer transition-all
                          ${selectedImages.some(i => i.name === image.name)
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-blue-500 hover:bg-gray-50'
                          }`}
                      >
                        <div className="w-20 h-12 rounded overflow-hidden flex-shrink-0">
                          <img
                            src={image.url}
                            alt={image.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{image.name}</p>
                          <p className="text-xs text-gray-500">
                            {selectedImages.some(i => i.name === image.name) ? 'Seleccionada' : 'No seleccionada'}
                          </p>
                        </div>
                        {selectedImages.some(i => i.name === image.name) && (
                          <div className="bg-blue-500 text-white rounded-full p-1">
                            <Check className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    );
  };

  const VideoModal = () => (
    <AnimatePresence>
      {showVideoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-xl max-w-2xl w-full overflow-hidden flex flex-col"
          >
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-medium">Agregar Video</h3>
              <button
                onClick={() => {
                  setShowVideoModal(false);
                  setVideoUrl('');
                }}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Tipo de Video
                </label>
                <div className="flex gap-4">
                  <button
                    onClick={() => setVideoType('youtube')}
                    className={`px-4 py-2 rounded-md ${
                      videoType === 'youtube' 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    URL de YouTube
                  </button>
                  <button
                    onClick={() => setVideoType('local')}
                    className={`px-4 py-2 rounded-md ${
                      videoType === 'local' 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Video Local
                  </button>
                </div>
              </div>

              {videoType === 'youtube' ? (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    URL del Video
                  </label>
                  <input
                    type="text"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="https://youtube.com/watch?v=..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Seleccionar Video
                  </label>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const url = URL.createObjectURL(file);
                        setVideoUrl(url);
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              )}

              {videoUrl && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vista Previa
                  </label>
                  <div className="aspect-video rounded-lg overflow-hidden bg-black">
                    {videoType === 'youtube' ? (
                      <iframe
                        src={videoUrl.replace('watch?v=', 'embed/')}
                        className="w-full h-full"
                        allowFullScreen
                      />
                    ) : (
                      <video
                        src={videoUrl}
                        controls
                        className="w-full h-full"
                      />
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className="p-4 border-t border-gray-200 flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowVideoModal(false);
                  setVideoUrl('');
                }}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddVideo}
                disabled={!videoUrl}
                className={`px-4 py-2 rounded-md text-white ${
                  videoUrl 
                    ? 'bg-blue-500 hover:bg-blue-600' 
                    : 'bg-gray-400 cursor-not-allowed'
                }`}
              >
                Agregar Video
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  const handleSendToSucursal = async (sucursalId: string, sucursalName: string) => {
    setSendingProgress(prev => ({
      ...prev,
      [sucursalId]: { 
        sucursal: sucursalName, 
        email: `${sucursalName.toLowerCase().replace(/\s/g, '.')}`,
        status: 'sending' 
      }
    }));

    try {
      // Simular envío a la sucursal
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setSendingProgress(prev => ({
        ...prev,
        [sucursalId]: { 
          sucursal: sucursalName, 
          email: `${sucursalName.toLowerCase().replace(/\s/g, '.')}`,
          status: 'success' 
        }
      }));
      toast.success(`Enviado exitosamente a ${sucursalName}`);
    } catch (error) {
      setSendingProgress(prev => ({
        ...prev,
        [sucursalId]: { 
          sucursal: sucursalName, 
          email: `${sucursalName.toLowerCase().replace(/\s/g, '.')}`,
          status: 'error' 
        }
      }));
      toast.error(`Error al enviar a ${sucursalName}`);
    }
  };

  const handleSendToAll = async () => {
    for (const sucId of selectedSucursales) {
      const sucursal = sucursales.find(s => s.id.toString() === sucId);
      if (sucursal) {
        await handleSendToSucursal(sucId, sucursal.direccion || '');
      }
    }
  };

  const SendModal = () => (
    <AnimatePresence>
      {showSendModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-xl p-8 max-w-2xl w-full flex flex-col"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-medium">Enviar Playlist a Sucursales</h3>
              <button
                onClick={() => setShowSendModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-auto max-h-[60vh]">
              <div className="space-y-4">
                {selectedSucursales.map((sucId) => {
                  const sucursal = sucursales.find(s => s.id.toString() === sucId);
                  const progress = sendingProgress[sucId];
                  const email = progress?.email || `${sucursal?.email.toLowerCase().replace(/\s/g, '.')}`;
                  
                  return (
                    <motion.div
                      key={sucId}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-gray-50 rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${
                              !progress ? 'bg-gray-400' :
                              progress.status === 'sending' ? 'bg-blue-500' :
                              progress.status === 'success' ? 'bg-green-500' :
                              'bg-red-500'
                            }`} />
                            <div className="flex flex-col">
                              <span className="font-medium text-gray-900">{sucursal?.nombre}</span>
                              <span className="text-sm text-gray-600">{sucursal?.direccion}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 text-sm text-gray-500 ml-4 mt-1">
                            <Mail className="w-4 h-4" />
                            <span className="text-blue-600 hover:underline cursor-pointer">
                              {email}
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => handleSendToSucursal(sucId, sucursal?.email || '')}
                          disabled={progress?.status === 'sending' || progress?.status === 'success'}
                          className={`px-3 py-1 rounded-md text-sm flex items-center gap-1
                            ${progress?.status === 'success' 
                              ? 'bg-green-500 text-white cursor-not-allowed'
                              : progress?.status === 'sending'
                              ? 'bg-blue-500 text-white cursor-wait'
                              : 'bg-blue-500 text-white hover:bg-blue-600'
                            }`}
                        >
                          <div className="relative">
                            {progress?.status === 'success' ? (
                              <Check className="w-4 h-4" />
                            ) : progress?.status === 'sending' ? (
                              <>
                                <Mail className="w-4 h-4 animate-bounce" />
                                <motion.div
                                  className="absolute -right-1 -top-1 w-2 h-2 bg-white rounded-full"
                                  animate={{
                                    scale: [1, 0],
                                    opacity: [1, 0],
                                    x: [0, 10],
                                    y: [-10, -20]
                                  }}
                                  transition={{
                                    duration: 1,
                                    repeat: Infinity,
                                    ease: "easeOut"
                                  }}
                                />
                              </>
                            ) : (
                              <Send className="w-4 h-4" />
                            )}
                          </div>
                          {progress?.status === 'success' ? 'Enviado' : 
                           progress?.status === 'sending' ? 'Enviando...' : 'Enviar'}
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-2 pl-4">
                        {selectedDevices.map((deviceType) => {
                          const device = devices.find(d => d.value === deviceType);
                          return (
                            <div key={deviceType} className="flex items-center gap-2 text-gray-600">
                              {device?.icon}
                              <span className="text-sm">{device?.label}</span>
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowSendModal(false);
                  setSendingProgress({});
                }}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
              >
                Cancelar
              </button>
              <button
                onClick={handleSendToAll}
                disabled={Object.keys(sendingProgress).length === selectedSucursales.length}
                className={`px-4 py-2 rounded-md text-white flex items-center gap-2
                  ${Object.keys(sendingProgress).length === selectedSucursales.length
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-500 hover:bg-blue-600'
                  }`}
              >
                <Send className="w-5 h-5" />
                Enviar a Todas
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  const handleFullscreenChange = (fullscreen: boolean) => {
    setIsFullscreen(fullscreen);
  };

  // Función para cargar playlists guardadas
  const loadSavedCarousels = async () => {
    try {
      setIsLoadingCarousels(true);
      const { data, error } = await supabaseAdmin
        .from('carousels')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setSavedCarousels(data || []);
    } catch (error) {
      console.error('Error al cargar playlists:', error);
      toast.error('Error al cargar las playlists guardadas');
    } finally {
      setIsLoadingCarousels(false);
    }
  };

  // Función para cargar una playlist seleccionada
  const loadCarousel = (carousel: typeof savedCarousels[0]) => {
    setSelectedEmpresa(carousel.empresa_id);
    setSelectedSucursales(carousel.sucursales);
    setSelectedDevices(carousel.devices);
    setSelectedImages(carousel.images);
    setStartDate(carousel.start_date || '');
    setEndDate(carousel.end_date || '');
    setStartTime(carousel.start_time || '08:00');
    setEndTime(carousel.end_time || '20:00');
    setCarouselId(carousel.id);
    setCarouselUrl(`${window.location.origin}/playlist/${carousel.id}`);
    setCarouselName(carousel.name || 'Playlist sin nombre');
    setShowSearchModal(false);
    toast.success('Playlist cargada exitosamente');
  };

  // Modal de búsqueda de playlists
  const SearchModal = React.memo(() => {
    const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);
    
    const filteredCarousels = React.useMemo(() => {
      const searchTermLower = localSearchTerm.toLowerCase();
      return savedCarousels.filter(carousel => {
        const empresa = empresas.find(e => e.id.toString() === carousel.empresa_id);
        
        // Filtrar por empresa habilitada
        if (!empresa || !isCompanyEnabled(carousel.empresa_id)) {
          return false;
        }
        
        // Buscar coincidencias en los dispositivos
        const deviceMatches = carousel.devices.some(deviceType => {
          const device = devices.find(d => d.value === deviceType);
          return device?.label.toLowerCase().includes(searchTermLower);
        });
        
        return (
          carousel.id.toLowerCase().includes(searchTermLower) ||
          (carousel.name || '').toLowerCase().includes(searchTermLower) ||
          empresa?.nombre.toLowerCase().includes(searchTermLower) ||
          deviceMatches || // Incluir coincidencias de dispositivos
          carousel.sucursales.some(suc => {
            const sucursal = sucursales.find(s => s.id.toString() === suc);
            return sucursal?.direccion.toLowerCase().includes(searchTermLower);
          })
        );
      });
    }, [localSearchTerm, savedCarousels, empresas, sucursales]);

    return (
      <AnimatePresence>
        {showSearchModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-xl max-w-4xl w-full max-h-[80vh] overflow-hidden flex flex-col"
            >
              <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-lg font-medium">Buscar Playlist</h3>
                <button
                  onClick={() => {
                    setShowSearchModal(false);
                    setLocalSearchTerm('');
                  }}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-4 border-b border-gray-200">
                <div className="relative flex gap-2">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={localSearchTerm}
                      onChange={(e) => setLocalSearchTerm(e.target.value)}
                      placeholder="Buscar por nombre, empresa, dispositivo, ID o sucursal..."
                      className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                    <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                  <button
                    onClick={loadSavedCarousels}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md flex items-center gap-2 text-gray-700"
                  >
                    <svg className={`w-4 h-4 ${isLoadingCarousels ? 'animate-spin' : ''}`} viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M12 4V2A10 10 0 0 0 2 12h2a8 8 0 0 1 8-8Z"
                      />
                    </svg>
                    Actualizar
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-auto p-4">
                {isLoadingCarousels ? (
                  <div className="flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  </div>
                ) : savedCarousels.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No se encontraron playlists guardadas
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredCarousels.map(carousel => {
                      const empresa = empresas.find(e => e.id.toString() === carousel.empresa_id);
                      return (
                        <div
                          key={carousel.id}
                          className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-all duration-200 hover:shadow-md"
                          onClick={() => loadCarousel(carousel)}
                        >
                          <div className="flex gap-4">
                            {/* Miniatura de la playlist */}
                            <div className="w-32 h-20 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                              {carousel.images[0] && (
                                carousel.images[0].type === 'image' ? (
                                  <img
                                    src={carousel.images[0].url}
                                    alt="Miniatura"
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center bg-gray-800">
                                    <Video className="w-6 h-6 text-white" />
                                  </div>
                                )
                              )}
                            </div>
                            
                            {/* Información principal */}
                            <div className="flex-1">
                              <div className="flex items-start justify-between">
                                <div>
                                  <div className="flex items-center gap-2">
                                    {empresa?.logo && (
                                      <img
                                        src={empresa.logo}
                                        alt={empresa.nombre}
                                        className="w-6 h-6 object-contain"
                                      />
                                    )}
                                    <h4 className="font-medium text-gray-900">{empresa?.nombre}</h4>
                                  </div>
                                  <p className="text-sm text-gray-500 mt-1">
                                    {carousel.name || 'Playlist sin nombre'} • ID: {carousel.id} • Creada: {new Date(carousel.created_at).toLocaleDateString()}
                                  </p>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span 
                                    className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full cursor-help"
                                    title={carousel.images.map(img => img.name).join('\n')}
                                  >
                                    {carousel.images.length} elementos
                                  </span>
                                  <span 
                                    className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full cursor-help"
                                    title={carousel.sucursales.map(sucId => {
                                      const sucursal = sucursales.find(s => s.id.toString() === sucId);
                                      return sucursal?.email || 'Sucursal no encontrada';
                                    }).join('\n')}
                                  >
                                    {carousel.sucursales.length} sucursales
                                  </span>
                                </div>
                              </div>
                              
                              {/* Detalles */}
                              <div className="mt-2 grid grid-cols-2 gap-4">
                                <div>
                                  <p className="text-xs text-gray-600 mb-1">Dispositivos:</p>
                                  <div className="flex flex-wrap gap-1">
                                    {carousel.devices.slice(0, 2).map(deviceType => {
                                      const device = devices.find(d => d.value === deviceType);
                                      return (
                                        <span key={deviceType} className="inline-flex items-center text-xs text-gray-500">
                                          {device?.icon}
                                          <span className="ml-1">{device?.label}</span>
                                        </span>
                                      );
                                    })}
                                  </div>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-600 mb-1">Período:</p>
                                  <p className="text-xs text-gray-500">
                                    {carousel.start_date ? 
                                      `${new Date(carousel.start_date).toLocaleDateString()} - ${new Date(carousel.end_date || '').toLocaleDateString()}` : 
                                      'Sin período definido'}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    );
  });

  // Cargar playlists cuando se abre el modal
  useEffect(() => {
    if (showSearchModal && savedCarousels.length === 0) {
      loadSavedCarousels();
    }
  }, [showSearchModal]);

  // Agregar video con auto-detección de duración
  const handleAddVideo = async () => {
    if (videoUrl) {
      const videoName = videoType === 'youtube' 
        ? `youtube-${new Date().getTime()}`
        : `local-${new Date().getTime()}`;
      
      // Para videos locales, intentar detectar duración
      let duration = 30; // Default
      if (videoType === 'local' && videoUrl.startsWith('blob:')) {
        try {
          // Si es un blob local, intentar obtener duración
          const video = document.createElement('video');
          video.src = videoUrl;
          await new Promise((resolve) => {
            video.onloadedmetadata = () => {
              duration = Math.round(video.duration) || 30;
              resolve(null);
            };
            video.onerror = () => resolve(null);
          });
        } catch (error) {
          console.error('Error detectando duración:', error);
        }
      }
      
      setSelectedImages([...selectedImages, {
        url: videoUrl,
        name: videoName,
        type: 'video',
        videoType,
        duration
      }]);
      setShowVideoModal(false);
      setVideoUrl('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-violet-900">
      <Header onBack={onBack} onLogout={onLogout} />
      <div className="min-h-screen flex flex-col bg-white">
        <main className="pt-10 px-6 pb-6 max-w-7xl mx-auto space-y-6">
          <div className="flex items-center justify-between gap-4 mb-8">
            <h2 className="text-2xl font-medium text-gray-900">Editor de Cartelería Digital</h2>
            <button
              onClick={() => setShowSearchModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-violet-500 text-white rounded-md hover:from-blue-600 hover:to-violet-600 transform hover:scale-105 transition-all duration-300 shadow-md hover:shadow-lg"
            >
              <Search className="w-5 h-5 animate-pulse" />
              Buscar Playlist
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 space-y-6 border border-gray-200">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Empresa
                </label>
                <CompanySelect
                  value={selectedEmpresa}
                  onChange={handleCompanyChange}
                  companies={empresas.map(empresa => ({
                    id: empresa.id.toString(),
                    name: empresa.nombre,
                    logo: empresa.logo
                  }))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sucursales
                </label>
                <LocationSelect
                  value={selectedSucursales}
                  onChange={setSelectedSucursales}
                  locations={sucursales.map(sucursal => ({
                    id: sucursal.id.toString(),
                    name: sucursal.direccion,
                    region: sucursal.nombre,
                    coordinates: [sucursal.latitud, sucursal.longitud],
                    address: sucursal.direccion
                  }))}
                  disabled={!selectedEmpresa}
                  isMulti={true}
                />
              </div>
            </div>

            {loading && (
              <div className="flex justify-center items-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              </div>
            )}

            <div className="mt-8">
              {selectedEmpresa && selectedSucursales.length > 0 ? (
                <div className="bg-white rounded-lg p-6 border border-gray-200 space-y-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      Configuración de la Playlist
                    </h3>
                    <div className="flex items-center gap-2 bg-white shadow-sm rounded-md border border-gray-300 hover:border-blue-500 transition-colors duration-200 group focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-opacity-50">
                      <div className="px-3 py-2 text-gray-400 group-hover:text-blue-500 group-focus-within:text-blue-500">
                        <Layout className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        value={carouselName}
                        onChange={(e) => setCarouselName(e.target.value)}
                        placeholder="Nombre de la playlist"
                        className="px-0 py-2 pr-3 border-0 focus:ring-0 text-sm text-gray-700 placeholder-gray-400 bg-transparent w-64 font-bold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Selector de Dispositivo */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tipo de Dispositivo
                      </label>
                      <Select
                        isMulti
                        value={devices.filter(d => selectedDevices.includes(d.value))}
                        onChange={(options) => setSelectedDevices(options ? options.map(opt => opt.value) : [])}
                        options={devices}
                        formatOptionLabel={formatDeviceOption}
                        classNames={{
                          control: (state) => `${state.isFocused ? 'border-indigo-500' : ''}`,
                          option: () => "px-3 py-2 hover:bg-gray-100 cursor-pointer"
                        }}
                        placeholder="Seleccionar dispositivos..."
                      />
                    </div>

                    {/* Fechas de Programación */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Fecha Inicio
                        </label>
                        <input
                          type="date"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                          min={new Date().toISOString().split('T')[0]}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Fecha Fin
                        </label>
                        <input
                          type="date"
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                          min={startDate || new Date().toISOString().split('T')[0]}
                        />
                      </div>
                    </div>

                    {/* Horarios de Reproducción */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Hora Inicio
                        </label>
                        <input
                          type="time"
                          value={startTime}
                          onChange={(e) => setStartTime(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Hora Fin
                        </label>
                        <input
                          type="time"
                          value={endTime}
                          onChange={(e) => setEndTime(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Preview de la Playlist */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-medium text-gray-900">
                      Previsualización de la Playlist
                    </h4>
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <CarouselPreview 
                        images={selectedImages}
                        isFullscreen={isFullscreen}
                        onFullscreenChange={handleFullscreenChange}
                      />
                    </div>
                  </div>

                  {/* Sección de botones */}
                  <div className="col-span-full flex justify-end gap-4 mt-6">
                    <button
                      onClick={() => setShowImageModal(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      <ImageIcon className="w-5 h-5" />
                      Agregar Imágenes ({selectedImages.filter(item => item.type === 'image').length})
                    </button>
                    <div className="relative">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleLocalImageUpload}
                        className="hidden"
                        id="local-image-upload"
                      />
                      <label
                        htmlFor="local-image-upload"
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 cursor-pointer"
                      >
                        <Upload className="w-5 h-5" />
                        Agregar Imagen Local
                      </label>
                    </div>
                    <button
                      onClick={() => setShowVideoModal(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      <Video className="w-5 h-5" />
                      Agregar Videos ({selectedImages.filter(item => item.type === 'video').length})
                    </button>
                    <button
                      onClick={handleSendCarousel}
                      disabled={!selectedDevices.length || !selectedImages.length || !selectedSucursales.length}
                      className={`flex items-center gap-2 px-4 py-2 rounded-md text-white
                        ${(!selectedDevices.length || !selectedImages.length || !selectedSucursales.length)
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-blue-500 hover:bg-blue-600'}`}
                    >
                      <Send className="w-5 h-5" />
                      Guardar
                    </button>
                  </div>

                  {/* Resumen actualizado */}
                  <div className="col-span-full mt-6 p-4 bg-gray-50 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Resumen de Configuración</h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li>• Sucursales seleccionadas: {selectedSucursales.length}</li>
                      <li>• Dispositivos: {selectedDevices.map(d => devices.find(dev => dev.value === d)?.label).join(', ') || 'No seleccionado'}</li>
                      <li>• Elementos seleccionados: {selectedImages.length}</li>
                      <li>• Período: {startDate ? `${startDate} al ${endDate}` : 'No configurado'}</li>
                      <li>• Horario: {`${startTime} a ${endTime}`}</li>
                      <li>• Tiempo total de reproducción: {selectedImages.reduce((total, img) => total + img.duration, 0)} segundos</li>
                      {selectedImages.length > 0 && (
                        <li className="mt-2">
                          <p className="font-medium text-gray-900 mb-3">Detalles de elementos (Arrastra para reordenar):</p>
                          <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={handleDragEnd}
                          >
                            <SortableContext
                              items={selectedImages.map((img) => img.name)}
                              strategy={verticalListSortingStrategy}
                            >
                              <div className="pl-4 space-y-2">
                                {selectedImages.map((img, index) => (
                                  <SortableItem
                                    key={img.name}
                                    img={img}
                                    index={index}
                                    selectedImages={selectedImages}
                                    onUpdateDuration={updateImageDuration}
                                    onRemove={(idx) => {
                                      setSelectedImages(selectedImages.filter((_, i) => i !== idx));
                                    }}
                                  />
                                ))}
                              </div>
                            </SortableContext>
                          </DndContext>
                        </li>
                      )}
                      {carouselUrl && (
                        <li className="pt-2">
                          <span className="font-medium text-gray-900">• URL de la Playlist:</span>
                          <div className="mt-1 flex items-center gap-2">
                            <input
                              type="text"
                              value={carouselUrl}
                              readOnly
                              className="flex-1 px-3 py-1 text-sm border border-gray-300 rounded bg-white"
                            />
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(carouselUrl);
                                toast.success('URL copiada al portapapeles');
                              }}
                              className="px-2 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                            >
                              Copiar
                            </button>
                          </div>
                        </li>
                      )}
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg p-6">
                  <p className="text-gray-500">
                    {!selectedEmpresa 
                      ? 'Seleccione una empresa para comenzar'
                      : 'Seleccione al menos una sucursal para configurar la playlist'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </main>

        {/* Modales */}
        <ImageModal />
        <VideoModal />
        <SendModal />
        <SearchModal />
      </div>
    </div>
  );
}; 