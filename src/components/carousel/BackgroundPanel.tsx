
import React from "react";
import { UnsplashImage } from "@/services/unsplashService";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { X } from "lucide-react";
import ImageSearchPanel from "./ImageSearchPanel";

interface BackgroundPanelProps {
  currentSlide: any;
  currentSlideImage: UnsplashImage | null;
  imageFilter: string;
  imageSize: { width: number; height: number };
  imageOpacity: number;
  onFilterChange: (filter: string) => void;
  onSizeChange: (size: { width: number; height: number }) => void;
  onOpacityChange: (opacity: number) => void;
  isLoading: boolean;
  backgroundColor?: string;
  onBackgroundColorChange?: (color: string) => void;
  backgroundImageOpacity?: number;
  onBackgroundImageOpacityChange?: (opacity: number) => void;
  onRemoveBackgroundImage?: () => void;
  onUpdateBackgroundImage?: (image: UnsplashImage) => void;
  images: UnsplashImage[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  handleSearchImages: () => void;
}

const BackgroundPanel: React.FC<BackgroundPanelProps> = ({
  currentSlide,
  currentSlideImage,
  backgroundColor = "#ffffff",
  onBackgroundColorChange = () => {},
  backgroundImageOpacity = 1,
  onBackgroundImageOpacityChange = () => {},
  onRemoveBackgroundImage = () => {},
  onUpdateBackgroundImage = () => {},
  isLoading,
  images,
  searchTerm,
  setSearchTerm,
  handleSearchImages,
}) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h3 className="text-sm font-medium">Cor de Fundo</h3>
        <div className="flex items-center gap-2">
          <Input
            type="color"
            value={backgroundColor}
            onChange={(e) => onBackgroundColorChange(e.target.value)}
            className="h-10 cursor-pointer w-24"
          />
          <div className="flex-grow">
            <span className="text-sm text-muted-foreground">
              {backgroundColor.toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-medium">Imagem de Fundo</h3>
        
        {currentSlideImage ? (
          <div className="space-y-4">
            <div className="relative rounded-md overflow-hidden h-40">
              <img 
                src={currentSlideImage.urls.small} 
                alt="Background" 
                className="w-full h-full object-cover"
                style={{ opacity: backgroundImageOpacity }}
              />
              <Button
                size="icon"
                variant="destructive"
                className="absolute top-2 right-2 h-6 w-6"
                onClick={onRemoveBackgroundImage}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Opacidade</span>
                <span className="text-sm text-muted-foreground">
                  {Math.round(backgroundImageOpacity * 100)}%
                </span>
              </div>
              <Slider
                value={[backgroundImageOpacity * 100]}
                min={0}
                max={100}
                step={1}
                onValueChange={(value) => onBackgroundImageOpacityChange(value[0] / 100)}
              />
            </div>
          </div>
        ) : (
          <div className="text-sm text-muted-foreground mb-4">
            Nenhuma imagem de fundo definida. Escolha uma imagem abaixo.
          </div>
        )}
        
        <ImageSearchPanel 
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          handleSearchImages={handleSearchImages}
          isLoading={isLoading}
        />
        
        <div className="grid grid-cols-3 gap-2 mt-4">
          {images.slice(0, 6).map((image) => (
            <div 
              key={image.id}
              className="relative cursor-pointer rounded-md overflow-hidden h-20"
              onClick={() => onUpdateBackgroundImage(image)}
            >
              <img 
                src={image.urls.thumb} 
                alt={image.alt_description || "Background option"}
                className="w-full h-full object-cover hover:opacity-80 transition-opacity"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BackgroundPanel;
