# 📊 Estructura de Base de Datos - Supabase

## Información de Conexión
- **URL:** https://supabase.com/dashboard/project/wpwkymhpubusrghoosim/database/schemas
- **Project ID:** wpwkymhpubusrghoosim
- **Region:** Supabase Cloud

---

## 📋 Tablas Principales

### 1. **empresas**
Almacena información de las empresas/cadenas retail

**Campos:**
```typescript
{
  id: number (PRIMARY KEY, auto-increment)
  nombre: varchar (nombre de la empresa)
  direccion: varchar (dirección principal)
  telefono: varchar (teléfono de contacto)
  email: varchar (email de contacto)
  sitio_web: varchar (URL del sitio web)
  fecha_creacion: timestamp (fecha de creación)
  estado: varchar (activo/inactivo)
  logo: varchar (URL del logo)
}
```

**Ejemplo:**
```json
{
  "id": 1,
  "nombre": "Falabella",
  "direccion": "Av. Paseo de la República 3520, San Isidro, Lima",
  "telefono": "+51 1 3313000",
  "email": "contacto@falabella.com.pe",
  "sitio_web": "https://www.falabella.com.pe",
  "fecha_creacion": "2025-11-12T12:53:00Z",
  "estado": "activo",
  "logo": "https://www.falabella.com.pe/static/images/logo.png"
}
```

---

### 2. **sucursales**
Almacena información de las sucursales/tiendas de cada empresa

**Campos:**
```typescript
{
  id: number (PRIMARY KEY, auto-increment)
  empresa_id: number (FOREIGN KEY → empresas.id)
  nombre: varchar (nombre de la sucursal)
  direccion: varchar (dirección completa)
  telefono: varchar (teléfono de la sucursal)
  email: varchar (email de la sucursal)
  horario: varchar (horario de atención)
  latitud: numeric (coordenada GPS)
  longitud: numeric (coordenada GPS)
  mapa: varchar (URL de Google Maps)
}
```

**Ejemplo:**
```json
{
  "id": 1,
  "empresa_id": 1,
  "nombre": "Falabella Centro",
  "direccion": "Av. Paseo de la República 3520, San Isidro, Lima",
  "telefono": "+51 1 3313000",
  "email": "centro@falabella.com.pe",
  "horario": "Lunes a Domingo: 10:00 AM - 10:00 PM",
  "latitud": -12.0931,
  "longitud": -77.0341,
  "mapa": "https://maps.google.com/?q=-12.0931,-77.0341"
}
```

---

### 3. **users**
Almacena información de usuarios del sistema

**Campos:**
```typescript
{
  id: number (PRIMARY KEY, auto-increment)
  name: varchar (nombre del usuario)
  email: varchar (email único)
  password: varchar (contraseña - almacenada en texto plano para demo)
  role: varchar (admin/limited)
  status: varchar (active/inactive)
  created_at: timestamp (fecha de creación)
}
```

**Ejemplo:**
```json
{
  "id": 1,
  "name": "Admin User",
  "email": "admin@admin.com",
  "password": "admin",
  "role": "admin",
  "status": "active",
  "created_at": "2025-11-12T12:00:00Z"
}
```

---

### 4. **carousels**
Almacena las playlists digitales creadas

**Campos:**
```typescript
{
  id: varchar (PRIMARY KEY, random string)
  name: varchar (nombre de la playlist)
  empresa_id: varchar (ID de la empresa)
  images: jsonb (array de imágenes/videos)
  devices: jsonb (array de tipos de dispositivos)
  sucursales: jsonb (array de IDs de sucursales)
  start_date: date (fecha de inicio)
  end_date: date (fecha de fin)
  start_time: time (hora de inicio)
  end_time: time (hora de fin)
  created_at: timestamp (fecha de creación)
}
```

**Estructura de images:**
```typescript
{
  url: string (URL de la imagen/video)
  name: string (nombre del archivo)
  type: 'image' | 'video' (tipo de media)
  videoType?: 'local' | 'youtube' (si es video)
  duration: number (segundos a mostrar)
}
```

**Ejemplo:**
```json
{
  "id": "abc123def456",
  "name": "Promoción Navidad 2025",
  "empresa_id": "1",
  "images": [
    {
      "url": "https://...",
      "name": "promo1.jpg",
      "type": "image",
      "duration": 5
    },
    {
      "url": "https://youtube.com/watch?v=...",
      "name": "video-promo",
      "type": "video",
      "videoType": "youtube",
      "duration": 30
    }
  ],
  "devices": ["videowall", "caja-registradora"],
  "sucursales": ["1", "2", "3"],
  "start_date": "2025-12-01",
  "end_date": "2025-12-25",
  "start_time": "08:00",
  "end_time": "20:00",
  "created_at": "2025-11-12T12:53:00Z"
}
```

---

### 5. **products**
Almacena información de productos

**Campos:**
```typescript
{
  id: number (PRIMARY KEY)
  name: varchar (nombre del producto)
  description: text (descripción)
  price: numeric (precio)
  category_id: number (categoría)
  image_url: varchar (URL de imagen)
  status: varchar (product_status)
  created_at: timestamp
  updated_at: timestamp
}
```

---

### 6. **product_categories**
Categorías de productos

**Campos:**
```typescript
{
  id: number (PRIMARY KEY)
  name: varchar (nombre de categoría)
  description: text
  created_at: timestamp
  updated_at: timestamp
}
```

---

### 7. **promotions**
Almacena promociones

**Campos:**
```typescript
{
  id: number (PRIMARY KEY)
  name: varchar (nombre de promoción)
  description: text
  discount_percentage: numeric
  start_date: date
  end_date: date
  status: varchar
  created_at: timestamp
  updated_at: timestamp
}
```

---

### 8. **builder**
Almacena datos de plantillas creadas

**Campos:**
```typescript
{
  id: number (PRIMARY KEY)
  image_url: varchar (URL de la imagen)
  created_by: number (ID del usuario)
  created_at: timestamp
  type: varchar (tipo de contenido)
  status: varchar (estado)
}
```

---

## 🔗 Relaciones

```
empresas (1) ──────────────────── (N) sucursales
   ↓
   └─ Cada empresa puede tener múltiples sucursales
   └─ Las sucursales se usan en carousels y otras funcionalidades

users (1) ──────────────────── (N) builder
   ↓
   └─ Cada usuario puede crear múltiples plantillas

carousels
   ├─ Referencia a empresa_id
   ├─ Contiene array de sucursales
   └─ Contiene array de dispositivos
```

---

## 📝 Operaciones Comunes

### Obtener todas las empresas activas
```typescript
const { data } = await supabaseAdmin
  .from('empresas')
  .select('*')
  .eq('estado', 'activo');
```

### Obtener sucursales de una empresa
```typescript
const { data } = await supabaseAdmin
  .from('sucursales')
  .select('*')
  .eq('empresa_id', empresaId);
```

### Crear una nueva empresa
```typescript
const { data } = await supabaseAdmin
  .from('empresas')
  .insert([{
    nombre: 'Falabella',
    direccion: '...',
    telefono: '...',
    email: '...',
    sitio_web: '...',
    estado: 'activo',
    logo: '...'
  }])
  .select()
  .single();
```

### Crear sucursales para una empresa
```typescript
const { data } = await supabaseAdmin
  .from('sucursales')
  .insert([
    {
      empresa_id: empresaId,
      nombre: 'Sucursal 1',
      direccion: '...',
      // ... más campos
    },
    {
      empresa_id: empresaId,
      nombre: 'Sucursal 2',
      // ...
    }
  ])
  .select();
```

### Guardar una playlist
```typescript
const { data } = await supabaseAdmin
  .from('carousels')
  .upsert({
    id: carouselId,
    name: 'Mi Playlist',
    empresa_id: empresaId,
    images: [...],
    devices: [...],
    sucursales: [...],
    start_date: '2025-12-01',
    end_date: '2025-12-25',
    start_time: '08:00',
    end_time: '20:00',
    created_at: new Date().toISOString()
  })
  .select()
  .single();
```

---

## 🔐 Seguridad

### Políticas de Fila (RLS)
- Las tablas tienen políticas de seguridad configuradas
- Se requiere autenticación para acceder a datos sensibles
- Los usuarios limitados solo ven datos de su empresa

### Credenciales
- **Anon Key:** Para operaciones públicas (lectura)
- **Service Key:** Para operaciones administrativas (lectura/escritura)

---

## 📊 Datos de Falabella Agregados

### Empresa
- **Nombre:** Falabella
- **Email:** contacto@falabella.com.pe
- **Teléfono:** +51 1 3313000
- **Sitio Web:** https://www.falabella.com.pe

### Sucursales (10 total)
1. Falabella Centro - San Isidro, Lima
2. Falabella Jockey Plaza - Surco, Lima
3. Falabella La Molina - La Molina, Lima
4. Falabella Megaplaza - Cercado, Lima
5. Falabella Saenz Peña - Rímac, Lima
6. Falabella Arequipa - Arequipa
7. Falabella Trujillo - Trujillo
8. Falabella Chiclayo - Chiclayo
9. Falabella Piura - Piura
10. Falabella Cusco - Cusco

---

## 🚀 Cómo Usar los Scripts

### Opción 1: SQL Directo en Supabase
1. Ve a https://supabase.com/dashboard/project/wpwkymhpubusrghoosim/database/schemas
2. Abre SQL Editor
3. Copia el contenido de `FALABELLA_DATA.sql`
4. Ejecuta el script

### Opción 2: Usar TypeScript
```typescript
import { addFalabellaToDatabase } from '@/lib/addFalabellaData';

const result = await addFalabellaToDatabase();
console.log(result);
```

### Opción 3: Usar Componente React
```typescript
import { FalabellaDataLoader } from '@/components/Admin/FalabellaDataLoader';

export default function AdminPage() {
  return <FalabellaDataLoader />;
}
```

---

## 📞 Contacto y Soporte

Para más información sobre la estructura de la base de datos:
- Documentación de Supabase: https://supabase.com/docs
- Dashboard: https://supabase.com/dashboard/project/wpwkymhpubusrghoosim

---

*Última actualización: 2025-11-12*
