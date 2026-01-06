export interface Company {
  id: string;
  name: string;
  logo: string;
  empresaId: number;
}

export const COMPANIES: Company[] = [
  { 
    id: 'no-logo', 
    name: 'TODAS',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/dc/Cencosud_logo.svg/1200px-Cencosud_logo.svg.png',
    empresaId: 16
  },
  { 
    id: 'jumbo', 
    name: 'Jumbo', 
    logo: 'https://upload.wikimedia.org/wikipedia/commons/d/d3/Logo_Jumbo_Cencosud.png',
    empresaId: 17
  },
  { 
    id: 'disco', 
    name: 'Disco', 
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Disco-Supermarket-Logo.svg/2048px-Disco-Supermarket-Logo.svg.png',
    empresaId: 18
  },
  { 
    id: 'vea', 
    name: 'Vea', 
    logo: 'https://upload.wikimedia.org/wikipedia/commons/f/fc/Logo_Vea_Cencosud.png',
    empresaId: 19
  },
  { 
    id: 'easy-mdh', 
    name: 'Easy (MDH)', 
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/Easy-Logo.svg/2048px-Easy-Logo.svg.png',
    empresaId: 20
  },
  { 
    id: 'sodimac', 
    name: 'Sodimac', 
    logo: '/images/Sodimac logo.jpg',
    empresaId: 0 // Se actualizará con el ID real de la BD
  }
]; 