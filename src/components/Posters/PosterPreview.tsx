import React, { useState } from 'react';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
}

interface FinancingOption {
  logo: string;
  bank: string;
  cardName: string;
  plan: string;
}

interface PosterPreviewProps {
  product?: Product;
  category?: string;
  promotion?: {
    discount: string;
    bank?: string;
    cardType?: string;
    conditions?: string[];
    startDate?: string;
    endDate?: string;
    type?: 'percentage' | '2x1' | '3x2' | 'second-70';
    title?: string;
    description?: string;
  };
  company?: {
    id: string;
    name: string;
    logo: string;
  };
  showTopLogo?: boolean;
  pricePerUnit?: string;
  points?: string;
  origin?: string;
  barcode?: string;
  compact?: boolean;
  selectedFormat: {
    id: string;
    width: string;
    height: string;
    name: string;
  };
  zoom: number;
  cardSize: number;
  isLandscape?: boolean;
  financing?: FinancingOption[] | null;
  hideGrid?: boolean;
  fullscreen?: boolean;
}

// Definimos los formatos de papel disponibles
const PAPER_FORMATS = [
  { id: 'A2', width: '420mm', height: '594mm', name: 'A2 (420 × 594 mm)' },
  { id: 'A3', width: '297mm', height: '420mm', name: 'A3 (297 × 420 mm)' },
  { id: 'A4', width: '210mm', height: '297mm', name: 'A4 (210 × 297 mm)' },
  { id: 'letter', width: '215.9mm', height: '279.4mm', name: 'Carta (215.9 × 279.4 mm)' },
  { id: 'legal', width: '215.9mm', height: '355.6mm', name: 'Legal (215.9 × 355.6 mm)' }
];

export const PosterPreview: React.FC<PosterPreviewProps> = ({
  product,
  category,
  promotion,
  company,
  showTopLogo = true,
  pricePerUnit,
  points,
  origin = 'ARGENTINA',
  barcode,
  compact = false,
  selectedFormat,
  zoom,
  cardSize,
  isLandscape = false,
  financing = null,
  hideGrid = false,
  fullscreen = false,
}) => {
  // En el componente, agregamos el estado para el formato seleccionado
  const [showFormatSelector, setShowFormatSelector] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Manejadores de movimiento
  const handleMouseDown = (e: React.MouseEvent) => {
    // Solo activar el arrastre si se hace clic en el cartel
    const target = e.target as HTMLElement;
    if (!target.closest('.poster-content')) return;

    e.preventDefault();
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    
    // Calcular nueva posición
    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;

    // Limitar el movimiento dentro de la hoja
    const maxOffset = 500; // Aumentamos el rango de movimiento
    setPosition({
      x: Math.max(-maxOffset, Math.min(maxOffset, newX)),
      y: Math.max(-maxOffset, Math.min(maxOffset, newY))
    });
  };

  // Obtener el texto de puntos según la empresa
  const getPointsText = () => {
    const companyName = company?.name?.toLowerCase() || '';
    if (companyName.includes('falabella')) {
      return 'Puntos Fala';
    }
    if (companyName.includes('sodimac')) {
      return 'Puntos Sodimac';
    }
    return 'PUNTOS JUMBO MÁS';
  };

  // Calcular el precio con descuento
  const calculatePrice = () => {
    if (!promotion) return {
      finalPrice: product?.price || 0,
      unitPrice: product?.price || 0,
      totalUnits: 1,
      savedAmount: 0,
      secondUnitPrice: 0
    };

    switch (promotion.type) {
      case 'second-70':
        const secondUnitPrice = product?.price * 0.3 || 0; // 70% de descuento en la segunda unidad
        return {
          finalPrice: product?.price + secondUnitPrice || 0,
          unitPrice: (product?.price + secondUnitPrice) / 2,
          totalUnits: 2,
          savedAmount: product?.price * 0.7 || 0,
          secondUnitPrice
        };
      case '2x1':
        return {
          finalPrice: product?.price || 0,
          unitPrice: product?.price / 2 || 0,
          totalUnits: 2,
          savedAmount: product?.price || 0
        };
      case '3x2':
        return {
          finalPrice: product?.price * 2 || 0,
          unitPrice: (product?.price * 2) / 3 || 0,
          totalUnits: 3,
          savedAmount: product?.price || 0
        };
      default:
        // Descuento porcentual normal
        const discountMatch = promotion.discount.match(/(\d+)/);
        if (!discountMatch) return {
          finalPrice: product?.price || 0,
          unitPrice: product?.price || 0,
          totalUnits: 1,
          savedAmount: 0
        };
        
        const discountPercent = parseInt(discountMatch[0]);
        const finalPrice = product?.price * (1 - discountPercent / 100) || 0;
        return {
          finalPrice,
          unitPrice: finalPrice,
          totalUnits: 1,
          savedAmount: product?.price - finalPrice || 0
        };
    }
  };

  const priceInfo = calculatePrice();

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://speed-plus.com/product/${product?.id}`;

  const roundedFontStyle = { 
    fontFamily: 'VAG Rounded BT, VAG Rounded Std, Arial Rounded MT Bold, Arial Black, sans-serif'
  };

  // Función para renderizar las condiciones y vigencia
  const renderConditionsAndDates = () => {
    if (!promotion) return null;

    return (
      <div className="text-right px-4">
        {promotion.conditions && promotion.conditions.length > 0 && (
          <div className="text-[14px]" style={roundedFontStyle}>
            <span className="text-gray-600">Condiciones:</span><br />
            {promotion.conditions.map((condition, index) => (
              <div key={index}>• {condition}</div>
            ))}
          </div>
        )}
        {(promotion.startDate || promotion.endDate) && (
          <div className="text-[14px] mt-2" style={roundedFontStyle}>
            <span className="text-gray-600">Vigencia:</span><br />
            {promotion.startDate && <div>Del {new Date(promotion.startDate).toLocaleDateString()}</div>}
            {promotion.endDate && <div>al {new Date(promotion.endDate).toLocaleDateString()}</div>}
          </div>
        )}
      </div>
    );
  };

  // Función para renderizar el logo del banco (la eliminaremos ya que está duplicada)
  const renderBankLogo = () => {
    return null; // Ya no renderizamos el logo aquí
  };

  // Función para renderizar el contenido principal
  const renderContent = () => {
    if (product) {
      return (
        <>
          <div className="text-4xl font-bold text-black tracking-tight leading-tight uppercase px-4 max-h-[120px] overflow-hidden">
            {product.name}
          </div>
          {/* Descuento y Condiciones para productos */}
          {promotion && (
            <div className="relative h-[70px]">
              <div className="flex items-center justify-center">
                <div className="bg-red-600 text-white px-6 py-2 rounded-full text-3xl font-bold">
                  {promotion.discount}
                </div>
              </div>
              {/* Condiciones y vigencia */}
              <div className="absolute top-0 right-4">
                {renderConditionsAndDates()}
              </div>
            </div>
          )}
        </>
      );
    } else if (category) {
      return (
        <div className="flex h-full">
          {/* Contenido principal centrado */}
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="text-6xl font-black text-black tracking-tight leading-tight uppercase text-center mb-8">
              {category}
            </div>
            {promotion && (
              <div className="text-4xl font-bold text-red-600 text-center mb-8">
                {promotion.title || promotion.discount}
              </div>
            )}
            {financing && financing.length > 0 && (
              <div className="flex flex-col gap-1">
                {financing.map((fin, index) => (
                  <div key={index} className="bg-indigo-600 text-white py-0.5 px-2 rounded text-xs">
                    {fin.plan} - {fin.bank}
                  </div>
                ))}
              </div>
            )}
            <div className="text-2xl text-gray-600 text-center">
              Ver productos seleccionados
            </div>
          </div>

          {/* Condiciones y vigencia al costado */}
          {promotion && (
            <div className="absolute right-8 top-1/2 -translate-y-1/2 w-[300px] text-right">
              {promotion.conditions && promotion.conditions.length > 0 && (
                <div className="text-[14px] mb-4" style={roundedFontStyle}>
                  <span className="text-gray-600 font-medium">Condiciones:</span><br />
                  {promotion.conditions.map((condition, index) => (
                    <div key={index} className="mt-1">• {condition}</div>
                  ))}
                </div>
              )}
              {(promotion.startDate || promotion.endDate) && (
                <div className="text-[14px]" style={roundedFontStyle}>
                  <span className="text-gray-600 font-medium">Vigencia:</span><br />
                  {promotion.startDate && (
                    <div className="mt-1">Del {new Date(promotion.startDate).toLocaleDateString()}</div>
                  )}
                  {promotion.endDate && (
                    <div>al {new Date(promotion.endDate).toLocaleDateString()}</div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  // Función para renderizar la sección de precios
  const renderPriceSection = () => {
    if (!product) return null;

    const strikeStyles = {
      textDecoration: 'line-through',
      textDecorationThickness: '1.5px',
      color: '#6B7280',
      opacity: '0.8',
      fontSize: '50px',
      fontWeight: '400',
      display: 'inline-block'
    };

    const discountStyles = {
      backgroundColor: '#DC2626',
      color: '#FBBF24',
      padding: '0.5rem 1rem',
      borderRadius: '9999px',
      fontSize: '1.5rem',
      fontWeight: '600',
      display: 'inline-block'
    };

    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[160px] relative">
        <div className="flex items-center gap-4 mb-4">
          <span style={strikeStyles}>
            ${product.price.toLocaleString('es-AR')}
          </span>
        </div>

        {promotion && (
          <div className="flex items-center justify-center mb-4">
            <div style={discountStyles}>
              {promotion.discount}
            </div>
          </div>
        )}

        <div className="text-center">
          <span className="text-[90px] font-black leading-none block">
            ${Math.round(priceInfo.finalPrice).toLocaleString('es-AR')}
          </span>

          {financing && financing.length > 0 && (
            <div className="absolute right-8 top-1/2 -translate-y-1/2 flex items-center gap-3">
              {financing.map((fin, index) => (
                <div 
                  key={index} 
                  className="flex items-center bg-white rounded-lg p-0 shadow-sm"
                  style={{
                    minWidth: '130px',
                    height: '90px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}
                >
                  <img 
                    src={fin.logo} 
                    alt={fin.bank} 
                    className="w-full h-full object-contain p-2"
                    style={{
                      maxWidth: '100%',
                      maxHeight: '100%'
                    }}
                  />
                </div>
              ))}
            </div>
          )}

          {financing && financing.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2 mt-4">
              {financing.map((fin, index) => (
                <div 
                  key={index} 
                  className="bg-indigo-600 text-white py-1.5 px-4 rounded-full text-sm font-medium"
                >
                  {fin.plan}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  // Función para renderizar la sección inferior
  const renderBottomSection = () => {
    if (!product) return null; // No mostrar sección inferior si no hay producto

    return (
      <div className="h-[120px] flex flex-col justify-end pb-4">
        <div className="grid grid-cols-2 gap-4 text-gray-800 px-4">
          <div className="space-y-1 text-left">
            <div className="text-base font-medium">
              ORIGEN: {origin}
            </div>
          </div>
          <div className="text-right">
            {points && (
              <div className="text-base font-bold">
                SUMÁ {points} {getPointsText()}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-between items-end mt-4 px-4">
          <div className="text-base text-left">
            SKU: {barcode}
          </div>
          <div className="flex items-center gap-2">
            <img 
              src={qrUrl}
              alt="QR Code"
              className="w-16 h-16 rounded bg-white"
            />
            <span className="text-xs text-gray-500 text-left">
              más información<br />del producto
            </span>
          </div>
        </div>
      </div>
    );
  };

  // Renderizado normal cuando no es modal
  return (
    <div className="poster-preview relative">
      <div className={`flex justify-center items-center ${fullscreen ? 'min-h-screen' : ''}`}>
        <div className="flex gap-4 items-start">
          <div 
            className="relative overflow-hidden flex items-center justify-center"
            style={{
              width: fullscreen ? '100vw' : '100%',
              height: fullscreen ? '100vh' : '90vh',
              cursor: isDragging ? 'grabbing' : 'grab'
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={() => setIsDragging(false)}
            onMouseLeave={() => setIsDragging(false)}
          >
            <div className="relative">
              <div 
                className="relative transition-transform poster-container"
                style={{ 
                  width: isLandscape ? selectedFormat.height : selectedFormat.width, 
                  height: isLandscape ? selectedFormat.width : selectedFormat.height,
                  transform: `scale(${zoom}) translate(${position.x}px, ${position.y}px)`,
                  transformOrigin: 'center center',
                  backgroundImage: hideGrid ? 'none' : `
                    linear-gradient(to right, #f0f0f0 1px, transparent 1px),
                    linear-gradient(to bottom, #f0f0f0 1px, transparent 1px)
                  `,
                  backgroundSize: '10mm 10mm',
                }}
              >
                <div 
                  className="poster-content absolute inset-0 flex items-center justify-center"
                  style={{
                    margin: 0,
                    padding: 0,
                    transform: 'none',
                    height: 'fit-content'
                  }}
                >
                  <div 
                    className="transform rounded-lg overflow-hidden"
                    style={{ 
                      transform: `scale(${cardSize})`,
                      transformOrigin: 'center center',
                      width: '900px',
                      height: 'fit-content',
                      margin: 0,
                      padding: 0,
                      position: 'relative',
                      backgroundColor: 'white'
                    }}
                  >
                    {/* Logo superior */}
                    {showTopLogo && company?.logo && (
                      <div className="absolute left-4 top-4 z-20">
                        <img 
                          src={company.logo}
                          alt={company.name}
                          className="h-16 w-auto object-contain"
                        />
                      </div>
                    )}

                    {/* Logo de fondo (marca de agua) */}
                    {company?.logo && (
                      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                        <img 
                          src={company.logo}
                          alt={company.name}
                          style={{
                            position: 'absolute',
                            width: '110%',
                            height: '110%',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%) rotate(-30deg)',
                            opacity: 0.08,
                            objectFit: 'contain',
                            filter: 'grayscale(50%)',
                            mixBlendMode: 'multiply'
                          }}
                        />
                      </div>
                    )}

                    {/* Contenido principal */}
                    <div className="flex flex-col relative" style={roundedFontStyle}>
                      {/* Título del producto */}
                      <div className="text-[48px] font-black text-black tracking-tight leading-none uppercase text-center mt-8 mb-4 px-8">
                        {product?.name}
                      </div>

                      {/* Sección de precios */}
                      <div className="flex flex-col items-center justify-center relative py-4">
                        {/* Precio tachado */}
                        <div className="text-[42px] text-gray-400 line-through mb-2">
                          ${product?.price.toLocaleString('es-AR')}
                        </div>

                        {/* Descuento */}
                        {promotion && (
                          <div className="bg-red-600 text-white px-8 py-2 rounded-full text-[36px] font-bold mb-4">
                            {promotion.discount}
                          </div>
                        )}

                        {/* Precio final */}
                        <div className="text-[80px] font-black leading-none mb-4">
                          ${Math.round(priceInfo.finalPrice).toLocaleString('es-AR')}
                        </div>

                        {/* Cuotas */}
                        {financing && financing.length > 0 && (
                          <div className="mb-4">
                            <div className="bg-indigo-600 text-white py-2 px-6 rounded-full text-[24px] font-medium">
                              {financing[0].plan}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Sección inferior */}
                      <div className="flex justify-between items-end p-4 bg-white">
                        <div className="flex flex-col items-start">
                          <div className="text-[16px] font-medium mb-1">
                            ORIGEN: {origin}
                          </div>
                          <div className="text-[16px]">
                            SKU: {barcode}
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="text-[16px] font-bold text-right">
                            SUMÁ {points} {getPointsText()}
                          </div>
                          <div className="flex items-center gap-2">
                            <img 
                              src={qrUrl}
                              alt="QR Code"
                              className="w-14 h-14 rounded bg-white"
                            />
                            <span className="text-xs text-gray-500 text-left">
                              más información<br />del producto
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Logo del banco y condiciones */}
                      {financing && financing.length > 0 && (
                        <div className="absolute right-5 top-[35%] flex flex-col items-end">
                          <img 
                            src={financing[0].logo}
                            alt={financing[0].bank}
                            className="w-32 h-auto object-contain mb-4"
                            onError={(e) => {
                              console.error(`Error loading bank logo: ${financing[0].logo}`);
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                          {promotion && (
                            <div className="text-right">
                              <div className="text-[14px]" style={roundedFontStyle}>
                                <div className="mb-1 font-medium">Condiciones:</div>
                                {promotion.conditions?.map((condition, index) => (
                                  <div key={index} className="text-[12px]">• {condition}</div>
                                ))}
                              </div>
                              {(promotion.startDate || promotion.endDate) && (
                                <div className="text-[14px] mt-2" style={roundedFontStyle}>
                                  <div className="mb-1 font-medium">Vigencia:</div>
                                  <div className="text-[12px]">
                                    Del {new Date(promotion.startDate || '').toLocaleDateString()}
                                    <br />
                                    al {new Date(promotion.endDate || '').toLocaleDateString()}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 