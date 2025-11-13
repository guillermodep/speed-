-- ============================================================
-- SCRIPT PARA AGREGAR SUCURSALES DE FALABELLA EN CHILE
-- ============================================================
-- Este script agrega 12 sucursales principales de Falabella
-- en las principales ciudades de Chile
-- ============================================================

INSERT INTO sucursales (empresa_id, nombre, direccion, telefono, email, horario, latitud, longitud, mapa)
SELECT
  (SELECT id FROM empresas WHERE nombre = 'Falabella' LIMIT 1) as empresa_id,
  sucursal.nombre,
  sucursal.direccion,
  sucursal.telefono,
  sucursal.email,
  sucursal.horario,
  sucursal.latitud,
  sucursal.longitud,
  sucursal.mapa
FROM (
  VALUES
    -- Región Metropolitana
    ('Falabella Santiago Centro', 'Paseo Ahumada 100, Santiago', '+56 2 2690 0000', 'santiago.centro@falabella.cl', 'Lunes a Domingo: 10:00 AM - 10:00 PM', -33.4372, -70.6663, 'https://maps.google.com/?q=-33.4372,-70.6663'),
    ('Falabella Parque Arauco', 'Av. Presidente Kennedy 5413, Las Condes, Santiago', '+56 2 2650 0000', 'parque.arauco@falabella.cl', 'Lunes a Domingo: 10:00 AM - 10:00 PM', -33.3850, -70.5850, 'https://maps.google.com/?q=-33.3850,-70.5850'),
    ('Falabella Costanera Center', 'Av. Andrés Bello 2425, Providencia, Santiago', '+56 2 2940 0000', 'costanera@falabella.cl', 'Lunes a Domingo: 10:00 AM - 10:00 PM', -33.4150, -70.6050, 'https://maps.google.com/?q=-33.4150,-70.6050'),
    ('Falabella Mall Plaza', 'Av. Apoquindo 3990, Las Condes, Santiago', '+56 2 2570 0000', 'mall.plaza@falabella.cl', 'Lunes a Domingo: 10:00 AM - 10:00 PM', -33.3950, -70.5750, 'https://maps.google.com/?q=-33.3950,-70.5750'),
    ('Falabella Maipú', 'Av. Pajaritos 3500, Maipú, Santiago', '+56 2 2430 0000', 'maipu@falabella.cl', 'Lunes a Domingo: 10:00 AM - 10:00 PM', -33.5050, -70.7550, 'https://maps.google.com/?q=-33.5050,-70.7550'),
    
    -- Valparaíso
    ('Falabella Valparaíso', 'Calle Esmeralda 1200, Valparaíso', '+56 32 2500 000', 'valparaiso@falabella.cl', 'Lunes a Domingo: 10:00 AM - 10:00 PM', -33.0458, -71.6197, 'https://maps.google.com/?q=-33.0458,-71.6197'),
    ('Falabella Viña del Mar', 'Av. San Martín 500, Viña del Mar', '+56 32 2680 000', 'vinadel.mar@falabella.cl', 'Lunes a Domingo: 10:00 AM - 10:00 PM', -32.9753, -71.5527, 'https://maps.google.com/?q=-32.9753,-71.5527'),
    
    -- Concepción
    ('Falabella Concepción', 'Calle Colo Colo 500, Concepción', '+56 41 2300 000', 'concepcion@falabella.cl', 'Lunes a Domingo: 10:00 AM - 10:00 PM', -36.8201, -73.0445, 'https://maps.google.com/?q=-36.8201,-73.0445'),
    
    -- La Serena
    ('Falabella La Serena', 'Av. del Mar 2500, La Serena', '+56 51 2400 000', 'laserena@falabella.cl', 'Lunes a Domingo: 10:00 AM - 10:00 PM', -29.9027, -71.3125, 'https://maps.google.com/?q=-29.9027,-71.3125'),
    
    -- Temuco
    ('Falabella Temuco', 'Av. Caupolicán 1200, Temuco', '+56 45 2200 000', 'temuco@falabella.cl', 'Lunes a Domingo: 10:00 AM - 10:00 PM', -38.7359, -72.5904, 'https://maps.google.com/?q=-38.7359,-72.5904'),
    
    -- Puerto Montt
    ('Falabella Puerto Montt', 'Av. Angelmó 2100, Puerto Montt', '+56 65 2100 000', 'puertomontt@falabella.cl', 'Lunes a Domingo: 10:00 AM - 10:00 PM', -41.3142, -72.4928, 'https://maps.google.com/?q=-41.3142,-72.4928'),
    
    -- Antofagasta
    ('Falabella Antofagasta', 'Av. Condell 2800, Antofagasta', '+56 55 2600 000', 'antofagasta@falabella.cl', 'Lunes a Domingo: 10:00 AM - 10:00 PM', -23.6345, -70.3997, 'https://maps.google.com/?q=-23.6345,-70.3997')
) AS sucursal(nombre, direccion, telefono, email, horario, latitud, longitud, mapa);
