
import React, { useState, useEffect, useRef } from "react";
import { X, Maximize2 } from "lucide-react";

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
  const textBoxRef = useRef<HTMLDivElement>(null);
  const textContentRef = useRef<HTMLDivElement>(null);
  const resizingRef = useRef<string | null>(null);
  
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

  // Handle resize start from any side or corner
  const startResizing = (e: React.MouseEvent, direction: string) => {
    e.preventDefault();
    e.stopPropagation();
    resizingRef.current = direction;
    
    // Initial size
    if (textBoxRef.current) {
      const rect = textBoxRef.current.getBoundingClientRect();
      setSize({
        width: `${rect.width}px`,
        height: `${rect.height}px`
      });
    }
    
    document.addEventListener('mousemove', handleResizeMove);
    document.addEventListener('mouseup', stopResizing);
  };

  const handleResizeMove = (e: MouseEvent) => {
    if (!resizingRef.current || !textBoxRef.current) return;
    
    const rect = textBoxRef.current.getBoundingClientRect();
    const direction = resizingRef.current;
    
    // Calculate new size based on resize direction
    let newWidth = rect.width;
    let newHeight = rect.height;
    
    if (direction.includes('e')) {
      // Right edge
      newWidth = e.clientX - rect.left;
    } else if (direction.includes('w')) {
      // Left edge
      newWidth = rect.right - e.clientX;
    }
    
    if (direction.includes('s')) {
      // Bottom edge
      newHeight = e.clientY - rect.top;
    } else if (direction.includes('n')) {
      // Top edge
      newHeight = rect.bottom - e.clientY;
    }
    
    // Minimum size constraints
    const minWidth = 100;
    const minHeight = 50;
    
    setSize({
      width: `${Math.max(minWidth, newWidth)}px`,
      height: `${Math.max(minHeight, newHeight)}px`,
    });
  };

  const stopResizing = () => {
    resizingRef.current = null;
    document.removeEventListener('mousemove', handleResizeMove);
    document.removeEventListener('mouseup', stopResizing);
  };

  // Create font class mapping
  const getFontClass = () => {
    switch(style.fontFamily) {
      case "montserrat": return "font-montserrat";
      case "roboto": return "font-roboto";
      case "poppins": return "font-poppins";
      case "playfair": return "font-playfair";
      case "opensans": return "font-opensans";
      case "lato": return "font-lato";
      case "raleway": return "font-raleway";
      case "oswald": return "font-oswald";
      case "merriweather": return "font-merriweather";
      case "dancingscript": return "font-dancingscript";
      case "pacifico": return "font-pacifico";
      case "quicksand": return "font-quicksand";
      case "comforter": return "font-comforter";
      default: return "font-sans";
    }
  };
  
  // Create resize handles
  const renderResizeHandles = () => {
    if (!isSelected) return null;
    
    const handles = [
      { position: 'n', className: 'top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 cursor-n-resize h-2 w-2' },
      { position: 'e', className: 'top-1/2 right-0 -translate-y-1/2 translate-x-1/2 cursor-e-resize h-2 w-2' },
      { position: 's', className: 'bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 cursor-s-resize h-2 w-2' },
      { position: 'w', className: 'top-1/2 left-0 -translate-y-1/2 -translate-x-1/2 cursor-w-resize h-2 w-2' },
      { position: 'ne', className: 'top-0 right-0 -translate-y-1/2 translate-x-1/2 cursor-ne-resize h-2 w-2' },
      { position: 'se', className: 'bottom-0 right-0 translate-y-1/2 translate-x-1/2 cursor-se-resize h-2 w-2' },
      { position: 'sw', className: 'bottom-0 left-0 translate-y-1/2 -translate-x-1/2 cursor-sw-resize h-2 w-2' },
      { position: 'nw', className: 'top-0 left-0 -translate-y-1/2 -translate-x-1/2 cursor-nw-resize h-2 w-2' },
    ];
    
    return handles.map(handle => (
      <div
        key={handle.position}
        className={`absolute ${handle.className} bg-primary rounded-full`}
        onMouseDown={(e) => startResizing(e, handle.position)}
      />
    ));
  };

  // Get the appropriate font class
  const fontClass = getFontClass();

  return (
    <div
      ref={textBoxRef}
      className={`absolute contenteditable-div ${isSelected ? "ring-2 ring-primary" : isHovering ? "ring-1 ring-primary/50" : ""}`}
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
        transform: "translate(-50%, -50%)",
        color: style.color,
        fontSize: style.fontSize,
        backgroundColor: style.backgroundColor,
        padding: style.padding,
        zIndex: isSelected ? 10 : 1,
        width: size.width,
        height: size.height,
        userSelect: isEditing ? "text" : "none",
        transition: "box-shadow 0.2s ease",
        boxShadow: isSelected ? "0 0 0 2px rgba(147, 51, 234, 0.5)" : "none",
        overflow: "visible",
        minWidth: "100px",
        minHeight: "50px",
        cursor: isEditing ? "text" : "move",
      }}
      onClick={(e) => {
        e.stopPropagation();
        if (!isEditing) {
          onSelect(id);
        }
      }}
      onMouseDown={(e) => {
        if (!isEditing) {
          e.preventDefault(); // Prevent text selection during drag
          onDragStart(e, id);
        }
      }}
      onDoubleClick={(e) => {
        e.stopPropagation();
        onEdit(id);
      }}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Delete button */}
      {(isSelected || isHovering) && (
        <button
          className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-700 z-20"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(id);
          }}
        >
          <X className="h-3 w-3" />
        </button>
      )}
      
      {/* Text content */}
      <div
        ref={textContentRef}
        contentEditable={isEditing}
        suppressContentEditableWarning={true}
        onBlur={handleBlur}
        onInput={handleTextChange}
        className={`outline-none whitespace-pre-wrap break-words h-full w-full ${fontClass}`}
        style={{
          minHeight: "1em",
          overflowY: "auto",
          fontFamily: style.fontFamily === "sans" ? "sans-serif" : undefined,
        }}
      >
        {localText}
      </div>
      
      {/* Resize handles */}
      {renderResizeHandles()}
    </div>
  );
};

export default TextBox;
