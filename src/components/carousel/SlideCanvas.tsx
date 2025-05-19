
import React, { useRef } from "react";
import TextBox from "@/components/TextBox";
import { Slide } from "@/components/CarouselCreatorExtension";

interface SlideCanvasProps {
  currentSlide: Slide;
  selectedTextBoxId: string | null;
  editingTextBoxId: string | null;
  selectedImageId: string | null;
  draggedTextBoxId: string | null;
  draggedImageId: string | null;
  selectTextBox: (id: string) => void;
  toggleEditingTextBox: (id: string) => void;
  deleteTextBox: (id: string) => void;
  updateTextContent: (id: string, text: string) => void;
  handleDragStart: (e: React.MouseEvent, id: string) => void;
  handleImageDragStart: (e: React.MouseEvent, id: string) => void;
  handleImageSelect: (id: string) => void;
  handleDeleteImage: (id: string) => void;
  handleMouseMove: (e: React.MouseEvent) => void;
  handleMouseUp: () => void;
  updateTextBoxPosition: (id: string, position: { x: number; y: number }) => void;
  handleImageSizeChange?: (id: string, size: { width: number; height: number }) => void;
}

const SlideCanvas: React.FC<SlideCanvasProps> = ({
  currentSlide,
  selectedTextBoxId,
  editingTextBoxId,
  selectedImageId,
  draggedTextBoxId,
  draggedImageId,
  selectTextBox,
  toggleEditingTextBox,
  deleteTextBox,
  updateTextContent,
  handleDragStart,
  handleImageDragStart,
  handleImageSelect,
  handleDeleteImage,
  handleMouseMove,
  handleMouseUp,
  updateTextBoxPosition,
  handleImageSizeChange
}) => {
  const slideCanvasRef = useRef<HTMLDivElement>(null);
  
  const isDragging = draggedTextBoxId !== null || draggedImageId !== null;
  
  // Handle click on canvas to deselect items
  const handleCanvasClick = () => {
    if (selectedTextBoxId !== null) {
      selectTextBox("");
    }
    if (editingTextBoxId !== null) {
      toggleEditingTextBox("");
    }
    if (selectedImageId !== null) {
      handleImageSelect("");
    }
  };
  
  return (
    <div 
      id="slide-canvas"
      ref={slideCanvasRef}
      className="slide-canvas carousel-container mb-4 relative"
      style={{ 
        aspectRatio: '1/1',
        backgroundColor: currentSlide.backgroundColor,
        border: '1px solid #e0e0e0',
        overflow: 'hidden'
      }}
      onMouseMove={isDragging ? handleMouseMove : undefined}
      onMouseUp={isDragging ? handleMouseUp : undefined}
      onMouseLeave={isDragging ? handleMouseUp : undefined}
      onClick={handleCanvasClick}
    >
      {currentSlide?.backgroundImage && (
        <img
          src={currentSlide.backgroundImage.urls.regular}
          alt={currentSlide.backgroundImage.alt_description || "Imagem do slide"}
          className="w-full h-full object-cover absolute inset-0"
          style={{ 
            opacity: currentSlide.backgroundImageOpacity 
          }}
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
          onPositionChange={updateTextBoxPosition}
          onDragStart={handleDragStart}
        />
      ))}
    </div>
  );
};

export default SlideCanvas;
