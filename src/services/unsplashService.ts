
import { BusinessInfo } from "@/components/BusinessInfoForm";
import { toast } from "@/components/ui/use-toast";

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
}

export async function searchImages({
  businessInfo,
  accessKey = DEFAULT_ACCESS_KEY,
  perPage = 30,
  searchQuery: customQuery,
}: SearchImagesProps): Promise<UnsplashImage[]> {
  if (!accessKey) {
    toast({
      title: "Access Key Necessária",
      description: "Por favor, forneça uma chave de acesso válida da Unsplash.",
      variant: "destructive",
    });
    return [];
  }

  try {
    console.log("Buscando imagens com a chave Unsplash:", accessKey.substring(0, 4) + "...");
    
    // Construir uma query mais relevante baseada nas informações do negócio
    const searchQuery = customQuery || 
      `${businessInfo.businessName} ${businessInfo.industry} ${businessInfo.targetAudience} ${businessInfo.postObjective}`
        .toLowerCase()
        .replace(/[^\w\s]/g, " ")
        .trim();

    console.log("Termo de busca:", searchQuery);

    const url = new URL(UNSPLASH_API_URL);
    url.searchParams.append("query", searchQuery);
    url.searchParams.append("per_page", perPage.toString());
    url.searchParams.append("client_id", accessKey);
    url.searchParams.append("orientation", "landscape"); 
    url.searchParams.append("content_filter", "high"); // Filtrar por conteúdo de alta qualidade

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
        return searchImages({
          businessInfo,
          accessKey,
          perPage,
          searchQuery: businessInfo.industry
        });
      }
      throw new Error("Nenhuma imagem encontrada para a busca");
    }
    
    return data.results;
  } catch (error) {
    console.error("Erro ao buscar imagens:", error);
    toast({
      title: "Erro",
      description: error instanceof Error ? error.message : "Erro ao buscar imagens",
      variant: "destructive",
    });
    return [];
  }
}
