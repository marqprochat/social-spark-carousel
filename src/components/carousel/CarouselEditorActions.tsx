
import React from "react";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";

interface CarouselEditorActionsProps {
  onBack: () => void;
  exportSlide: () => void;
  exportAllSlides: () => void;
}

const CarouselEditorActions: React.FC<CarouselEditorActionsProps> = ({
  onBack,
  exportSlide,
  exportAllSlides
}) => {
  return (
    <>
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
    </>
  );
};

export default CarouselEditorActions;
