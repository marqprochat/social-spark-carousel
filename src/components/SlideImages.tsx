
import React, { useState, useRef } from "react";
import { UnsplashImage } from "@/services/unsplashService";
import { X, Move } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SlideImageProps {
  image: UnsplashImage;
  position: { x: number; y: number };
  size: { width: number; height: number };
  opacity: number;
  filter: string;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onDragStart: (e: React.MouseEvent) => void;
  onPositionChange: (position: { x: number; y: number }) => void;
  onSizeChange?: (size: { width: number; height: number }) => void;
  zIndex: number;
}

export const SlideImage: React.FC<SlideImageProps> = ({
  image,
  position,
  size,
  opacity,
  filter,
  isSelected,
  onSelect,
  onDelete,
  onDragStart,
  onSizeChange,
  zIndex,
}) => {
  const [isHovering, setIsHovering] = useState(false);
  const imageRef = useRef<HTMLDivElement>(null);
  const resizingRef = useRef<string | null>(null);
  
  // Handle resize functionality
  const startResizing = (e: React.MouseEvent, direction: string) => {
    e.preventDefault();
    e.stopPropagation();
    resizingRef.current = direction;
    
    document.addEventListener('mousemove', handleResizeMove);
    document.addEventListener('mouseup', stopResizing);
  };

  const handleResizeMove = (e: MouseEvent) => {
    if (!resizingRef.current || !imageRef.current || !onSizeChange) return;
    
    const slideCanvas = document.getElementById('slide-canvas');
    if (!slideCanvas) return;
    
    const canvasRect = slideCanvas.getBoundingClientRect();
    const imageRect = imageRef.current.getBoundingClientRect();
    const direction = resizingRef.current;
    
    // Calculate size changes based on canvas dimensions
    const canvasWidth = canvasRect.width;
    const canvasHeight = canvasRect.height;
    
    let newWidth = size.width;
    let newHeight = size.height;
    
    // Calculate resize based on direction
    if (direction.includes('e')) {
      // Right edge
      const widthChange = ((e.clientX - imageRect.right) / canvasWidth) * 100;
      newWidth = Math.max(10, size.width + widthChange);
    } else if (direction.includes('w')) {
      // Left edge
      const widthChange = ((imageRect.left - e.clientX) / canvasWidth) * 100;
      newWidth = Math.max(10, size.width + widthChange);
    }
    
    if (direction.includes('s')) {
      // Bottom edge
      const heightChange = ((e.clientY - imageRect.bottom) / canvasHeight) * 100;
      newHeight = Math.max(10, size.height + heightChange);
    } else if (direction.includes('n')) {
      // Top edge
      const heightChange = ((imageRect.top - e.clientY) / canvasHeight) * 100;
      newHeight = Math.max(10, size.height + heightChange);
    }
    
    onSizeChange({ width: newWidth, height: newHeight });
  };

  const stopResizing = () => {
    resizingRef.current = null;
    document.removeEventListener('mousemove', handleResizeMove);
    document.removeEventListener('mouseup', stopResizing);
  };
  
  // Create resize handles
  const renderResizeHandles = () => {
    if (!isSelected) return null;
    
    const handles = [
      { position: 'n', className: 'top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 cursor-n-resize h-2 w-2' },
      { position: 'e', className: 'top-1/2 right-0 -translate-y-1/2 translate-x-1/2 cursor-e-resize h-2 w-2' },
      { position: 's', className: 'bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 cursor-s-resize h-2 w-2' },
      { position: 'w', className: 'top-1/2 left-0 -translate-y-1/2 -translate-x-1/2 cursor-w-resize h-2 w-2' },
      { position: 'ne', className: 'top-0 right-0 -translate-y-1/2 translate-x-1/2 cursor-ne-resize h-2 w-2' },
      { position: 'se', className: 'bottom-0 right-0 translate-y-1/2 translate-x-1/2 cursor-se-resize h-2 w-2' },
      { position: 'sw', className: 'bottom-0 left-0 translate-y-1/2 -translate-x-1/2 cursor-sw-resize h-2 w-2' },
      { position: 'nw', className: 'top-0 left-0 -translate-y-1/2 -translate-x-1/2 cursor-nw-resize h-2 w-2' },
    ];
    
    return handles.map(handle => (
      <div
        key={handle.position}
        className={`absolute ${handle.className} bg-primary rounded-full`}
        onMouseDown={(e) => startResizing(e, handle.position)}
      />
    ));
  };

  // Default fixed size for images - set to 30% of slide canvas width
  const defaultImageSize = { width: 30, height: 30 };
  const actualSize = {
    width: size.width === 0 ? defaultImageSize.width : size.width,
    height: size.height === 0 ? defaultImageSize.height : size.height
  };

  return (
    <div
      ref={imageRef}
      className={`absolute cursor-move ${isSelected ? "ring-2 ring-primary" : ""}`}
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
        width: `${actualSize.width}%`,
        height: `${actualSize.height}%`,
        transform: "translate(-50%, -50%)",
        opacity,
        zIndex,
        userSelect: "none",
      }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      onMouseDown={(e) => {
        e.stopPropagation();
        onDragStart(e);
      }}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <img
        src={image.urls.regular}
        alt={image.alt_description || "Imagem do slide"}
        className={`w-full h-full object-cover filter-${filter}`}
        draggable={false}
      />
      
      {(isSelected || isHovering) && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Button
            className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-700 z-20"
            size="icon"
            variant="destructive"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
          >
            <X className="h-3 w-3" />
          </Button>
          
          <Button
            className="bg-primary/70 text-white rounded-full p-2 hover:bg-primary"
            size="icon"
            variant="ghost"
          >
            <Move className="h-5 w-5" />
          </Button>
        </div>
      )}
      
      {/* Resize handles */}
      {renderResizeHandles()}
    </div>
  );
};

interface SlideImageData {
  id: string;
  image: UnsplashImage;
  position: { x: number; y: number };
  size: { width: number; height: number };
  opacity: number;
  filter: string;
  zIndex: number;
}

interface SlideImagesProps {
  images: SlideImageData[];
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  selectedId: string | null;
  onDragStart: (e: React.MouseEvent, id: string) => void;
  onPositionChange: (id: string, position: { x: number; y: number }) => void;
  onSizeChange?: (id: string, size: { width: number; height: number }) => void;
}

const SlideImages: React.FC<SlideImagesProps> = ({
  images,
  onSelect,
  onDelete,
  selectedId,
  onDragStart,
  onPositionChange,
  onSizeChange,
}) => {
  if (!images.length) return null;

  // Sort images by zIndex to ensure the ones with higher zIndex are rendered last
  const sortedImages = [...images].sort((a, b) => (a.zIndex || 1) - (b.zIndex || 1));

  return (
    <>
      {sortedImages.map((slideImage) => (
        <SlideImage
          key={slideImage.id}
          image={slideImage.image}
          position={slideImage.position}
          size={slideImage.size}
          opacity={slideImage.opacity}
          filter={slideImage.filter}
          isSelected={selectedId === slideImage.id}
          onSelect={() => onSelect(slideImage.id)}
          onDelete={() => onDelete(slideImage.id)}
          onDragStart={(e) => onDragStart(e, slideImage.id)}
          onPositionChange={(position) => onPositionChange(slideImage.id, position)}
          onSizeChange={onSizeChange ? (size) => onSizeChange(slideImage.id, size) : undefined}
          zIndex={slideImage.zIndex}
        />
      ))}
    </>
  );
};

export default SlideImages;
export type { SlideImageData };
