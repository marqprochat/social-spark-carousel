
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { BusinessInfo } from "@/components/BusinessInfoForm";
import { searchImages, UnsplashImage } from "@/services/unsplashService";
import { generateCarouselContent } from "@/services/openaiService";
import { ChevronLeft, ChevronRight, Save, RefreshCw, Image, Type, Plus, TextQuote } from "lucide-react";
import TextBox from "@/components/TextBox";
import html2canvas from "html2canvas";
import { v4 as uuidv4 } from "uuid";

type TextBoxItem = {
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
};

type Slide = {
  id: string;
  textBoxes: TextBoxItem[];
  image: UnsplashImage | null;
};

interface CarouselCreatorProps {
  businessInfo: BusinessInfo;
  openAiKey: string;
  unsplashKey: string;
  onBack: () => void;
}

const FONT_OPTIONS = [
  { value: "montserrat", label: "Montserrat" },
  { value: "roboto", label: "Roboto" },
  { value: "poppins", label: "Poppins" },
  { value: "playfair", label: "Playfair Display" },
  { value: "opensans", label: "Open Sans" }
];

const FONT_SIZE_OPTIONS = [
  { value: "16px", label: "Pequeno (16px)" },
  { value: "20px", label: "Médio (20px)" },
  { value: "24px", label: "Grande (24px)" },
  { value: "32px", label: "Muito Grande (32px)" },
  { value: "40px", label: "Extra Grande (40px)" }
];

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
  
  // Estado para gerenciar os textboxes
  const [selectedTextBoxId, setSelectedTextBoxId] = useState<string | null>(null);
  const [editingTextBoxId, setEditingTextBoxId] = useState<string | null>(null);
  const [draggedTextBoxId, setDraggedTextBoxId] = useState<string | null>(null);
  
  // Estado para estilização do texto
  const [currentTextColor, setCurrentTextColor] = useState("#ffffff");
  const [currentFontSize, setCurrentFontSize] = useState("20px");
  const [currentFontFamily, setCurrentFontFamily] = useState("roboto");
  const [currentBgColor, setCurrentBgColor] = useState("rgba(0,0,0,0.5)");
  const [currentBgOpacity, setCurrentBgOpacity] = useState("0.5");
  const [currentPadding, setCurrentPadding] = useState("10px");
  
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
          textBoxes: [{
            id: uuidv4(),
            text: text,
            position: { x: 50, y: 50 }, // Posição central inicial
            style: {
              color: "#ffffff",
              fontSize: "20px",
              fontFamily: "roboto",
              backgroundColor: "rgba(0,0,0,0.5)",
              padding: "10px"
            }
          }],
          image: fetchedImages[index % fetchedImages.length] || null,
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
  
  useEffect(() => {
    if (slides.length > 0 && selectedTextBoxId) {
      const currentSlide = slides[currentSlideIndex];
      const selectedTextBox = currentSlide.textBoxes.find(box => box.id === selectedTextBoxId);
      
      if (selectedTextBox) {
        // Atualizar os controles de estilo com os valores do textbox selecionado
        setCurrentTextColor(selectedTextBox.style.color);
        setCurrentFontSize(selectedTextBox.style.fontSize);
        setCurrentFontFamily(selectedTextBox.style.fontFamily);
        setCurrentBgColor(selectedTextBox.style.backgroundColor);
        
        // Extrair a opacidade do backgroundColor rgba
        const opacityMatch = selectedTextBox.style.backgroundColor.match(/[^,]+(?=\))/);
        if (opacityMatch) {
          setCurrentBgOpacity(opacityMatch[0]);
        }
        
        setCurrentPadding(selectedTextBox.style.padding);
      }
    }
  }, [selectedTextBoxId, currentSlideIndex, slides]);
  
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
        accessKey: unsplashKey,
        searchQuery: searchTerm
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
      
      const updatedSlides = slides.map((slide, index) => {
        // Atualizar apenas o primeiro textbox de cada slide com o novo texto
        const updatedTextBoxes = [...slide.textBoxes];
        if (updatedTextBoxes.length > 0) {
          updatedTextBoxes[0] = {
            ...updatedTextBoxes[0],
            text: generatedTexts[index] || updatedTextBoxes[0].text
          };
        }
        
        return {
          ...slide,
          textBoxes: updatedTextBoxes
        };
      });
      
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
    setSelectedTextBoxId(null);
    setEditingTextBoxId(null);
    setCurrentSlideIndex((prev) => 
      prev === 0 ? slides.length - 1 : prev - 1
    );
  };
  
  const goToNextSlide = () => {
    setSelectedTextBoxId(null);
    setEditingTextBoxId(null);
    setCurrentSlideIndex((prev) => 
      prev === slides.length - 1 ? 0 : prev + 1
    );
  };
  
  // Adicionar novo textbox
  const addNewTextBox = () => {
    const updatedSlides = [...slides];
    const currentSlide = updatedSlides[currentSlideIndex];
    
    const newTextBox: TextBoxItem = {
      id: uuidv4(),
      text: "Clique duas vezes para editar",
      position: { x: 50, y: 50 },
      style: {
        color: currentTextColor,
        fontSize: currentFontSize,
        fontFamily: currentFontFamily,
        backgroundColor: currentBgColor,
        padding: currentPadding
      }
    };
    
    currentSlide.textBoxes.push(newTextBox);
    setSlides(updatedSlides);
    setSelectedTextBoxId(newTextBox.id);
  };
  
  // Selecionar textbox
  const selectTextBox = (id: string) => {
    setSelectedTextBoxId(id);
    setEditingTextBoxId(null);
  };
  
  // Editar textbox
  const toggleEditingTextBox = (id: string) => {
    setEditingTextBoxId(id === editingTextBoxId ? null : id);
  };
  
  // Excluir textbox
  const deleteTextBox = (id: string) => {
    const updatedSlides = [...slides];
    const currentSlide = updatedSlides[currentSlideIndex];
    
    // Impedir a exclusão se houver apenas um textbox
    if (currentSlide.textBoxes.length <= 1) {
      toast({
        title: "Aviso",
        description: "Cada slide precisa ter pelo menos um texto",
      });
      return;
    }
    
    currentSlide.textBoxes = currentSlide.textBoxes.filter(box => box.id !== id);
    setSlides(updatedSlides);
    
    if (selectedTextBoxId === id) {
      setSelectedTextBoxId(null);
    }
    
    if (editingTextBoxId === id) {
      setEditingTextBoxId(null);
    }
  };
  
  // Alterar texto
  const updateTextContent = (id: string, text: string) => {
    const updatedSlides = [...slides];
    const currentSlide = updatedSlides[currentSlideIndex];
    
    const textBoxIndex = currentSlide.textBoxes.findIndex(box => box.id === id);
    if (textBoxIndex !== -1) {
      currentSlide.textBoxes[textBoxIndex].text = text;
      setSlides(updatedSlides);
    }
  };
  
  // Drag and Drop de texto
  const handleDragStart = (e: React.MouseEvent, id: string) => {
    // Começar a arrastar apenas se não estiver editando o texto
    if (editingTextBoxId !== id) {
      setDraggedTextBoxId(id);
      selectTextBox(id);
      e.preventDefault(); // Prevenir seleção de texto
    }
  };
  
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggedTextBoxId) return;
    
    const slideElement = document.getElementById('slide-canvas');
    if (!slideElement) return;
    
    const rect = slideElement.getBoundingClientRect();
    
    // Calcula a posição relativa dentro do slide
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    // Limites para garantir que o texto fique dentro do slide
    const boundedX = Math.max(0, Math.min(100, x));
    const boundedY = Math.max(0, Math.min(100, y));
    
    const updatedSlides = [...slides];
    const currentSlide = updatedSlides[currentSlideIndex];
    
    const textBoxIndex = currentSlide.textBoxes.findIndex(box => box.id === draggedTextBoxId);
    if (textBoxIndex !== -1) {
      currentSlide.textBoxes[textBoxIndex].position = { x: boundedX, y: boundedY };
      setSlides(updatedSlides);
    }
  };
  
  const handleMouseUp = () => {
    setDraggedTextBoxId(null);
  };
  
  // Atualizar estilo de texto
  const updateTextStyle = (property: string, value: string) => {
    if (!selectedTextBoxId) return;
    
    const updatedSlides = [...slides];
    const currentSlide = updatedSlides[currentSlideIndex];
    
    const textBoxIndex = currentSlide.textBoxes.findIndex(box => box.id === selectedTextBoxId);
    if (textBoxIndex === -1) return;
    
    const updatedTextBox = { ...currentSlide.textBoxes[textBoxIndex] };
    
    switch(property) {
      case "color":
        updatedTextBox.style.color = value;
        setCurrentTextColor(value);
        break;
      case "fontSize":
        updatedTextBox.style.fontSize = value;
        setCurrentFontSize(value);
        break;
      case "fontFamily":
        updatedTextBox.style.fontFamily = value;
        setCurrentFontFamily(value);
        break;
      case "backgroundColor":
        // Atualizar apenas a cor mantendo a opacidade
        const rgba = updatedTextBox.style.backgroundColor.match(/rgba\((\d+),\s*(\d+),\s*(\d+)/);
        if (rgba) {
          const r = parseInt(value.slice(1, 3), 16);
          const g = parseInt(value.slice(3, 5), 16);
          const b = parseInt(value.slice(5, 7), 16);
          updatedTextBox.style.backgroundColor = `rgba(${r}, ${g}, ${b}, ${currentBgOpacity})`;
          setCurrentBgColor(updatedTextBox.style.backgroundColor);
        } else {
          const r = parseInt(value.slice(1, 3), 16);
          const g = parseInt(value.slice(3, 5), 16);
          const b = parseInt(value.slice(5, 7), 16);
          updatedTextBox.style.backgroundColor = `rgba(${r}, ${g}, ${b}, ${currentBgOpacity})`;
          setCurrentBgColor(updatedTextBox.style.backgroundColor);
        }
        break;
      case "bgOpacity":
        // Atualizar apenas a opacidade mantendo a cor
        const rgbaColor = updatedTextBox.style.backgroundColor.match(/rgba\((\d+),\s*(\d+),\s*(\d+)/);
        if (rgbaColor) {
          updatedTextBox.style.backgroundColor = `rgba(${rgbaColor[1]}, ${rgbaColor[2]}, ${rgbaColor[3]}, ${value})`;
          setCurrentBgColor(updatedTextBox.style.backgroundColor);
          setCurrentBgOpacity(value);
        }
        break;
      case "padding":
        updatedTextBox.style.padding = value;
        setCurrentPadding(value);
        break;
    }
    
    currentSlide.textBoxes[textBoxIndex] = updatedTextBox;
    setSlides(updatedSlides);
  };
  
  // Exportar slide atual como imagem
  const exportSlide = async () => {
    try {
      const slideElement = document.getElementById('slide-canvas');
      if (!slideElement) return;
      
      // Temporariamente remover indicadores de edição
      const originalDraggedId = draggedTextBoxId;
      const originalEditingId = editingTextBoxId;
      const originalSelectedId = selectedTextBoxId;
      setDraggedTextBoxId(null);
      setEditingTextBoxId(null);
      setSelectedTextBoxId(null);
      
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
          setDraggedTextBoxId(originalDraggedId);
          setEditingTextBoxId(originalEditingId);
          setSelectedTextBoxId(originalSelectedId);
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
    const originalSlideIndex = currentSlideIndex;
    
    for (let i = 0; i < slides.length; i++) {
      setCurrentSlideIndex(i);
      // Pequeno delay para garantir que o slide foi renderizado
      await new Promise(resolve => setTimeout(resolve, 300));
      await exportSlide();
    }
    
    // Restaurar slide original
    setCurrentSlideIndex(originalSlideIndex);
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
            onMouseMove={draggedTextBoxId ? handleMouseMove : undefined}
            onMouseUp={draggedTextBoxId ? handleMouseUp : undefined}
            onMouseLeave={draggedTextBoxId ? handleMouseUp : undefined}
          >
            {currentSlide?.image && (
              <img
                src={currentSlide.image.urls.regular}
                alt={currentSlide.image.alt_description || "Imagem do slide"}
                className="w-full h-full object-cover"
              />
            )}
            
            {currentSlide?.textBoxes.map((textBox) => (
              <TextBox
                key={textBox.id}
                id={textBox.id}
                text={textBox.text}
                position={textBox.position}
                style={textBox.style}
                isSelected={selectedTextBoxId === textBox.id}
                isEditing={editingTextBoxId === textBox.id}
                onSelect={selectTextBox}
                onEdit={toggleEditingTextBox}
                onDelete={deleteTextBox}
                onTextChange={updateTextContent}
                onPositionChange={(id, pos) => {
                  const updatedSlides = [...slides];
                  const textBoxIndex = updatedSlides[currentSlideIndex].textBoxes.findIndex(box => box.id === id);
                  if (textBoxIndex !== -1) {
                    updatedSlides[currentSlideIndex].textBoxes[textBoxIndex].position = pos;
                    setSlides(updatedSlides);
                  }
                }}
                onDragStart={handleDragStart}
              />
            ))}
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
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-medium">Estilo do Texto</h3>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={addNewTextBox}
                    className="flex items-center gap-1"
                  >
                    <Plus className="h-3 w-3" /> Adicionar Texto
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Cor do Texto</label>
                    <Input
                      type="color"
                      value={currentTextColor}
                      onChange={(e) => updateTextStyle("color", e.target.value)}
                      disabled={!selectedTextBoxId}
                      className="h-10 cursor-pointer"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Tamanho da Fonte</label>
                    <Select 
                      value={currentFontSize} 
                      onValueChange={(value) => updateTextStyle("fontSize", value)}
                      disabled={!selectedTextBoxId}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tamanho" />
                      </SelectTrigger>
                      <SelectContent>
                        {FONT_SIZE_OPTIONS.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Fonte</label>
                  <Select 
                    value={currentFontFamily} 
                    onValueChange={(value) => updateTextStyle("fontFamily", value)}
                    disabled={!selectedTextBoxId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a fonte" />
                    </SelectTrigger>
                    <SelectContent>
                      {FONT_OPTIONS.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          <span className={`font-${option.value}`}>{option.label}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Fundo do Texto</label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="color"
                        value={currentBgColor.replace(/[^,]+(?=\))/, '1').replace(/rgba\((\d+), (\d+), (\d+).*/, (_, r, g, b) => {
                          const toHex = (n: string) => {
                            const hex = parseInt(n).toString(16);
                            return hex.length === 1 ? '0' + hex : hex;
                          };
                          return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
                        })}
                        onChange={(e) => updateTextStyle("backgroundColor", e.target.value)}
                        disabled={!selectedTextBoxId}
                        className="h-10 cursor-pointer"
                      />
                      <Select 
                        value={currentBgOpacity} 
                        onValueChange={(value) => updateTextStyle("bgOpacity", value)}
                        disabled={!selectedTextBoxId}
                      >
                        <SelectTrigger className="h-10">
                          <SelectValue placeholder="Opacidade" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">Transparente</SelectItem>
                          <SelectItem value="0.25">25%</SelectItem>
                          <SelectItem value="0.5">50%</SelectItem>
                          <SelectItem value="0.75">75%</SelectItem>
                          <SelectItem value="1">100%</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Padding</label>
                    <Select 
                      value={currentPadding} 
                      onValueChange={(value) => updateTextStyle("padding", value)}
                      disabled={!selectedTextBoxId}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o padding" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0px">Sem padding</SelectItem>
                        <SelectItem value="5px">Pequeno</SelectItem>
                        <SelectItem value="10px">Médio</SelectItem>
                        <SelectItem value="15px">Grande</SelectItem>
                      </SelectContent>
                    </Select>
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
                  
                  {slide.textBoxes.map((textBox) => (
                    <div
                      key={textBox.id}
                      className="absolute text-sm leading-snug"
                      style={{
                        left: `${textBox.position.x}%`,
                        top: `${textBox.position.y}%`,
                        transform: 'translate(-50%, -50%)',
                        color: textBox.style.color,
                        fontFamily: textBox.style.fontFamily,
                        fontSize: `calc(${textBox.style.fontSize} * 0.5)`,
                        backgroundColor: textBox.style.backgroundColor,
                        padding: textBox.style.padding,
                        maxWidth: '80%',
                        textAlign: 'center',
                        wordBreak: 'break-word'
                      }}
                    >
                      {textBox.text}
                    </div>
                  ))}
                  
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
              <li>Clique em "Adicionar Texto" para incluir mais textos no slide</li>
              <li>Selecione um texto clicando nele para editá-lo</li>
              <li>Arraste o texto para posicioná-lo onde desejar</li>
              <li>Dê duplo clique no texto para editá-lo</li>
              <li>Use as abas para formatar o texto ou trocar a imagem</li>
              <li>Experimente diferentes fontes para tornar seu carrossel único</li>
              <li>Clique em "Salvar Slide" para exportar o slide atual</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarouselCreator;
