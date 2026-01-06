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

// Datos de Sodimac
const sodimacData: Empresa = {
  nombre: 'Sodimac',
  direccion: 'Av. Angamos Este 1805, Surquillo, Lima',
  telefono: '+51 1 6119000',
  email: 'contacto@sodimac.com.pe',
  sitio_web: 'https://www.sodimac.com.pe',
  logo: '/images/Sodimac logo.jpg'
};

// Sucursales de Sodimac en Perú
const sodimacSucursales: Omit<Sucursal, 'empresa_id'>[] = [
  {
    nombre: 'Sodimac Javier Prado',
    direccion: 'Av. Javier Prado Este 5268, La Molina, Lima',
    telefono: '+51 1 6119000',
    email: 'javierprado@sodimac.com.pe',
    horario: 'Lunes a Domingo: 8:00 AM - 10:00 PM',
    latitud: -12.0850,
    longitud: -76.9650,
    mapa: 'https://maps.google.com/?q=-12.0850,-76.9650'
  },
  {
    nombre: 'Sodimac Angamos',
    direccion: 'Av. Angamos Este 1805, Surquillo, Lima',
    telefono: '+51 1 6119001',
    email: 'angamos@sodimac.com.pe',
    horario: 'Lunes a Domingo: 8:00 AM - 10:00 PM',
    latitud: -12.1100,
    longitud: -77.0150,
    mapa: 'https://maps.google.com/?q=-12.1100,-77.0150'
  },
  {
    nombre: 'Sodimac Mega Plaza',
    direccion: 'Av. Alfredo Mendiola 3698, Independencia, Lima',
    telefono: '+51 1 6119002',
    email: 'megaplaza@sodimac.com.pe',
    horario: 'Lunes a Domingo: 8:00 AM - 10:00 PM',
    latitud: -12.0000,
    longitud: -77.0600,
    mapa: 'https://maps.google.com/?q=-12.0000,-77.0600'
  },
  {
    nombre: 'Sodimac San Miguel',
    direccion: 'Av. La Marina 2000, San Miguel, Lima',
    telefono: '+51 1 6119003',
    email: 'sanmiguel@sodimac.com.pe',
    horario: 'Lunes a Domingo: 8:00 AM - 10:00 PM',
    latitud: -12.0770,
    longitud: -77.0870,
    mapa: 'https://maps.google.com/?q=-12.0770,-77.0870'
  },
  {
    nombre: 'Sodimac Atocongo',
    direccion: 'Av. Los Héroes 1000, San Juan de Miraflores, Lima',
    telefono: '+51 1 6119004',
    email: 'atocongo@sodimac.com.pe',
    horario: 'Lunes a Domingo: 8:00 AM - 10:00 PM',
    latitud: -12.1600,
    longitud: -76.9800,
    mapa: 'https://maps.google.com/?q=-12.1600,-76.9800'
  },
  {
    nombre: 'Sodimac Arequipa',
    direccion: 'Av. Ejército 1009, Arequipa',
    telefono: '+51 54 605000',
    email: 'arequipa@sodimac.com.pe',
    horario: 'Lunes a Domingo: 8:00 AM - 10:00 PM',
    latitud: -16.4090,
    longitud: -71.5370,
    mapa: 'https://maps.google.com/?q=-16.4090,-71.5370'
  },
  {
    nombre: 'Sodimac Trujillo',
    direccion: 'Av. América Oeste 750, Trujillo',
    telefono: '+51 44 605000',
    email: 'trujillo@sodimac.com.pe',
    horario: 'Lunes a Domingo: 8:00 AM - 10:00 PM',
    latitud: -8.1200,
    longitud: -79.0350,
    mapa: 'https://maps.google.com/?q=-8.1200,-79.0350'
  },
  {
    nombre: 'Sodimac Chiclayo',
    direccion: 'Av. Bolognesi 956, Chiclayo',
    telefono: '+51 74 605000',
    email: 'chiclayo@sodimac.com.pe',
    horario: 'Lunes a Domingo: 8:00 AM - 10:00 PM',
    latitud: -6.7700,
    longitud: -79.8400,
    mapa: 'https://maps.google.com/?q=-6.7700,-79.8400'
  },
  {
    nombre: 'Sodimac Piura',
    direccion: 'Av. Grau 1245, Piura',
    telefono: '+51 73 605000',
    email: 'piura@sodimac.com.pe',
    horario: 'Lunes a Domingo: 8:00 AM - 10:00 PM',
    latitud: -5.1950,
    longitud: -80.6330,
    mapa: 'https://maps.google.com/?q=-5.1950,-80.6330'
  },
  {
    nombre: 'Sodimac Cusco',
    direccion: 'Av. La Cultura 1650, Cusco',
    telefono: '+51 84 605000',
    email: 'cusco@sodimac.com.pe',
    horario: 'Lunes a Domingo: 8:00 AM - 10:00 PM',
    latitud: -13.5300,
    longitud: -71.9700,
    mapa: 'https://maps.google.com/?q=-13.5300,-71.9700'
  }
];

/**
 * Agrega Sodimac y sus sucursales a la base de datos
 */
export const addSodimacToDatabase = async () => {
  try {
    console.log('🏢 Verificando si Sodimac ya existe...');
    
    // Verificar si Sodimac ya existe
    const { data: existingEmpresas, error: checkError } = await supabaseAdmin
      .from('empresas')
      .select('id, nombre')
      .eq('nombre', 'Sodimac');

    if (checkError) {
      console.error('Error al verificar Sodimac:', checkError);
      throw checkError;
    }

    if (existingEmpresas && existingEmpresas.length > 0) {
      console.log('✅ Sodimac ya existe en la base de datos');
      return {
        success: true,
        message: 'Sodimac ya existe en la base de datos',
        empresaId: existingEmpresas[0].id,
        sucursalesCount: 0
      };
    }

    console.log('📝 Insertando Sodimac en la base de datos...');

    // Insertar empresa
    const { data: empresaData, error: empresaError } = await supabaseAdmin
      .from('empresas')
      .insert([{
        ...sodimacData,
        estado: 'activo',
        fecha_creacion: new Date().toISOString()
      }])
      .select();

    if (empresaError) {
      console.error('Error al insertar Sodimac:', empresaError);
      throw empresaError;
    }

    if (!empresaData || empresaData.length === 0) {
      throw new Error('No se pudo obtener el ID de la empresa insertada');
    }

    const empresaId = empresaData[0].id;
    console.log(`✅ Sodimac insertada con ID: ${empresaId}`);

    // Insertar sucursales
    console.log('📍 Insertando sucursales de Sodimac...');
    const sucursalesConEmpresaId = sodimacSucursales.map(sucursal => ({
      ...sucursal,
      empresa_id: empresaId
    }));

    const { data: sucursalesData, error: sucursalesError } = await supabaseAdmin
      .from('sucursales')
      .insert(sucursalesConEmpresaId)
      .select();

    if (sucursalesError) {
      console.error('Error al insertar sucursales:', sucursalesError);
      throw sucursalesError;
    }

    console.log(`✅ ${sucursalesData?.length || 0} sucursales insertadas`);

    return {
      success: true,
      message: `Sodimac y ${sucursalesData?.length || 0} sucursales agregadas exitosamente`,
      empresaId,
      sucursalesCount: sucursalesData?.length || 0,
      sucursales: sucursalesData
    };

  } catch (error) {
    console.error('❌ Error al agregar Sodimac:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Error desconocido',
      error
    };
  }
};

/**
 * Obtiene los datos de Sodimac desde la base de datos
 */
export const getSodimacData = async () => {
  try {
    const { data: empresaData, error: empresaError } = await supabaseAdmin
      .from('empresas')
      .select('*')
      .eq('nombre', 'Sodimac');

    if (empresaError) throw empresaError;
    if (!empresaData || empresaData.length === 0) {
      throw new Error('Sodimac no encontrada en la base de datos');
    }

    const empresa = empresaData[0];

    const { data: sucursalesData, error: sucursalesError } = await supabaseAdmin
      .from('sucursales')
      .select('*')
      .eq('empresa_id', empresa.id);

    if (sucursalesError) throw sucursalesError;

    return {
      success: true,
      empresa,
      sucursales: sucursalesData || []
    };

  } catch (error) {
    console.error('Error al obtener datos de Sodimac:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Error desconocido',
      error
    };
  }
};

/**
 * Elimina Sodimac y todas sus sucursales de la base de datos
 */
export const deleteSodimacFromDatabase = async () => {
  try {
    const { data: empresaData, error: empresaError } = await supabaseAdmin
      .from('empresas')
      .select('id')
      .eq('nombre', 'Sodimac');

    if (empresaError) throw empresaError;
    if (!empresaData || empresaData.length === 0) {
      return {
        success: true,
        message: 'Sodimac no existe en la base de datos'
      };
    }

    const empresaId = empresaData[0].id;

    // Eliminar sucursales primero (por la foreign key)
    const { error: sucursalesError } = await supabaseAdmin
      .from('sucursales')
      .delete()
      .eq('empresa_id', empresaId);

    if (sucursalesError) throw sucursalesError;

    // Eliminar empresa
    const { error: deleteError } = await supabaseAdmin
      .from('empresas')
      .delete()
      .eq('id', empresaId);

    if (deleteError) throw deleteError;

    return {
      success: true,
      message: 'Sodimac y todas sus sucursales han sido eliminadas'
    };

  } catch (error) {
    console.error('Error al eliminar Sodimac:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Error desconocido',
      error
    };
  }
};
