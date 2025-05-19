
import { BusinessInfo } from "@/components/BusinessInfoForm";
import { toast } from "sonner";

const UNSPLASH_API_URL = "https://api.unsplash.com/search/photos";
const DEFAULT_ACCESS_KEY = "oFdbSDmB4dckb0NWVq4QTHDPjAg2AVw0BbkjJt6TZpo";

export type UnsplashImage = {
  id: string;
  urls: {
    regular: string;
    small: string;
    thumb: string;
    raw: string;
  };
  alt_description: string;
  user: {
    name: string;
    username: string;
  };
  width: number;
  height: number;
};

interface SearchImagesProps {
  businessInfo: BusinessInfo;
  accessKey?: string;
  perPage?: number;
  searchQuery?: string;
  slideText?: string; 
  carouselDescription?: string;
}

// Mapeamento de segmentos para termos de busca mais relevantes
const industrySearchTerms: Record<string, string[]> = {
  "Moda e Vestuário": ["fashion", "clothing", "apparel", "moda", "roupas", "fashion store"],
  "Alimentos e Bebidas": ["food", "drinks", "restaurant", "café", "alimentos", "gastronomia"],
  "Beleza e Cosmética": ["beauty", "cosmetics", "makeup", "spa", "beleza", "skincare"],
  "Saúde e Bem-estar": ["health", "wellness", "fitness", "healthy", "bem-estar", "lifestyle"],
  "Fitness e Esportes": ["sports", "fitness", "gym", "workout", "training", "atletas"],
  "Tecnologia": ["technology", "tech", "gadgets", "electronics", "digital", "innovation"],
  "Imóveis": ["real estate", "property", "home", "house", "apartment", "imobiliária"],
  "Finanças": ["finance", "banking", "investment", "money", "business", "financial"],
  "Educação": ["education", "school", "learning", "study", "books", "classroom"],
  "Viagem e Turismo": ["travel", "tourism", "vacation", "trip", "journey", "destination"],
  "Hotelaria e Restaurantes": ["hotel", "restaurant", "hospitality", "dining", "food service"],
  "Arte e Cultura": ["art", "culture", "museum", "gallery", "exhibition", "creative"],
  "Entretenimento": ["entertainment", "events", "shows", "concert", "festival", "performance"],
  "Casa e Decoração": ["home decor", "interior design", "furniture", "decoration", "casa"],
  "Serviços Profissionais": ["professional services", "business", "consulting", "office"],
  "Automotivo": ["automotive", "car", "vehicle", "auto shop", "mechanic", "cars", "auto parts", "carros", "oficina", "troca de óleo", "revisão"],
  "Mecânica de veículos": ["auto repair", "car mechanic", "oil change", "troca de óleo", "revisão", "revisão veicular", "oficina mecânica", "manutenção de carros"]
};

// Função para extrair palavras-chave de um texto
function extractKeywords(text: string): string[] {
  if (!text) return [];
  
  // Limpar o texto e separar palavras
  const cleanText = text.replace(/[^\w\sÀ-ÿ]/gi, ' ').toLowerCase();
  const words = cleanText.split(/\s+/);
  
  // Remover palavras comuns (stop words em português)
  const stopWords = ['de', 'a', 'o', 'que', 'e', 'do', 'da', 'em', 'um', 'para', 'é', 'com', 'não', 'uma', 'os', 'no', 'se', 'na', 'por', 'mais', 'as', 'dos', 'como', 'mas', 'foi', 'ao', 'ele', 'das', 'tem', 'à', 'seu', 'sua', 'ou', 'ser', 'quando', 'muito', 'há', 'nos', 'já', 'está', 'eu', 'também', 'só', 'pelo', 'pela', 'até', 'isso', 'ela', 'entre', 'era', 'depois', 'sem', 'mesmo', 'aos', 'ter', 'seus', 'quem', 'nas', 'me', 'esse', 'eles', 'estão', 'você', 'tinha', 'foram', 'essa', 'num', 'nem', 'suas', 'meu', 'às', 'minha', 'têm', 'numa', 'pelos', 'elas', 'havia', 'seja', 'qual', 'será', 'nós'];
  
  // Filtrar palavras relevantes (não stop words e com mais de 3 caracteres)
  return words
    .filter(word => word.length > 3 && !stopWords.includes(word))
    .slice(0, 6); // Limitar para as 6 palavras mais relevantes
}

export async function searchImages({
  businessInfo,
  accessKey = DEFAULT_ACCESS_KEY,
  perPage = 30,
  searchQuery: customQuery,
  slideText,
  carouselDescription,
}: SearchImagesProps): Promise<UnsplashImage[]> {
  if (!accessKey) {
    toast.error("Por favor, forneça uma chave de acesso válida da Unsplash.");
    return [];
  }

  try {
    console.log("Buscando imagens com a chave Unsplash:", accessKey.substring(0, 4) + "...");
    
    // Construir uma query mais relevante baseada nas informações do slide e negócio
    let searchTerms: string[] = [];
    
    // 1. Prioridade máxima: Palavras-chave do texto do slide atual
    if (slideText && slideText.length > 5) {
      const slideKeywords = extractKeywords(slideText);
      if (slideKeywords.length > 0) {
        searchTerms = [...slideKeywords];
      }
    }
    
    // 2. Segunda prioridade: Informações sobre o tema específico baseado no texto
    const themeSpecificTerms: string[] = [];
    
    // Verificar se o contexto é automotivo/mecânico
    const isAutomotiveContext = 
      (businessInfo.industry?.toLowerCase().includes('mecânica') || 
       businessInfo.industry?.toLowerCase().includes('auto')) ||
      (slideText?.toLowerCase().includes('óleo') || 
       slideText?.toLowerCase().includes('revisão') ||
       slideText?.toLowerCase().includes('motor') ||
       slideText?.toLowerCase().includes('carro') ||
       slideText?.toLowerCase().includes('veículo'));
    
    if (isAutomotiveContext) {
      // Adicionar termos específicos baseados no contexto do slide
      if (slideText?.toLowerCase().includes('óleo')) {
        themeSpecificTerms.push('troca de óleo', 'oil change', 'motor oil');
      } else if (slideText?.toLowerCase().includes('revisão')) {
        themeSpecificTerms.push('revisão veicular', 'car maintenance');
      } else if (slideText?.toLowerCase().includes('motor')) {
        themeSpecificTerms.push('motor de carro', 'car engine');
      } else if (slideText?.toLowerCase().includes('segurança')) {
        themeSpecificTerms.push('segurança automotiva', 'car safety');
      } else if (slideText?.toLowerCase().includes('manutenção')) {
        themeSpecificTerms.push('manutenção automotiva', 'car repair');
      } else {
        themeSpecificTerms.push('oficina mecânica', 'auto service');
      }
    }
    
    // Adicionar os termos específicos do tema
    searchTerms = [...searchTerms, ...themeSpecificTerms];
    
    // 3. Terceira prioridade: Descrição do carrossel
    if (carouselDescription && carouselDescription.length > 5) {
      const descKeywords = extractKeywords(carouselDescription)
        .filter(word => !searchTerms.some(term => term.includes(word)));
      
      if (descKeywords.length > 0) {
        searchTerms = [...searchTerms, ...descKeywords.slice(0, 2)];
      }
    }
    
    // 4. Quarta prioridade: Informações do negócio
    if (businessInfo.industry) {
      const industryTerms = industrySearchTerms[businessInfo.industry] || [businessInfo.industry];
      // Adicionar apenas termos que não são redundantes com o que já temos
      const uniqueIndustryTerms = industryTerms
        .filter(term => !searchTerms.some(existingTerm => 
          existingTerm.includes(term) || term.includes(existingTerm)
        ));
      
      searchTerms = [...searchTerms, ...uniqueIndustryTerms.slice(0, 1)];
    }
    
    // 5. Nome do negócio (se não for muito genérico)
    if (businessInfo.businessName && businessInfo.businessName.length > 3 &&
        !searchTerms.some(term => term.includes(businessInfo.businessName))) {
      searchTerms.push(businessInfo.businessName);
    }
    
    // Usar o termo de busca customizado ou construir um com os termos mais relevantes
    let searchQuery = customQuery || searchTerms.join(' ');
    
    // Adicionar termos que melhorem a qualidade visual das imagens
    if (!searchQuery.includes("high quality")) {
      searchQuery += " high quality professional";
    }
    
    console.log("Palavras-chave para busca de imagens:", searchQuery);

    const url = new URL(UNSPLASH_API_URL);
    url.searchParams.append("query", searchQuery);
    url.searchParams.append("per_page", perPage.toString());
    url.searchParams.append("client_id", accessKey);
    url.searchParams.append("orientation", "landscape"); 
    url.searchParams.append("content_filter", "high");
    url.searchParams.append("order_by", "relevant");

    const response = await fetch(url.toString());

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.errors?.[0] || "Erro ao buscar imagens");
    }

    const data = await response.json();
    
    // Verificar se temos resultados antes de retornar
    if (!data.results || data.results.length === 0) {
      // Tentar novamente com uma busca mais genérica se não houver resultados
      if (!customQuery && isAutomotiveContext) {
        console.log("Nenhum resultado encontrado. Tentando busca mais genérica...");
        let fallbackQuery = "car mechanic auto repair professional";
        return searchImages({
          businessInfo,
          accessKey,
          perPage,
          searchQuery: fallbackQuery
        });
      }
      throw new Error("Nenhuma imagem encontrada para a busca");
    }
    
    return data.results;
  } catch (error) {
    console.error("Erro ao buscar imagens:", error);
    toast.error(error instanceof Error ? error.message : "Erro ao buscar imagens");
    return [];
  }
}
