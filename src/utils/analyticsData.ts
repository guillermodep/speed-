// Función auxiliar para calcular el multiplicador basado en el rango de fechas
const getMultiplier = (startDate: Date, endDate: Date): number => {
  const diffMonths = (endDate.getFullYear() - startDate.getFullYear()) * 12 + 
                    (endDate.getMonth() - startDate.getMonth());
  
  if (diffMonths >= 12) return 12;  // Año completo
  if (diffMonths >= 3) return 4;    // Trimestre
  return 1;                         // Mes
};

// Definir distribuciones base por empresa
const REGIONAL_DISTRIBUTIONS = {
  Easy: {
    'Buenos Aires': 0.35,  // 35% de las ventas
    'Córdoba': 0.25,      // 25% de las ventas
    'Santa Fe': 0.20,     // 20% de las ventas
    'Mendoza': 0.15,      // 15% de las ventas
    'Tucumán': 0.05       // 5% de las ventas
  },
  Jumbo: {
    'Buenos Aires': 0.45,
    'Córdoba': 0.20,
    'Santa Fe': 0.15,
    'Mendoza': 0.12,
    'Tucumán': 0.08
  },
  Disco: {
    'Buenos Aires': 0.40,
    'Córdoba': 0.22,
    'Santa Fe': 0.18,
    'Mendoza': 0.13,
    'Tucumán': 0.07
  },
  Vea: {
    'Buenos Aires': 0.30,
    'Córdoba': 0.28,
    'Santa Fe': 0.22,
    'Mendoza': 0.12,
    'Tucumán': 0.08
  }
};

// Definir productos top por empresa
const COMPANY_PRODUCTS = {
  Easy: [
    { name: 'Taladro Eléctrico', baseValue: 500 },
    { name: 'Pintura Interior', baseValue: 450 },
    { name: 'Set Herramientas', baseValue: 400 },
    { name: 'Lámparas LED', baseValue: 350 },
    { name: 'Cerraduras', baseValue: 300 }
  ],
  Jumbo: [
    { name: 'Coca Cola 2.25L', baseValue: 500 },
    { name: 'Cerveza Quilmes', baseValue: 450 },
    { name: 'Aceite Cocinero', baseValue: 400 },
    { name: 'Papel Higiénico', baseValue: 350 },
    { name: 'Arroz Gallo', baseValue: 300 }
  ],
  Disco: [
    { name: 'Leche La Serenísima', baseValue: 500 },
    { name: 'Pan Lactal', baseValue: 450 },
    { name: 'Yogur Yogurísimo', baseValue: 400 },
    { name: 'Queso Cremoso', baseValue: 350 },
    { name: 'Galletitas Oreo', baseValue: 300 }
  ],
  Vea: [
    { name: 'Fideos Matarazzo', baseValue: 500 },
    { name: 'Puré de Tomate', baseValue: 450 },
    { name: 'Jabón en Polvo', baseValue: 400 },
    { name: 'Gaseosa Manaos', baseValue: 350 },
    { name: 'Galletas Surtidas', baseValue: 300 }
  ]
};

interface TopProduct {
  name: string;
  value: number;
  company?: string; // Opcional, para cuando mostramos todos los productos
}

export const generateRandomData = (startDate: Date, endDate: Date) => {
  const multiplier = getMultiplier(startDate, endDate);
  const baseValues = {
    easy: 2000,
    jumbo: 1800,
    disco: 1500,
    vea: 1200,
    products: {
      cocaCola: 500,
      cerveza: 400,
      aceite: 300,
      papel: 200,
      arroz: 100
    }
  };

  // Generar datos de ventas por empresa primero
  const salesData = [
    { 
      name: 'Easy', 
      value: Math.floor((Math.random() * 1000 + baseValues.easy) * multiplier), 
      color: '#D64045', // Rojo Easy más oscuro (Pantone-like)
      logo: 'https://upload.wikimedia.org/wikipedia/commons/7/7c/Easy-Logo.svg'
    },
    { 
      name: 'Jumbo', 
      value: Math.floor((Math.random() * 800 + baseValues.jumbo) * multiplier), 
      color: '#7EC9AC', // Verde Jumbo pastel (Pantone-like)
      logo: 'https://upload.wikimedia.org/wikipedia/commons/d/d3/Logo_Jumbo_Cencosud.png'
    },
    { 
      name: 'Disco', 
      value: Math.floor((Math.random() * 600 + baseValues.disco) * multiplier), 
      color: '#FF9B9B', // Rojo Disco pastel (Pantone-like)
      logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Disco-Supermarket-Logo.svg/2048px-Disco-Supermarket-Logo.svg.png'
    },
    { 
      name: 'Vea', 
      value: Math.floor((Math.random() * 400 + baseValues.vea) * multiplier), 
      color: '#FFE5A5', // Amarillo Vea pastel (Pantone-like)
      logo: 'https://upload.wikimedia.org/wikipedia/commons/9/94/Logo-VEA-Supermercados.png'
    },
  ];

  // Generar datos regionales basados en las ventas de cada empresa
  const regionData = Object.keys(REGIONAL_DISTRIBUTIONS.Easy).map(region => ({
    name: region,
    value: 0, // Inicializar en 0
    byCompany: {} as Record<string, number> // Guardar valores por empresa
  }));

  // Calcular valores regionales para cada empresa
  salesData.forEach(company => {
    const distribution = REGIONAL_DISTRIBUTIONS[company.name as keyof typeof REGIONAL_DISTRIBUTIONS];
    Object.entries(distribution).forEach(([region, percentage]) => {
      const regionValue = Math.floor(company.value * percentage);
      const regionIndex = regionData.findIndex(r => r.name === region);
      regionData[regionIndex].value += regionValue;
      regionData[regionIndex].byCompany[company.name] = regionValue;
    });
  });

  // Generar productos top por empresa
  const topProductsByCompany = {} as Record<string, TopProduct[]>;
  
  salesData.forEach(company => {
    const products = COMPANY_PRODUCTS[company.name as keyof typeof COMPANY_PRODUCTS];
    if (products) {
      topProductsByCompany[company.name] = products.map(product => ({
        name: product.name,
        value: Math.floor((Math.random() * 200 + product.baseValue) * multiplier)
      }));
    }
  });

  console.log('Generated topProducts:', topProductsByCompany); // Para debug

  return {
    salesData,
    monthlyData: getMonthlyData(startDate, endDate, multiplier),
    regionData: regionData.map(({ name, value, byCompany }) => ({
      name,
      value,
      byCompany
    })),
    topProducts: topProductsByCompany,
    stats: {
      totalSales: `$${((Math.random() * 2 + 8) * multiplier).toFixed(1)}M`,
      regions: Math.floor(Math.random() * 5 + 20),
      products: `${Math.floor((Math.random() * 200 + 1000) * multiplier)}`,
      trends: {
        sales: `+${(Math.random() * 5 + 10).toFixed(1)}%`,
        regions: `+${Math.floor(Math.random() * 3 + 2)}`,
        products: `+${Math.floor((Math.random() * 50 + 50) * multiplier)}`
      }
    }
  };
};

function getMonthlyData(startDate: Date, endDate: Date, multiplier: number) {
  const months = [];
  const currentDate = new Date(startDate);
  const baseValues = {
    easy: 2000,
    jumbo: 1800,
    disco: 1500,
    vea: 1200
  };
  
  while (currentDate <= endDate) {
    months.push({
      name: currentDate.toLocaleString('default', { month: 'short' }),
      Easy: Math.floor((Math.random() * 1000 + baseValues.easy) * multiplier),
      Jumbo: Math.floor((Math.random() * 800 + baseValues.jumbo) * multiplier),
      Disco: Math.floor((Math.random() * 600 + baseValues.disco) * multiplier),
      Vea: Math.floor((Math.random() * 400 + baseValues.vea) * multiplier)
    });
    currentDate.setMonth(currentDate.getMonth() + 1);
  }
  
  return months;
} 