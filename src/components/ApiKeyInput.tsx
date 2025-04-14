
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";

interface ApiKeyInputProps {
  onKeysSubmitted: (openAiKey: string, unsplashKey: string) => void;
}

// Chaves de API fixas
const DEFAULT_OPENAI_KEY = "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";
const DEFAULT_UNSPLASH_KEY = "oFdbSDmB4dckb0NWVq4QTHDPjAg2AVw0BbkjJt6TZpo";

const ApiKeyInput: React.FC<ApiKeyInputProps> = ({ onKeysSubmitted }) => {
  const [openAiKey, setOpenAiKey] = useState<string>(DEFAULT_OPENAI_KEY);
  const [unsplashKey, setUnsplashKey] = useState<string>(DEFAULT_UNSPLASH_KEY);

  // Submeter automaticamente as chaves ao montar o componente
  useEffect(() => {
    if (openAiKey && unsplashKey) {
      toast({
        title: "APIs Configuradas",
        description: "As chaves de API foram configuradas automaticamente.",
      });
      
      // Pequeno atraso para garantir que o toast seja exibido
      const timer = setTimeout(() => {
        onKeysSubmitted(openAiKey, unsplashKey);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (openAiKey && unsplashKey) {
      onKeysSubmitted(openAiKey, unsplashKey);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg animate-fade-in">
      <h2 className="text-xl font-semibold mb-4">Configuração das APIs</h2>
      <p className="mb-4 text-gray-600 text-sm">
        As chaves de API foram pré-configuradas. Você pode prosseguir diretamente ou alterá-las se necessário:
      </p>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="openAiKey">Chave da API OpenAI</Label>
          <Input
            id="openAiKey"
            type="password"
            value={openAiKey}
            onChange={(e) => setOpenAiKey(e.target.value)}
            className="w-full"
          />
          <p className="text-xs text-gray-500">
            <a 
              href="https://platform.openai.com/api-keys" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-brand-purple underline"
            >
              Obtenha sua chave aqui
            </a>
          </p>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="unsplashKey">Chave de Acesso Unsplash</Label>
          <Input
            id="unsplashKey"
            type="password"
            value={unsplashKey}
            onChange={(e) => setUnsplashKey(e.target.value)}
            className="w-full"
          />
          <p className="text-xs text-gray-500">
            <a 
              href="https://unsplash.com/developers" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-brand-purple underline"
            >
              Obtenha sua chave aqui
            </a>
          </p>
        </div>
        
        <Button 
          type="submit" 
          className="w-full bg-gradient-to-r from-brand-purple to-brand-blue hover:opacity-90"
        >
          Continuar
        </Button>
      </form>
    </div>
  );
};

export default ApiKeyInput;
