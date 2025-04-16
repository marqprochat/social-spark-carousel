
import React, { useState, useEffect, useRef } from "react";
import { X, ArrowsMaximize } from "lucide-react";

interface TextBoxProps {
  id: string;
  text: string;
  position: { x: number; y: number };
  style: {
    color: string;
    fontSize: string;
    fontFamily: string;
    backgroundColor: string;
    padding: string;
  };
  isSelected: boolean;
  isEditing: boolean;
  onSelect: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onTextChange: (id: string, text: string) => void;
  onPositionChange: (id: string, position: { x: number; y: number }) => void;
  onDragStart: (e: React.MouseEvent, id: string) => void;
}

const TextBox: React.FC<TextBoxProps> = ({
  id,
  text,
  position,
  style,
  isSelected,
  isEditing,
  onSelect,
  onEdit,
  onDelete,
  onTextChange,
  onPositionChange,
  onDragStart,
}) => {
  const [isHovering, setIsHovering] = useState(false);
  const [localText, setLocalText] = useState(text);
  const [size, setSize] = useState({ width: 'auto', height: 'auto' });
  const [isResizing, setIsResizing] = useState(false);
  const textBoxRef = useRef<HTMLDivElement>(null);
  
  // Update local text when prop text changes
  useEffect(() => {
    setLocalText(text);
  }, [text]);

  const handleTextChange = (e: React.FormEvent<HTMLDivElement>) => {
    const newText = e.currentTarget.innerText;
    setLocalText(newText);
    onTextChange(id, newText);
  };

  const handleBlur = () => {
    if (isEditing) {
      onEdit("");  // Disable editing mode
    }
  };

  const startResizing = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    document.addEventListener('mousemove', handleResizeMove);
    document.addEventListener('mouseup', stopResizing);
  };

  const handleResizeMove = (e: MouseEvent) => {
    if (!isResizing || !textBoxRef.current) return;
    
    const rect = textBoxRef.current.getBoundingClientRect();
    const containerRect = textBoxRef.current.parentElement?.getBoundingClientRect();
    
    if (!containerRect) return;
    
    const newWidth = e.clientX - rect.left;
    const newHeight = e.clientY - rect.top;
    
    const minWidth = 100;
    const minHeight = 50;
    const maxWidth = containerRect.width * 0.9;
    const maxHeight = containerRect.height * 0.9;
    
    setSize({
      width: `${Math.max(minWidth, Math.min(newWidth, maxWidth))}px`,
      height: `${Math.max(minHeight, Math.min(newHeight, maxHeight))}px`,
    });
  };

  const stopResizing = () => {
    setIsResizing(false);
    document.removeEventListener('mousemove', handleResizeMove);
    document.removeEventListener('mouseup', stopResizing);
  };

  // Map font family to Tailwind class
  const fontFamilyMap: Record<string, string> = {
    montserrat: "font-montserrat",
    roboto: "font-roboto",
    poppins: "font-poppins",
    playfair: "font-playfair",
    opensans: "font-opensans",
    lato: "font-lato",
    raleway: "font-raleway",
    oswald: "font-oswald",
    merriweather: "font-merriweather",
    dancingscript: "font-dancingscript",
    pacifico: "font-pacifico",
    quicksand: "font-quicksand",
    comforter: "font-comforter"
  };

  const fontClass = fontFamilyMap[style.fontFamily] || "font-sans";

  return (
    <div
      ref={textBoxRef}
      className={`absolute contenteditable-div cursor-move ${isSelected ? "ring-2 ring-primary" : ""}`}
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
        transform: "translate(-50%, -50%)",
        color: style.color,
        fontSize: style.fontSize,
        backgroundColor: style.backgroundColor,
        padding: style.padding,
        zIndex: isSelected ? 10 : 1,
        minWidth: "100px",
        width: size.width,
        height: size.height,
        userSelect: isEditing ? "text" : "none",
        transition: "box-shadow 0.2s ease",
        boxShadow: isSelected ? "0 0 0 2px rgba(147, 51, 234, 0.5)" : "none",
        overflow: "visible",
        resize: isSelected ? "both" : "none",
      }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(id);
      }}
      onMouseDown={(e) => {
        if (!isEditing) {
          e.preventDefault(); // Prevent text selection during drag
          onDragStart(e, id);
        }
      }}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {(isSelected || isHovering) && (
        <>
          <button
            className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-700 z-20"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(id);
            }}
          >
            <X className="h-3 w-3" />
          </button>
          
          <button
            className="absolute -bottom-3 -right-3 bg-primary text-white rounded-full p-0.5 hover:bg-primary/80 z-20"
            onClick={startResizing}
          >
            <ArrowsMaximize className="h-3 w-3" />
          </button>
        </>
      )}
      <div
        contentEditable={isEditing}
        suppressContentEditableWarning={true}
        onDoubleClick={(e) => {
          e.stopPropagation();
          onEdit(id);
        }}
        onBlur={handleBlur}
        onInput={handleTextChange}
        className={`outline-none whitespace-pre-wrap break-words h-full ${fontClass}`}
        style={{
          minHeight: "1em",
          overflowY: "auto",
        }}
      >
        {localText}
      </div>
    </div>
  );
};

export default TextBox;
