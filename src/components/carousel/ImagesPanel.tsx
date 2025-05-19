
import React from "react";
import { UnsplashImage } from "@/services/unsplashService";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { SlideImageData } from "@/components/SlideImages";
import { v4 as uuidv4 } from "uuid";

interface ImagesPanelProps {
  images: UnsplashImage[];
  onAddImage: (imageData: SlideImageData) => void;
  isLoading: boolean;
  updateSlideImage?: (image: UnsplashImage) => void;
}

const ImagesPanel: React.FC<ImagesPanelProps> = ({
  images,
  onAddImage,
  isLoading,
  updateSlideImage,
}) => {
  const handleAddImage = (image: UnsplashImage) => {
    // Se temos a função updateSlideImage disponível, usamos ela diretamente
    if (updateSlideImage) {
      updateSlideImage(image);
      return;
    }
    
    // Caso contrário, criamos dados para a imagem e usamos onAddImage
    const newImageData: SlideImageData = {
      id: uuidv4(),
      image,
      position: { x: 50, y: 50 },
      size: { width: 100, height: 100 },
      opacity: 1,
      filter: "none",
      zIndex: 1,
    };
    
    onAddImage(newImageData);
  };

  return (
    <div>
      {isLoading ? (
        <div className="flex justify-center items-center h-48">
          <Loader2 className="animate-spin h-8 w-8 text-primary" />
        </div>
      ) : images.length === 0 ? (
        <div className="text-center p-8 text-muted-foreground">
          <p>Nenhuma imagem encontrada. Use a caixa de busca acima para pesquisar.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[600px] overflow-y-auto p-1">
          {images.map((image) => (
            <div 
              key={image.id} 
              className="relative group overflow-hidden rounded-md bg-gray-100 aspect-[4/3]"
            >
              <img 
                src={image.urls.small} 
                alt={image.alt_description || "Unsplash Image"} 
                className="w-full h-full object-cover"
                loading="lazy"
              />
              
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-center items-center gap-2 p-2">
                <Button 
                  variant="default" 
                  size="sm" 
                  className="w-full"
                  onClick={() => handleAddImage(image)}
                >
                  Definir como fundo
                </Button>
              </div>
              
              <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-[10px] truncate p-1">
                Foto: {image.user.name}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImagesPanel;
