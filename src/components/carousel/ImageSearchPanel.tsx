
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, Search } from "lucide-react";
import { toast } from "sonner";

interface ImageSearchPanelProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  handleSearchImages: () => void;
  isLoading: boolean;
  businessInfo?: any;
  carouselDescription?: string;
  slideText?: string; // Added to connect images with text
}

const ImageSearchPanel: React.FC<ImageSearchPanelProps> = ({
  searchTerm,
  setSearchTerm,
  handleSearchImages,
  isLoading,
  businessInfo,
  carouselDescription,
  slideText
}) => {
  const [aiSuggestion, setAiSuggestion] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);

  const generateAISearchTerm = async () => {
    if (!businessInfo) {
      toast.error("Informações da empresa não disponíveis");
      return;
    }

    setIsGenerating(true);
    try {
      // Combine all relevant information for better context
      const context = {
        businessName: businessInfo.businessName || "",
        industry: businessInfo.industry || "",
        targetAudience: businessInfo.targetAudience || "",
        objective: businessInfo.postObjective || "",
        tone: businessInfo.tone || "",
        additionalInfo: businessInfo.additionalInfo || "",
        carouselDescription: carouselDescription || "",
        slideText: slideText || "" 
      };

      // Generate a more targeted search term based on all context
      let searchSuggestion = "";
      
      if (slideText) {
        // Se temos texto do slide, combiná-lo com descrição do carrossel e dados da empresa
        const slideKeywords = slideText.substring(0, 60);
        const descriptionKeywords = carouselDescription ? 
          carouselDescription.substring(0, 30) : "";
        
        searchSuggestion = `${context.businessName} ${context.industry} ${descriptionKeywords} ${slideKeywords} high quality professional images`;
      } else if (carouselDescription) {
        // Se temos descrição do carrossel mas não texto específico
        searchSuggestion = `${context.businessName} ${context.industry} ${carouselDescription.substring(0, 80)} professional high quality marketing images`;
      } else {
        // Caso contrário use contexto geral do negócio
        searchSuggestion = `${context.businessName} ${context.industry} ${context.objective} ${context.tone} professional high quality marketing images for ${context.targetAudience}`.trim();
      }
      
      setAiSuggestion(searchSuggestion);
      setSearchTerm(searchSuggestion);
      
      // Automatically search after setting the term
      setTimeout(() => {
        handleSearchImages();
      }, 300);
      
      toast.success("Termo de busca gerado com IA");
    } catch (error) {
      console.error("Erro ao gerar termo de busca:", error);
      toast.error("Erro ao gerar termo de busca com IA");
    } finally {
      setIsGenerating(false);
    }
  };

  // Automatically generate search term when component loads if business info is available
  useEffect(() => {
    if (businessInfo && !searchTerm && !aiSuggestion) {
      generateAISearchTerm();
    }
  }, [businessInfo, slideText, carouselDescription]); // Added carouselDescription dependency

  return (
    <div className="space-y-2">
      <div className="flex space-x-2">
        <Input
          type="text"
          placeholder="Buscar imagens..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1"
        />
        <Button onClick={handleSearchImages} disabled={isLoading} variant="outline">
          <Search className="h-4 w-4 mr-2" />
          Buscar
        </Button>
        <Button 
          onClick={generateAISearchTerm} 
          disabled={isLoading || isGenerating}
          variant="default"
          className="whitespace-nowrap"
        >
          <Sparkles className="h-4 w-4 mr-2" />
          Sugestão IA
        </Button>
      </div>
      {aiSuggestion && (
        <p className="text-xs text-muted-foreground">
          Sugestão gerada: <span className="font-medium">{aiSuggestion}</span>
        </p>
      )}
    </div>
  );
};

export default ImageSearchPanel;
