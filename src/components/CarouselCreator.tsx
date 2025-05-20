
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
import { SaveIcon, BotIcon } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface CarouselCreatorProps {
  businessInfo: BusinessInfo;
  openAiKey: string;
  unsplashKey: string;
  grokKey: string;
  geminiKey: string;
  selectedProvider: string;
  onBack: () => void;
  carouselDescription?: string;
}

const CarouselCreator: React.FC<CarouselCreatorProps> = ({
  businessInfo,
  openAiKey,
  unsplashKey,
  grokKey,
  geminiKey,
  selectedProvider: initialProvider,
  onBack,
  carouselDescription = ""
}) => {
  const navigate = useNavigate();
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState(carouselDescription || "");
  const [isSaving, setIsSaving] = useState(false);
  const [aiDialogOpen, setAiDialogOpen] = useState(true);
  const [selectedProvider, setSelectedProvider] = useState(initialProvider || "openai");
  
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
    updateSlideImage,
    initializeCarousel
  } = useCarouselState({ 
    businessInfo, 
    openAiKey, 
    unsplashKey,
    grokKey,
    geminiKey,
    selectedProvider: selectedProvider,
    autoInitialize: false,
    carouselDescription
  });

  const startCarouselCreation = async () => {
    setAiDialogOpen(false);
    await initializeCarousel();
  };

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
      {aiDialogOpen && (
        <Dialog open={aiDialogOpen} onOpenChange={setAiDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <BotIcon className="h-5 w-5" />
                Selecione o Provedor de IA
              </DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <Label className="mb-3 block text-center">Escolha o provedor de IA para geração de conteúdo:</Label>
              <RadioGroup 
                value={selectedProvider} 
                onValueChange={setSelectedProvider}
                className="grid gap-4 md:grid-cols-3"
              >
                <div className={`flex items-center justify-between rounded-md border-2 p-4 ${selectedProvider === "openai" ? "border-primary" : "border-border"}`}>
                  <div className="space-y-1">
                    <Label htmlFor="openai" className="text-base">OpenAI</Label>
                    <p className="text-xs text-muted-foreground">
                      GPT-3.5 Turbo
                    </p>
                  </div>
                  <RadioGroupItem value="openai" id="openai" className="h-5 w-5" />
                </div>
                <div className={`flex items-center justify-between rounded-md border-2 p-4 ${selectedProvider === "gemini" ? "border-primary" : "border-border"}`}>
                  <div className="space-y-1">
                    <Label htmlFor="gemini" className="text-base">Google Gemini</Label>
                    <p className="text-xs text-muted-foreground">
                      Gemini Pro
                    </p>
                  </div>
                  <RadioGroupItem value="gemini" id="gemini" className="h-5 w-5" />
                </div>
                <div className={`flex items-center justify-between rounded-md border-2 p-4 ${selectedProvider === "grok" ? "border-primary" : "border-border"}`}>
                  <div className="space-y-1">
                    <Label htmlFor="grok" className="text-base">Grok</Label>
                    <p className="text-xs text-muted-foreground">
                      Grok-1
                    </p>
                  </div>
                  <RadioGroupItem value="grok" id="grok" className="h-5 w-5" />
                </div>
              </RadioGroup>

              {selectedProvider === "openai" && !openAiKey && (
                <p className="text-sm text-red-500 mt-2">
                  Você não configurou uma chave OpenAI. Configure-a nas configurações.
                </p>
              )}
              
              {selectedProvider === "gemini" && !geminiKey && (
                <p className="text-sm text-red-500 mt-2">
                  Você não configurou uma chave Gemini. Configure-a nas configurações.
                </p>
              )}
              
              {selectedProvider === "grok" && !grokKey && (
                <p className="text-sm text-red-500 mt-2">
                  Você não configurou uma chave Grok. Configure-a nas configurações.
                </p>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={onBack}>Cancelar</Button>
              <Button 
                onClick={startCarouselCreation} 
                disabled={
                  (selectedProvider === "openai" && !openAiKey) ||
                  (selectedProvider === "gemini" && !geminiKey) ||
                  (selectedProvider === "grok" && !grokKey)
                }
              >
                Criar Carrossel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {(!aiDialogOpen && slides.length > 0) && (
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
                    carouselDescription={carouselDescription} 
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
      )}
      
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
