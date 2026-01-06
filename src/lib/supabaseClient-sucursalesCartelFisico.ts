import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Faltan las variables de entorno de Supabase');
}

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

export interface Sucursal {
  id: number;
  empresa_id: number;
  nombre: string;
  direccion: string;
  telefono: string;
  email: string;
  horario: string;
  latitud?: number;
  longitud?: number;
  mapa?: string;
}

export interface CartelFisico {
  id: number;
  sucursal_id: number;
  usuario_id: string;
  fecha_envio: string;
  estado: 'pendiente' | 'impreso' | 'error';
  detalles: {
    productos: number[];
    formato: string;
    cantidad: number;
    promocion_id?: number;
    impresora: {
      nombre: string;
      tipo: 'laser' | 'plotter' | 'termica' | 'a3';
    };
  };
}

// Función para obtener todas las sucursales de una empresa
export const getSucursalesPorEmpresa = async (empresaId: number): Promise<Sucursal[]> => {
  try {
    console.log('Consultando sucursales para empresa ID:', empresaId);
    const { data, error } = await supabaseAdmin
      .from('sucursales')
      .select('*')
      .eq('empresa_id', empresaId)
      .order('nombre');

    if (error) {
      console.error('Error de Supabase:', error);
      throw error;
    }
    
    console.log('Sucursales encontradas:', data);
    return data || [];
  } catch (error) {
    console.error('Error al obtener sucursales:', error);
    throw error;
  }
};

// Función para obtener una sucursal específica
export const getSucursal = async (sucursalId: number): Promise<Sucursal | null> => {
  try {
    const { data, error } = await supabaseAdmin
      .from('sucursales')
      .select('*')
      .eq('id', sucursalId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error al obtener sucursal:', error);
    throw error;
  }
};

// Función para crear un nuevo cartel físico
export const crearCartelFisico = async (cartel: Omit<CartelFisico, 'id' | 'fecha_envio'>): Promise<CartelFisico> => {
  try {
    const { data, error } = await supabaseAdmin
      .from('carteles_fisicos')
      .insert([
        {
          ...cartel,
          fecha_envio: new Date().toISOString(),
          estado: 'pendiente'
        }
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error al crear cartel físico:', error);
    throw error;
  }
};

// Función para actualizar el estado de un cartel físico
export const actualizarEstadoCartelFisico = async (
  cartelId: number, 
  estado: CartelFisico['estado']
): Promise<void> => {
  try {
    const { error } = await supabaseAdmin
      .from('carteles_fisicos')
      .update({ estado })
      .eq('id', cartelId);

    if (error) throw error;
  } catch (error) {
    console.error('Error al actualizar estado del cartel:', error);
    throw error;
  }
};

// Función para obtener el historial de carteles de una sucursal
export const getHistorialCartelesPorSucursal = async (
  sucursalId: number,
  limite: number = 50
): Promise<CartelFisico[]> => {
  try {
    const { data, error } = await supabaseAdmin
      .from('carteles_fisicos')
      .select('*')
      .eq('sucursal_id', sucursalId)
      .order('fecha_envio', { ascending: false })
      .limit(limite);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error al obtener historial de carteles:', error);
    throw error;
  }
}; 