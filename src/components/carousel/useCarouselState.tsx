import { useState, useEffect, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";
import { UnsplashImage } from "@/services/unsplashService";
import { BusinessInfo } from "@/components/BusinessInfoForm";
import { searchImages } from "@/services/unsplashService";
import { generateCarouselContent } from "@/services/openaiService";
import { SlideImageData } from "@/components/SlideImages";
import html2canvas from "html2canvas";
import {
  Slide,
  initializeSlides,
  addImageToSlide,
  updateImageInSlide,
  deleteImageFromSlide
} from "@/components/CarouselCreatorExtension";

interface UseCarouselStateProps {
  businessInfo: BusinessInfo;
  openAiKey: string;
  unsplashKey: string;
}

export const useCarouselState = ({ businessInfo, openAiKey, unsplashKey }: UseCarouselStateProps) => {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [images, setImages] = useState<UnsplashImage[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [selectedTextBoxId, setSelectedTextBoxId] = useState<string | null>(null);
  const [editingTextBoxId, setEditingTextBoxId] = useState<string | null>(null);
  const [draggedTextBoxId, setDraggedTextBoxId] = useState<string | null>(null);
  
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  const [imageFilter, setImageFilter] = useState("none");
  const [imageSize, setImageSize] = useState({ width: 80, height: 80 });
  const [imageOpacity, setImageOpacity] = useState(1);
  
  const [currentTextColor, setCurrentTextColor] = useState("#ffffff");
  const [currentFontSize, setCurrentFontSize] = useState("24px");
  const [currentFontFamily, setCurrentFontFamily] = useState("roboto");
  const [currentBgColor, setCurrentBgColor] = useState("rgba(0,0,0,0.5)");
  const [currentBgOpacity, setCurrentBgOpacity] = useState("0.5");
  const [currentPadding, setCurrentPadding] = useState("10px");
  
  const [draggedImageId, setDraggedImageId] = useState<string | null>(null);
  
  const [slideBackgroundColor, setSlideBackgroundColor] = useState("#f5f5f5");
  const [backgroundImageOpacity, setBackgroundImageOpacity] = useState(1);
  
  useEffect(() => {
    const initializeCarousel = async () => {
      try {
        setIsLoading(true);
        
        const [fetchedImages, generatedTexts] = await Promise.all([
          searchImages({ businessInfo, accessKey: unsplashKey }),
          generateCarouselContent({ businessInfo, apiKey: openAiKey, numSlides: 5 }),
        ]);
        
        if (fetchedImages.length === 0 || generatedTexts.length === 0) {
          throw new Error("Não foi possível obter recursos suficientes");
        }
        
        setImages(fetchedImages);
        
        const newSlides = initializeSlides(generatedTexts, fetchedImages);
        
        newSlides.forEach(slide => {
          slide.backgroundColor = "#f5f5f5";
          slide.backgroundImageOpacity = 1;
        });
        
        setSlides(newSlides);
      } catch (error) {
        console.error("Erro ao inicializar carrossel:", error);
        toast.error(error instanceof Error 
          ? error.message 
          : "Erro ao criar carrossel. Por favor, tente novamente."
        );
      } finally {
        setIsLoading(false);
      }
    };
    
    initializeCarousel();
  }, [businessInfo, openAiKey, unsplashKey]);
  
  useEffect(() => {
    if (selectedTextBoxId) {
      const currentSlide = slides[currentSlideIndex];
      const selectedTextBox = currentSlide.textBoxes.find(box => box.id === selectedTextBoxId);
      
      if (selectedTextBox) {
        setCurrentTextColor(selectedTextBox.style.color);
        setCurrentFontSize(selectedTextBox.style.fontSize);
        setCurrentFontFamily(selectedTextBox.style.fontFamily);
        setCurrentBgColor(selectedTextBox.style.backgroundColor);
        
        const opacityMatch = selectedTextBox.style.backgroundColor.match(/[^,]+(?=\))/);
        if (opacityMatch) {
          setCurrentBgOpacity(opacityMatch[0]);
        }
        
        setCurrentPadding(selectedTextBox.style.padding);
      }
    }
  }, [selectedTextBoxId, currentSlideIndex, slides]);

  useEffect(() => {
    if (selectedImageId) {
      const currentSlide = slides[currentSlideIndex];
      const selectedImage = currentSlide.images.find(img => img.id === selectedImageId);
      
      if (selectedImage) {
        setImageFilter(selectedImage.filter || "none");
        setImageSize(selectedImage.size);
        setImageOpacity(selectedImage.opacity);
      }
    }
  }, [selectedImageId, currentSlideIndex, slides]);
  
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
      toast.error(error instanceof Error 
        ? error.message 
        : "Erro ao buscar imagens"
      );
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleRegenerateTexts = async () => {
    try {
      setIsLoading(true);
      
      toast.loading("Gerando novos textos...");
      
      const generatedTexts = await generateCarouselContent({
        businessInfo,
        apiKey: openAiKey,
        numSlides: slides.length
      });
      
      if (generatedTexts.length === 0) {
        throw new Error("Nenhum texto gerado");
      }
      
      const updatedSlides = [...slides].map((slide, index) => {
        const updatedTextBoxes = [...slide.textBoxes];
        if (updatedTextBoxes.length > 0 && index < generatedTexts.length) {
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
      toast.success("Textos gerados com sucesso!");
    } catch (error) {
      console.error("Erro ao gerar textos:", error);
      toast.error(error instanceof Error 
        ? error.message 
        : "Erro ao gerar textos"
      );
    } finally {
      setIsLoading(false);
    }
  };
  
  const updateSlideImage = (image: UnsplashImage) => {
    const updatedSlides = [...slides];
    updatedSlides[currentSlideIndex].backgroundImage = image;
    setSlides(updatedSlides);
  };

  const handleAddImage = (imageData: SlideImageData) => {
    setSlides(addImageToSlide(slides, currentSlideIndex, imageData));
  };

  const handleUpdateImage = (imageId: string, updates: Partial<SlideImageData>) => {
    setSlides(updateImageInSlide(slides, currentSlideIndex, imageId, updates));
  };

  const handleDeleteImage = (imageId: string) => {
    setSlides(deleteImageFromSlide(slides, currentSlideIndex, imageId));
    if (selectedImageId === imageId) {
      setSelectedImageId(null);
    }
  };

  const handleImageFilterChange = (filter: string) => {
    setImageFilter(filter);
    if (selectedImageId) {
      handleUpdateImage(selectedImageId, { filter });
    }
  };

  const handleImageSizeChange = (size: { width: number; height: number }) => {
    setImageSize(size);
    if (selectedImageId) {
      handleUpdateImage(selectedImageId, { size });
    }
  };

  const handleImageOpacityChange = (opacity: number) => {
    setImageOpacity(opacity);
    if (selectedImageId) {
      handleUpdateImage(selectedImageId, { opacity });
    }
  };

  const handleArrangeImage = (imageId: string, direction: 'forward' | 'backward') => {
    const updatedSlides = [...slides];
    const currentImages = [...updatedSlides[currentSlideIndex].images];
    const imageIndex = currentImages.findIndex(img => img.id === imageId);
    
    if (imageIndex === -1) return;
    
    const image = currentImages[imageIndex];
    
    if (direction === 'forward') {
      handleUpdateImage(imageId, { zIndex: (image.zIndex || 1) + 1 });
    } else {
      handleUpdateImage(imageId, { zIndex: Math.max(1, (image.zIndex || 1) - 1) });
    }
  };
  
  const goToPrevSlide = () => {
    setSelectedTextBoxId(null);
    setEditingTextBoxId(null);
    setSelectedImageId(null);
    setCurrentSlideIndex((prev) => 
      prev === 0 ? slides.length - 1 : prev - 1
    );
  };
  
  const goToNextSlide = () => {
    setSelectedTextBoxId(null);
    setEditingTextBoxId(null);
    setSelectedImageId(null);
    setCurrentSlideIndex((prev) => 
      prev === slides.length - 1 ? 0 : prev + 1
    );
  };
  
  const addNewTextBox = () => {
    const updatedSlides = [...slides];
    const currentSlide = updatedSlides[currentSlideIndex];
    
    const newTextBox = {
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
  
  const selectTextBox = (id: string) => {
    setSelectedTextBoxId(id);
    setEditingTextBoxId(null);
    setSelectedImageId(null);
  };
  
  const toggleEditingTextBox = (id: string) => {
    setEditingTextBoxId(id === editingTextBoxId ? null : id);
  };
  
  const deleteTextBox = (id: string) => {
    const updatedSlides = [...slides];
    const currentSlide = updatedSlides[currentSlideIndex];
    
    if (currentSlide.textBoxes.length <= 1) {
      toast.warning("Cada slide precisa ter pelo menos um texto");
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
  
  const updateTextContent = (id: string, text: string) => {
    const updatedSlides = [...slides];
    const currentSlide = updatedSlides[currentSlideIndex];
    
    const textBoxIndex = currentSlide.textBoxes.findIndex(box => box.id === id);
    if (textBoxIndex !== -1) {
      currentSlide.textBoxes[textBoxIndex].text = text;
      setSlides(updatedSlides);
    }
  };
  
  const handleDragStart = useCallback((e: React.MouseEvent, id: string) => {
    if (editingTextBoxId !== id) {
      setDraggedTextBoxId(id);
      selectTextBox(id);
      e.preventDefault();
    }
  }, [editingTextBoxId]);
  
  const handleImageDragStart = useCallback((e: React.MouseEvent, id: string) => {
    setDraggedImageId(id);
    setSelectedImageId(id);
    setSelectedTextBoxId(null);
    setEditingTextBoxId(null);
    e.preventDefault();
  }, []);
  
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const slideElement = e.currentTarget;
    if (!slideElement) return;
    
    const rect = slideElement.getBoundingClientRect();
    
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    const boundedX = Math.max(0, Math.min(100, x));
    const boundedY = Math.max(0, Math.min(100, y));
    
    const updatedSlides = [...slides];
    const currentSlide = updatedSlides[currentSlideIndex];
    
    if (draggedTextBoxId) {
      const textBoxIndex = currentSlide.textBoxes.findIndex(box => box.id === draggedTextBoxId);
      if (textBoxIndex !== -1) {
        currentSlide.textBoxes[textBoxIndex].position = { x: boundedX, y: boundedY };
        setSlides(updatedSlides);
      }
    }
    
    if (draggedImageId) {
      const imageIndex = currentSlide.images.findIndex(img => img.id === draggedImageId);
      if (imageIndex !== -1) {
        currentSlide.images[imageIndex].position = { x: boundedX, y: boundedY };
        setSlides(updatedSlides);
      }
    }
  }, [draggedTextBoxId, draggedImageId, currentSlideIndex, slides]);
  
  const handleMouseUp = useCallback(() => {
    setDraggedTextBoxId(null);
    setDraggedImageId(null);
  }, []);
  
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

  const handleImageSelect = (id: string) => {
    setSelectedImageId(id);
    setSelectedTextBoxId(null);
    setEditingTextBoxId(null);
  };
  
  const updateTextBoxPosition = (id: string, position: { x: number; y: number }) => {
    const updatedSlides = [...slides];
    const textBoxIndex = updatedSlides[currentSlideIndex].textBoxes.findIndex(box => box.id === id);
    if (textBoxIndex !== -1) {
      updatedSlides[currentSlideIndex].textBoxes[textBoxIndex].position = position;
      setSlides(updatedSlides);
    }
  };
  
  const exportSlide = async () => {
    try {
      const slideElement = document.getElementById('slide-canvas');
      if (!slideElement) return;
      
      const originalDraggedId = draggedTextBoxId;
      const originalEditingId = editingTextBoxId;
      const originalSelectedId = selectedTextBoxId;
      const originalSelectedImageId = selectedImageId;
      setDraggedTextBoxId(null);
      setEditingTextBoxId(null);
      setSelectedTextBoxId(null);
      setSelectedImageId(null);
      
      setTimeout(async () => {
        try {
          const canvas = await html2canvas(slideElement, {
            allowTaint: true,
            useCORS: true,
            scale: 2,
            logging: false,
          });
          
          const imgData = canvas.toDataURL('image/png');
          const link = document.createElement('a');
          link.download = `slide-${currentSlideIndex + 1}.png`;
          link.href = imgData;
          link.click();
          
          toast.success("Slide exportado com sucesso");
        } catch (error) {
          console.error("Erro ao exportar slide:", error);
          toast.error("Não foi possível exportar o slide");
        } finally {
          setDraggedTextBoxId(originalDraggedId);
          setEditingTextBoxId(originalEditingId);
          setSelectedTextBoxId(originalSelectedId);
          setSelectedImageId(originalSelectedImageId);
        }
      }, 100);
    } catch (error) {
      console.error("Erro ao exportar:", error);
      toast.error("Não foi possível exportar o slide");
    }
  };
  
  const exportAllSlides = async () => {
    const originalSlideIndex = currentSlideIndex;
    
    for (let i = 0; i < slides.length; i++) {
      setCurrentSlideIndex(i);
      await new Promise(resolve => setTimeout(resolve, 300));
      await exportSlide();
    }
    
    setCurrentSlideIndex(originalSlideIndex);
  };

  const currentSlide = slides[currentSlideIndex];

  useEffect(() => {
    if (currentSlide) {
      setSlideBackgroundColor(currentSlide.backgroundColor || "#f5f5f5");
      setBackgroundImageOpacity(currentSlide.backgroundImageOpacity ?? 1);
    }
  }, [currentSlideIndex, currentSlide]);

  const updateBackgroundColor = (color: string) => {
    const updatedSlides = [...slides];
    updatedSlides[currentSlideIndex].backgroundColor = color;
    setSlideBackgroundColor(color);
    setSlides(updatedSlides);
  };
  
  const updateBackgroundImageOpacity = (opacity: number) => {
    const updatedSlides = [...slides];
    updatedSlides[currentSlideIndex].backgroundImageOpacity = opacity;
    setBackgroundImageOpacity(opacity);
    setSlides(updatedSlides);
  };
  
  const removeBackgroundImage = () => {
    const updatedSlides = [...slides];
    updatedSlides[currentSlideIndex].backgroundImage = null;
    setSlides(updatedSlides);
  };
  
  const handleImageResize = (imageId: string, size: { width: number; height: number }) => {
    const updatedSlides = [...slides];
    const currentSlide = updatedSlides[currentSlideIndex];
    const imageIndex = currentSlide.images.findIndex(img => img.id === imageId);
    
    if (imageIndex !== -1) {
      currentSlide.images[imageIndex].size = size;
      setSlides(updatedSlides);
    }
  };

  return {
    slides,
    currentSlideIndex,
    setCurrentSlideIndex,
    isLoading,
    images,
    searchTerm,
    setSearchTerm,
    selectedTextBoxId,
    editingTextBoxId,
    selectedImageId,
    imageFilter,
    imageSize,
    imageOpacity,
    currentTextColor,
    currentFontSize,
    currentFontFamily,
    currentBgColor,
    currentBgOpacity,
    currentPadding,
    draggedTextBoxId,
    draggedImageId,
    currentSlide,
    slideBackgroundColor,
    backgroundImageOpacity,
    handleSearchImages,
    handleRegenerateTexts,
    updateSlideImage,
    handleAddImage,
    handleUpdateImage,
    handleDeleteImage,
    handleImageFilterChange,
    handleImageSizeChange,
    handleImageOpacityChange,
    handleArrangeImage,
    goToPrevSlide,
    goToNextSlide,
    addNewTextBox,
    selectTextBox,
    toggleEditingTextBox,
    deleteTextBox,
    updateTextContent,
    handleDragStart,
    handleImageDragStart,
    handleMouseMove,
    handleMouseUp,
    updateTextStyle,
    handleImageSelect,
    updateTextBoxPosition,
    exportSlide,
    exportAllSlides,
    updateBackgroundColor,
    updateBackgroundImageOpacity,
    removeBackgroundImage,
    handleImageResize
  };
};
