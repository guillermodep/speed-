# 🎬 Digital Carousel (Cartelería Digital) - Análisis Detallado

## 📋 Índice
1. [Visión General](#visión-general)
2. [Arquitectura](#arquitectura)
3. [Componentes](#componentes)
4. [Flujo de Datos](#flujo-de-datos)
5. [Base de Datos](#base-de-datos)
6. [Funcionalidades](#funcionalidades)
7. [Rutas](#rutas)
8. [Limitaciones y Mejoras](#limitaciones-y-mejoras)

---

## 🎯 Visión General

El módulo **Digital Carousel** es un sistema completo para crear, gestionar y distribuir playlists digitales a múltiples sucursales y tipos de dispositivos en una red retail.

### Casos de Uso Principales
- ✅ Crear playlists de imágenes y videos
- ✅ Programar reproducción por fechas y horarios
- ✅ Distribuir a múltiples sucursales y dispositivos
- ✅ Visualizar en pantallas digitales en tiempo real
- ✅ Buscar y reutilizar playlists guardadas

---

## 🏗️ Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│                    DIGITAL CAROUSEL SYSTEM                  │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────┐         ┌──────────────────┐         │
│  │ DigitalCarousel  │         │  CarouselView    │         │
│  │    Editor        │────────▶│   (Playback)     │         │
│  │  (1668 líneas)   │         │                  │         │
│  └──────────────────┘         └──────────────────┘         │
│         │                             │                     │
│         │                             │                     │
│         ▼                             ▼                     │
│  ┌──────────────────┐         ┌──────────────────┐         │
│  │   Supabase DB    │         │  Public URL      │         │
│  │  (carousels)     │         │  /playlist/{id}  │         │
│  └──────────────────┘         └──────────────────┘         │
│         │                                                    │
│         ▼                                                    │
│  ┌──────────────────┐                                       │
│  │  Storage Bucket  │                                       │
│  │    (posters)     │                                       │
│  └──────────────────┘                                       │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 🧩 Componentes

### 1. **DigitalCarouselEditor.tsx** (Principal)
**Ubicación:** `/src/components/DigitalCarousel/DigitalCarouselEditor.tsx`

#### Responsabilidades
- Interfaz de creación/edición de playlists
- Selección de empresa y sucursales
- Gestión de dispositivos
- Configuración de horarios
- Carga de imágenes/videos
- Previsualización
- Guardado en base de datos

#### Estructura de Estado
```typescript
// Selección de Empresa y Sucursales
const [empresas, setEmpresas] = useState<Empresa[]>([]);
const [selectedEmpresa, setSelectedEmpresa] = useState<string>('');
const [sucursales, setSucursales] = useState<Sucursal[]>([]);
const [selectedSucursales, setSelectedSucursales] = useState<string[]>([]);

// Configuración de Dispositivos
const [selectedDevices, setSelectedDevices] = useState<DeviceType[]>([]);

// Programación
const [startDate, setStartDate] = useState<string>('');
const [endDate, setEndDate] = useState<string>('');
const [startTime, setStartTime] = useState<string>('08:00');
const [endTime, setEndTime] = useState<string>('20:00');

// Contenido
const [selectedImages, setSelectedImages] = useState<SelectedImage[]>([]);
const [availableImages, setAvailableImages] = useState<SelectedImage[]>([]);

// URL y ID
const [carouselId, setCarouselId] = useState<string>('');
const [carouselUrl, setCarouselUrl] = useState<string>('');
const [carouselName, setCarouselName] = useState<string>('Playlist sin nombre');

// Modales
const [showImageModal, setShowImageModal] = useState(false);
const [showVideoModal, setShowVideoModal] = useState(false);
const [showSendModal, setShowSendModal] = useState(false);
const [showSearchModal, setShowSearchModal] = useState(false);
```

#### Tipos de Dispositivos Soportados
```typescript
type DeviceType = 
  | 'videowall'
  | 'caja-registradora'
  | 'self-checkout'
  | 'kiosko-digital'
  | 'tablet-carrito'
  | 'pantalla-interactiva'
  | 'punta-gondola';

const devices: Device[] = [
  { value: 'videowall', label: 'Videowall', icon: <Layers /> },
  { value: 'caja-registradora', label: 'Pantalla de Caja Registradora', icon: <Monitor /> },
  { value: 'self-checkout', label: 'Self-Checkout (Caja de Autopago)', icon: <ShoppingCart /> },
  { value: 'kiosko-digital', label: 'Kiosco Digital', icon: <MonitorSmartphone /> },
  { value: 'tablet-carrito', label: 'Tablet/Pantalla en Carrito', icon: <Tablet /> },
  { value: 'pantalla-interactiva', label: 'Pantalla Interactiva', icon: <TouchpadOff /> },
  { value: 'punta-gondola', label: 'Punta de Góndola', icon: <Layout /> }
];
```

### 2. **CarouselView.tsx** (Reproducción)
**Ubicación:** `/src/components/DigitalCarousel/CarouselView.tsx`

#### Responsabilidades
- Cargar playlist por ID
- Validar restricciones de fecha/hora
- Reproducir en pantalla completa
- Auto-avanzar entre elementos
- Soportar múltiples tipos de media

#### Validaciones
```typescript
// Validar rango de fechas
if (startDate && now < startDate) {
  throw new Error('Esta playlist aún no está disponible');
}
if (endDate && now > endDate) {
  throw new Error('Esta playlist ya no está disponible');
}

// Validar horario
if (currentTime < startTimeMinutes || currentTime > endTimeMinutes) {
  throw new Error(`Esta playlist solo está disponible de ${startTime} a ${endTime}`);
}
```

### 3. **DigitalSignageView.tsx** (Alternativa)
**Ubicación:** `/src/components/DigitalSignage/DigitalSignageView.tsx`

#### Responsabilidades
- Vista alternativa para señalética digital
- Reproducción de posters en carrusel
- Controles de reproducción
- Modo pantalla completa

---

## 🔄 Flujo de Datos

### Creación de Nueva Playlist
```
1. Seleccionar Empresa
   ↓
2. Cargar Sucursales de la Empresa
   ↓
3. Seleccionar Sucursales
   ↓
4. Seleccionar Dispositivos
   ↓
5. Configurar Fechas y Horarios
   ↓
6. Agregar Imágenes/Videos
   ↓
7. Configurar Duración de cada Elemento
   ↓
8. Previsualizar
   ↓
9. Guardar en Supabase
   ↓
10. Generar URL Única
   ↓
11. Compartir o Enviar a Sucursales
```

### Carga de Imágenes
```
1. Usuario hace clic en "Agregar Imágenes"
   ↓
2. Se abre Modal de Selección
   ↓
3. Se cargan imágenes del bucket 'posters'
   ↓
4. Usuario busca/filtra por nombre
   ↓
5. Usuario selecciona imágenes (multi-select)
   ↓
6. Se valida accesibilidad de cada imagen
   ↓
7. Se agregan a selectedImages con duración default (3s)
```

### Reproducción de Playlist
```
1. Usuario accede a /playlist/{id}
   ↓
2. Se carga datos del carrusel desde DB
   ↓
3. Se validan restricciones de fecha/hora
   ↓
4. Se inicia reproducción en pantalla completa
   ↓
5. Para cada elemento:
   - Si es imagen: mostrar por X segundos
   - Si es video YouTube: reproducir con autoplay
   - Si es video local: reproducir y esperar onEnded
   ↓
6. Auto-avanzar al siguiente elemento
   ↓
7. Repetir indefinidamente
```

---

## 💾 Base de Datos

### Tabla: `carousels`
```sql
CREATE TABLE carousels (
  id VARCHAR PRIMARY KEY,
  name VARCHAR,
  empresa_id VARCHAR,
  images JSONB,  -- Array de SelectedImage
  devices JSONB,  -- Array de DeviceType
  sucursales JSONB,  -- Array de IDs
  start_date DATE,
  end_date DATE,
  start_time TIME,
  end_time TIME,
  created_at TIMESTAMP
);
```

### Interfaz: `SelectedImage`
```typescript
interface SelectedImage {
  url: string;              // URL de la imagen/video
  name: string;             // Nombre del archivo
  type: 'image' | 'video';  // Tipo de media
  videoType?: 'local' | 'youtube';  // Si es video
  duration: number;         // Segundos a mostrar
}
```

### Interfaz: `Carousel` (Completa)
```typescript
interface Carousel {
  id: string;
  name: string;
  empresa_id: string;
  images: SelectedImage[];
  devices: DeviceType[];
  sucursales: string[];
  start_date: string | null;
  end_date: string | null;
  start_time: string | null;
  end_time: string | null;
  created_at: string;
}
```

---

## ⚙️ Funcionalidades Principales

### 1. Selección de Empresa y Sucursales
```typescript
// Cargar empresas al montar
useEffect(() => {
  const loadEmpresas = async () => {
    const data = await getEmpresas();
    setEmpresas(data);
  };
  loadEmpresas();
}, []);

// Cargar sucursales cuando cambia empresa
useEffect(() => {
  if (!selectedEmpresa) return;
  const loadSucursales = async () => {
    const data = await getSucursalesPorEmpresa(parseInt(selectedEmpresa));
    setSucursales(data);
  };
  loadSucursales();
}, [selectedEmpresa]);
```

### 2. Carga de Imágenes Disponibles
```typescript
// Cargar imágenes del bucket
useEffect(() => {
  const loadImages = async () => {
    const { data: files } = await supabaseAdmin.storage
      .from('posters')
      .list();
    
    // Filtrar solo imágenes
    const imagePromises = files
      .filter(file => file.name.match(/\.(jpg|jpeg|png|gif)$/i))
      .map(async file => {
        const { data: urlData } = supabaseAdmin.storage
          .from('posters')
          .getPublicUrl(file.name);
        
        // Validar que la imagen sea accesible
        const response = await fetch(urlData.publicUrl);
        if (!response.ok) return null;
        
        return {
          name: file.name,
          url: urlData.publicUrl,
          type: 'image' as const,
          duration: 3
        };
      });
    
    const images = (await Promise.all(imagePromises))
      .filter((img): img is SelectedImage => img !== null);
    setAvailableImages(images);
  };
  loadImages();
}, []);
```

### 3. Generación de URL Única
```typescript
useEffect(() => {
  if (selectedImages.length > 0) {
    if (!carouselId) {
      const newCarouselId = Math.random().toString(36).substring(2, 15);
      setCarouselId(newCarouselId);
      setCarouselUrl(`${window.location.origin}/playlist/${newCarouselId}`);
    }
  } else {
    setCarouselId('');
    setCarouselUrl('');
  }
}, [selectedImages, carouselId]);
```

### 4. Guardado en Base de Datos
```typescript
const handleSendCarousel = async () => {
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
};
```

### 5. Búsqueda de Playlists Guardadas
```typescript
const filteredCarousels = React.useMemo(() => {
  const searchTermLower = localSearchTerm.toLowerCase();
  return savedCarousels.filter(carousel => {
    const empresa = empresas.find(e => e.id.toString() === carousel.empresa_id);
    
    // Buscar en múltiples campos
    return (
      carousel.id.toLowerCase().includes(searchTermLower) ||
      (carousel.name || '').toLowerCase().includes(searchTermLower) ||
      empresa?.nombre.toLowerCase().includes(searchTermLower) ||
      // Buscar en dispositivos
      carousel.devices.some(deviceType => {
        const device = devices.find(d => d.value === deviceType);
        return device?.label.toLowerCase().includes(searchTermLower);
      }) ||
      // Buscar en sucursales
      carousel.sucursales.some(suc => {
        const sucursal = sucursales.find(s => s.id.toString() === suc);
        return sucursal?.direccion.toLowerCase().includes(searchTermLower);
      })
    );
  });
}, [localSearchTerm, savedCarousels, empresas, sucursales]);
```

---

## 🛣️ Rutas

| Ruta | Componente | Descripción |
|------|-----------|-------------|
| `/digital-carousel` | `DigitalCarouselEditor` | Editor principal de playlists |
| `/playlist/:id` | `CarouselView` | Reproducción de playlist |
| `/carousel/:id` | `CarouselView` | Reproducción de playlist (alternativa) |
| `/digital-signage` | `DigitalSignageView` | Vista alternativa de señalética |

---

## 🎨 Componentes Modales

### ImageModal
- **Propósito:** Seleccionar imágenes del bucket de Supabase
- **Características:**
  - Vista Grid/Lista intercambiable
  - Búsqueda por nombre
  - Multi-select
  - Indicador de selección con checkmark
  - Scroll infinito

### VideoModal
- **Propósito:** Agregar videos (YouTube o locales)
- **Características:**
  - Toggle entre YouTube y video local
  - Input de URL de YouTube
  - Upload de archivo local
  - Preview antes de agregar
  - Duración default: 30 segundos

### SendModal
- **Propósito:** Distribuir playlist a sucursales
- **Características:**
  - Lista de sucursales seleccionadas
  - Botón individual de envío por sucursal
  - Indicadores de estado (pending/sending/success/error)
  - Botón "Enviar a Todas"
  - Animaciones de envío

### SearchModal
- **Propósito:** Buscar y cargar playlists guardadas
- **Características:**
  - Búsqueda por nombre, empresa, dispositivo, ID o sucursal
  - Miniatura de playlist
  - Información de empresa y fecha
  - Contador de elementos y sucursales
  - Click para cargar y editar

---

## 🔧 Funciones Clave

### `handleImageSelection(image)`
Agrega o remueve una imagen de la playlist
```typescript
- Valida accesibilidad de la imagen
- Si ya está seleccionada: la remueve
- Si no está: la agrega con duración default (3s)
- Muestra toast de confirmación
```

### `handleLocalImageUpload(event)`
Carga imágenes locales del usuario
```typescript
- Valida que sea imagen
- Valida tamaño máximo (5MB)
- Crea URL temporal
- Valida que sea imagen válida
- Agrega a selectedImages
```

### `updateImageDuration(name, duration)`
Actualiza la duración de un elemento
```typescript
- Busca elemento por nombre
- Actualiza duración
- Recalcula tiempo total
```

### `loadSavedCarousels()`
Carga todas las playlists guardadas
```typescript
- Query a tabla carousels
- Ordena por created_at descendente
- Guarda en estado
```

### `loadCarousel(carousel)`
Carga una playlist guardada para editar
```typescript
- Rellena todos los campos con datos guardados
- Cierra modal de búsqueda
- Muestra toast de confirmación
```

---

## 📊 Limitaciones Actuales

1. ❌ **Sin detección automática de duración de videos**
   - Se usa default de 30 segundos
   - Usuario debe ajustar manualmente

2. ❌ **Sin interfaz drag-drop para reordenar**
   - Solo botones de flecha arriba/abajo
   - Poco intuitivo para muchos elementos

3. ❌ **Búsqueda carga todas las playlists**
   - Sin paginación
   - Puede ser lento con muchas playlists

4. ❌ **Sin funcionalidad de eliminar playlists**
   - No hay botón de delete/archive
   - Las playlists se acumulan indefinidamente

5. ❌ **Sin clonar/duplicar playlists**
   - Usuario debe crear desde cero
   - Ineficiente para playlists similares

6. ❌ **Sin analytics de visualización**
   - No se registra cuándo se ve una playlist
   - No hay estadísticas de uso

7. ❌ **Sin control de acceso por sucursal**
   - Cualquier usuario puede ver/editar todas
   - Sin permisos granulares

---

## 💡 Mejoras Sugeridas

### Priority 1 (Alta)
- [ ] Agregar botón de eliminar/archivar playlists
- [ ] Implementar drag-drop para reordenar elementos
- [ ] Agregar detección automática de duración de videos
- [ ] Paginar búsqueda de playlists

### Priority 2 (Media)
- [ ] Agregar función de clonar playlist
- [ ] Agregar vista de calendario para programación
- [ ] Agregar templates de playlists
- [ ] Agregar vista de analytics

### Priority 3 (Baja)
- [ ] Agregar control de acceso por rol
- [ ] Agregar operaciones en lote
- [ ] Agregar historial de cambios
- [ ] Agregar presets de duración

---

## 📝 Notas Técnicas

### Performance
- `CarouselPreview` usa `useCallback` para optimizar navegación
- `SearchModal` es memoizado con `React.memo`
- Búsqueda usa `useMemo` para evitar recálculos

### Validaciones
- Imágenes: máximo 5MB, formatos jpg/jpeg/png/gif
- URLs: validadas con fetch antes de agregar
- Fechas: fecha fin >= fecha inicio
- Horarios: hora fin >= hora inicio

### Almacenamiento
- Imágenes: bucket 'posters' en Supabase Storage
- Metadatos: tabla 'carousels' en Supabase DB
- URLs: públicas y accesibles sin autenticación

---

## 🚀 Próximos Pasos Recomendados

1. **Investigar limitaciones actuales** con casos de uso reales
2. **Priorizar mejoras** según feedback de usuarios
3. **Implementar mejoras Priority 1** primero
4. **Agregar tests** para nuevas funcionalidades
5. **Documentar cambios** en changelog

---

*Documento generado: 2025-11-12*
*Última actualización: Digital Carousel Analysis*
