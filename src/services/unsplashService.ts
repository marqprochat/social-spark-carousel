
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

// Função para obter temas relacionados ao texto do slide
function getThemeSpecificTerms(slideText: string): string[] {
  if (!slideText) return [];
  
  const cleanText = slideText.toLowerCase();
  const themes = [];
  
  // Detectar temas específicos no texto do slide
  if (cleanText.includes('férias')) themes.push('férias', 'viagem', 'vacation');
  if (cleanText.includes('segurança')) themes.push('segurança veicular', 'vehicle safety');
  if (cleanText.includes('família')) themes.push('família', 'family car');
  if (cleanText.includes('economia')) themes.push('economia', 'savings');
  if (cleanText.includes('preocupações')) themes.push('tranquilidade', 'peace of mind');
  if (cleanText.includes('revisão')) themes.push('revisão de carro', 'vehicle inspection');
  if (cleanText.includes('revisão prévia')) themes.push('checklist de viagem', 'car trip preparation');
  if (cleanText.includes('manutenção')) themes.push('manutenção de carro', 'car maintenance');
  if (cleanText.includes('óleo')) themes.push('troca de óleo', 'oil change');
  if (cleanText.includes('motor')) themes.push('motor de carro', 'car engine');
  if (cleanText.includes('preço') || cleanText.includes('justo')) themes.push('preço justo', 'fair price');
  if (cleanText.includes('qualidade')) themes.push('serviço de qualidade', 'quality service');
  if (cleanText.includes('garantida')) themes.push('garantia mecânica', 'warranty');
  if (cleanText.includes('agende')) themes.push('agendamento de serviço', 'service appointment');
  if (cleanText.includes('cuidado')) themes.push('cuidados com o carro', 'car care');
  
  // Adicionar um modificador visual para variar as imagens
  const visualModifiers = [
    'realistic photo', 
    'professional photography',
    'high quality image',
    'colorful image',
    'clear background'
  ];
  
  // Selecionar um modificador aleatório para evitar imagens similares
  const randomModifier = visualModifiers[Math.floor(Math.random() * visualModifiers.length)];
  themes.push(randomModifier);
  
  return themes;
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
    
    // 1. Usar a query personalizada se fornecida
    if (customQuery) {
      console.log("Usando query personalizada para busca de imagens:", customQuery);
      
      // Adicionar um identificador único para evitar resultados semelhantes
      const timestamp = new Date().getTime();
      const randomSeed = Math.floor(Math.random() * 1000);
      const uniqueQuery = `${customQuery} ${timestamp % 5}${randomSeed % 10}`;
      
      const url = new URL(UNSPLASH_API_URL);
      url.searchParams.append("query", uniqueQuery);
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
      
      if (!data.results || data.results.length === 0) {
        throw new Error("Nenhuma imagem encontrada para a busca");
      }
      
      return data.results;
    }
    
    // 2. Criar query baseada no texto do slide atual
    if (slideText) {
      // Extrair palavras-chave do texto do slide
      const slideKeywords = extractKeywords(slideText);
      
      // Obter temas específicos relacionados ao conteúdo
      const themeTerms = getThemeSpecificTerms(slideText);
      
      // Adicionar termos da indústria (com foco em mecânica de veículos)
      const industryTerms = industrySearchTerms[businessInfo.industry] || 
                           ["car mechanic", "auto repair", "vehicle service"];
      
      // Combinar tudo numa única query, priorizando o tema específico
      const combinedQuery = [
        ...themeTerms.slice(0, 3), 
        ...slideKeywords.slice(0, 3),
        ...industryTerms.slice(0, 1)
      ].join(' ');
      
      // Adicionar um número aleatório para evitar resultados repetidos
      const randomSuffix = Math.floor(Math.random() * 1000);
      const finalQuery = `${combinedQuery} ${randomSuffix % 10}`;
      
      console.log("Query final para busca de imagens:", finalQuery);
      
      const url = new URL(UNSPLASH_API_URL);
      url.searchParams.append("query", finalQuery);
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
      
      if (!data.results || data.results.length === 0) {
        // Tentar uma busca mais genérica como fallback
        console.log("Nenhum resultado. Tentando busca genérica para a indústria...");
        return searchImages({
          businessInfo,
          accessKey,
          perPage,
          searchQuery: `${businessInfo.industry} vehicle service ${Math.random().toString().slice(2, 5)}`
        });
      }
      
      return data.results;
    }
    
    // 3. Fallback: usar descrição do carrossel ou informações do negócio
    const fallbackQuery = carouselDescription || 
                         `${businessInfo.industry} ${businessInfo.businessName} vehicle service`;
    
    return searchImages({
      businessInfo,
      accessKey,
      perPage,
      searchQuery: fallbackQuery
    });
    
  } catch (error) {
    console.error("Erro ao buscar imagens:", error);
    toast.error(error instanceof Error ? error.message : "Erro ao buscar imagens");
    return [];
  }
}
