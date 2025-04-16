
import React from "react";
import { Card } from "@/components/ui/card";
import { Slide } from "@/components/CarouselCreatorExtension";

interface SlidePreviewProps {
  slides: Slide[];
  currentSlideIndex: number;
  setCurrentSlideIndex: (index: number) => void;
}

const SlidePreview: React.FC<SlidePreviewProps> = ({
  slides,
  currentSlideIndex,
  setCurrentSlideIndex
}) => {
  return (
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
            {slide.backgroundImage && (
              <img
                src={slide.backgroundImage.urls.small}
                alt={slide.backgroundImage.alt_description || "Imagem do slide"}
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
                  padding: textBox.style.padding
                }}
              >
                {textBox.text}
              </div>
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
};

export default SlidePreview;
