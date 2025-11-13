-- ============================================================
-- SCRIPT PARA AGREGAR FALABELLA Y SUS SUCURSALES
-- ============================================================
-- Este script usa una transacción con CTE para insertar
-- la empresa y todas sus sucursales en una sola operación
-- ============================================================

WITH nueva_empresa AS (
  INSERT INTO empresas (nombre, direccion, telefono, email, sitio_web, fecha_creacion, estado, logo)
  VALUES (
    'Falabella',
    'Av. Paseo de la República 3520, San Isidro, Lima',
    '+51 1 3313000',
    'contacto@falabella.com.pe',
    'https://www.falabella.com.pe',
    NOW(),
    'activo',
    'https://www.falabella.com.pe/static/images/logo.png'
  )
  RETURNING id
)
INSERT INTO sucursales (empresa_id, nombre, direccion, telefono, email, horario, latitud, longitud, mapa)
SELECT
  ne.id,
  sucursal.nombre,
  sucursal.direccion,
  sucursal.telefono,
  sucursal.email,
  sucursal.horario,
  sucursal.latitud,
  sucursal.longitud,
  sucursal.mapa
FROM nueva_empresa ne,
LATERAL (
  VALUES
    ('Falabella Centro', 'Av. Paseo de la República 3520, San Isidro, Lima', '+51 1 3313000', 'centro@falabella.com.pe', 'Lunes a Domingo: 10:00 AM - 10:00 PM', -12.0931, -77.0341, 'https://maps.google.com/?q=-12.0931,-77.0341'),
    ('Falabella Jockey Plaza', 'Av. Paseo de la República 3520, Surco, Lima', '+51 1 4225000', 'jockey@falabella.com.pe', 'Lunes a Domingo: 10:00 AM - 10:00 PM', -12.1097, -77.0282, 'https://maps.google.com/?q=-12.1097,-77.0282'),
    ('Falabella La Molina', 'Av. Aviación 2500, La Molina, Lima', '+51 1 4373000', 'lamolina@falabella.com.pe', 'Lunes a Domingo: 10:00 AM - 10:00 PM', -12.0850, -76.9450, 'https://maps.google.com/?q=-12.0850,-76.9450'),
    ('Falabella Megaplaza', 'Av. Universitaria 1980, Cercado, Lima', '+51 1 5133000', 'megaplaza@falabella.com.pe', 'Lunes a Domingo: 10:00 AM - 10:00 PM', -12.0500, -77.1100, 'https://maps.google.com/?q=-12.0500,-77.1100'),
    ('Falabella Saenz Peña', 'Av. Saenz Peña 1500, Rímac, Lima', '+51 1 4813000', 'saenzpena@falabella.com.pe', 'Lunes a Domingo: 10:00 AM - 10:00 PM', -12.0450, -77.0850, 'https://maps.google.com/?q=-12.0450,-77.0850'),
    ('Falabella Arequipa', 'Av. Ejército 1000, Arequipa', '+51 54 213000', 'arequipa@falabella.com.pe', 'Lunes a Domingo: 10:00 AM - 10:00 PM', -16.3988, -71.5350, 'https://maps.google.com/?q=-16.3988,-71.5350'),
    ('Falabella Trujillo', 'Av. Larco 1200, Trujillo', '+51 44 213000', 'trujillo@falabella.com.pe', 'Lunes a Domingo: 10:00 AM - 10:00 PM', -8.1109, -79.0277, 'https://maps.google.com/?q=-8.1109,-79.0277'),
    ('Falabella Chiclayo', 'Av. Salaverry 1500, Chiclayo', '+51 74 213000', 'chiclayo@falabella.com.pe', 'Lunes a Domingo: 10:00 AM - 10:00 PM', -6.7735, -79.8405, 'https://maps.google.com/?q=-6.7735,-79.8405'),
    ('Falabella Piura', 'Av. Sánchez Cerro 1000, Piura', '+51 73 213000', 'piura@falabella.com.pe', 'Lunes a Domingo: 10:00 AM - 10:00 PM', -5.1944, -80.6328, 'https://maps.google.com/?q=-5.1944,-80.6328'),
    ('Falabella Cusco', 'Av. El Sol 1000, Cusco', '+51 84 213000', 'cusco@falabella.com.pe', 'Lunes a Domingo: 10:00 AM - 10:00 PM', -13.5316, -71.9877, 'https://maps.google.com/?q=-13.5316,-71.9877')
) AS sucursal(nombre, direccion, telefono, email, horario, latitud, longitud, mapa);
