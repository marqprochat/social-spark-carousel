
import { BusinessInfo } from "@/components/BusinessInfoForm";
import { toast } from "@/components/ui/use-toast";

const UNSPLASH_API_URL = "https://api.unsplash.com/search/photos";
const DEFAULT_ACCESS_KEY = "oFdbSDmB4dckb0NWVq4QTHDPjAg2AVw0BbkjJt6TZpo";

export type UnsplashImage = {
  id: string;
  urls: {
    regular: string;
    small: string;
  };
  alt_description: string;
  user: {
    name: string;
    username: string;
  };
};

interface SearchImagesProps {
  businessInfo: BusinessInfo;
  accessKey?: string;
  perPage?: number;
}

export async function searchImages({
  businessInfo,
  accessKey = DEFAULT_ACCESS_KEY,
  perPage = 20,
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
    
    // Construa uma query que combine vários aspectos do negócio
    const searchQuery = `${businessInfo.industry} ${businessInfo.postObjective.replace(
      /[^\w\s]/g,
      ""
    )}`.toLowerCase();

    const url = new URL(UNSPLASH_API_URL);
    url.searchParams.append("query", searchQuery);
    url.searchParams.append("per_page", perPage.toString());
    url.searchParams.append("client_id", accessKey);
    url.searchParams.append("orientation", "landscape"); // Mudando para um valor válido: landscape, portrait, ou squarish

    console.log("URL de busca:", url.toString());

    const response = await fetch(url.toString());

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.errors?.[0] || "Erro ao buscar imagens");
    }

    const data = await response.json();
    
    // Verificar se temos resultados antes de retornar
    if (!data.results || data.results.length === 0) {
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
