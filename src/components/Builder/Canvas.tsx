import React from 'react';
import { X, Move } from 'lucide-react';
import { Block } from '../../types/builder';
import { ResizableBox } from 'react-resizable';
import { PAPER_SIZES, MM_TO_PX } from '../../utils/paperSizes';
import 'react-resizable/css/styles.css';
import { renderBlockContent } from '../../utils/blockRenderer';

interface CanvasProps {
  blocks: Block[];
  setBlocks: React.Dispatch<React.SetStateAction<Block[]>>;
}

export default function Canvas({ blocks, setBlocks }: CanvasProps) {
  const handleDelete = (blockId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setBlocks(prevBlocks => prevBlocks.filter(block => block.id !== blockId));
  };

  const handleMouseDown = (e: React.MouseEvent, blockId: string) => {
    const block = blocks.find(b => b.id === blockId);
    if (!block) return;

    const blockElement = e.currentTarget as HTMLDivElement;
    const startX = e.clientX - block.position.x;
    const startY = e.clientY - block.position.y;

    const handleMouseMove = (e: MouseEvent) => {
      const newX = e.clientX - startX;
      const newY = e.clientY - startY;

      blockElement.style.left = `${newX}px`;
      blockElement.style.top = `${newY}px`;
    };

    const handleMouseUp = () => {
      const finalX = parseInt(blockElement.style.left);
      const finalY = parseInt(blockElement.style.top);

      setBlocks(prevBlocks => prevBlocks.map(b => 
        b.id === blockId 
          ? { ...b, position: { x: finalX, y: finalY } }
          : b
      ));

      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleResize = (blockId: string, size: { width: number; height: number }) => {
    setBlocks(prevBlocks => prevBlocks.map(block => 
      block.id === blockId 
        ? { ...block, size }
        : block
    ));
  };

  const handleImageUpload = (blockId: string, file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setBlocks(prevBlocks => prevBlocks.map(block => 
          block.id === blockId 
            ? { ...block, content: { ...block.content, imageUrl: e.target.result as string } }
            : block
        ));
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex-1 bg-white m-4 rounded-lg shadow-lg p-4 relative min-h-[600px]">
      <div className="relative w-full h-full">
        {blocks.map((block) => (
          <div
            key={block.id}
            className="absolute"
            style={{
              left: block.position.x,
              top: block.position.y,
            }}
          >
            <ResizableBox
              width={block.size.width}
              height={block.size.height}
              onResize={(e, { size }) => handleResize(block.id, size)}
              minConstraints={[100, 50]}
              maxConstraints={[800, 600]}
              resizeHandles={['se', 'sw', 'ne', 'nw', 'n', 's', 'e', 'w']}
            >
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow w-full h-full">
                <div 
                  className="h-8 bg-gray-50 rounded-t-lg border-b border-gray-200 px-2 
                            flex items-center justify-between cursor-move"
                  onMouseDown={(e) => handleMouseDown(e, block.id)}
                >
                  <Move className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{block.type}</span>
                  <button
                    onClick={(e) => handleDelete(block.id, e)}
                    className="p-1 hover:bg-red-50 rounded-full"
                  >
                    <X className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
                <div className="p-4">
                  {renderBlockContent({
                    block,
                    onImageUpload: handleImageUpload
                  })}
                </div>
              </div>
            </ResizableBox>
          </div>
        ))}

        {blocks.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-gray-400">
            Haz clic en los elementos del panel para agregarlos
          </div>
        )}
      </div>
    </div>
  );
}