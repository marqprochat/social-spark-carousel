

import { toast } from "sonner";
import { BusinessInfo } from "@/components/BusinessInfoForm";

const API_URL = "https://api.openai.com/v1/chat/completions";
const DEFAULT_API_KEY = "sk-proj-A7hlYKaOW4EzUkDMurLwDobCbpL_zrIPX-hQc7yOHcKU_vnqBO3PjRPxpgnULP0eDrqecvSFH1x6BZPIVKELUF38guol8tlL5LfVLYuC1RygA";

interface GenerateTextProps {
  businessInfo: BusinessInfo;
  apiKey?: string;
  numSlides?: number;
  carouselDescription?: string; // Nova propriedade para descrição do carrossel
}

export async function generateCarouselContent({
  businessInfo,
  apiKey = DEFAULT_API_KEY,
  numSlides = 5,
  carouselDescription = ""
}: GenerateTextProps): Promise<string[]> {
  // Validar API key
  if (!apiKey) {
    toast.error("Por favor, forneça uma chave API válida da OpenAI.");
    return [];
  }

  try {
    const prompt = `
      Crie ${numSlides} textos curtos e impactantes para um carrossel de posts no Instagram para um negócio com as seguintes características:
      
      Nome do negócio: ${businessInfo.businessName}
      Segmento: ${businessInfo.industry}
      ${businessInfo.targetAudience ? `Público-alvo: ${businessInfo.targetAudience}` : ''}
      ${businessInfo.postObjective ? `Objetivo: ${businessInfo.postObjective}` : ''}
      ${businessInfo.tone ? `Tom de comunicação: ${businessInfo.tone}` : ''}
      ${carouselDescription ? `Descrição do carrossel: ${carouselDescription}` : ''}
      ${businessInfo.additionalInfo ? `Informações adicionais: ${businessInfo.additionalInfo}` : ''}
      
      Os textos devem ser:
      1. Específicos e relevantes para o segmento do negócio
      2. Diretos e impactantes, com no máximo 200 caracteres
      ${businessInfo.targetAudience ? '3. Direcionados especificamente ao público-alvo mencionado' : ''}
      ${businessInfo.postObjective ? '4. Focados no objetivo de marketing informado' : ''}
      ${businessInfo.tone ? '5. Adequados ao tom de comunicação solicitado' : ''}
      ${carouselDescription ? '6. MUITO importantes: alinhados com a descrição do carrossel fornecida pelo usuário' : ''}
      
      IMPORTANTE: Cada texto deve ter no máximo 200 caracteres, ser direto e adequado para um slide único. 
      Formate cada texto como um item em uma lista, numerado de 1 a ${numSlides}.
      Não inclua títulos, hashtags ou introduções, apenas os textos numerados para cada slide.
      
      LEMBRE-SE: Se uma descrição do carrossel foi fornecida, esta é a informação MAIS IMPORTANTE para guiar o conteúdo dos textos.
    `;

    console.log("Enviando requisição para OpenAI com prompt refinado", { 
      businessInfo, 
      carouselDescription 
    });

    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "Você é um especialista em marketing digital e copywriting para redes sociais. Crie conteúdo direto, conciso e altamente relevante para a audiência-alvo."
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    // Tratar erros de resposta HTTP
    if (!response.ok) {
      let errorMessage = `Erro HTTP: ${response.status}`;

      try {
        const errorData = await response.json();
        console.error("Erro da API OpenAI:", errorData);
        
        if (errorData.error) {
          // Mensagens de erro específicas para problemas comuns
          if (errorData.error.code === "invalid_api_key") {
            errorMessage = "Chave de API inválida. Verifique se você inseriu corretamente.";
          } else if (errorData.error.code === "insufficient_quota") {
            errorMessage = "Sua conta OpenAI não tem créditos suficientes. Verifique seu saldo.";
          } else if (errorData.error.type === "invalid_request_error") {
            errorMessage = `Erro de solicitação: ${errorData.error.message}`;
          } else {
            errorMessage = errorData.error.message || errorMessage;
          }
        }
      } catch (e) {
        console.error("Erro ao processar resposta de erro:", e);
      }

      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log("Resposta da OpenAI recebida");
    
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("Nenhum conteúdo foi gerado pela API");
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
      const lines = content.split("\n")
        .map(line => line.replace(/^\d+\.\s*/, "").trim())
        .filter(line => line.length > 0);
        
      if (lines.length > 0) {
        return lines;
      } else {
        // Último recurso: simplesmente retorna o conteúdo como um único texto
        return [content.trim()];
      }
    }

    return textArray;
  } catch (error) {
    console.error("Erro ao gerar textos:", error);
    toast.error(error instanceof Error 
      ? error.message 
      : "Falha na conexão com a API da OpenAI. Verifique sua chave de API e conexão.");
    return [];
  }
}

