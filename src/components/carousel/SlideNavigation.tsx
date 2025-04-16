
import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface SlideNavigationProps {
  currentSlideIndex: number;
  slidesLength: number;
  goToPrevSlide: () => void;
  goToNextSlide: () => void;
}

const SlideNavigation: React.FC<SlideNavigationProps> = ({
  currentSlideIndex,
  slidesLength,
  goToPrevSlide,
  goToNextSlide
}) => {
  return (
    <div className="flex justify-between items-center mb-4">
      <Button 
        variant="outline" 
        size="icon" 
        onClick={goToPrevSlide}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      
      <span className="text-sm font-medium">
        Slide {currentSlideIndex + 1} de {slidesLength}
      </span>
      
      <Button 
        variant="outline" 
        size="icon" 
        onClick={goToNextSlide}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default SlideNavigation;
