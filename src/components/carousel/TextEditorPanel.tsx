
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, RefreshCw } from "lucide-react";

const FONT_OPTIONS = [
  { value: "montserrat", label: "Montserrat" },
  { value: "roboto", label: "Roboto" },
  { value: "poppins", label: "Poppins" },
  { value: "playfair", label: "Playfair Display" },
  { value: "opensans", label: "Open Sans" },
  { value: "lato", label: "Lato" },
  { value: "raleway", label: "Raleway" },
  { value: "oswald", label: "Oswald" },
  { value: "merriweather", label: "Merriweather" }
];

const FONT_SIZE_OPTIONS = [
  { value: "16px", label: "Pequeno (16px)" },
  { value: "20px", label: "Médio (20px)" },
  { value: "24px", label: "Grande (24px)" },
  { value: "32px", label: "Muito Grande (32px)" },
  { value: "40px", label: "Extra Grande (40px)" },
  { value: "48px", label: "Super Grande (48px)" }
];

interface TextEditorPanelProps {
  selectedTextBoxId: string | null;
  currentTextColor: string;
  currentFontSize: string;
  currentFontFamily: string;
  currentBgColor: string;
  currentBgOpacity: string;
  currentPadding: string;
  isLoading: boolean;
  updateTextStyle: (property: string, value: string) => void;
  addNewTextBox: () => void;
  handleRegenerateTexts: () => void;
}

const TextEditorPanel: React.FC<TextEditorPanelProps> = ({
  selectedTextBoxId,
  currentTextColor,
  currentFontSize,
  currentFontFamily,
  currentBgColor,
  currentBgOpacity,
  currentPadding,
  isLoading,
  updateTextStyle,
  addNewTextBox,
  handleRegenerateTexts
}) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-medium">Estilo do Texto</h3>
        <Button 
          size="sm" 
          variant="outline" 
          onClick={addNewTextBox}
          className="flex items-center gap-1"
        >
          <Plus className="h-3 w-3" /> Adicionar Texto
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Cor do Texto</label>
          <Input
            type="color"
            value={currentTextColor}
            onChange={(e) => updateTextStyle("color", e.target.value)}
            disabled={!selectedTextBoxId}
            className="h-10 cursor-pointer"
          />
        </div>
        
        <div>
          <label className="text-sm font-medium">Tamanho da Fonte</label>
          <Select 
            value={currentFontSize} 
            onValueChange={(value) => updateTextStyle("fontSize", value)}
            disabled={!selectedTextBoxId}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o tamanho" />
            </SelectTrigger>
            <SelectContent>
              {FONT_SIZE_OPTIONS.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div>
        <label className="text-sm font-medium">Fonte</label>
        <Select 
          value={currentFontFamily} 
          onValueChange={(value) => updateTextStyle("fontFamily", value)}
          disabled={!selectedTextBoxId}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione a fonte" />
          </SelectTrigger>
          <SelectContent>
            {FONT_OPTIONS.map(option => (
              <SelectItem key={option.value} value={option.value}>
                <span className={`font-${option.value}`}>{option.label}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Fundo do Texto</label>
          <div className="flex items-center gap-2">
            <Input
              type="color"
              value={currentBgColor.replace(/[^,]+(?=\))/, '1').replace(/rgba\((\d+), (\d+), (\d+).*/, (_, r, g, b) => {
                const toHex = (n: string) => {
                  const hex = parseInt(n).toString(16);
                  return hex.length === 1 ? '0' + hex : hex;
                };
                return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
              })}
              onChange={(e) => updateTextStyle("backgroundColor", e.target.value)}
              disabled={!selectedTextBoxId}
              className="h-10 cursor-pointer"
            />
            <Select 
              value={currentBgOpacity} 
              onValueChange={(value) => updateTextStyle("bgOpacity", value)}
              disabled={!selectedTextBoxId}
            >
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Opacidade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Transparente</SelectItem>
                <SelectItem value="0.25">25%</SelectItem>
                <SelectItem value="0.5">50%</SelectItem>
                <SelectItem value="0.75">75%</SelectItem>
                <SelectItem value="1">100%</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div>
          <label className="text-sm font-medium">Padding</label>
          <Select 
            value={currentPadding} 
            onValueChange={(value) => updateTextStyle("padding", value)}
            disabled={!selectedTextBoxId}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o padding" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0px">Sem padding</SelectItem>
              <SelectItem value="5px">Pequeno</SelectItem>
              <SelectItem value="10px">Médio</SelectItem>
              <SelectItem value="15px">Grande</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <Button 
        onClick={handleRegenerateTexts}
        className="w-full"
        disabled={isLoading}
      >
        <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
        Gerar Novos Textos
      </Button>
    </div>
  );
};

export default TextEditorPanel;
