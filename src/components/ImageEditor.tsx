
import React from "react";
import { UnsplashImage } from "@/services/unsplashService";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ImageOff } from "lucide-react";

interface ImageEditorProps {
  currentSlideImage: UnsplashImage | null;
  imageFilter: string;
  imageSize: { width: number; height: number };
  onFilterChange: (filter: string) => void;
  onSizeChange: (size: { width: number; height: number }) => void;
  onOpacityChange: (opacity: number) => void;
  imageOpacity: number;
  isLoading: boolean;
  backgroundColor?: string;
  onBackgroundColorChange?: (color: string) => void;
  backgroundImageOpacity?: number;
  onBackgroundImageOpacityChange?: (opacity: number) => void;
  onRemoveBackgroundImage?: () => void;
}

const ImageEditor: React.FC<ImageEditorProps> = ({
  currentSlideImage,
  imageFilter,
  imageSize,
  onFilterChange,
  onSizeChange,
  onOpacityChange,
  imageOpacity,
  isLoading,
  backgroundColor,
  onBackgroundColorChange,
  backgroundImageOpacity = 1,
  onBackgroundImageOpacityChange,
  onRemoveBackgroundImage
}) => {
  const filters = [
    { value: "none", label: "Normal" },
    { value: "grayscale", label: "Preto e Branco" },
    { value: "sepia", label: "Sépia" },
    { value: "brightness", label: "Brilho" },
    { value: "contrast", label: "Contraste" },
    { value: "hue-rotate", label: "Matiz" },
    { value: "invert", label: "Negativo" },
    { value: "saturate", label: "Saturação" },
    { value: "vintage", label: "Vintage" },
  ];

  const handleWidthChange = (value: string) => {
    const width = parseInt(value);
    if (!isNaN(width) && width > 0) {
      onSizeChange({ ...imageSize, width });
    }
  };

  const handleHeightChange = (value: string) => {
    const height = parseInt(value);
    if (!isNaN(height) && height > 0) {
      onSizeChange({ ...imageSize, height });
    }
  };

  return (
    <div className="space-y-6">
      {/* Background settings section */}
      {(onBackgroundColorChange || onBackgroundImageOpacityChange || onRemoveBackgroundImage) && (
        <div className="space-y-4 pt-2 border-t border-gray-200">
          <h3 className="font-medium">Configurações de Plano de Fundo</h3>
          
          {onBackgroundColorChange && (
            <div>
              <Label>Cor de Fundo</Label>
              <Input 
                type="color" 
                value={backgroundColor || "#f5f5f5"}
                onChange={(e) => onBackgroundColorChange(e.target.value)}
                className="h-10 cursor-pointer"
              />
            </div>
          )}
          
          {onBackgroundImageOpacityChange && currentSlideImage && (
            <div>
              <Label>Opacidade da Imagem de Fundo ({Math.round(backgroundImageOpacity * 100)}%)</Label>
              <Slider
                value={[backgroundImageOpacity * 100]}
                min={0}
                max={100}
                step={5}
                className="mt-2"
                onValueChange={(value) => onBackgroundImageOpacityChange(value[0] / 100)}
                disabled={isLoading || !currentSlideImage}
              />
            </div>
          )}
          
          {onRemoveBackgroundImage && currentSlideImage && (
            <Button 
              variant="destructive" 
              size="sm"
              onClick={onRemoveBackgroundImage}
              className="w-full flex items-center gap-2"
            >
              <ImageOff className="w-4 h-4" />
              Remover Imagem de Fundo
            </Button>
          )}
        </div>
      )}
      
      <div>
        <Label>Filtro de Imagem</Label>
        <Select value={imageFilter} onValueChange={onFilterChange} disabled={isLoading || !currentSlideImage}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione um filtro" />
          </SelectTrigger>
          <SelectContent>
            {filters.map(filter => (
              <SelectItem key={filter.value} value={filter.value}>
                {filter.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Opacidade ({Math.round(imageOpacity * 100)}%)</Label>
        <Slider
          value={[imageOpacity * 100]}
          min={10}
          max={100}
          step={5}
          className="mt-2"
          onValueChange={(value) => onOpacityChange(value[0] / 100)}
          disabled={isLoading || !currentSlideImage}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Largura (%)</Label>
          <Input 
            type="number" 
            min={50} 
            max={150} 
            value={imageSize.width} 
            onChange={(e) => handleWidthChange(e.target.value)}
            disabled={isLoading || !currentSlideImage}
          />
        </div>
        <div>
          <Label>Altura (%)</Label>
          <Input 
            type="number" 
            min={50} 
            max={150} 
            value={imageSize.height} 
            onChange={(e) => handleHeightChange(e.target.value)}
            disabled={isLoading || !currentSlideImage}
          />
        </div>
      </div>
    </div>
  );
};

export default ImageEditor;
