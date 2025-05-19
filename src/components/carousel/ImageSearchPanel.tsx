
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
  slideText?: string;
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

      // Gerar termos de busca com foco em "troca de óleo" e "revisão" se for esse o tema
      let searchSuggestion = "";
      
      // Verificar se é sobre troca de óleo ou revisão de veículos
      const isAboutOilChange = carouselDescription?.toLowerCase().includes("troca de óleo") || 
                               carouselDescription?.toLowerCase().includes("revisão") ||
                               businessInfo.industry?.toLowerCase().includes("mecânica");

      if (slideText) {
        // Se temos texto do slide, combiná-lo com descrição do carrossel e dados da empresa
        const slideKeywords = slideText.substring(0, 60);
        
        searchSuggestion = `${slideKeywords} ${carouselDescription?.substring(0, 40) || ""} ${context.businessName} ${context.industry}`;
        
        // Adicionar termos específicos se for sobre troca de óleo
        if (isAboutOilChange) {
          searchSuggestion += " troca de óleo oficina mecânica revisão automotiva";
        }
      } else if (carouselDescription) {
        // Se temos descrição do carrossel mas não texto específico
        searchSuggestion = `${context.businessName} ${carouselDescription.substring(0, 80)} ${context.industry}`;
        
        // Adicionar termos específicos se for sobre troca de óleo
        if (isAboutOilChange) {
          searchSuggestion += " troca de óleo oficina mecânica revisão automotiva";
        }
      } else {
        // Caso contrário use contexto geral do negócio
        searchSuggestion = `${context.businessName} ${context.industry} ${context.objective || ""} ${context.tone || ""}`;
        
        // Adicionar termos específicos se for sobre troca de óleo
        if (isAboutOilChange) {
          searchSuggestion += " troca de óleo oficina mecânica revisão automotiva";
        }
      }
      
      // Adicionar "high quality" para melhorar qualidade das imagens
      searchSuggestion += " high quality professional";
      
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
  }, [businessInfo, slideText, carouselDescription]);

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
