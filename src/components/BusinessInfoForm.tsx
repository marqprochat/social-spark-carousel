
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";

export type BusinessInfo = {
  businessName: string;
  industry: string;
  description?: string;
  // Add missing properties that are used in the services
  targetAudience?: string;
  postObjective?: string;
  tone?: string;
  additionalInfo?: string;
};

interface BusinessInfoFormProps {
  onComplete: (info: BusinessInfo) => void;
  onBack?: () => void;
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

const BusinessInfoForm: React.FC<BusinessInfoFormProps> = ({ onComplete, onBack }) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState<BusinessInfo>({
    businessName: "",
    industry: "",
    description: "",
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
      !formData.industry
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
        {onBack && (
          <Button 
            type="button" 
            variant="ghost" 
            onClick={onBack} 
            className="mb-4 pl-2 flex items-center text-muted-foreground"
          >
            <ArrowLeft size={16} className="mr-1" />
            Voltar
          </Button>
        )}

        <h2 className="text-2xl font-semibold mb-6">Sobre sua Empresa</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="businessName">Nome da Empresa</Label>
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
            <Label htmlFor="description">Descrição (opcional)</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Descreva sua empresa..."
              value={formData.description}
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
