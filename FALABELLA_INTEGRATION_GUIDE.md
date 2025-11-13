# Guía de Integración de Falabella en el Editor de Carteles

## 📋 Resumen

Falabella ahora se carga automáticamente en el selector de empresas del Editor de Carteles. No requiere configuración manual.

## 🔄 Cómo Funciona

### Flujo de Inicialización

```
1. Usuario abre Editor de Carteles
   ↓
2. Hook useInitializeFalabella() se ejecuta
   ↓
3. Verifica si Falabella existe en la BD
   ↓
4a. Si NO existe → Inserta Falabella + 10 sucursales
4b. Si SÍ existe → Continúa sin cambios
   ↓
5. useEffect carga todas las empresas desde Supabase
   ↓
6. CompanySelect muestra Falabella en el dropdown
```

## 📁 Archivos Involucrados

### Nuevos
- **`/src/hooks/useInitializeFalabella.ts`** - Hook de inicialización automática

### Modificados
- **`/src/components/Posters/PosterEditor.tsx`**
  - Línea 35: Import del hook
  - Línea 343: Llamada al hook

### Existentes (No modificados)
- `/src/lib/supabaseClient-sucursales.ts` - Función `getEmpresas()`
- `/src/lib/addFalabellaData.ts` - Función `addFalabellaToDatabase()`
- `/src/components/Posters/CompanySelect.tsx` - Selector de empresas

## 🎯 Datos de Falabella

### Empresa
- **Nombre:** Falabella
- **Email:** contacto@falabella.com.pe
- **Teléfono:** +51 1 3313000
- **Sitio Web:** https://www.falabella.com.pe
- **Logo:** https://www.falabella.com.pe/static/images/logo.png
- **Estado:** activo

### Sucursales (Perú - 10)
1. Falabella Centro - Lima
2. Falabella Jockey Plaza - Lima
3. Falabella La Molina - Lima
4. Falabella Megaplaza - Lima
5. Falabella Saenz Peña - Lima
6. Falabella Arequipa
7. Falabella Trujillo
8. Falabella Chiclayo
9. Falabella Piura
10. Falabella Cusco

## 🧪 Cómo Verificar

### En la Consola del Navegador

1. Abre las Developer Tools (F12)
2. Ve a la pestaña "Console"
3. Navega al Editor de Carteles
4. Busca los logs:

```
✅ Falabella ya existe en la base de datos
// o
🏢 Falabella no encontrada. Inicializando...
✅ Falabella inicializada exitosamente
```

### En la UI

1. Abre el Editor de Carteles
2. Haz clic en el dropdown "Empresa"
3. Deberías ver "Falabella" con su logo

## ⚙️ Detalles Técnicos

### Hook: useInitializeFalabella()

```typescript
export const useInitializeFalabella = () => {
  // Retorna: { isInitialized: boolean, error: string | null }
  // Se ejecuta una sola vez al montar el componente
  // Verifica si Falabella existe
  // Si no existe, la inserta automáticamente
}
```

### Integración en PosterEditor

```typescript
// En el componente PosterEditor
useInitializeFalabella(); // Se ejecuta al montar

// Luego, el useEffect existente carga las empresas
useEffect(() => {
  const loadEmpresas = async () => {
    const empresas = await getEmpresas(); // Incluye Falabella
    setEmpresasFromDB(empresas);
  };
  loadEmpresas();
}, []);
```

### Combinación de Empresas

```typescript
const combinedCompanies = React.useMemo(() => {
  const staticCompanies = COMPANIES; // Empresas estáticas
  const dbCompanies = empresasFromDB.map(emp => ({
    id: emp.nombre.toLowerCase().replace(/\s+/g, '-'),
    name: emp.nombre,
    logo: emp.logo || 'https://via.placeholder.com/40',
    empresaId: emp.id
  }));
  
  // Combina y elimina duplicados
  const combined = [...staticCompanies];
  dbCompanies.forEach(dbComp => {
    if (!combined.find(c => c.name.toLowerCase() === dbComp.name.toLowerCase())) {
      combined.push(dbComp);
    }
  });
  
  return combined;
}, [empresasFromDB]);
```

## 🔍 Solución de Problemas

### Falabella no aparece en el dropdown

**Posibles causas:**
1. La BD no está conectada correctamente
2. Las variables de entorno de Supabase no están configuradas
3. La tabla `empresas` no existe

**Solución:**
- Verifica la consola del navegador para errores
- Confirma que `VITE_SUPABASE_URL` y `VITE_SUPABASE_SERVICE_KEY` están en `.env`
- Ejecuta manualmente: `await addFalabellaToDatabase()` en la consola

### Falabella aparece duplicada

**Causa:** La función `addFalabellaToDatabase()` ya verifica duplicados, pero si algo falla:

**Solución:**
```typescript
// En la consola del navegador
import { deleteFalabellaFromDatabase } from '@/lib/addFalabellaData';
await deleteFalabellaFromDatabase();
```

### Error al cargar empresas

**Verificar:**
1. Que Supabase esté disponible
2. Que la tabla `empresas` tenga datos
3. Que haya al menos una empresa con `estado = 'activo'`

## 📝 Notas

- La inicialización es **idempotente**: se puede ejecutar múltiples veces sin problemas
- Falabella se inserta con `estado = 'activo'` automáticamente
- El logo se carga desde la URL de Falabella
- Las sucursales incluyen coordenadas GPS y enlaces a Google Maps

## 🚀 Próximos Pasos

Si quieres agregar más empresas dinámicamente:

1. Usa `addFalabellaToDatabase()` como referencia
2. Crea funciones similares para otras empresas
3. Llama a esas funciones en el hook `useInitializeFalabella()`

Ejemplo:
```typescript
// En useInitializeFalabella.ts
await addFalabellaToDatabase();
await addOtraEmpresaToDatabase();
await addMasEmpresasToDatabase();
```
