
import React from "react";
import { useCarouselState } from "./carousel/useCarouselState";
import { BusinessInfo } from "@/components/BusinessInfoForm";
import SlideCanvas from "./carousel/SlideCanvas";
import SlideNavigation from "./carousel/SlideNavigation";
import EditorTabs from "./carousel/EditorTabs";
import SlidePreview from "./carousel/SlidePreview";
import CarouselEditorActions from "./carousel/CarouselEditorActions";
import LoadingState from "./carousel/LoadingState";

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
  const {
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
    handleAddImage,
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
  } = useCarouselState({ businessInfo, openAiKey, unsplashKey });
  
  if (isLoading && slides.length === 0) {
    return <LoadingState />;
  }
  
  return (
    <div className="w-full max-w-6xl mx-auto p-4 animate-fade-in">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Coluna da esquerda: SlideCanvas no topo e SlidePreview embaixo */}
        <div className="w-full lg:w-1/2 flex flex-col gap-6">
          <div>
            <h2 className="text-2xl font-semibold mb-4">Editor de Slide</h2>
            
            {currentSlide && (
              <SlideCanvas
                currentSlide={currentSlide}
                selectedTextBoxId={selectedTextBoxId}
                editingTextBoxId={editingTextBoxId}
                selectedImageId={selectedImageId}
                draggedTextBoxId={draggedTextBoxId}
                draggedImageId={draggedImageId}
                selectTextBox={selectTextBox}
                toggleEditingTextBox={toggleEditingTextBox}
                deleteTextBox={deleteTextBox}
                updateTextContent={updateTextContent}
                handleDragStart={handleDragStart}
                handleImageDragStart={handleImageDragStart}
                handleImageSelect={handleImageSelect}
                handleDeleteImage={handleDeleteImage}
                handleMouseMove={handleMouseMove}
                handleMouseUp={handleMouseUp}
                updateTextBoxPosition={updateTextBoxPosition}
                handleImageSizeChange={handleImageResize}
              />
            )}
            
            <SlideNavigation 
              currentSlideIndex={currentSlideIndex}
              slidesLength={slides.length}
              goToPrevSlide={goToPrevSlide}
              goToNextSlide={goToNextSlide}
            />
          </div>
          
          <div>
            <h2 className="text-2xl font-semibold mb-4">Pré-visualização do Carrossel</h2>
            
            <SlidePreview 
              slides={slides}
              currentSlideIndex={currentSlideIndex}
              setCurrentSlideIndex={setCurrentSlideIndex}
            />
          </div>
        </div>
        
        {/* Coluna da direita: EditorTabs no topo e CarouselEditorActions embaixo */}
        <div className="w-full lg:w-1/2 flex flex-col">
          <h2 className="text-2xl font-semibold mb-4">Ferramentas de Edição</h2>
          
          <div className="space-y-4">
            {currentSlide && (
              <EditorTabs 
                currentSlide={currentSlide}
                selectedTextBoxId={selectedTextBoxId}
                selectedImageId={selectedImageId}
                currentTextColor={currentTextColor}
                currentFontSize={currentFontSize}
                currentFontFamily={currentFontFamily}
                currentBgColor={currentBgColor}
                currentBgOpacity={currentBgOpacity}
                currentPadding={currentPadding}
                imageFilter={imageFilter}
                imageSize={imageSize}
                imageOpacity={imageOpacity}
                images={images}
                isLoading={isLoading}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                updateTextStyle={updateTextStyle}
                addNewTextBox={addNewTextBox}
                handleRegenerateTexts={handleRegenerateTexts}
                handleImageFilterChange={handleImageFilterChange}
                handleImageSizeChange={handleImageSizeChange}
                handleImageOpacityChange={handleImageOpacityChange}
                handleAddImage={handleAddImage}
                handleArrangeImage={handleArrangeImage}
                handleSearchImages={handleSearchImages}
                slideBackgroundColor={slideBackgroundColor}
                updateBackgroundColor={updateBackgroundColor}
                backgroundImageOpacity={backgroundImageOpacity}
                updateBackgroundImageOpacity={updateBackgroundImageOpacity}
                removeBackgroundImage={removeBackgroundImage}
              />
            )}
          </div>
          
          <CarouselEditorActions 
            onBack={onBack}
            exportSlide={exportSlide}
            exportAllSlides={exportAllSlides}
          />
        </div>
      </div>
    </div>
  );
};

export default CarouselCreator;
