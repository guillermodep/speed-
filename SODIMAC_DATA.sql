-- Script SQL para agregar Sodimac y sus sucursales a la base de datos
-- Ejecutar en Supabase SQL Editor

-- Insertar empresa Sodimac y sus sucursales en una sola transacción
WITH nueva_empresa AS (
  INSERT INTO empresas (
    nombre,
    direccion,
    telefono,
    email,
    sitio_web,
    estado,
    logo,
    fecha_creacion
  )
  VALUES (
    'Sodimac',
    'Av. Angamos Este 1805, Surquillo, Lima',
    '+51 1 6119000',
    'contacto@sodimac.com.pe',
    'https://www.sodimac.com.pe',
    'activo',
    '/images/Sodimac logo.jpg',
    NOW()
  )
  ON CONFLICT (nombre) DO NOTHING
  RETURNING id
)
INSERT INTO sucursales (
  empresa_id,
  nombre,
  direccion,
  telefono,
  email,
  horario,
  latitud,
  longitud,
  mapa
)
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
    (
      'Sodimac Javier Prado',
      'Av. Javier Prado Este 5268, La Molina, Lima',
      '+51 1 6119000',
      'javierprado@sodimac.com.pe',
      'Lunes a Domingo: 8:00 AM - 10:00 PM',
      -12.0850,
      -76.9650,
      'https://maps.google.com/?q=-12.0850,-76.9650'
    ),
    (
      'Sodimac Angamos',
      'Av. Angamos Este 1805, Surquillo, Lima',
      '+51 1 6119001',
      'angamos@sodimac.com.pe',
      'Lunes a Domingo: 8:00 AM - 10:00 PM',
      -12.1100,
      -77.0150,
      'https://maps.google.com/?q=-12.1100,-77.0150'
    ),
    (
      'Sodimac Mega Plaza',
      'Av. Alfredo Mendiola 3698, Independencia, Lima',
      '+51 1 6119002',
      'megaplaza@sodimac.com.pe',
      'Lunes a Domingo: 8:00 AM - 10:00 PM',
      -12.0000,
      -77.0600,
      'https://maps.google.com/?q=-12.0000,-77.0600'
    ),
    (
      'Sodimac San Miguel',
      'Av. La Marina 2000, San Miguel, Lima',
      '+51 1 6119003',
      'sanmiguel@sodimac.com.pe',
      'Lunes a Domingo: 8:00 AM - 10:00 PM',
      -12.0770,
      -77.0870,
      'https://maps.google.com/?q=-12.0770,-77.0870'
    ),
    (
      'Sodimac Atocongo',
      'Av. Los Héroes 1000, San Juan de Miraflores, Lima',
      '+51 1 6119004',
      'atocongo@sodimac.com.pe',
      'Lunes a Domingo: 8:00 AM - 10:00 PM',
      -12.1600,
      -76.9800,
      'https://maps.google.com/?q=-12.1600,-76.9800'
    ),
    (
      'Sodimac Arequipa',
      'Av. Ejército 1009, Arequipa',
      '+51 54 605000',
      'arequipa@sodimac.com.pe',
      'Lunes a Domingo: 8:00 AM - 10:00 PM',
      -16.4090,
      -71.5370,
      'https://maps.google.com/?q=-16.4090,-71.5370'
    ),
    (
      'Sodimac Trujillo',
      'Av. América Oeste 750, Trujillo',
      '+51 44 605000',
      'trujillo@sodimac.com.pe',
      'Lunes a Domingo: 8:00 AM - 10:00 PM',
      -8.1200,
      -79.0350,
      'https://maps.google.com/?q=-8.1200,-79.0350'
    ),
    (
      'Sodimac Chiclayo',
      'Av. Bolognesi 956, Chiclayo',
      '+51 74 605000',
      'chiclayo@sodimac.com.pe',
      'Lunes a Domingo: 8:00 AM - 10:00 PM',
      -6.7700,
      -79.8400,
      'https://maps.google.com/?q=-6.7700,-79.8400'
    ),
    (
      'Sodimac Piura',
      'Av. Grau 1245, Piura',
      '+51 73 605000',
      'piura@sodimac.com.pe',
      'Lunes a Domingo: 8:00 AM - 10:00 PM',
      -5.1950,
      -80.6330,
      'https://maps.google.com/?q=-5.1950,-80.6330'
    ),
    (
      'Sodimac Cusco',
      'Av. La Cultura 1650, Cusco',
      '+51 84 605000',
      'cusco@sodimac.com.pe',
      'Lunes a Domingo: 8:00 AM - 10:00 PM',
      -13.5300,
      -71.9700,
      'https://maps.google.com/?q=-13.5300,-71.9700'
    )
) AS sucursal(nombre, direccion, telefono, email, horario, latitud, longitud, mapa);

-- Verificar que se insertó correctamente
SELECT 
  e.id,
  e.nombre as empresa,
  COUNT(s.id) as total_sucursales
FROM empresas e
LEFT JOIN sucursales s ON s.empresa_id = e.id
WHERE e.nombre = 'Sodimac'
GROUP BY e.id, e.nombre;
