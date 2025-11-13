# 🎨 Editor de Carteles - Integración Falabella

## ✅ Estado Actual

El Editor de Carteles (`/poster-editor`) ha sido actualizado para cargar empresas dinámicamente desde Supabase.

### Cambios Realizados

**Archivo: `src/components/Posters/PosterEditor.tsx`**

1. ✅ Importa `getEmpresas()` de Supabase
2. ✅ Carga empresas automáticamente al iniciar
3. ✅ Combina empresas estáticas + dinámicas
4. ✅ Elimina duplicados
5. ✅ Muestra todas en el dropdown

---

## 🚀 Cómo Usar

### Paso 1: Ejecutar Script SQL

Para agregar Falabella a la base de datos:

1. **Ir a Supabase Dashboard**
   - URL: https://app.supabase.com
   - Proyecto: wpwkymhpubusrghoosim

2. **Abrir SQL Editor**
   - Click en "SQL Editor" en el menú lateral
   - Click en "New Query"

3. **Copiar y ejecutar FALABELLA_DATA.sql**
   - Copiar contenido de `/FALABELLA_DATA.sql`
   - Pegar en el editor
   - Click en "Run"
   - Esperar confirmación

4. **Copiar y ejecutar FALABELLA_CHILE_DATA.sql** (Opcional)
   - Copiar contenido de `/FALABELLA_CHILE_DATA.sql`
   - Pegar en el editor
   - Click en "Run"
   - Esperar confirmación

### Paso 2: Verificar en el Editor

1. **Ir al Editor de Carteles**
   - URL: http://localhost:5173/poster-editor (o 5174 si está ocupado)

2. **Abrir dropdown de Empresa**
   - Buscar el campo "Empresa"
   - Click en el dropdown

3. **Verificar que aparece Falabella**
   - Debe aparecer en la lista
   - Con logo (si está disponible)
   - Junto a otras empresas

4. **Seleccionar Falabella**
   - Click en "Falabella"
   - Se selecciona automáticamente

### Paso 3: Crear Cartel

1. **Seleccionar Promoción**
   - Elegir una promoción del dropdown

2. **Seleccionar Categoría y Productos**
   - Elegir categoría
   - Seleccionar productos

3. **Crear Cartel**
   - El cartel se renderiza automáticamente
   - Con logo de Falabella
   - Con los productos seleccionados

---

## 📊 Estructura de Datos

### Tabla: empresas

```sql
id (PK)
nombre (string)
direccion (string)
telefono (string)
email (string)
sitio_web (string)
fecha_creacion (timestamp)
estado (enum: 'activo', 'inactivo')
logo (string - URL)
```

### Tabla: sucursales

```sql
id (PK)
empresa_id (FK → empresas.id)
nombre (string)
direccion (string)
telefono (string)
email (string)
horario (string)
latitud (number)
longitud (number)
mapa (string - URL)
```

---

## 🔍 Troubleshooting

### Falabella no aparece en el dropdown

**Posibles causas:**

1. **Script SQL no ejecutado**
   - Verificar que FALABELLA_DATA.sql se ejecutó correctamente
   - Ir a Supabase → SQL Editor → Ver historial

2. **Empresa no está activa**
   - Verificar en Supabase que `estado = 'activo'`
   - Query: `SELECT * FROM empresas WHERE nombre = 'Falabella'`

3. **Cache del navegador**
   - Limpiar cache: Ctrl+Shift+Delete (o Cmd+Shift+Delete en Mac)
   - Recargar página: Ctrl+R (o Cmd+R en Mac)

4. **Servidor no reiniciado**
   - Detener servidor: Ctrl+C
   - Reiniciar: `npm run dev`

### Falabella aparece pero sin logo

- Es normal si no hay URL de logo
- Se muestra placeholder gris
- Funciona igual para crear carteles

### Error al cargar empresas

- Verificar que `.env` tiene credenciales correctas
- Verificar que `VITE_SUPABASE_SERVICE_KEY` está configurada
- Ver console del navegador (F12) para errores

---

## 📋 Checklist

- [ ] Script SQL ejecutado en Supabase
- [ ] Falabella aparece en dropdown del editor
- [ ] Se puede seleccionar Falabella
- [ ] Se pueden crear carteles con Falabella
- [ ] Logo de Falabella se muestra (opcional)
- [ ] Sucursales de Perú agregadas (10)
- [ ] Sucursales de Chile agregadas (12)

---

## 🎯 Próximos Pasos

1. **Integración con Digital Carousel**
   - El Digital Carousel también cargará Falabella
   - Misma lógica de carga dinámica

2. **Agregar más empresas**
   - Agregar nuevas empresas a la BD
   - Aparecerán automáticamente en el editor

3. **Personalización**
   - Agregar logos de empresas
   - Configurar colores por empresa
   - Agregar más campos

---

## 📞 Información de Falabella

**Empresa:**
- Nombre: Falabella
- Email: contacto@falabella.com.pe
- Teléfono: +51 1 3313000
- Sitio: https://www.falabella.com.pe

**Sucursales:**
- 🇵🇪 Perú: 10 sucursales
- 🇨🇱 Chile: 12 sucursales
- **Total: 22 sucursales**

---

*Última actualización: 2025-11-13*
