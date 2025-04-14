
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface ApiKeyInputProps {
  onKeysSubmitted: (openAiKey: string, unsplashKey: string) => void;
}

const ApiKeyInput: React.FC<ApiKeyInputProps> = ({ onKeysSubmitted }) => {
  const [openAiKey, setOpenAiKey] = useState<string>("");
  const [unsplashKey, setUnsplashKey] = useState<string>("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (openAiKey && unsplashKey) {
      onKeysSubmitted(openAiKey, unsplashKey);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg animate-fade-in">
      <h2 className="text-xl font-semibold mb-4">Configure as APIs</h2>
      <p className="mb-4 text-gray-600 text-sm">
        Para gerar textos e obter imagens, forneça suas chaves de API:
      </p>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="openAiKey">Chave da API OpenAI</Label>
          <Input
            id="openAiKey"
            type="password"
            placeholder="sk-..."
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
            placeholder="Insira sua chave de acesso Unsplash"
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
          disabled={!openAiKey || !unsplashKey}
        >
          Continuar
        </Button>
      </form>
    </div>
  );
};

export default ApiKeyInput;
