import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sparkles, Search } from "lucide-react"
import { toast } from "sonner"
import { BusinessInfo } from "@/components/BusinessInfoForm"

interface ImageSearchPanelProps {
  searchTerm: string
  setSearchTerm: (term: string) => void
  handleSearchImages: () => void
  isLoading: boolean
  businessInfo?: BusinessInfo
  carouselDescription?: string
  slideText?: string
}

const ImageSearchPanel: React.FC<ImageSearchPanelProps> = ({
  searchTerm,
  setSearchTerm,
  handleSearchImages,
  isLoading,
  businessInfo,
  carouselDescription,
  slideText,
}) => {
  const [aiSuggestion, setAiSuggestion] = useState<string>("")
  const [isGenerating, setIsGenerating] = useState(false)

  const generateAISearchTerm = async () => {
    if (!slideText) {
      toast.error("Texto do slide não disponível")
      return
    }

    setIsGenerating(true)
    try {
      // Limpar o texto e separar palavras
      const cleanText = slideText.replace(/[^\w\sÀ-ÿ]/gi, " ").toLowerCase()
      const words = cleanText.split(/\s+/)

      // Remover palavras comuns (stop words em português)
      const stopWords = [
        "de",
        "a",
        "o",
        "que",
        "e",
        "do",
        "da",
        "em",
        "um",
        "para",
        "é",
        "com",
        "não",
        "uma",
        "os",
        "no",
        "se",
        "na",
        "por",
        "mais",
        "as",
        "dos",
        "como",
        "mas",
        "foi",
        "ao",
        "ele",
        "das",
        "tem",
        "à",
        "seu",
        "sua",
        "ou",
        "ser",
        "quando",
        "muito",
        "há",
        "nos",
        "já",
        "está",
        "eu",
        "também",
        "só",
        "pelo",
        "pela",
        "até",
        "isso",
        "ela",
        "entre",
        "era",
        "depois",
        "sem",
        "mesmo",
        "aos",
        "ter",
        "seus",
        "quem",
        "nas",
        "me",
        "esse",
        "eles",
        "estão",
        "você",
        "tinha",
        "foram",
        "essa",
        "num",
        "nem",
        "suas",
        "meu",
        "às",
        "minha",
        "têm",
        "numa",
        "pelos",
        "elas",
        "havia",
        "seja",
        "qual",
        "será",
        "nós",
      ]

      // Filtrar palavras relevantes (não stop words e com mais de 3 caracteres)
      const keyWords = words.filter((word) => word.length > 3 && !stopWords.includes(word)).slice(0, 5) // Pegar até 5 palavras-chave

      // Extrair temas específicos do slide
      const themes = []

      // Verificar temas específicos no texto do slide
      if (cleanText.includes("férias")) themes.push("férias", "viagem", "vacation")
      if (cleanText.includes("segurança")) themes.push("segurança veicular", "vehicle safety")
      if (cleanText.includes("família")) themes.push("família", "family car")
      if (cleanText.includes("economia")) themes.push("economia", "savings")
      if (cleanText.includes("preocupações")) themes.push("tranquilidade", "peace of mind")
      if (cleanText.includes("revisão")) themes.push("revisão de carro", "vehicle inspection")
      if (cleanText.includes("revisão prévia")) themes.push("checklist de viagem", "car trip preparation")
      if (cleanText.includes("manutenção")) themes.push("manutenção de carro", "car maintenance")
      if (cleanText.includes("óleo")) themes.push("troca de óleo", "oil change")
      if (cleanText.includes("motor")) themes.push("motor de carro", "car engine")
      if (cleanText.includes("preço") || cleanText.includes("justo")) themes.push("preço justo", "fair price")
      if (cleanText.includes("qualidade")) themes.push("serviço de qualidade", "quality service")
      if (cleanText.includes("garantida")) themes.push("garantia mecânica", "warranty")
      if (cleanText.includes("agende")) themes.push("agendamento de serviço", "service appointment")
      if (cleanText.includes("cuidado")) themes.push("cuidados com o carro", "car care")

      // Se não encontramos temas específicos, usar contexto geral de oficina mecânica
      if (themes.length === 0) {
        const generalThemes = ["oficina mecânica", "auto repair shop", "car service"]
        themes.push(...generalThemes)
      }

      // Adicionar um modificador visual relacionado ao tipo de imagem que queremos
      const imageTypes = ["professional photo", "clean background", "colorful", "realistic image", "high quality photo"]
      const randomImageType = imageTypes[Math.floor(Math.random() * imageTypes.length)]

      // Adicionar um número aleatório para evitar resultados repetidos
      const randomSuffix = Math.floor(Math.random() * 10000)

      // Combinar palavras-chave + temas específicos + tipo de imagem + contexto da empresa
      const searchKeywords = [
        ...keyWords.slice(0, 3),
        ...themes.slice(0, 2), // Limitar a 2 temas para não sobrecarregar
        randomImageType,
        businessInfo?.industry || "auto repair",
        `${randomSuffix % 100}`,
      ]
        .filter(Boolean)
        .join(" ")

      console.log("Termos de busca gerados para o slide:", searchKeywords)

      setAiSuggestion(searchKeywords)
      setSearchTerm(searchKeywords)

      // Pesquisar automaticamente após definir os termos
      setTimeout(() => {
        handleSearchImages()
      }, 300)

      toast.success("Palavras-chave geradas com base no texto do slide")
    } catch (error) {
      console.error("Erro ao gerar termo de busca:", error)
      toast.error("Erro ao gerar palavras-chave")
    } finally {
      setIsGenerating(false)
    }
  }

  // Gerar termo de busca automaticamente quando o texto do slide mudar
  useEffect(() => {
    if (slideText && !searchTerm) {
      generateAISearchTerm()
    }
  }, [slideText])

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
  )
}

export default ImageSearchPanel
