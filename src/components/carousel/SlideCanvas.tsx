
import React, { useRef, useCallback } from "react";
import TextBox from "@/components/TextBox";
import SlideImages from "@/components/SlideImages";
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
  updateTextBoxPosition
}) => {
  const slideCanvasRef = useRef<HTMLDivElement>(null);
  
  const isDragging = draggedTextBoxId !== null || draggedImageId !== null;
  
  return (
    <div 
      id="slide-canvas"
      ref={slideCanvasRef}
      className="slide-canvas carousel-container mb-4 relative"
      onMouseMove={isDragging ? handleMouseMove : undefined}
      onMouseUp={isDragging ? handleMouseUp : undefined}
      onMouseLeave={isDragging ? handleMouseUp : undefined}
    >
      {currentSlide?.backgroundImage && (
        <img
          src={currentSlide.backgroundImage.urls.regular}
          alt={currentSlide.backgroundImage.alt_description || "Imagem do slide"}
          className="w-full h-full object-cover"
        />
      )}
      
      {currentSlide && <SlideImages 
        images={currentSlide.images}
        onSelect={handleImageSelect}
        selectedId={selectedImageId}
        onDelete={handleDeleteImage}
        onDragStart={handleImageDragStart}
        onPositionChange={(id, position) => {
          // This is handled by the parent component through draggedImageId
        }}
      />}
      
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
