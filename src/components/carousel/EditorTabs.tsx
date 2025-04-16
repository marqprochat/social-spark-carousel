
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Type, Image } from "lucide-react";
import TextEditorPanel from "./TextEditorPanel";
import { ImageEditorTab } from "@/components/CarouselCreatorExtension";
import ImageSearchPanel from "./ImageSearchPanel";
import { Slide } from "@/components/CarouselCreatorExtension";
import { UnsplashImage } from "@/services/unsplashService";
import { SlideImageData } from "@/components/SlideImages";

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
  handleSearchImages
}) => {
  return (
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
        <TextEditorPanel 
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
      
      <TabsContent value="image" className="space-y-4">
        {currentSlide && (
          <ImageEditorTab
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
          />
        )}

        <ImageSearchPanel 
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          handleSearchImages={handleSearchImages}
          isLoading={isLoading}
        />
      </TabsContent>
    </Tabs>
  );
};

export default EditorTabs;
