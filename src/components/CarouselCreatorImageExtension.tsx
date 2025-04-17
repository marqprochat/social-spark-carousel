
import React, { useState, useRef } from "react";
import { UnsplashImage } from "@/services/unsplashService";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Image, Upload, Search } from "lucide-react";
import { SlideImageData } from "@/components/SlideImages";
import { v4 as uuidv4 } from "uuid";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

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
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  handleSearchImages: () => void;
}

export const AddImageDialog: React.FC<AddImageDialogProps> = ({
  images,
  onAddImage,
  isLoading,
  searchTerm,
  setSearchTerm,
  handleSearchImages
}) => {
  const [open, setOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Verificar o tipo do arquivo
    if (!file.type.startsWith('image/')) {
      toast.error("Por favor, selecione apenas arquivos de imagem");
      return;
    }

    // Verificar o tamanho do arquivo (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("O arquivo é muito grande. Tamanho máximo: 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      
      // Criar um objeto semelhante ao formato do Unsplash
      const localImage: UnsplashImage = {
        id: uuidv4(),
        urls: {
          regular: result,
          small: result,
          thumb: result,
          raw: result,
        },
        alt_description: file.name,
        user: {
          name: "Arquivo Local",
          username: "local",
        },
        width: 0, // Não temos como saber o tamanho real até carregar a imagem
        height: 0
      };
      
      // Pré-carregar a imagem para obter dimensões
      const img = new Image();
      img.onload = () => {
        localImage.width = img.width;
        localImage.height = img.height;
        handleImageSelect(localImage);
      };
      img.src = result;
    };
    
    reader.readAsDataURL(file);
    event.target.value = ''; // Reset input value
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="flex items-center gap-1"
        >
          <Plus className="h-4 w-4" /> Adicionar Imagem
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Adicionar imagem ao slide</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="w-full mb-4">
            <TabsTrigger value="upload" className="w-1/2">
              <Upload className="h-4 w-4 mr-2" /> Upload
            </TabsTrigger>
            <TabsTrigger value="unsplash" className="w-1/2">
              <Search className="h-4 w-4 mr-2" /> Unsplash
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="upload" className="space-y-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />
            <Button 
              variant="outline" 
              className="w-full h-40 border-dashed flex flex-col gap-2 justify-center items-center"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-10 w-10 opacity-50" />
              <div className="text-center">
                <p>Clique para selecionar uma imagem</p>
                <p className="text-xs text-muted-foreground">ou arraste o arquivo aqui</p>
              </div>
            </Button>
          </TabsContent>
          
          <TabsContent value="unsplash" className="space-y-4">
            <div className="flex space-x-2 mb-4">
              <Input
                type="text"
                placeholder="Buscar imagens..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Button onClick={handleSearchImages} disabled={isLoading}>
                Buscar
              </Button>
            </div>
            
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full"></div>
              </div>
            ) : (
              images.length > 0 ? (
                <ImageGallery images={images} onImageSelect={handleImageSelect} />
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhuma imagem encontrada. Tente outra busca.
                </div>
              )
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
