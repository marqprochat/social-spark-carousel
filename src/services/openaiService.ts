
import { toast } from "@/components/ui/use-toast";
import { BusinessInfo } from "@/components/BusinessInfoForm";

const API_URL = "https://api.openai.com/v1/chat/completions";

interface GenerateTextProps {
  businessInfo: BusinessInfo;
  apiKey: string;
  numSlides?: number;
}

export async function generateCarouselContent({
  businessInfo,
  apiKey,
  numSlides = 5
}: GenerateTextProps): Promise<string[]> {
  // Validar API key
  if (!apiKey) {
    toast({
      title: "API Key Necessária",
      description: "Por favor, forneça uma chave API válida da OpenAI.",
      variant: "destructive",
    });
    return [];
  }

  try {
    const prompt = `
      Crie ${numSlides} textos curtos e impactantes para um carrossel de posts no Instagram para um negócio com as seguintes características:
      
      Nome do negócio: ${businessInfo.businessName}
      Segmento: ${businessInfo.industry}
      Público-alvo: ${businessInfo.targetAudience}
      Objetivo: ${businessInfo.postObjective}
      Tom de comunicação: ${businessInfo.tone}
      ${businessInfo.additionalInfo ? `Informações adicionais: ${businessInfo.additionalInfo}` : ''}
      
      Cada texto deve ter no máximo 200 caracteres, ser direto e adequado para um slide único. 
      Formate cada texto como um item em uma lista, numerado de 1 a ${numSlides}.
      Não inclua títulos ou introduções, apenas os textos numerados para cada slide.
    `;

    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || "Erro ao gerar textos");
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      throw new Error("Nenhum conteúdo gerado");
    }

    // Extrair os textos numerados do formato de lista
    const textArray: string[] = [];
    const regex = /\d+\.\s*(.*?)(?=\d+\.|\n\d+\.|\n\n|$)/gs;
    let match;

    while ((match = regex.exec(content)) !== null) {
      if (match[1].trim()) {
        textArray.push(match[1].trim());
      }
    }

    // Se não conseguimos extrair com regex, divide por linhas
    if (textArray.length === 0) {
      return content.split("\n")
        .map(line => line.replace(/^\d+\.\s*/, "").trim())
        .filter(line => line.length > 0);
    }

    return textArray;
  } catch (error) {
    console.error("Erro ao gerar textos:", error);
    toast({
      title: "Erro",
      description: error instanceof Error ? error.message : "Erro ao gerar textos",
      variant: "destructive",
    });
    return [];
  }
}
