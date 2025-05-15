
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Settings } from "lucide-react";
import { getApiKeys, hasApiKeys } from "@/utils/apiKeys";
import { Link } from "react-router-dom";

interface ApiKeyInputProps {
  onKeysSubmitted: (openAiKey: string, unsplashKey: string) => void;
  onBack?: () => void;
}

const ApiKeyInput: React.FC<ApiKeyInputProps> = ({ onKeysSubmitted, onBack }) => {
  const { toast } = useToast();
  const [openAiKey, setOpenAiKey] = useState("");
  const [unsplashKey, setUnsplashKey] = useState("");

  useEffect(() => {
    // Verificar se já temos as chaves armazenadas
    const storedKeys = getApiKeys();
    if (storedKeys) {
      setOpenAiKey(storedKeys.openAiKey);
      setUnsplashKey(storedKeys.unsplashKey);
    }
  }, []);

  useEffect(() => {
    // Automaticamente usar as chaves armazenadas quando disponíveis
    if (hasApiKeys()) {
      const keys = getApiKeys();
      if (keys) {
        onKeysSubmitted(keys.openAiKey, keys.unsplashKey);
      }
    }
  }, [onKeysSubmitted]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!openAiKey || !unsplashKey) {
      toast({
        title: "Chaves API obrigatórias",
        description: "Por favor, forneça ambas as chaves API.",
        variant: "destructive",
      });
      return;
    }
    
    onKeysSubmitted(openAiKey, unsplashKey);
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

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold">Chaves de API</h2>
          <Link to="/settings">
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <Settings size={16} />
              Configurar
            </Button>
          </Link>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="openAiKey">OpenAI API Key</Label>
            <Input
              id="openAiKey"
              type="password"
              value={openAiKey}
              onChange={(e) => setOpenAiKey(e.target.value)}
              placeholder="sk-..."
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="unsplashKey">Unsplash API Key</Label>
            <Input
              id="unsplashKey"
              type="password"
              value={unsplashKey}
              onChange={(e) => setUnsplashKey(e.target.value)}
              placeholder="Sua chave Unsplash..."
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

export default ApiKeyInput;
