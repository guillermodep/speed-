import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Faltan las variables de entorno de Supabase');
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

interface Empresa {
  nombre: string;
  direccion: string;
  telefono: string;
  email: string;
  sitio_web: string;
  logo: string;
}

interface Sucursal {
  empresa_id: number;
  nombre: string;
  direccion: string;
  telefono: string;
  email: string;
  horario: string;
  latitud: number;
  longitud: number;
  mapa: string;
}

// Datos de Falabella
const falabellaData: Empresa = {
  nombre: 'Falabella',
  direccion: 'Av. Paseo de la República 3520, San Isidro, Lima',
  telefono: '+51 1 3313000',
  email: 'contacto@falabella.com.pe',
  sitio_web: 'https://www.falabella.com.pe',
  logo: 'https://www.falabella.com.pe/static/images/logo.png'
};

// Sucursales de Falabella en Perú
const falabellaSucursales: Omit<Sucursal, 'empresa_id'>[] = [
  {
    nombre: 'Falabella Centro',
    direccion: 'Av. Paseo de la República 3520, San Isidro, Lima',
    telefono: '+51 1 3313000',
    email: 'centro@falabella.com.pe',
    horario: 'Lunes a Domingo: 10:00 AM - 10:00 PM',
    latitud: -12.0931,
    longitud: -77.0341,
    mapa: 'https://maps.google.com/?q=-12.0931,-77.0341'
  },
  {
    nombre: 'Falabella Jockey Plaza',
    direccion: 'Av. Paseo de la República 3520, Surco, Lima',
    telefono: '+51 1 4225000',
    email: 'jockey@falabella.com.pe',
    horario: 'Lunes a Domingo: 10:00 AM - 10:00 PM',
    latitud: -12.1097,
    longitud: -77.0282,
    mapa: 'https://maps.google.com/?q=-12.1097,-77.0282'
  },
  {
    nombre: 'Falabella La Molina',
    direccion: 'Av. Aviación 2500, La Molina, Lima',
    telefono: '+51 1 4373000',
    email: 'lamolina@falabella.com.pe',
    horario: 'Lunes a Domingo: 10:00 AM - 10:00 PM',
    latitud: -12.0850,
    longitud: -76.9450,
    mapa: 'https://maps.google.com/?q=-12.0850,-76.9450'
  },
  {
    nombre: 'Falabella Megaplaza',
    direccion: 'Av. Universitaria 1980, Cercado, Lima',
    telefono: '+51 1 5133000',
    email: 'megaplaza@falabella.com.pe',
    horario: 'Lunes a Domingo: 10:00 AM - 10:00 PM',
    latitud: -12.0500,
    longitud: -77.1100,
    mapa: 'https://maps.google.com/?q=-12.0500,-77.1100'
  },
  {
    nombre: 'Falabella Saenz Peña',
    direccion: 'Av. Saenz Peña 1500, Rímac, Lima',
    telefono: '+51 1 4813000',
    email: 'saenzpena@falabella.com.pe',
    horario: 'Lunes a Domingo: 10:00 AM - 10:00 PM',
    latitud: -12.0450,
    longitud: -77.0850,
    mapa: 'https://maps.google.com/?q=-12.0450,-77.0850'
  },
  {
    nombre: 'Falabella Arequipa',
    direccion: 'Av. Ejército 1000, Arequipa',
    telefono: '+51 54 213000',
    email: 'arequipa@falabella.com.pe',
    horario: 'Lunes a Domingo: 10:00 AM - 10:00 PM',
    latitud: -16.3988,
    longitud: -71.5350,
    mapa: 'https://maps.google.com/?q=-16.3988,-71.5350'
  },
  {
    nombre: 'Falabella Trujillo',
    direccion: 'Av. Larco 1200, Trujillo',
    telefono: '+51 44 213000',
    email: 'trujillo@falabella.com.pe',
    horario: 'Lunes a Domingo: 10:00 AM - 10:00 PM',
    latitud: -8.1109,
    longitud: -79.0277,
    mapa: 'https://maps.google.com/?q=-8.1109,-79.0277'
  },
  {
    nombre: 'Falabella Chiclayo',
    direccion: 'Av. Salaverry 1500, Chiclayo',
    telefono: '+51 74 213000',
    email: 'chiclayo@falabella.com.pe',
    horario: 'Lunes a Domingo: 10:00 AM - 10:00 PM',
    latitud: -6.7735,
    longitud: -79.8405,
    mapa: 'https://maps.google.com/?q=-6.7735,-79.8405'
  },
  {
    nombre: 'Falabella Piura',
    direccion: 'Av. Sánchez Cerro 1000, Piura',
    telefono: '+51 73 213000',
    email: 'piura@falabella.com.pe',
    horario: 'Lunes a Domingo: 10:00 AM - 10:00 PM',
    latitud: -5.1944,
    longitud: -80.6328,
    mapa: 'https://maps.google.com/?q=-5.1944,-80.6328'
  },
  {
    nombre: 'Falabella Cusco',
    direccion: 'Av. El Sol 1000, Cusco',
    telefono: '+51 84 213000',
    email: 'cusco@falabella.com.pe',
    horario: 'Lunes a Domingo: 10:00 AM - 10:00 PM',
    latitud: -13.5316,
    longitud: -71.9877,
    mapa: 'https://maps.google.com/?q=-13.5316,-71.9877'
  }
];

/**
 * Agrega Falabella como empresa y todas sus sucursales a la base de datos
 * @returns Promise con el resultado de la operación
 */
export const addFalabellaToDatabase = async () => {
  try {
    console.log('🏢 Iniciando inserción de Falabella...');

    // 1. Verificar si Falabella ya existe
    const { data: existingCompanies, error: checkError } = await supabaseAdmin
      .from('empresas')
      .select('id')
      .eq('nombre', 'Falabella');

    if (checkError) {
      console.error('Error al verificar Falabella:', checkError);
    }

    if (existingCompanies && existingCompanies.length > 0) {
      console.log('⚠️  Falabella ya existe en la base de datos');
      return {
        success: false,
        message: 'Falabella ya existe en la base de datos',
        empresaId: existingCompanies[0].id
      };
    }

    // 2. Insertar empresa Falabella
    const { data: empresaData, error: empresaError } = await supabaseAdmin
      .from('empresas')
      .insert([
        {
          ...falabellaData,
          fecha_creacion: new Date().toISOString(),
          estado: 'activo'
        }
      ])
      .select()
      .single();

    if (empresaError) {
      console.error('❌ Error al insertar empresa:', empresaError);
      throw empresaError;
    }

    const empresaId = empresaData.id;
    console.log(`✅ Empresa Falabella creada con ID: ${empresaId}`);

    // 3. Insertar sucursales
    const sucursalesConEmpresaId = falabellaSucursales.map(sucursal => ({
      ...sucursal,
      empresa_id: empresaId
    }));

    const { data: sucursalesData, error: sucursalesError } = await supabaseAdmin
      .from('sucursales')
      .insert(sucursalesConEmpresaId)
      .select();

    if (sucursalesError) {
      console.error('❌ Error al insertar sucursales:', sucursalesError);
      throw sucursalesError;
    }

    console.log(`✅ ${sucursalesData.length} sucursales creadas exitosamente`);

    return {
      success: true,
      message: `Falabella y ${sucursalesData.length} sucursales agregadas exitosamente`,
      empresaId,
      sucursalesCount: sucursalesData.length,
      sucursales: sucursalesData
    };
  } catch (error) {
    console.error('❌ Error en addFalabellaToDatabase:', error);
    throw error;
  }
};

/**
 * Obtiene la información de Falabella desde la base de datos
 */
export const getFalabellaData = async () => {
  try {
    const { data: empresas, error: empresaError } = await supabaseAdmin
      .from('empresas')
      .select('*')
      .eq('nombre', 'Falabella');

    if (empresaError) throw empresaError;
    if (!empresas || empresas.length === 0) {
      throw new Error('Falabella no encontrada');
    }

    const empresa = empresas[0];

    const { data: sucursales, error: sucursalesError } = await supabaseAdmin
      .from('sucursales')
      .select('*')
      .eq('empresa_id', empresa.id);

    if (sucursalesError) throw sucursalesError;

    return {
      empresa,
      sucursales
    };
  } catch (error) {
    console.error('Error al obtener datos de Falabella:', error);
    throw error;
  }
};

/**
 * Sucursales de Falabella en Chile
 */
const falabellaChileSucursales: Omit<Sucursal, 'empresa_id'>[] = [
  // Región Metropolitana
  {
    nombre: 'Falabella Santiago Centro',
    direccion: 'Paseo Ahumada 100, Santiago',
    telefono: '+56 2 2690 0000',
    email: 'santiago.centro@falabella.cl',
    horario: 'Lunes a Domingo: 10:00 AM - 10:00 PM',
    latitud: -33.4372,
    longitud: -70.6663,
    mapa: 'https://maps.google.com/?q=-33.4372,-70.6663'
  },
  {
    nombre: 'Falabella Parque Arauco',
    direccion: 'Av. Presidente Kennedy 5413, Las Condes, Santiago',
    telefono: '+56 2 2650 0000',
    email: 'parque.arauco@falabella.cl',
    horario: 'Lunes a Domingo: 10:00 AM - 10:00 PM',
    latitud: -33.3850,
    longitud: -70.5850,
    mapa: 'https://maps.google.com/?q=-33.3850,-70.5850'
  },
  {
    nombre: 'Falabella Costanera Center',
    direccion: 'Av. Andrés Bello 2425, Providencia, Santiago',
    telefono: '+56 2 2940 0000',
    email: 'costanera@falabella.cl',
    horario: 'Lunes a Domingo: 10:00 AM - 10:00 PM',
    latitud: -33.4150,
    longitud: -70.6050,
    mapa: 'https://maps.google.com/?q=-33.4150,-70.6050'
  },
  {
    nombre: 'Falabella Mall Plaza',
    direccion: 'Av. Apoquindo 3990, Las Condes, Santiago',
    telefono: '+56 2 2570 0000',
    email: 'mall.plaza@falabella.cl',
    horario: 'Lunes a Domingo: 10:00 AM - 10:00 PM',
    latitud: -33.3950,
    longitud: -70.5750,
    mapa: 'https://maps.google.com/?q=-33.3950,-70.5750'
  },
  {
    nombre: 'Falabella Maipú',
    direccion: 'Av. Pajaritos 3500, Maipú, Santiago',
    telefono: '+56 2 2430 0000',
    email: 'maipu@falabella.cl',
    horario: 'Lunes a Domingo: 10:00 AM - 10:00 PM',
    latitud: -33.5050,
    longitud: -70.7550,
    mapa: 'https://maps.google.com/?q=-33.5050,-70.7550'
  },
  // Valparaíso
  {
    nombre: 'Falabella Valparaíso',
    direccion: 'Calle Esmeralda 1200, Valparaíso',
    telefono: '+56 32 2500 000',
    email: 'valparaiso@falabella.cl',
    horario: 'Lunes a Domingo: 10:00 AM - 10:00 PM',
    latitud: -33.0458,
    longitud: -71.6197,
    mapa: 'https://maps.google.com/?q=-33.0458,-71.6197'
  },
  {
    nombre: 'Falabella Viña del Mar',
    direccion: 'Av. San Martín 500, Viña del Mar',
    telefono: '+56 32 2680 000',
    email: 'vinadel.mar@falabella.cl',
    horario: 'Lunes a Domingo: 10:00 AM - 10:00 PM',
    latitud: -32.9753,
    longitud: -71.5527,
    mapa: 'https://maps.google.com/?q=-32.9753,-71.5527'
  },
  // Concepción
  {
    nombre: 'Falabella Concepción',
    direccion: 'Calle Colo Colo 500, Concepción',
    telefono: '+56 41 2300 000',
    email: 'concepcion@falabella.cl',
    horario: 'Lunes a Domingo: 10:00 AM - 10:00 PM',
    latitud: -36.8201,
    longitud: -73.0445,
    mapa: 'https://maps.google.com/?q=-36.8201,-73.0445'
  },
  // La Serena
  {
    nombre: 'Falabella La Serena',
    direccion: 'Av. del Mar 2500, La Serena',
    telefono: '+56 51 2400 000',
    email: 'laserena@falabella.cl',
    horario: 'Lunes a Domingo: 10:00 AM - 10:00 PM',
    latitud: -29.9027,
    longitud: -71.3125,
    mapa: 'https://maps.google.com/?q=-29.9027,-71.3125'
  },
  // Temuco
  {
    nombre: 'Falabella Temuco',
    direccion: 'Av. Caupolicán 1200, Temuco',
    telefono: '+56 45 2200 000',
    email: 'temuco@falabella.cl',
    horario: 'Lunes a Domingo: 10:00 AM - 10:00 PM',
    latitud: -38.7359,
    longitud: -72.5904,
    mapa: 'https://maps.google.com/?q=-38.7359,-72.5904'
  },
  // Puerto Montt
  {
    nombre: 'Falabella Puerto Montt',
    direccion: 'Av. Angelmó 2100, Puerto Montt',
    telefono: '+56 65 2100 000',
    email: 'puertomontt@falabella.cl',
    horario: 'Lunes a Domingo: 10:00 AM - 10:00 PM',
    latitud: -41.3142,
    longitud: -72.4928,
    mapa: 'https://maps.google.com/?q=-41.3142,-72.4928'
  },
  // Antofagasta
  {
    nombre: 'Falabella Antofagasta',
    direccion: 'Av. Condell 2800, Antofagasta',
    telefono: '+56 55 2600 000',
    email: 'antofagasta@falabella.cl',
    horario: 'Lunes a Domingo: 10:00 AM - 10:00 PM',
    latitud: -23.6345,
    longitud: -70.3997,
    mapa: 'https://maps.google.com/?q=-23.6345,-70.3997'
  }
];

/**
 * Agrega sucursales de Falabella en Chile a la base de datos
 */
export const addFalabellaChileToDatabase = async () => {
  try {
    console.log('🇨🇱 Iniciando inserción de sucursales de Falabella en Chile...');

    // 1. Obtener ID de Falabella
    const { data: empresas, error: empresaError } = await supabaseAdmin
      .from('empresas')
      .select('id')
      .eq('nombre', 'Falabella');

    if (empresaError || !empresas || empresas.length === 0) {
      console.error('❌ Falabella no encontrada en la base de datos');
      return {
        success: false,
        message: 'Falabella no encontrada. Primero debes agregar la empresa.'
      };
    }

    const empresa = empresas[0];

    const empresaId = empresa.id;
    console.log(`✅ Empresa Falabella encontrada con ID: ${empresaId}`);

    // 2. Insertar sucursales de Chile
    const sucursalesConEmpresaId = falabellaChileSucursales.map(sucursal => ({
      ...sucursal,
      empresa_id: empresaId
    }));

    const { data: sucursalesData, error: sucursalesError } = await supabaseAdmin
      .from('sucursales')
      .insert(sucursalesConEmpresaId)
      .select();

    if (sucursalesError) {
      console.error('❌ Error al insertar sucursales:', sucursalesError);
      throw sucursalesError;
    }

    console.log(`✅ ${sucursalesData.length} sucursales de Chile creadas exitosamente`);

    return {
      success: true,
      message: `${sucursalesData.length} sucursales de Falabella en Chile agregadas exitosamente`,
      sucursalesCount: sucursalesData.length,
      sucursales: sucursalesData
    };
  } catch (error) {
    console.error('❌ Error en addFalabellaChileToDatabase:', error);
    throw error;
  }
};

/**
 * Elimina Falabella y todas sus sucursales (útil para testing)
 */
export const deleteFalabellaFromDatabase = async () => {
  try {
    console.log('🗑️  Iniciando eliminación de Falabella...');

    // 1. Obtener ID de Falabella
    const { data: empresas, error: empresaError } = await supabaseAdmin
      .from('empresas')
      .select('id')
      .eq('nombre', 'Falabella');

    if (empresaError || !empresas || empresas.length === 0) {
      console.log('⚠️  Falabella no encontrada');
      return { success: false, message: 'Falabella no encontrada' };
    }

    const empresa = empresas[0];

    // 2. Eliminar sucursales
    const { error: sucursalesError } = await supabaseAdmin
      .from('sucursales')
      .delete()
      .eq('empresa_id', empresa.id);

    if (sucursalesError) throw sucursalesError;
    console.log('✅ Sucursales eliminadas');

    // 3. Eliminar empresa
    const { error: empresaDeleteError } = await supabaseAdmin
      .from('empresas')
      .delete()
      .eq('id', empresa.id);

    if (empresaDeleteError) throw empresaDeleteError;
    console.log('✅ Empresa eliminada');

    return {
      success: true,
      message: 'Falabella y todas sus sucursales han sido eliminadas'
    };
  } catch (error) {
    console.error('❌ Error al eliminar Falabella:', error);
    throw error;
  }
};
