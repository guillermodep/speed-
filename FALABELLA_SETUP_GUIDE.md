# 🏪 Guía de Configuración - Falabella

## 📋 Resumen Ejecutivo

Se ha agregado **Falabella** como empresa con **10 sucursales** principales en Perú a la base de datos Supabase. Se proporcionan 3 formas diferentes de implementar esta integración.

---

## 📁 Archivos Generados

### 1. **FALABELLA_DATA.sql**
Script SQL listo para ejecutar en Supabase SQL Editor.

**Ubicación:** `/Users/guille/Smart/SOFTWARE/speed-/FALABELLA_DATA.sql`

**Contenido:**
- Inserción de empresa Falabella
- Inserción de 10 sucursales con coordenadas GPS

**Uso:**
```bash
1. Ir a https://supabase.com/dashboard/project/wpwkymhpubusrghoosim/database/schemas
2. Abre SQL Editor
3. Copia el contenido del archivo
4. Ejecuta el script
```

---

### 2. **src/lib/addFalabellaData.ts**
Funciones TypeScript para gestionar datos de Falabella programáticamente.

**Ubicación:** `/Users/guille/Smart/SOFTWARE/speed-/src/lib/addFalabellaData.ts`

**Funciones Disponibles:**

#### `addFalabellaToDatabase()`
Agrega Falabella y sus sucursales a la BD.

```typescript
import { addFalabellaToDatabase } from '@/lib/addFalabellaData';

const result = await addFalabellaToDatabase();
// Retorna:
// {
//   success: true,
//   message: "Falabella y 10 sucursales agregadas exitosamente",
//   empresaId: 1,
//   sucursalesCount: 10,
//   sucursales: [...]
// }
```

#### `getFalabellaData()`
Obtiene la información de Falabella desde la BD.

```typescript
import { getFalabellaData } from '@/lib/addFalabellaData';

const { empresa, sucursales } = await getFalabellaData();
console.log(empresa.nombre); // "Falabella"
console.log(sucursales.length); // 10
```

#### `deleteFalabellaFromDatabase()`
Elimina Falabella y todas sus sucursales (útil para testing).

```typescript
import { deleteFalabellaFromDatabase } from '@/lib/addFalabellaData';

const result = await deleteFalabellaFromDatabase();
// Retorna:
// {
//   success: true,
//   message: "Falabella y todas sus sucursales han sido eliminadas"
// }
```

---

### 3. **src/components/Admin/FalabellaDataLoader.tsx**
Componente React con interfaz gráfica para gestionar datos de Falabella.

**Ubicación:** `/Users/guille/Smart/SOFTWARE/speed-/src/components/Admin/FalabellaDataLoader.tsx`

**Características:**
- ✅ Botón para agregar Falabella
- ✅ Botón para obtener datos
- ✅ Botón para eliminar (con confirmación)
- ✅ Visualización de resultados
- ✅ Notificaciones con toast
- ✅ Información detallada de empresa y sucursales

**Uso en React:**

```typescript
import { FalabellaDataLoader } from '@/components/Admin/FalabellaDataLoader';

export default function AdminPage() {
  return (
    <div className="p-6">
      <FalabellaDataLoader />
    </div>
  );
}
```

**Interfaz:**
```
┌─────────────────────────────────────────────────────────┐
│  Gestor de Datos - Falabella                            │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  [Agregar Falabella] [Obtener Datos] [Eliminar]        │
│                                                         │
│  ✅ Resultado:                                          │
│  ├─ Empresa: Falabella                                 │
│  ├─ Email: contacto@falabella.com.pe                   │
│  ├─ Sucursales: 10                                     │
│  └─ [Lista de sucursales...]                           │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

### 4. **DATABASE_STRUCTURE.md**
Documentación completa de la estructura de la base de datos.

**Ubicación:** `/Users/guille/Smart/SOFTWARE/speed-/DATABASE_STRUCTURE.md`

**Contenido:**
- Descripción de todas las tablas
- Campos y tipos de datos
- Ejemplos de datos
- Relaciones entre tablas
- Operaciones comunes
- Políticas de seguridad

---

## 🏢 Datos de Falabella

### Información de la Empresa

| Campo | Valor |
|-------|-------|
| **Nombre** | Falabella |
| **Email** | contacto@falabella.com.pe |
| **Teléfono** | +51 1 3313000 |
| **Sitio Web** | https://www.falabella.com.pe |
| **Dirección** | Av. Paseo de la República 3520, San Isidro, Lima |
| **Logo** | https://www.falabella.com.pe/static/images/logo.png |
| **Estado** | Activo |

### Sucursales (10 Total)

| # | Nombre | Ciudad | Coordenadas |
|---|--------|--------|-------------|
| 1 | Falabella Centro | San Isidro, Lima | -12.0931, -77.0341 |
| 2 | Falabella Jockey Plaza | Surco, Lima | -12.1097, -77.0282 |
| 3 | Falabella La Molina | La Molina, Lima | -12.0850, -76.9450 |
| 4 | Falabella Megaplaza | Cercado, Lima | -12.0500, -77.1100 |
| 5 | Falabella Saenz Peña | Rímac, Lima | -12.0450, -77.0850 |
| 6 | Falabella Arequipa | Arequipa | -16.3988, -71.5350 |
| 7 | Falabella Trujillo | Trujillo | -8.1109, -79.0277 |
| 8 | Falabella Chiclayo | Chiclayo | -6.7735, -79.8405 |
| 9 | Falabella Piura | Piura | -5.1944, -80.6328 |
| 10 | Falabella Cusco | Cusco | -13.5316, -71.9877 |

**Características de cada sucursal:**
- ✅ Nombre único
- ✅ Dirección completa
- ✅ Teléfono de contacto
- ✅ Email de sucursal
- ✅ Horario de atención (10 AM - 10 PM)
- ✅ Coordenadas GPS (latitud, longitud)
- ✅ URL de Google Maps

---

## 🚀 Cómo Implementar

### Opción 1: SQL Directo (Recomendado para Producción)

**Paso 1:** Abre Supabase Dashboard
```
https://supabase.com/dashboard/project/wpwkymhpubusrghoosim/database/schemas
```

**Paso 2:** Accede a SQL Editor
```
Click en "SQL Editor" en el menú lateral
```

**Paso 3:** Copia el script
```
Abre FALABELLA_DATA.sql
Copia todo el contenido
```

**Paso 4:** Ejecuta el script
```
Pega en SQL Editor
Click en "Run"
```

**Resultado:**
```
✅ Empresa Falabella creada
✅ 10 sucursales creadas
```

---

### Opción 2: TypeScript (Para Automatización)

**Paso 1:** Importa la función
```typescript
import { addFalabellaToDatabase } from '@/lib/addFalabellaData';
```

**Paso 2:** Ejecuta en tu código
```typescript
try {
  const result = await addFalabellaToDatabase();
  console.log('✅', result.message);
  console.log('Empresa ID:', result.empresaId);
  console.log('Sucursales:', result.sucursalesCount);
} catch (error) {
  console.error('❌ Error:', error);
}
```

**Paso 3:** Maneja el resultado
```typescript
if (result.success) {
  // Falabella agregada exitosamente
  // Puedes usar result.empresaId para referencias
} else {
  // Falabella ya existe o hubo error
  console.log(result.message);
}
```

---

### Opción 3: React Component (Para UI)

**Paso 1:** Importa el componente
```typescript
import { FalabellaDataLoader } from '@/components/Admin/FalabellaDataLoader';
```

**Paso 2:** Úsalo en tu página
```typescript
export default function AdminPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <FalabellaDataLoader />
    </div>
  );
}
```

**Paso 3:** Interactúa con la UI
```
1. Click en "Agregar Falabella"
2. Espera a que se complete
3. Verás los resultados en la pantalla
```

---

## 🔍 Verificación

### Verificar que Falabella fue agregada

**En Supabase Dashboard:**
1. Ve a "Table Editor"
2. Selecciona tabla "empresas"
3. Busca "Falabella"
4. Verifica que tenga estado "activo"

**Mediante SQL:**
```sql
SELECT * FROM empresas WHERE nombre = 'Falabella';
```

**Mediante TypeScript:**
```typescript
import { getFalabellaData } from '@/lib/addFalabellaData';

const { empresa, sucursales } = await getFalabellaData();
console.log('Empresa:', empresa);
console.log('Sucursales:', sucursales.length);
```

---

## 🗑️ Eliminar Falabella (Si es necesario)

### Opción 1: SQL
```sql
DELETE FROM sucursales WHERE empresa_id = (SELECT id FROM empresas WHERE nombre = 'Falabella');
DELETE FROM empresas WHERE nombre = 'Falabella';
```

### Opción 2: TypeScript
```typescript
import { deleteFalabellaFromDatabase } from '@/lib/addFalabellaData';

const result = await deleteFalabellaFromDatabase();
console.log(result.message);
```

### Opción 3: UI
```
1. Abre FalabellaDataLoader
2. Click en "Eliminar Falabella"
3. Confirma en el diálogo
```

---

## 📊 Estructura de Datos

### Tabla: empresas
```typescript
{
  id: number (auto-increment)
  nombre: string
  direccion: string
  telefono: string
  email: string
  sitio_web: string
  fecha_creacion: timestamp
  estado: string ('activo' | 'inactivo')
  logo: string (URL)
}
```

### Tabla: sucursales
```typescript
{
  id: number (auto-increment)
  empresa_id: number (FK → empresas.id)
  nombre: string
  direccion: string
  telefono: string
  email: string
  horario: string
  latitud: number
  longitud: number
  mapa: string (URL)
}
```

---

## 🔐 Seguridad

### Credenciales Utilizadas
- **Supabase URL:** https://wpwkymhpubusrghoosim.supabase.co
- **Service Key:** Almacenada en `.env` como `VITE_SUPABASE_SERVICE_KEY`
- **Anon Key:** Almacenada en `.env` como `VITE_SUPABASE_ANON_KEY`

### Políticas de Seguridad
- ✅ RLS (Row Level Security) habilitado
- ✅ Solo admin puede insertar/actualizar empresas
- ✅ Los datos son públicos para lectura
- ✅ Contraseñas no se exponen en respuestas

---

## 📞 Soporte

### Documentación
- [Supabase Docs](https://supabase.com/docs)
- [DATABASE_STRUCTURE.md](./DATABASE_STRUCTURE.md)
- [DIGITAL_CAROUSEL_ANALYSIS.md](./DIGITAL_CAROUSEL_ANALYSIS.md)

### Archivos de Referencia
- `FALABELLA_DATA.sql` - Script SQL
- `src/lib/addFalabellaData.ts` - Funciones TypeScript
- `src/components/Admin/FalabellaDataLoader.tsx` - Componente React

---

## ✅ Checklist de Implementación

- [ ] Revisar archivos generados
- [ ] Elegir método de implementación (SQL, TS o React)
- [ ] Ejecutar la inserción de datos
- [ ] Verificar que Falabella aparece en la BD
- [ ] Probar que las sucursales se cargan correctamente
- [ ] Usar Falabella en Digital Carousel
- [ ] Documentar en changelog

---

## 🎯 Próximos Pasos

1. **Implementar Falabella** usando uno de los 3 métodos
2. **Verificar datos** en Supabase Dashboard
3. **Probar en Digital Carousel** - seleccionar Falabella como empresa
4. **Crear playlists** para sucursales de Falabella
5. **Distribuir contenido** a dispositivos en tiendas

---

*Guía generada: 2025-11-12*
*Última actualización: Falabella Setup*
