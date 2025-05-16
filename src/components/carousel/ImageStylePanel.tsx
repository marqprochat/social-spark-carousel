
import React from "react";
import { UnsplashImage } from "@/services/unsplashService";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ArrowUp, ArrowDown } from "lucide-react";
import { SlideImageData } from "@/components/SlideImages";
import ImageSearchPanel from "./ImageSearchPanel";

interface ImageStylePanelProps {
  currentSlide: any;
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
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  handleSearchImages: () => void;
}

const FILTER_OPTIONS = [
  { value: "none", label: "Normal" },
  { value: "grayscale", label: "Preto e Branco" },
  { value: "sepia", label: "Sépia" },
  { value: "blur", label: "Desfocado" },
  { value: "brightness", label: "Brilho Alto" },
  { value: "contrast", label: "Contraste Alto" },
  { value: "saturate", label: "Saturado" },
];

const ImageStylePanel: React.FC<ImageStylePanelProps> = ({
  selectedImageId,
  imageFilter,
  imageOpacity,
  onFilterChange,
  onOpacityChange,
  onArrangeImage,
  images,
  isLoading,
  searchTerm,
  setSearchTerm,
  handleSearchImages,
}) => {
  if (!selectedImageId) {
    return <div className="p-4 text-center text-muted-foreground">Selecione uma imagem para editar</div>;
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h3 className="text-sm font-medium">Filtro</h3>
        <Select 
          value={imageFilter} 
          onValueChange={onFilterChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione um filtro" />
          </SelectTrigger>
          <SelectContent>
            {FILTER_OPTIONS.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between">
          <h3 className="text-sm font-medium">Opacidade</h3>
          <span className="text-sm text-muted-foreground">{Math.round(imageOpacity * 100)}%</span>
        </div>
        <Slider
          value={[imageOpacity * 100]}
          min={0}
          max={100}
          step={1}
          onValueChange={(value) => onOpacityChange(value[0] / 100)}
        />
      </div>
      
      <div className="space-y-2">
        <h3 className="text-sm font-medium">Posição</h3>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={() => onArrangeImage(selectedImageId, 'forward')}
          >
            <ArrowUp className="h-4 w-4 mr-2" />
            Trazer para frente
          </Button>
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={() => onArrangeImage(selectedImageId, 'backward')}
          >
            <ArrowDown className="h-4 w-4 mr-2" />
            Enviar para trás
          </Button>
        </div>
      </div>
      
      <div className="space-y-2">
        <h3 className="text-sm font-medium">Trocar imagem</h3>
        <ImageSearchPanel 
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          handleSearchImages={handleSearchImages}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};

export default ImageStylePanel;
