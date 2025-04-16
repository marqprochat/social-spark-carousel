
import React, { useState, useEffect } from "react";
import { X } from "lucide-react";

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
  
  // Atualizar texto local quando o texto da props mudar
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
      onEdit("");  // Desativa o modo de edição
    }
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
        maxWidth: "80%",
        userSelect: isEditing ? "text" : "none",
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
      <div
        contentEditable={isEditing}
        suppressContentEditableWarning={true}
        onDoubleClick={(e) => {
          e.stopPropagation();
          onEdit(id);
        }}
        onBlur={handleBlur}
        onInput={handleTextChange}
        className={`outline-none whitespace-pre-wrap break-words text-center ${fontClass}`}
      >
        {localText}
      </div>
    </div>
  );
};

export default TextBox;
