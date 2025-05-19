
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
    
    // Construir uma query mais relevante baseada nas informações do negócio
    let searchTerms: string[] = [];
    
    // Primeiro, considere o texto específico do slide como a fonte mais importante
    if (slideText && slideText.length > 5) {
      // Extrair todas as palavras da descrição, priorizando termos técnicos
      const slideKeywords = slideText
        .split(/[\s,.]+/)
        .filter(word => word.length > 3)
        .slice(0, 5); // Pegar palavras-chave do slide
      
      if (slideKeywords.length > 0) {
        searchTerms = [...slideKeywords];
      }
    }
    
    // Em seguida, considere a descrição do carrossel
    if (carouselDescription && carouselDescription.length > 5) {
      // Extrair palavras-chave da descrição
      const descKeywords = carouselDescription
        .split(/[\s,.]+/)
        .filter(word => word.length > 3 && !searchTerms.includes(word))
        .slice(0, 3); // Limitar para não ter muitas palavras
      
      if (descKeywords.length > 0) {
        searchTerms = [...searchTerms, ...descKeywords];
      }
    }
    
    // Adicionar termos específicos para o segmento do negócio (foco automotivo/mecânica)
    if (businessInfo.industry) {
      const industryTerms = industrySearchTerms[businessInfo.industry] || [businessInfo.industry];
      searchTerms = [...searchTerms, ...industryTerms.slice(0, 2)];
    }
    
    // Adicionar nome do negócio se não for muito genérico
    if (businessInfo.businessName && businessInfo.businessName.length > 3) {
      searchTerms.push(businessInfo.businessName);
    }
    
    // Usar o termo de busca customizado se fornecido, ou construir um com os termos mais relevantes
    let searchQuery = customQuery || searchTerms.join(' ');
    
    // Adicionar termos específicos de "oficina mecânica" e "troca de óleo" se for sobre esse tema
    if ((carouselDescription?.toLowerCase().includes("troca de óleo") || 
        carouselDescription?.toLowerCase().includes("revisão") ||
        businessInfo.industry?.toLowerCase().includes("mecânica")) && 
        !searchQuery.toLowerCase().includes("óleo")) {
      
      // Verificar o contexto do slide atual para adicionar termos específicos
      if (slideText?.toLowerCase().includes("óleo")) {
        searchQuery += " troca de óleo lubrificante motor oficina";
      } else if (slideText?.toLowerCase().includes("revisão")) {
        searchQuery += " revisão veicular oficina mecânica";
      } else if (slideText?.toLowerCase().includes("motor")) {
        searchQuery += " motor veicular oficina mecânica";
      } else if (slideText?.toLowerCase().includes("segurança")) {
        searchQuery += " segurança automotiva mecânica";
      } else {
        searchQuery += " troca de óleo oficina mecânica";
      }
    }
    
    // Adicionar termos que melhorem a qualidade visual das imagens
    searchQuery += " high quality professional";
    
    console.log("Termo de busca final:", searchQuery);

    const url = new URL(UNSPLASH_API_URL);
    url.searchParams.append("query", searchQuery);
    url.searchParams.append("per_page", perPage.toString());
    url.searchParams.append("client_id", accessKey);
    url.searchParams.append("orientation", "landscape"); 
    url.searchParams.append("content_filter", "high");
    url.searchParams.append("order_by", "relevant");

    console.log("URL de busca:", url.toString());

    const response = await fetch(url.toString());

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.errors?.[0] || "Erro ao buscar imagens");
    }

    const data = await response.json();
    
    // Verificar se temos resultados antes de retornar
    if (!data.results || data.results.length === 0) {
      // Tentar novamente com uma busca mais genérica se não houver resultados
      if (!customQuery) {
        console.log("Nenhum resultado encontrado. Tentando busca mais genérica...");
        let fallbackQuery = "car mechanic oil change auto repair";
        if (businessInfo.industry) {
          fallbackQuery += ` ${businessInfo.industry}`;
        }
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
