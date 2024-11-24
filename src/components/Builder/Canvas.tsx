import React, { useState, useRef, useEffect } from 'react';
import Draggable from 'react-draggable';
import { X, Move } from 'lucide-react';
import { Block } from '../../types/builder';
import { renderBlockContent } from '../../utils/blockRenderer';
import Rulers from './Rulers';

interface CanvasProps {
  blocks: Block[];
  setBlocks: (blocks: Block[]) => void;
}

export default function Canvas({ blocks, setBlocks }: CanvasProps) {
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null);
  const [editingText, setEditingText] = useState<string | null>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);
  const fileInputRefs = useRef<Map<string, HTMLInputElement>>(new Map());
  const gridSize = 20;

  useEffect(() => {
    const updateCanvasSize = () => {
      if (canvasRef.current) {
        setCanvasSize({
          width: canvasRef.current.clientWidth - 40, // -40 por el padding
          height: canvasRef.current.clientHeight - 40
        });
      }
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    return () => window.removeEventListener('resize', updateCanvasSize);
  }, []);

  const snapToGrid = (value: number): number => {
    return Math.round(value / gridSize) * gridSize;
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
      if (e.target?.result) {
        const imageUrl = typeof e.target.result === 'string' 
          ? e.target.result 
          : URL.createObjectURL(file);

        setBlocks(blocks.map(block => 
          block.id === blockId 
            ? { ...block, content: { ...block.content, imageUrl } }
            : block
        ));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDragStop = (blockId: string, data: { x: number; y: number }) => {
    const snappedX = snapToGrid(data.x);
    const snappedY = snapToGrid(data.y);

    setBlocks(blocks.map(block => 
      block.id === blockId 
        ? { ...block, position: { x: snappedX, y: snappedY } }
        : block
    ));
  };

  return (
    <div
      ref={canvasRef}
      className="flex-1 bg-white m-4 rounded-lg shadow-xl relative"
      style={{ 
        minHeight: '600px',
        paddingTop: '20px',
        paddingLeft: '20px',
      }}
    >
      {/* Reglas */}
      <Rulers 
        width={canvasSize.width} 
        height={canvasSize.height}
        gridSize={gridSize}
      />

      {/* Área de trabajo con cuadrícula */}
      <div
        className="relative w-full h-full"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(99, 102, 241, 0.1) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(99, 102, 241, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: `${gridSize}px ${gridSize}px`,
        }}
      >
        {blocks.map((block) => (
          <Draggable
            key={block.id}
            defaultPosition={block.position}
            onStop={(e, data) => handleDragStop(block.id, data)}
            grid={[gridSize, gridSize]}
            bounds="parent"
            handle=".handle"
          >
            <div 
              className={`absolute ${selectedBlock === block.id ? 'ring-2 ring-indigo-500' : ''}`}
              onClick={() => setSelectedBlock(block.id)}
            >
              <div className="bg-white rounded-lg shadow-lg border border-gray-200">
                <div className="handle absolute top-0 left-0 w-full h-6 bg-gray-50 rounded-t-lg cursor-move 
                              flex items-center justify-between px-2">
                  <Move className="w-4 h-4 text-gray-400" />
                  <span className="text-xs font-medium text-gray-600">{block.type}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteBlock(block.id);
                    }}
                    className="p-1 hover:bg-red-50 rounded-full"
                  >
                    <X className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
                <div className="mt-6 p-4" style={{ width: block.size?.width, height: block.size?.height }}>
                  {renderBlockContent({
                    block,
                    isEditing: editingText === block.id,
                    onEdit: handleTextEdit,
                    onStartEdit: (id) => setEditingText(id),
                    onStopEdit: () => setEditingText(null),
                    onImageUpload: handleImageUpload,
                    fileInputRef: { current: fileInputRefs.current.get(block.id) || null }
                  })}
                </div>
              </div>
            </div>
          </Draggable>
        ))}

        {blocks.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-gray-400">
            Haz clic en los elementos para agregarlos a la plantilla
          </div>
        )}
      </div>
    </div>
  );
}