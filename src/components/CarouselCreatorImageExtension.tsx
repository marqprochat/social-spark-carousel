
import React, { useState } from "react";
import { UnsplashImage } from "@/services/unsplashService";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Image } from "lucide-react";
import { SlideImageData } from "@/components/SlideImages";
import { v4 as uuidv4 } from "uuid";

interface ImageGalleryProps {
  images: UnsplashImage[];
  onImageSelect: (image: UnsplashImage) => void;
}

export const ImageGallery: React.FC<ImageGalleryProps> = ({
  images,
  onImageSelect
}) => {
  return (
    <div className="grid grid-cols-3 gap-2 max-h-[400px] overflow-y-auto p-1">
      {images.map((image) => (
        <div
          key={image.id}
          className="cursor-pointer rounded overflow-hidden h-[100px]"
          onClick={() => onImageSelect(image)}
        >
          <img
            src={image.urls.small}
            alt={image.alt_description || "Imagem do Unsplash"}
            className="w-full h-full object-cover"
          />
        </div>
      ))}
    </div>
  );
};

interface AddImageDialogProps {
  images: UnsplashImage[];
  onAddImage: (imageData: SlideImageData) => void;
  isLoading: boolean;
}

export const AddImageDialog: React.FC<AddImageDialogProps> = ({
  images,
  onAddImage,
  isLoading
}) => {
  const [open, setOpen] = useState(false);

  const handleImageSelect = (image: UnsplashImage) => {
    onAddImage({
      id: uuidv4(),
      image,
      position: { x: 50, y: 50 },
      size: { width: 80, height: 80 },
      opacity: 1,
      filter: "none",
      zIndex: 1
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="flex items-center gap-1"
          disabled={isLoading || images.length === 0}
        >
          <Plus className="h-4 w-4" /> Adicionar Imagem
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Selecione uma imagem para adicionar</DialogTitle>
        </DialogHeader>
        <ImageGallery images={images} onImageSelect={handleImageSelect} />
      </DialogContent>
    </Dialog>
  );
};
