
import React from "react";
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
  zIndex,
}) => {
  const [isHovering, setIsHovering] = useState(false);

  return (
    <div
      className={`absolute cursor-move ${isSelected ? "ring-2 ring-primary" : ""}`}
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
        width: `${size.width}%`,
        height: `${size.height}%`,
        transform: "translate(-50%, -50%)",
        opacity,
        zIndex,
      }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      onMouseDown={(e) => onDragStart(e)}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <img
        src={image.urls.regular}
        alt={image.alt_description || "Imagem do slide"}
        className={`w-full h-full object-cover filter-${filter}`}
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
    </div>
  );
};

import { useState } from "react";

export interface SlideImageData {
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
  selectedImageId: string | null;
  onDragStart: (e: React.MouseEvent, id: string) => void;
  onPositionChange: (id: string, position: { x: number; y: number }) => void;
}

const SlideImages: React.FC<SlideImagesProps> = ({
  images,
  onSelect,
  onDelete,
  selectedImageId,
  onDragStart,
  onPositionChange,
}) => {
  if (!images.length) return null;

  return (
    <>
      {images.map((slideImage) => (
        <SlideImage
          key={slideImage.id}
          image={slideImage.image}
          position={slideImage.position}
          size={slideImage.size}
          opacity={slideImage.opacity}
          filter={slideImage.filter}
          isSelected={selectedImageId === slideImage.id}
          onSelect={() => onSelect(slideImage.id)}
          onDelete={() => onDelete(slideImage.id)}
          onDragStart={(e) => onDragStart(e, slideImage.id)}
          onPositionChange={(position) => onPositionChange(slideImage.id, position)}
          zIndex={slideImage.zIndex}
        />
      ))}
    </>
  );
};

export default SlideImages;
