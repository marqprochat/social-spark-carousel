
import { toast } from "sonner";
import { BusinessInfo } from "@/components/BusinessInfoForm";

const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent";
const GROK_API_URL = "https://api.grok.x/v1/chat/completions";

interface GenerateTextProps {
  businessInfo: BusinessInfo;
  apiKey?: string;
  numSlides?: number;
  carouselDescription?: string;
  provider?: string;
  grokKey?: string;
  geminiKey?: string;
}

export async function generateCarouselContent({
  businessInfo,
  apiKey = "",
  numSlides = 5,
  carouselDescription = "",
  provider = "openai",
  grokKey = "",
  geminiKey = ""
}: GenerateTextProps): Promise<string[]> {
  // Prompt base para todos os provedores
  const promptText = `
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

  try {
    // Validar chaves de API com base no provedor selecionado
    let activeKey = "";
    switch (provider) {
      case "openai":
        if (!apiKey) {
          toast.error("Por favor, forneça uma chave API válida da OpenAI.");
          return [];
        }
        activeKey = apiKey;
        break;
      case "grok":
        if (!grokKey) {
          toast.error("Por favor, forneça uma chave API válida do Grok.");
          return [];
        }
        activeKey = grokKey;
        break;
      case "gemini":
        if (!geminiKey) {
          toast.error("Por favor, forneça uma chave API válida do Gemini.");
          return [];
        }
        activeKey = geminiKey;
        break;
      default:
        toast.error("Provedor de IA não reconhecido.");
        return [];
    }

    console.log(`Usando provedor: ${provider}`);

    let content = "";

    switch (provider) {
      case "openai":
        content = await generateWithOpenAI(promptText, activeKey);
        break;
      case "grok":
        content = await generateWithGrok(promptText, activeKey);
        break;
      case "gemini":
        content = await generateWithGemini(promptText, activeKey);
        break;
      default:
        throw new Error(`Provedor não suportado: ${provider}`);
    }

    if (!content) {
      throw new Error("Nenhum conteúdo foi gerado pela API");
    }

    // Extrair os textos numerados do formato de lista
    return extractTextFromContent(content);
    
  } catch (error) {
    console.error("Erro ao gerar textos:", error);
    toast.error(error instanceof Error 
      ? error.message 
      : "Falha na conexão com a API. Verifique sua chave e conexão.");
    return [];
  }
}

async function generateWithOpenAI(prompt: string, apiKey: string): Promise<string> {
  const response = await fetch(OPENAI_API_URL, {
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

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    handleApiError(response, errorData);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || "";
}

async function generateWithGrok(prompt: string, apiKey: string): Promise<string> {
  const response = await fetch(GROK_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "grok-1",
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

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    handleApiError(response, errorData);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || "";
}

async function generateWithGemini(prompt: string, apiKey: string): Promise<string> {
  const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              text: prompt
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1000,
      },
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    handleApiError(response, errorData);
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
}

function handleApiError(response: Response, errorData: any = null): never {
  let errorMessage = `Erro HTTP: ${response.status}`;

  if (errorData && errorData.error) {
    console.error("Erro da API:", errorData);
    
    // Mensagens de erro específicas para problemas comuns
    if (errorData.error.code === "invalid_api_key") {
      errorMessage = "Chave de API inválida. Verifique se você inseriu corretamente.";
    } else if (errorData.error.code === "insufficient_quota") {
      errorMessage = "Sua conta não tem créditos suficientes. Verifique seu saldo.";
    } else if (errorData.error.type === "invalid_request_error") {
      errorMessage = `Erro de solicitação: ${errorData.error.message}`;
    } else {
      errorMessage = errorData.error.message || errorMessage;
    }
  }

  throw new Error(errorMessage);
}

function extractTextFromContent(content: string): string[] {
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
}
