import React, { useState, useRef } from 'react';
import Draggable from 'react-draggable';
import { ResizableBox } from 'react-resizable';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Move, Edit2, Upload } from 'lucide-react';
import { Block, BlockType } from '../../types/builder';
import 'react-resizable/css/styles.css';
import { useCollisionDetection } from '../hooks/useCollisionDetection';

interface CanvasProps {
  blocks: Block[];
  setBlocks: (blocks: Block[]) => void;
}

export default function Canvas({ blocks, setBlocks }: CanvasProps) {
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null);
  const [editingText, setEditingText] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [guides, setGuides] = useState<{
    vertical: number[];
    horizontal: number[];
  }>({ vertical: [], horizontal: [] });
  const collisionState = useCollisionDetection(blocks, selectedBlock);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const blockType = e.dataTransfer.getData('blockType') as BlockType;
    const canvasRect = e.currentTarget.getBoundingClientRect();
    
    let x = e.clientX - canvasRect.left;
    let y = e.clientY - canvasRect.top;

    // Ajustar a la cuadrícula
    x = Math.round(x / 20) * 20;
    y = Math.round(y / 20) * 20;

    const newBlock: Block = {
      id: `${blockType}-${Date.now()}`,
      type: blockType,
      content: {},
      position: { x, y },
      size: { width: 200, height: 100 }
    };

    // Verificar colisión antes de agregar
    if (!checkCollision(newBlock, x, y)) {
      setBlocks([...blocks, newBlock]);
    }
  };

  const handleBlockDrag = (blockId: string, data: { x: number; y: number }) => {
    const activeBlock = blocks.find(b => b.id === blockId);
    if (!activeBlock) return;

    // Ajustar posición con la fuerza de repulsión
    let newX = Math.round(data.x / 20) * 20 + collisionState.repulsionForce.x;
    let newY = Math.round(data.y / 20) * 20 + collisionState.repulsionForce.y;

    // Verificar límites del canvas
    const maxX = window.innerWidth - (activeBlock.size?.width || 200) - 100;
    const maxY = window.innerHeight - (activeBlock.size?.height || 100) - 100;
    
    newX = Math.max(0, Math.min(newX, maxX));
    newY = Math.max(0, Math.min(newY, maxY));

    const updatedBlocks = blocks.map(block => 
      block.id === blockId 
        ? { 
            ...block, 
            position: { x: newX, y: newY }
          }
        : block
    );
    setBlocks(updatedBlocks);
  };

  const handleDeleteBlock = (id: string) => {
    setBlocks(blocks.filter(block => block.id !== id));
    setSelectedBlock(null);
  };

  const handleTextEdit = (blockId: string, newText: string) => {
    setBlocks(blocks.map(block => 
      block.id === blockId 
        ? { ...block, content: { ...block.content, text: newText } }
        : block
    ));
  };

  const handleImageUpload = (blockId: string, file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setBlocks(blocks.map(block => 
        block.id === blockId 
          ? { ...block, content: { ...block.content, imageUrl: e.target?.result } }
          : block
      ));
    };
    reader.readAsDataURL(file);
  };

  const updateGuides = (activeBlock: Block) => {
    const verticalGuides: number[] = [];
    const horizontalGuides: number[] = [];

    blocks.forEach(block => {
      if (block.id === activeBlock.id) return;

      // Guías verticales
      const blockCenterX = block.position.x + (block.size?.width || 0) / 2;
      const activeCenterX = activeBlock.position.x + (activeBlock.size?.width || 0) / 2;
      
      if (Math.abs(blockCenterX - activeCenterX) < 10) {
        verticalGuides.push(blockCenterX);
      }

      // Guías horizontales
      const blockCenterY = block.position.y + (block.size?.height || 0) / 2;
      const activeCenterY = activeBlock.position.y + (activeBlock.size?.height || 0) / 2;
      
      if (Math.abs(blockCenterY - activeCenterY) < 10) {
        horizontalGuides.push(blockCenterY);
      }
    });

    setGuides({ vertical: verticalGuides, horizontal: horizontalGuides });
  };

  const renderBlockContent = (block: Block) => {
    const isEditing = editingText === block.id;

    switch (block.type) {
      case 'header':
        return <div className="bg-gray-50 p-4 rounded">Header Content</div>;
      case 'footer':
        return <div className="bg-gray-50 p-4 rounded">Footer Content</div>;
      case 'sku':
        return (
          <div className="relative group">
            {isEditing ? (
              <input
                type="text"
                value={block.content?.text || 'SKU-12345'}
                onChange={(e) => handleTextEdit(block.id, e.target.value)}
                onBlur={() => setEditingText(null)}
                autoFocus
                className="font-mono text-gray-600 w-full p-1 border rounded"
              />
            ) : (
              <>
                <span className="font-mono text-gray-600">{block.content?.text || 'SKU-12345'}</span>
                <button
                  onClick={() => setEditingText(block.id)}
                  className="absolute -right-6 top-0 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Edit2 className="w-4 h-4 text-gray-400" />
                </button>
              </>
            )}
          </div>
        );
      case 'image':
        return (
          <div className="relative group">
            {block.content?.imageUrl ? (
              <img 
                src={block.content.imageUrl} 
                alt="Uploaded content"
                className="w-full h-full object-contain"
              />
            ) : (
              <div 
                className="bg-gray-100 rounded flex flex-col items-center justify-center h-full min-h-[100px] cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-8 h-8 text-gray-400 mb-2" />
                <span className="text-gray-400 text-sm">Click para subir imagen</span>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleImageUpload(block.id, file);
              }}
            />
          </div>
        );
      case 'price':
        return (
          <div className="relative group">
            {isEditing ? (
              <input
                type="text"
                value={block.content?.text || '$99.99'}
                onChange={(e) => handleTextEdit(block.id, e.target.value)}
                onBlur={() => setEditingText(null)}
                autoFocus
                className="text-2xl font-bold text-gray-800 w-full p-1 border rounded"
              />
            ) : (
              <>
                <span className="text-2xl font-bold text-gray-800">{block.content?.text || '$99.99'}</span>
                <button
                  onClick={() => setEditingText(block.id)}
                  className="absolute -right-6 top-0 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Edit2 className="w-4 h-4 text-gray-400" />
                </button>
              </>
            )}
          </div>
        );
      case 'discount':
        return (
          <div className="relative group">
            {isEditing ? (
              <input
                type="text"
                value={block.content?.text || '-20%'}
                onChange={(e) => handleTextEdit(block.id, e.target.value)}
                onBlur={() => setEditingText(null)}
                autoFocus
                className="text-red-500 font-semibold w-full p-1 border rounded"
              />
            ) : (
              <>
                <span className="text-red-500 font-semibold">{block.content?.text || '-20%'}</span>
                <button
                  onClick={() => setEditingText(block.id)}
                  className="absolute -right-6 top-0 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Edit2 className="w-4 h-4 text-gray-400" />
                </button>
              </>
            )}
          </div>
        );
      case 'promotion':
        return (
          <div className="relative group">
            {isEditing ? (
              <input
                type="text"
                value={block.content?.text || '¡Oferta especial!'}
                onChange={(e) => handleTextEdit(block.id, e.target.value)}
                onBlur={() => setEditingText(null)}
                autoFocus
                className="bg-yellow-50 text-yellow-800 p-2 rounded w-full border"
              />
            ) : (
              <>
                <div className="bg-yellow-50 text-yellow-800 p-2 rounded">
                  {block.content?.text || '¡Oferta especial!'}
                </div>
                <button
                  onClick={() => setEditingText(block.id)}
                  className="absolute -right-6 top-0 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Edit2 className="w-4 h-4 text-gray-400" />
                </button>
              </>
            )}
          </div>
        );
      case 'logo':
        return (
          <div className="relative group">
            {block.content?.imageUrl ? (
              <img 
                src={block.content.imageUrl} 
                alt="Company logo"
                className="w-full h-full object-contain"
              />
            ) : (
              <div 
                className="bg-gray-100 rounded p-4 flex flex-col items-center justify-center cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-8 h-8 text-gray-400 mb-2" />
                <span className="text-gray-400 text-sm">Subir logo</span>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleImageUpload(block.id, file);
              }}
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div
      className="flex-1 bg-white m-4 rounded-lg shadow-xl p-4 relative"
      onDragOver={(e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
      }}
      onDrop={handleDrop}
      style={{ 
        minHeight: '600px', 
        position: 'relative',
        overflow: 'hidden',
        backgroundImage: 'radial-gradient(circle at 1px 1px, #f0f0f0 1px, transparent 0)',
        backgroundSize: '20px 20px'
      }}
    >
      <AnimatePresence>
        {blocks.map((block) => (
          <Draggable
            key={block.id}
            position={{ x: block.position.x, y: block.position.y }}
            grid={[20, 20]}
            bounds="parent"
            handle=".handle"
            onDrag={(e, data) => {
              e.preventDefault();
              handleBlockDrag(block.id, data);
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ 
                opacity: 1, 
                scale: 1,
                x: collisionState.isColliding && selectedBlock === block.id ? [-5, 5, 0] : 0
              }}
              transition={{ 
                duration: 0.3, 
                ease: "easeInOut",
                x: { type: "spring", stiffness: 300, damping: 10 }
              }}
              className={`absolute ${
                selectedBlock === block.id 
                  ? 'ring-2 ring-indigo-500' 
                  : ''
              } ${
                collisionState.collidingWith.includes(block.id)
                  ? 'ring-2 ring-red-500'
                  : ''
              }`}
              style={{ 
                position: 'absolute',
                zIndex: selectedBlock === block.id ? 10 : 1,
                boxShadow: collisionState.isColliding && selectedBlock === block.id 
                  ? '0 0 15px rgba(239, 68, 68, 0.5)'
                  : 'none'
              }}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedBlock(block.id);
              }}
              style={{ 
                position: 'absolute',
                zIndex: selectedBlock === block.id ? 10 : 1,
                width: block.size?.width,
                height: block.size?.height,
              }}
            >
              <ResizableBox
                width={block.size?.width || 200}
                height={block.size?.height || 100}
                minConstraints={[100, 50]}
                maxConstraints={[window.innerWidth - 100, window.innerHeight - 100]}
                onResize={(e, { size }) => {
                  const updatedBlocks = blocks.map(b =>
                    b.id === block.id ? { ...b, size } : b
                  );
                  setBlocks(updatedBlocks);
                }}
                resizeHandles={['se', 'sw', 'ne', 'nw', 'n', 's', 'e', 'w']}
                handle={<ResizeHandle />}
              >
                <motion.div 
                  className="relative bg-white rounded-lg shadow-lg border border-gray-200 p-4 h-full overflow-hidden"
                  whileHover={{ boxShadow: "0 8px 30px rgba(0,0,0,0.12)" }}
                >
                  <div className="handle absolute top-0 left-0 w-full h-6 bg-gray-50 rounded-t-lg cursor-move flex items-center justify-between px-2">
                    <Move className="w-4 h-4 text-gray-400" />
                    <span className="text-xs font-medium text-gray-600">{block.type}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteBlock(block.id);
                      }}
                      className="p-1 hover:bg-red-50 rounded-full group"
                    >
                      <X className="w-4 h-4 text-gray-400 group-hover:text-red-500" />
                    </button>
                  </div>
                  <div className="mt-6 overflow-auto">
                    {renderBlockContent(block)}
                  </div>
                </motion.div>
              </ResizableBox>
              
              {/* Indicador de zona de repulsión */}
              {selectedBlock === block.id && (
                <motion.div
                  className="absolute inset-0 -m-4 rounded-lg pointer-events-none"
                  initial={{ opacity: 0 }}
                  animate={{ 
                    opacity: [0.2, 0.1, 0.2],
                    scale: [1, 1.05, 1]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity
                  }}
                  style={{
                    background: 'radial-gradient(circle, rgba(99, 102, 241, 0.1) 0%, transparent 70%)'
                  }}
                />
              )}
            </motion.div>
          </Draggable>
        ))}
      </AnimatePresence>
      
      {blocks.length === 0 && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="h-full flex items-center justify-center"
        >
          <div className="text-center space-y-4">
            <div className="bg-indigo-50 rounded-full p-4 mx-auto w-fit">
              <Move className="w-8 h-8 text-indigo-600" />
            </div>
            <p className="text-gray-500">
              Arrastra elementos aquí para construir tu plantilla
            </p>
          </div>
        </motion.div>
      )}

      {/* Guías verticales */}
      {guides.vertical.map((position, index) => (
        <div
          key={`v-${index}`}
          className="absolute top-0 bottom-0 w-px bg-indigo-500/50"
          style={{ left: position }}
        />
      ))}

      {/* Guías horizontales */}
      {guides.horizontal.map((position, index) => (
        <div
          key={`h-${index}`}
          className="absolute left-0 right-0 h-px bg-indigo-500/50"
          style={{ top: position }}
        />
      ))}
    </div>
  );
}

const ResizeHandle = () => (
  <div className="absolute bottom-0 right-0 w-4 h-4 bg-indigo-500 rounded-bl cursor-se-resize" />
);