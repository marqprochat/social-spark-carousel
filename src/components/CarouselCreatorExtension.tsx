import React, { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { UnsplashImage } from "@/services/unsplashService";
import { SlideImageData } from "@/components/SlideImages";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Image, Plus, Layers } from "lucide-react";

// This file contains extension methods and types for the CarouselCreator component

export const initializeSlides = (texts: string[], images: UnsplashImage[]): Slide[] => {
  return texts.map((text, index) => ({
    id: `slide-${Date.now()}-${index}`,
    textBoxes: [{
      id: uuidv4(),
      text: text,
      position: { x: 50, y: 50 },
      style: {
        color: "#ffffff",
        fontSize: "20px",
        fontFamily: "roboto",
        backgroundColor: "rgba(0,0,0,0.5)",
        padding: "10px"
      }
    }],
    images: [],
    backgroundImage: images[index % images.length] || null,
  }));
};

export const addImageToSlide = (slides: Slide[], currentSlideIndex: number, imageData: SlideImageData): Slide[] => {
  const updatedSlides = [...slides];
  updatedSlides[currentSlideIndex].images.push(imageData);
  return updatedSlides;
};

export const updateImageInSlide = (
  slides: Slide[], 
  currentSlideIndex: number,
  imageId: string,
  updates: Partial<SlideImageData>
): Slide[] => {
  const updatedSlides = [...slides];
  const currentSlide = updatedSlides[currentSlideIndex];
  
  const imageIndex = currentSlide.images.findIndex(img => img.id === imageId);
  if (imageIndex === -1) return slides;
  
  currentSlide.images[imageIndex] = {
    ...currentSlide.images[imageIndex],
    ...updates
  };
  
  return updatedSlides;
};

export const deleteImageFromSlide = (
  slides: Slide[],
  currentSlideIndex: number,
  imageId: string
): Slide[] => {
  const updatedSlides = [...slides];
  const currentSlide = updatedSlides[currentSlideIndex];
  
  currentSlide.images = currentSlide.images.filter(img => img.id !== imageId);
  
  return updatedSlides;
};

export const updateBackgroundImageFilter = (
  slides: Slide[],
  currentSlideIndex: number,
  filter: string
): Slide[] => {
  // This function would update the filter on the background image
  // Since we're keeping the background image separate from the editable images
  // This is where that logic would go
  return slides;
};

export interface ImageEditorTabProps {
  currentSlide: Slide;
  selectedImageId: string | null;
  imageFilter: string;
  imageSize: { width: number; height: number };
  imageOpacity: number;
  onFilterChange: (filter: string) => void;
  onSizeChange: (size: { width: number; height: number }) => void;
  onOpacityChange: (opacity: number) => void;
  onAddImage: (imageData: SlideImageData) => void;
  onArrangeImage: (id: string, direction: 'forward' | 'backward') => void;
  images: UnsplashImage[];
  isLoading: boolean;
}

export const ImageEditorTab: React.FC<ImageEditorTabProps> = ({
  currentSlide,
  selectedImageId,
  imageFilter,
  imageSize,
  imageOpacity,
  onFilterChange,
  onSizeChange,
  onOpacityChange,
  onAddImage,
  onArrangeImage,
  images,
  isLoading
}) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-medium">Gerenciar Imagens</h3>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => selectedImageId && onArrangeImage(selectedImageId, 'forward')}
            disabled={!selectedImageId}
          >
            <Layers className="h-4 w-4" />
            Trazer para Frente
          </Button>
          <AddImageDialog 
            images={images}
            onAddImage={onAddImage}
            isLoading={isLoading}
          />
        </div>
      </div>
      
      <Tabs defaultValue="edit" className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="edit" className="w-1/2">
            <Image className="h-4 w-4 mr-2" /> Editar Imagem
          </TabsTrigger>
          <TabsTrigger value="gallery" className="w-1/2">
            <Plus className="h-4 w-4 mr-2" /> Galeria
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="edit">
          <ImageEditor 
            currentSlideImage={selectedImageId ? 
              currentSlide.images.find(img => img.id === selectedImageId)?.image || null : 
              currentSlide.backgroundImage}
            imageFilter={imageFilter}
            imageSize={imageSize}
            onFilterChange={onFilterChange}
            onSizeChange={onSizeChange}
            onOpacityChange={onOpacityChange}
            imageOpacity={imageOpacity}
            isLoading={isLoading}
          />
        </TabsContent>
        
        <TabsContent value="gallery">
          <div className="space-y-2">
            <div className="grid grid-cols-3 gap-2 max-h-[200px] overflow-y-auto p-1">
              {images.map((image) => (
                <div
                  key={image.id}
                  className="cursor-pointer rounded overflow-hidden h-[60px]"
                  onClick={() => {
                    onAddImage({
                      id: uuidv4(),
                      image,
                      position: { x: 50, y: 50 },
                      size: { width: 50, height: 50 },
                      opacity: 1,
                      filter: "none",
                      zIndex: 2
                    });
                  }}
                >
                  <img
                    src={image.urls.small}
                    alt={image.alt_description || "Imagem do Unsplash"}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
              {isLoading && (
                <div className="col-span-3 flex justify-center py-4">
                  <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
                </div>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

import { AddImageDialog } from "./CarouselCreatorImageExtension";

// Export the slide type for use in other components
export type Slide = {
  id: string;
  textBoxes: {
    id: string;
    text: string;
    position: { x: number; y: number };
    style: {
      color: string;
      fontSize: string;
      fontFamily: string;
      backgroundColor: string;
      padding: string;
    };
  }[];
  images: SlideImageData[];
  backgroundImage: UnsplashImage | null;
};
