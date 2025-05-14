
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
}

const ImageSearchPanel: React.FC<ImageSearchPanelProps> = ({
  searchTerm,
  setSearchTerm,
  handleSearchImages,
  isLoading,
  businessInfo,
  carouselDescription
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
        carouselDescription: carouselDescription || ""
      };

      // Generate a high-quality search term based on the business context
      const searchSuggestion = `${context.businessName} ${context.industry} ${context.objective} ${context.tone} ${context.carouselDescription}`.trim();
      
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
