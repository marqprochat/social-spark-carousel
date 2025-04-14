
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";

export type BusinessInfo = {
  businessName: string;
  industry: string;
  targetAudience: string;
  postObjective: string;
  tone: string;
  additionalInfo?: string;
};

interface BusinessInfoFormProps {
  onComplete: (info: BusinessInfo) => void;
}

const INDUSTRIES = [
  "Moda e Vestuário",
  "Alimentos e Bebidas",
  "Beleza e Cosmética",
  "Saúde e Bem-estar",
  "Fitness e Esportes",
  "Tecnologia",
  "Imóveis",
  "Finanças",
  "Educação",
  "Viagem e Turismo",
  "Hotelaria e Restaurantes",
  "Arte e Cultura",
  "Entretenimento",
  "Casa e Decoração",
  "Serviços Profissionais",
  "Automotivo",
  "Outros"
];

const TONE_OPTIONS = [
  "Profissional",
  "Descontraído",
  "Informativo",
  "Inspirador",
  "Humorístico",
  "Formal",
  "Amigável",
  "Persuasivo"
];

const POST_OBJECTIVES = [
  "Aumentar Engajamento",
  "Vender um Produto",
  "Aumentar Reconhecimento da Marca",
  "Educar/Informar",
  "Promover um Evento",
  "Gerar Leads",
  "Compartilhar Novidades",
  "Contar uma História"
];

const BusinessInfoForm: React.FC<BusinessInfoFormProps> = ({ onComplete }) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState<BusinessInfo>({
    businessName: "",
    industry: "",
    targetAudience: "",
    postObjective: "",
    tone: "",
    additionalInfo: "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: keyof BusinessInfo, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação básica
    if (
      !formData.businessName ||
      !formData.industry ||
      !formData.targetAudience ||
      !formData.postObjective ||
      !formData.tone
    ) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    onComplete(formData);
  };

  return (
    <div className="w-full max-w-3xl animate-fade-in">
      <h1 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-brand-purple to-brand-blue bg-clip-text text-transparent">
        Social Spark Carousel
      </h1>
      
      <div className="bg-white p-8 rounded-lg shadow-lg">
        <h2 className="text-2xl font-semibold mb-6">Sobre seu Negócio</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="businessName">Nome do Negócio</Label>
            <Input
              id="businessName"
              name="businessName"
              placeholder="Ex: Café Aroma Intenso"
              value={formData.businessName}
              onChange={handleInputChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="industry">Segmento</Label>
            <Select
              value={formData.industry}
              onValueChange={(value) => handleSelectChange("industry", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o segmento" />
              </SelectTrigger>
              <SelectContent>
                {INDUSTRIES.map((industry) => (
                  <SelectItem key={industry} value={industry}>
                    {industry}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="targetAudience">Público-alvo</Label>
            <Input
              id="targetAudience"
              name="targetAudience"
              placeholder="Ex: Mulheres, 25-45 anos, profissionais, interessadas em bem-estar"
              value={formData.targetAudience}
              onChange={handleInputChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="postObjective">Objetivo do Post</Label>
            <Select
              value={formData.postObjective}
              onValueChange={(value) => handleSelectChange("postObjective", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o objetivo" />
              </SelectTrigger>
              <SelectContent>
                {POST_OBJECTIVES.map((objective) => (
                  <SelectItem key={objective} value={objective}>
                    {objective}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tone">Tom de Comunicação</Label>
            <Select
              value={formData.tone}
              onValueChange={(value) => handleSelectChange("tone", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tom" />
              </SelectTrigger>
              <SelectContent>
                {TONE_OPTIONS.map((tone) => (
                  <SelectItem key={tone} value={tone}>
                    {tone}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="additionalInfo">Informações Adicionais (opcional)</Label>
            <Textarea
              id="additionalInfo"
              name="additionalInfo"
              placeholder="Detalhes específicos que gostaria de mencionar no post..."
              value={formData.additionalInfo}
              onChange={handleInputChange}
              rows={4}
            />
          </div>

          <Button 
            type="submit" 
            className="w-full bg-gradient-to-r from-brand-purple to-brand-blue hover:opacity-90"
          >
            Continuar
          </Button>
        </form>
      </div>
    </div>
  );
};

export default BusinessInfoForm;
