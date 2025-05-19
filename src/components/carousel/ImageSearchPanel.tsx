
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
    if (!slideText) {
      toast.error("Texto do slide não disponível");
      return;
    }

    setIsGenerating(true);
    try {
      // Extração de palavras-chave do texto do slide
      const cleanText = slideText.replace(/[^\w\sÀ-ÿ]/gi, ' ').toLowerCase();
      const words = cleanText.split(/\s+/);
      
      // Remover palavras comuns (stop words em português)
      const stopWords = ['de', 'a', 'o', 'que', 'e', 'do', 'da', 'em', 'um', 'para', 'é', 'com', 'não', 'uma', 'os', 'no', 'se', 'na', 'por', 'mais', 'as', 'dos', 'como', 'mas', 'foi', 'ao', 'ele', 'das', 'tem', 'à', 'seu', 'sua', 'ou', 'ser', 'quando', 'muito', 'há', 'nos', 'já', 'está', 'eu', 'também', 'só', 'pelo', 'pela', 'até', 'isso', 'ela', 'entre', 'era', 'depois', 'sem', 'mesmo', 'aos', 'ter', 'seus', 'quem', 'nas', 'me', 'esse', 'eles', 'estão', 'você', 'tinha', 'foram', 'essa', 'num', 'nem', 'suas', 'meu', 'às', 'minha', 'têm', 'numa', 'pelos', 'elas', 'havia', 'seja', 'qual', 'será', 'nós'];
      
      // Filtrar palavras relevantes (não stop words e com mais de 3 caracteres)
      const keyWords = words
        .filter(word => word.length > 3 && !stopWords.includes(word))
        .slice(0, 5); // Pegar até 5 palavras-chave
      
      // Adicionar contexto específico de negócio
      let contextTerms = [];
      
      if (businessInfo?.industry) {
        // Detectar se é sobre mecânica/troca de óleo
        if (businessInfo.industry.toLowerCase().includes('mecânica') || 
            businessInfo.industry.toLowerCase().includes('auto') ||
            slideText.toLowerCase().includes('óleo') ||
            slideText.toLowerCase().includes('motor') ||
            slideText.toLowerCase().includes('revisão') ||
            slideText.toLowerCase().includes('veículo') ||
            slideText.toLowerCase().includes('manutenção')) {
          
          // Adicionar termos específicos baseados no contexto do slide
          if (slideText.toLowerCase().includes('óleo')) {
            contextTerms.push('troca de óleo', 'oil change', 'motor oil', 'lubrificante');
          } else if (slideText.toLowerCase().includes('revisão')) {
            contextTerms.push('revisão veicular', 'car maintenance', 'check-up');
          } else if (slideText.toLowerCase().includes('motor')) {
            contextTerms.push('motor de carro', 'engine maintenance', 'car engine');
          } else if (slideText.toLowerCase().includes('segurança')) {
            contextTerms.push('segurança automotiva', 'car safety', 'car inspection');
          } else {
            contextTerms.push('oficina mecânica', 'car repair', 'auto service');
          }
        }
      }
      
      // Combinar palavras-chave do texto + contexto + termos gerais de qualidade
      const searchKeywords = [
        ...keyWords, 
        ...contextTerms,
        businessInfo?.businessName || "",
        "professional", 
        "high quality"
      ].filter(Boolean).join(' ');
      
      setAiSuggestion(searchKeywords);
      setSearchTerm(searchKeywords);
      
      // Pesquisar automaticamente após definir os termos
      setTimeout(() => {
        handleSearchImages();
      }, 300);
      
      toast.success("Palavras-chave geradas com base no texto do slide");
    } catch (error) {
      console.error("Erro ao gerar termo de busca:", error);
      toast.error("Erro ao gerar palavras-chave");
    } finally {
      setIsGenerating(false);
    }
  };

  // Gerar termo de busca automaticamente quando o texto do slide mudar
  useEffect(() => {
    if (slideText && !searchTerm) {
      generateAISearchTerm();
    }
  }, [slideText]);

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
          disabled={isLoading || isGenerating || !slideText}
          variant="default"
          className="whitespace-nowrap"
        >
          <Sparkles className="h-4 w-4 mr-2" />
          Palavras-chave
        </Button>
      </div>
      {aiSuggestion && (
        <p className="text-xs text-muted-foreground">
          Palavras-chave: <span className="font-medium">{aiSuggestion}</span>
        </p>
      )}
    </div>
  );
};

export default ImageSearchPanel;
