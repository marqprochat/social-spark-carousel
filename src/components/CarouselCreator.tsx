import React, { useState, useEffect } from "react";
import { useCarouselState } from "./carousel/useCarouselState";
import { BusinessInfo } from "@/components/BusinessInfoForm";
import SlideCanvas from "./carousel/SlideCanvas";
import SlideNavigation from "./carousel/SlideNavigation";
import EditorTabs from "./carousel/EditorTabs";
import SlidePreview from "./carousel/SlidePreview";
import CarouselEditorActions from "./carousel/CarouselEditorActions";
import LoadingState from "./carousel/LoadingState";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { SaveIcon } from "lucide-react";

interface CarouselCreatorProps {
  businessInfo: BusinessInfo;
  openAiKey: string;
  unsplashKey: string;
  onBack: () => void;
  carouselDescription?: string; // Nova propriedade para descrição do carrossel
}

const CarouselCreator: React.FC<CarouselCreatorProps> = ({
  businessInfo,
  openAiKey,
  unsplashKey,
  onBack,
  carouselDescription = "" // Valor padrão vazio
}) => {
  const navigate = useNavigate();
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState(carouselDescription || ""); // Usa a descrição do carrossel como valor inicial
  const [isSaving, setIsSaving] = useState(false);
  
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
    handleImageResize,
    updateSlideImage
  } = useCarouselState({ 
    businessInfo, 
    openAiKey, 
    unsplashKey,
    autoInitialize: true,
    carouselDescription // Passa a descrição do carrossel
  });

  const handleSaveToProject = async () => {
    if (!projectName.trim()) {
      toast.error("Nome do projeto é obrigatório");
      return;
    }

    setIsSaving(true);
    try {
      // Buscar ID da empresa pelo nome da empresa
      const { data: businessData, error: businessError } = await supabase
        .from("business_info")
        .select("id")
        .eq("business_name", businessInfo.businessName)
        .single();

      if (businessError) throw businessError;
      
      // Obter o user_id da sessão atual
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user.id;
      
      if (!userId) {
        throw new Error("Usuário não autenticado");
      }
      
      // Criar um novo projeto
      const { data: projectData, error: projectError } = await supabase
        .from("projects")
        .insert({
          name: projectName,
          description: projectDescription,
          business_id: businessData.id,
          user_id: userId
        })
        .select()
        .single();

      if (projectError) throw projectError;
      
      // Criar um novo carrossel dentro do projeto
      const slidesJson = JSON.stringify(slides);
      
      const { error: carouselError } = await supabase
        .from("carousels")
        .insert({
          project_id: projectData.id,
          title: `Carrossel de ${businessInfo.businessName}`,
          description: projectDescription || `Gerado em ${new Date().toLocaleDateString()}`,
          slides: slidesJson
        });

      if (carouselError) throw carouselError;
      
      toast.success("Projeto salvo com sucesso!");
      setSaveDialogOpen(false);
      
      // Redirecionar para a página do projeto
      navigate(`/projects/${projectData.id}`);
    } catch (error) {
      console.error("Error saving project:", error);
      toast.error("Erro ao salvar projeto");
    } finally {
      setIsSaving(false);
    }
  };
  
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
        <div className="w-full lg:w-1/2 flex flex-col gap-6">
          <div>
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
                  updateSlideImage={updateSlideImage}
                  businessInfo={businessInfo} 
                  carouselDescription={carouselDescription} // Passa a descrição do carrossel
                />
              )}
            </div>
          </div>
          
          <div className="flex flex-col gap-4">
            <CarouselEditorActions 
              onBack={onBack}
              exportSlide={exportSlide}
              exportAllSlides={exportAllSlides}
            />
            
            <Button 
              onClick={() => setSaveDialogOpen(true)} 
              className="w-full bg-green-600 hover:bg-green-700 text-white"
            >
              <SaveIcon className="w-4 h-4 mr-2" />
              Salvar em Projetos
            </Button>
          </div>
        </div>
      </div>
      
      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Salvar em Projetos</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="projectName">Nome do Projeto</Label>
              <Input
                id="projectName"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="Nome do projeto"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="projectDescription">Descrição (opcional)</Label>
              <Textarea
                id="projectDescription"
                value={projectDescription}
                onChange={(e) => setProjectDescription(e.target.value)}
                placeholder="Descrição do projeto"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>Cancelar</Button>
            <Button 
              onClick={handleSaveToProject} 
              disabled={isSaving}
            >
              {isSaving ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CarouselCreator;
