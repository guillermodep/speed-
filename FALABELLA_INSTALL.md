# 🏪 Instalación de Falabella - Guía Rápida

## ✅ El Error Fue Corregido

El script SQL anterior tenía placeholders `{FALABELLA_ID}` que causaban error de sintaxis.

**Solución:** Se reescribió el script usando una **transacción con CTE (Common Table Expression)** que:
- ✅ Inserta la empresa Falabella
- ✅ Obtiene su ID automáticamente
- ✅ Inserta las 10 sucursales en una sola operación
- ✅ No requiere placeholders manuales

---

## 🚀 Cómo Instalar Ahora

### Opción 1: SQL Directo (Recomendado) ⭐

**Paso 1:** Abre Supabase Dashboard
```
https://supabase.com/dashboard/project/wpwkymhpubusrghoosim/database/schemas
```

**Paso 2:** Accede a SQL Editor
```
En el menú lateral, busca "SQL Editor"
Click en el icono de SQL
```

**Paso 3:** Copia el script
```
Abre el archivo: FALABELLA_DATA.sql
Copia TODO el contenido
```

**Paso 4:** Pega y ejecuta
```
Pega en el editor SQL de Supabase
Click en "Run" o presiona Ctrl+Enter
```

**Resultado esperado:**
```
✅ 10 rows inserted into sucursales
✅ Falabella y sus sucursales están en la BD
```

---

### Opción 2: TypeScript (Desde la Aplicación)

**Paso 1:** Abre una terminal en el proyecto
```bash
cd /Users/guille/Smart/SOFTWARE/speed-
```

**Paso 2:** Crea un archivo de prueba
```typescript
// test-falabella.ts
import { addFalabellaToDatabase } from './src/lib/addFalabellaData';

(async () => {
  try {
    const result = await addFalabellaToDatabase();
    console.log('✅ Resultado:', result);
  } catch (error) {
    console.error('❌ Error:', error);
  }
})();
```

**Paso 3:** Ejecuta con Node
```bash
npx ts-node test-falabella.ts
```

---

### Opción 3: React Component (Desde la UI)

**Paso 1:** Importa el componente en una página admin
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

**Paso 2:** Navega a la página en el navegador

**Paso 3:** Click en "Agregar Falabella"

**Resultado:** Verás los datos en la pantalla

---

## 📋 Script SQL Corregido

El archivo `FALABELLA_DATA.sql` ahora contiene:

```sql
WITH nueva_empresa AS (
  INSERT INTO empresas (...)
  VALUES (...)
  RETURNING id
)
INSERT INTO sucursales (...)
SELECT
  ne.id,
  sucursal.*
FROM nueva_empresa ne,
LATERAL (
  VALUES
    ('Falabella Centro', ...),
    ('Falabella Jockey Plaza', ...),
    ...
) AS sucursal(...)
```

**Ventajas:**
- ✅ Una sola operación SQL
- ✅ Sin placeholders manuales
- ✅ Transacción atómica (todo o nada)
- ✅ Obtiene automáticamente el ID de la empresa

---

## ✨ Verificación

### Después de ejecutar, verifica:

**En Supabase Dashboard:**
1. Ve a "Table Editor"
2. Selecciona tabla "empresas"
3. Busca "Falabella" → Debe estar ahí ✅
4. Selecciona tabla "sucursales"
5. Filtra por empresa_id de Falabella
6. Debes ver 10 sucursales ✅

**Con SQL:**
```sql
SELECT COUNT(*) FROM sucursales 
WHERE empresa_id = (SELECT id FROM empresas WHERE nombre = 'Falabella');
-- Resultado: 10
```

---

## 🎯 Próximos Pasos

Una vez instalado Falabella:

1. **Abre Digital Carousel**
   - Ve a `/digital-carousel`
   - Selecciona "Falabella" en empresa
   - Verás sus 10 sucursales

2. **Crea una Playlist**
   - Selecciona sucursales
   - Elige dispositivos
   - Agrega imágenes/videos
   - Guarda

3. **Distribuye Contenido**
   - Envía a las sucursales
   - Visualiza en pantallas

---

## 🆘 Si Hay Problemas

### Error: "Relation 'empresas' does not exist"
- Verifica que estés en el proyecto correcto
- URL debe ser: `https://wpwkymhpubusrghoosim.supabase.co`

### Error: "Permission denied"
- Asegúrate de usar Service Key (no Anon Key)
- En Supabase Dashboard, usa SQL Editor directamente

### Error: "Duplicate key value"
- Falabella ya existe en la BD
- Ejecuta: `DELETE FROM empresas WHERE nombre = 'Falabella'`
- Luego intenta de nuevo

---

## 📞 Archivos de Referencia

- `FALABELLA_DATA.sql` - Script SQL corregido
- `src/lib/addFalabellaData.ts` - Funciones TypeScript
- `src/components/Admin/FalabellaDataLoader.tsx` - Componente React
- `DATABASE_STRUCTURE.md` - Documentación de BD
- `FALABELLA_SETUP_GUIDE.md` - Guía completa

---

## ✅ Checklist

- [ ] Abrí Supabase Dashboard
- [ ] Copié el script de FALABELLA_DATA.sql
- [ ] Ejecuté en SQL Editor
- [ ] Verifiqué que Falabella aparece en empresas
- [ ] Verifiqué que hay 10 sucursales
- [ ] Probé en Digital Carousel
- [ ] Creé una playlist de prueba

---

*Script corregido: 2025-11-12*
*Estado: Listo para usar ✅*
