-- Script para eliminar Sodimac duplicado
-- Ejecutar en Supabase SQL Editor

-- 1. Ver todos los registros de Sodimac
SELECT id, nombre, email, fecha_creacion 
FROM empresas 
WHERE nombre = 'Sodimac'
ORDER BY id;

-- 2. Ver cuántas sucursales tiene cada Sodimac
SELECT empresa_id, COUNT(*) as sucursales_count
FROM sucursales
WHERE empresa_id IN (24, 25)
GROUP BY empresa_id;

-- 3. Eliminar el Sodimac duplicado (ID 25) y sus sucursales
-- IMPORTANTE: Ejecutar solo después de verificar cuál es el duplicado

-- Primero eliminar las sucursales del duplicado
DELETE FROM sucursales WHERE empresa_id = 25;

-- Luego eliminar la empresa duplicada
DELETE FROM empresas WHERE id = 25 AND nombre = 'Sodimac';

-- 4. Verificar que solo queda un Sodimac
SELECT id, nombre, email 
FROM empresas 
WHERE nombre = 'Sodimac';
