
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TextStylePanel from "./TextStylePanel";
import BackgroundPanel from "./BackgroundPanel";
import ImageStylePanel from "./ImageStylePanel";
import ImageSearchPanel from "./ImageSearchPanel";
import { UnsplashImage } from "@/services/unsplashService";
import { Slide } from "@/components/CarouselCreatorExtension";
import ImagesPanel from "./ImagesPanel";
import { SlideImageData } from "@/components/SlideImages";
import { BusinessInfo } from "@/components/BusinessInfoForm";

interface EditorTabsProps {
  currentSlide: Slide;
  selectedTextBoxId: string | null;
  selectedImageId: string | null;
  currentTextColor: string;
  currentFontSize: string;
  currentFontFamily: string;
  currentBgColor: string;
  currentBgOpacity: string;
  currentPadding: string;
  imageFilter: string;
  imageSize: { width: number; height: number };
  imageOpacity: number;
  images: UnsplashImage[];
  isLoading: boolean;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  updateTextStyle: (property: string, value: string) => void;
  addNewTextBox: () => void;
  handleRegenerateTexts: () => void;
  handleImageFilterChange: (filter: string) => void;
  handleImageSizeChange: (size: { width: number; height: number }) => void;
  handleImageOpacityChange: (opacity: number) => void;
  handleAddImage: (imageData: SlideImageData) => void;
  handleArrangeImage: (id: string, direction: 'forward' | 'backward') => void;
  handleSearchImages: () => void;
  slideBackgroundColor?: string;
  updateBackgroundColor?: (color: string) => void;
  backgroundImageOpacity?: number;
  updateBackgroundImageOpacity?: (opacity: number) => void;
  removeBackgroundImage?: () => void;
  updateSlideImage?: (image: UnsplashImage) => void;
  businessInfo?: BusinessInfo; 
  carouselDescription?: string; // Adiciona suporte à descrição do carrossel
}

const EditorTabs: React.FC<EditorTabsProps> = ({
  currentSlide,
  selectedTextBoxId,
  selectedImageId,
  currentTextColor,
  currentFontSize,
  currentFontFamily,
  currentBgColor,
  currentBgOpacity,
  currentPadding,
  imageFilter,
  imageSize,
  imageOpacity,
  images,
  isLoading,
  searchTerm,
  setSearchTerm,
  updateTextStyle,
  addNewTextBox,
  handleRegenerateTexts,
  handleImageFilterChange,
  handleImageSizeChange,
  handleImageOpacityChange,
  handleAddImage,
  handleArrangeImage,
  handleSearchImages,
  slideBackgroundColor,
  updateBackgroundColor,
  backgroundImageOpacity,
  updateBackgroundImageOpacity,
  removeBackgroundImage,
  updateSlideImage,
  businessInfo,
  carouselDescription 
}) => {
  const [activeTab, setActiveTab] = useState("text");
  
  // Get current slide text for better image search context
  const currentSlideText = currentSlide?.textBoxes[0]?.text || "";

  return (
    <Tabs defaultValue="text" className="w-full" value={activeTab} onValueChange={setActiveTab}>
      <TabsList className="grid grid-cols-4 mb-4">
        <TabsTrigger value="text">Texto</TabsTrigger>
        <TabsTrigger value="background">Fundo</TabsTrigger>
        <TabsTrigger value="image" disabled={!selectedImageId}>Imagem</TabsTrigger>
        <TabsTrigger value="images">Imagens</TabsTrigger>
      </TabsList>
      
      <TabsContent value="text" className="space-y-4">
        <TextStylePanel 
          selectedTextBoxId={selectedTextBoxId}
          currentTextColor={currentTextColor}
          currentFontSize={currentFontSize}
          currentFontFamily={currentFontFamily}
          currentBgColor={currentBgColor}
          currentBgOpacity={currentBgOpacity}
          currentPadding={currentPadding}
          isLoading={isLoading}
          updateTextStyle={updateTextStyle}
          addNewTextBox={addNewTextBox}
          handleRegenerateTexts={handleRegenerateTexts}
        />
      </TabsContent>
      
      <TabsContent value="background">
        <BackgroundPanel
          currentSlide={currentSlide}
          currentSlideImage={currentSlide?.backgroundImage || null}
          imageFilter="none"
          imageSize={{ width: 100, height: 100 }}
          onFilterChange={() => {}}
          onSizeChange={() => {}}
          onOpacityChange={() => {}}
          imageOpacity={1}
          isLoading={isLoading}
          backgroundColor={slideBackgroundColor}
          onBackgroundColorChange={updateBackgroundColor}
          backgroundImageOpacity={backgroundImageOpacity}
          onBackgroundImageOpacityChange={updateBackgroundImageOpacity}
          onRemoveBackgroundImage={removeBackgroundImage}
          onUpdateBackgroundImage={updateSlideImage}
          images={images}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          handleSearchImages={handleSearchImages}
        />
      </TabsContent>
      
      <TabsContent value="image">
        <ImageStylePanel
          currentSlide={currentSlide}
          selectedImageId={selectedImageId}
          imageFilter={imageFilter}
          imageSize={imageSize}
          imageOpacity={imageOpacity}
          onFilterChange={handleImageFilterChange}
          onSizeChange={handleImageSizeChange}
          onOpacityChange={handleImageOpacityChange}
          onAddImage={handleAddImage}
          onArrangeImage={handleArrangeImage}
          images={images}
          isLoading={isLoading}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          handleSearchImages={handleSearchImages}
        />
      </TabsContent>
      
      <TabsContent value="images" className="space-y-4">
        <div className="mb-4">
          <ImageSearchPanel 
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            handleSearchImages={handleSearchImages}
            isLoading={isLoading}
            businessInfo={businessInfo}
            carouselDescription={carouselDescription}
            slideText={currentSlideText}
          />
        </div>
        
        <ImagesPanel 
          images={images} 
          onAddImage={handleAddImage} 
          isLoading={isLoading} 
          updateSlideImage={updateSlideImage}
        />
      </TabsContent>
    </Tabs>
  );
};

export default EditorTabs;
