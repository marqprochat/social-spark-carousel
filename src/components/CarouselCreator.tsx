
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import { BusinessInfo } from "@/components/BusinessInfoForm";
import { searchImages, UnsplashImage } from "@/services/unsplashService";
import { generateCarouselContent } from "@/services/openaiService";
import { ChevronLeft, ChevronRight, Save, RefreshCw, Image, Type } from "lucide-react";
import html2canvas from "html2canvas";

type Slide = {
  id: string;
  text: string;
  textPosition: { x: number; y: number };
  image: UnsplashImage | null;
  textColor: string;
  fontSize: string;
  textBackgroundColor: string;
  textPadding: string;
};

interface CarouselCreatorProps {
  businessInfo: BusinessInfo;
  openAiKey: string;
  unsplashKey: string;
  onBack: () => void;
}

const CarouselCreator: React.FC<CarouselCreatorProps> = ({
  businessInfo,
  openAiKey,
  unsplashKey,
  onBack,
}) => {
  const { toast } = useToast();
  const [slides, setSlides] = useState<Slide[]>([]);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [images, setImages] = useState<UnsplashImage[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [draggedTextId, setDraggedTextId] = useState<string | null>(null);
  const [editingTextId, setEditingTextId] = useState<string | null>(null);
  
  // Inicialização - buscar imagens e textos
  useEffect(() => {
    const initializeCarousel = async () => {
      try {
        setIsLoading(true);
        
        // Buscar imagens e textos em paralelo
        const [fetchedImages, generatedTexts] = await Promise.all([
          searchImages({ businessInfo, accessKey: unsplashKey }),
          generateCarouselContent({ businessInfo, apiKey: openAiKey, numSlides: 5 }),
        ]);
        
        if (fetchedImages.length === 0 || generatedTexts.length === 0) {
          throw new Error("Não foi possível obter recursos suficientes");
        }
        
        setImages(fetchedImages);
        
        // Criar slides com os textos e imagens
        const newSlides = generatedTexts.map((text, index) => ({
          id: `slide-${Date.now()}-${index}`,
          text: text,
          textPosition: { x: 50, y: 50 }, // Posição central inicial
          image: fetchedImages[index % fetchedImages.length] || null,
          textColor: "#ffffff",
          fontSize: "20px",
          textBackgroundColor: "rgba(0,0,0,0.5)",
          textPadding: "10px"
        }));
        
        setSlides(newSlides);
      } catch (error) {
        console.error("Erro ao inicializar carrossel:", error);
        toast({
          title: "Erro",
          description: error instanceof Error 
            ? error.message 
            : "Erro ao criar carrossel. Por favor, tente novamente.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    initializeCarousel();
  }, [businessInfo, openAiKey, unsplashKey, toast]);
  
  // Buscar novas imagens com termo de pesquisa
  const handleSearchImages = async () => {
    try {
      setIsLoading(true);
      const newBusinessInfo = {
        ...businessInfo,
        additionalInfo: searchTerm || businessInfo.additionalInfo
      };
      
      const fetchedImages = await searchImages({
        businessInfo: newBusinessInfo,
        accessKey: unsplashKey
      });
      
      if (fetchedImages.length === 0) {
        throw new Error("Nenhuma imagem encontrada");
      }
      
      setImages(fetchedImages);
    } catch (error) {
      toast({
        title: "Erro",
        description: error instanceof Error 
          ? error.message 
          : "Erro ao buscar imagens",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Gerar novos textos
  const handleRegenerateTexts = async () => {
    try {
      setIsLoading(true);
      const generatedTexts = await generateCarouselContent({
        businessInfo,
        apiKey: openAiKey,
        numSlides: slides.length
      });
      
      if (generatedTexts.length === 0) {
        throw new Error("Nenhum texto gerado");
      }
      
      const updatedSlides = slides.map((slide, index) => ({
        ...slide,
        text: generatedTexts[index] || slide.text
      }));
      
      setSlides(updatedSlides);
    } catch (error) {
      toast({
        title: "Erro",
        description: error instanceof Error 
          ? error.message 
          : "Erro ao gerar textos",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Atualizar imagem do slide atual
  const updateSlideImage = (image: UnsplashImage) => {
    const updatedSlides = [...slides];
    updatedSlides[currentSlideIndex].image = image;
    setSlides(updatedSlides);
  };
  
  // Navegação de slides
  const goToPrevSlide = () => {
    setCurrentSlideIndex((prev) => 
      prev === 0 ? slides.length - 1 : prev - 1
    );
  };
  
  const goToNextSlide = () => {
    setCurrentSlideIndex((prev) => 
      prev === slides.length - 1 ? 0 : prev + 1
    );
  };
  
  // Drag and Drop de texto
  const handleMouseDown = (e: React.MouseEvent, id: string) => {
    // Começar a arrastar apenas se não estiver editando o texto
    if (editingTextId !== id) {
      setDraggedTextId(id);
      e.preventDefault(); // Prevenir seleção de texto
    }
  };
  
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggedTextId) return;
    
    const slideElement = document.getElementById('slide-canvas');
    if (!slideElement) return;
    
    const rect = slideElement.getBoundingClientRect();
    
    // Calcula a posição relativa dentro do slide
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    // Limites para garantir que o texto fique dentro do slide
    const boundedX = Math.max(0, Math.min(100, x));
    const boundedY = Math.max(0, Math.min(100, y));
    
    setSlides((prevSlides) => {
      return prevSlides.map((slide) => {
        if (slide.id === slides[currentSlideIndex].id) {
          return {
            ...slide,
            textPosition: { x: boundedX, y: boundedY },
          };
        }
        return slide;
      });
    });
  };
  
  const handleMouseUp = () => {
    setDraggedTextId(null);
  };
  
  // Edição de texto
  const handleTextChange = (e: React.FormEvent<HTMLDivElement>, id: string) => {
    const text = e.currentTarget.innerText;
    setSlides((prevSlides) => {
      return prevSlides.map((slide) => {
        if (slide.id === id) {
          return { ...slide, text };
        }
        return slide;
      });
    });
  };
  
  // Estilo do texto
  const updateTextStyle = (property: string, value: string) => {
    setSlides((prevSlides) => {
      return prevSlides.map((slide, index) => {
        if (index === currentSlideIndex) {
          return { ...slide, [property]: value };
        }
        return slide;
      });
    });
  };
  
  // Exportar slide atual como imagem
  const exportSlide = async () => {
    try {
      const slideElement = document.getElementById('slide-canvas');
      if (!slideElement) return;
      
      // Temporariamente remover indicadores de edição
      const originalDraggedId = draggedTextId;
      const originalEditingId = editingTextId;
      setDraggedTextId(null);
      setEditingTextId(null);
      
      // Pequeno delay para garantir que as mudanças de estilo foram aplicadas
      setTimeout(async () => {
        try {
          const canvas = await html2canvas(slideElement, {
            allowTaint: true,
            useCORS: true,
            scale: 2, // Melhor qualidade
            logging: false,
          });
          
          const imgData = canvas.toDataURL('image/png');
          const link = document.createElement('a');
          link.download = `slide-${currentSlideIndex + 1}.png`;
          link.href = imgData;
          link.click();
          
          toast({
            title: "Sucesso!",
            description: "Slide exportado com sucesso",
          });
        } catch (error) {
          console.error("Erro ao exportar slide:", error);
          toast({
            title: "Erro",
            description: "Não foi possível exportar o slide",
            variant: "destructive",
          });
        } finally {
          // Restaurar estados originais
          setDraggedTextId(originalDraggedId);
          setEditingTextId(originalEditingId);
        }
      }, 100);
    } catch (error) {
      console.error("Erro ao exportar:", error);
      toast({
        title: "Erro",
        description: "Não foi possível exportar o slide",
        variant: "destructive",
      });
    }
  };
  
  // Exportar todos os slides
  const exportAllSlides = async () => {
    for (let i = 0; i < slides.length; i++) {
      setCurrentSlideIndex(i);
      // Pequeno delay para garantir que o slide foi renderizado
      await new Promise(resolve => setTimeout(resolve, 300));
      await exportSlide();
    }
  };
  
  const currentSlide = slides[currentSlideIndex];
  
  if (isLoading && slides.length === 0) {
    return (
      <div className="w-full flex flex-col items-center justify-center p-8 animate-fade-in">
        <h2 className="text-2xl font-semibold mb-8">Criando seu Carrossel...</h2>
        <div className="flex flex-col items-center space-y-4 w-full max-w-md">
          <Skeleton className="h-[400px] w-full" />
          <div className="flex justify-center space-x-2 w-full">
            <Skeleton className="h-10 w-10" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-10" />
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="w-full max-w-6xl mx-auto p-4 animate-fade-in">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Área do Carrossel */}
        <div className="w-full lg:w-1/2 flex flex-col">
          <h2 className="text-2xl font-semibold mb-4">Editor de Carrossel</h2>
          
          <div 
            id="slide-canvas"
            className="slide-canvas carousel-container mb-4"
            onMouseMove={draggedTextId ? handleMouseMove : undefined}
            onMouseUp={draggedTextId ? handleMouseUp : undefined}
            onMouseLeave={draggedTextId ? handleMouseUp : undefined}
          >
            {currentSlide?.image && (
              <img
                src={currentSlide.image.urls.regular}
                alt={currentSlide.image.alt_description || "Imagem do slide"}
                className="w-full h-full object-cover"
              />
            )}
            
            <div
              className="drag-item contenteditable-div"
              style={{
                left: `${currentSlide?.textPosition.x || 50}%`,
                top: `${currentSlide?.textPosition.y || 50}%`,
                transform: 'translate(-50%, -50%)',
                color: currentSlide?.textColor || '#ffffff',
                fontSize: currentSlide?.fontSize || '20px',
                backgroundColor: currentSlide?.textBackgroundColor || 'rgba(0,0,0,0.5)',
                padding: currentSlide?.textPadding || '10px',
                cursor: draggedTextId ? 'grabbing' : 'grab'
              }}
              contentEditable={editingTextId === currentSlide?.id}
              suppressContentEditableWarning
              onDoubleClick={() => setEditingTextId(currentSlide.id)}
              onBlur={() => setEditingTextId(null)}
              onInput={(e) => handleTextChange(e, currentSlide.id)}
              onMouseDown={(e) => handleMouseDown(e, currentSlide.id)}
            >
              {currentSlide?.text || "Carregando texto..."}
            </div>
          </div>
          
          <div className="flex justify-between items-center mb-4">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={goToPrevSlide}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <span className="text-sm font-medium">
              Slide {currentSlideIndex + 1} de {slides.length}
            </span>
            
            <Button 
              variant="outline" 
              size="icon" 
              onClick={goToNextSlide}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="space-y-4">
            <Tabs defaultValue="text" className="w-full">
              <TabsList className="w-full">
                <TabsTrigger value="text" className="w-1/2">
                  <Type className="h-4 w-4 mr-2" /> Texto
                </TabsTrigger>
                <TabsTrigger value="image" className="w-1/2">
                  <Image className="h-4 w-4 mr-2" /> Imagem
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="text" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Cor do Texto</label>
                    <Input
                      type="color"
                      value={currentSlide?.textColor || "#ffffff"}
                      onChange={(e) => updateTextStyle("textColor", e.target.value)}
                      className="h-10 cursor-pointer"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Tamanho da Fonte</label>
                    <select
                      value={currentSlide?.fontSize || "20px"}
                      onChange={(e) => updateTextStyle("fontSize", e.target.value)}
                      className="w-full h-10 rounded-md border border-input px-3"
                    >
                      <option value="16px">Pequeno</option>
                      <option value="20px">Médio</option>
                      <option value="24px">Grande</option>
                      <option value="32px">Muito Grande</option>
                    </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Fundo do Texto</label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="color"
                        value={currentSlide?.textBackgroundColor.replace(/[^,]+(?=\))/, '1') || "#000000"}
                        onChange={(e) => {
                          // Converter para rgba com opacidade
                          const hex = e.target.value;
                          const r = parseInt(hex.slice(1, 3), 16);
                          const g = parseInt(hex.slice(3, 5), 16);
                          const b = parseInt(hex.slice(5, 7), 16);
                          const opacity = currentSlide?.textBackgroundColor.match(/[^,]+(?=\))/)?.[0] || "0.5";
                          updateTextStyle("textBackgroundColor", `rgba(${r}, ${g}, ${b}, ${opacity})`);
                        }}
                        className="h-10 cursor-pointer"
                      />
                      <select
                        value={currentSlide?.textBackgroundColor.match(/[^,]+(?=\))/)?.[0] || "0.5"}
                        onChange={(e) => {
                          // Manter a cor, atualizar apenas a opacidade
                          const rgba = currentSlide?.textBackgroundColor.match(/rgba\((\d+),\s*(\d+),\s*(\d+)/);
                          if (rgba) {
                            updateTextStyle("textBackgroundColor", `rgba(${rgba[1]}, ${rgba[2]}, ${rgba[3]}, ${e.target.value})`);
                          }
                        }}
                        className="h-10 rounded-md border border-input px-3"
                      >
                        <option value="0">Transparente</option>
                        <option value="0.25">25%</option>
                        <option value="0.5">50%</option>
                        <option value="0.75">75%</option>
                        <option value="1">100%</option>
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Padding</label>
                    <select
                      value={currentSlide?.textPadding || "10px"}
                      onChange={(e) => updateTextStyle("textPadding", e.target.value)}
                      className="w-full h-10 rounded-md border border-input px-3"
                    >
                      <option value="0px">Sem padding</option>
                      <option value="5px">Pequeno</option>
                      <option value="10px">Médio</option>
                      <option value="15px">Grande</option>
                    </select>
                  </div>
                </div>
                
                <Button 
                  onClick={handleRegenerateTexts}
                  className="w-full"
                  disabled={isLoading}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Gerar Novos Textos
                </Button>
              </TabsContent>
              
              <TabsContent value="image" className="space-y-4">
                <div className="space-y-2">
                  <div className="flex space-x-2">
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
                  
                  <div className="grid grid-cols-3 gap-2 max-h-[200px] overflow-y-auto p-1">
                    {images.map((image) => (
                      <div
                        key={image.id}
                        className={`cursor-pointer rounded overflow-hidden h-[60px] ${
                          currentSlide?.image?.id === image.id ? "ring-2 ring-primary" : ""
                        }`}
                        onClick={() => updateSlideImage(image)}
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
          
          <div className="mt-6 grid grid-cols-2 gap-4">
            <Button variant="outline" onClick={onBack}>
              Voltar
            </Button>
            
            <Button
              onClick={exportSlide}
              className="bg-gradient-to-r from-brand-purple to-brand-blue hover:opacity-90"
            >
              <Save className="h-4 w-4 mr-2" />
              Salvar Slide
            </Button>
          </div>
          
          <Button
            onClick={exportAllSlides}
            className="mt-2 bg-gradient-to-r from-brand-purple to-brand-blue hover:opacity-90"
          >
            <Save className="h-4 w-4 mr-2" />
            Salvar Todos os Slides
          </Button>
        </div>
        
        {/* Exibição dos Slides */}
        <div className="w-full lg:w-1/2">
          <h2 className="text-2xl font-semibold mb-4">Pré-visualização do Carrossel</h2>
          
          <div className="grid grid-cols-3 gap-4">
            {slides.map((slide, index) => (
              <Card
                key={slide.id}
                className={`cursor-pointer overflow-hidden ${
                  index === currentSlideIndex ? "ring-2 ring-primary" : ""
                }`}
                onClick={() => setCurrentSlideIndex(index)}
              >
                <div className="relative aspect-square">
                  {slide.image && (
                    <img
                      src={slide.image.urls.small}
                      alt={slide.image.alt_description || "Imagem do slide"}
                      className="w-full h-full object-cover"
                    />
                  )}
                  <div
                    className="absolute text-sm leading-snug"
                    style={{
                      left: `${slide.textPosition.x}%`,
                      top: `${slide.textPosition.y}%`,
                      transform: 'translate(-50%, -50%)',
                      color: slide.textColor,
                      fontSize: `calc(${slide.fontSize} * 0.5)`,
                      backgroundColor: slide.textBackgroundColor,
                      padding: slide.textPadding,
                      maxWidth: '80%',
                      textAlign: 'center',
                      wordBreak: 'break-word'
                    }}
                  >
                    {slide.text}
                  </div>
                  <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
                    {index + 1}
                  </div>
                </div>
              </Card>
            ))}
          </div>
          
          <div className="mt-6 bg-secondary p-4 rounded-lg">
            <h3 className="font-medium mb-2">Como utilizar:</h3>
            <ul className="text-sm space-y-2 list-disc pl-5">
              <li>Clique em um slide na pré-visualização para editá-lo</li>
              <li>Arraste o texto para posicioná-lo onde desejar</li>
              <li>Dê duplo clique no texto para editá-lo</li>
              <li>Use as abas para formatar o texto ou trocar a imagem</li>
              <li>Clique em "Salvar Slide" para exportar o slide atual</li>
              <li>Use "Salvar Todos os Slides" para exportar o carrossel completo</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarouselCreator;
