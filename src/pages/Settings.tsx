
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ArrowLeft, Save } from "lucide-react";
import { getApiKeys, saveApiKeys } from "@/utils/apiKeys";
import { useNavigate } from "react-router-dom";

const Settings = () => {
  const [openAiKey, setOpenAiKey] = useState<string>("");
  const [unsplashKey, setUnsplashKey] = useState<string>("");
  const navigate = useNavigate();

  useEffect(() => {
    // Carregar chaves existentes
    const keys = getApiKeys();
    if (keys) {
      setOpenAiKey(keys.openAiKey || "");
      setUnsplashKey(keys.unsplashKey || "");
    }
  }, []);

  const handleSave = () => {
    if (!openAiKey || !unsplashKey) {
      toast.error("Por favor, forneça ambas as chaves API.");
      return;
    }

    saveApiKeys(openAiKey, unsplashKey);
    toast.success("Chaves API salvas com sucesso!");
  };

  return (
    <div className="container max-w-3xl py-10 animate-fade-in">
      <div className="flex items-center mb-8 gap-4">
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
          size="icon"
          className="rounded-full"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-brand-purple to-brand-blue bg-clip-text text-transparent">
          Configurações
        </h1>
      </div>
      
      <div className="bg-white p-8 rounded-lg shadow-lg">
        <h2 className="text-2xl font-semibold mb-6">Chaves de API</h2>
        
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="openAiKey">OpenAI API Key</Label>
            <Input
              id="openAiKey"
              type="password"
              value={openAiKey}
              onChange={(e) => setOpenAiKey(e.target.value)}
              placeholder="sk-..."
            />
            <p className="text-xs text-muted-foreground">
              Obtenha sua chave em{" "}
              <a 
                href="https://platform.openai.com/api-keys" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-brand-purple hover:underline"
              >
                platform.openai.com/api-keys
              </a>
            </p>
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
            <p className="text-xs text-muted-foreground">
              Obtenha sua chave em{" "}
              <a 
                href="https://unsplash.com/developers" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-brand-purple hover:underline"
              >
                unsplash.com/developers
              </a>
            </p>
          </div>
          
          <Button 
            onClick={handleSave}
            className="w-full bg-gradient-to-r from-brand-purple to-brand-blue hover:opacity-90"
          >
            <Save className="mr-2 h-4 w-4" />
            Salvar Configurações
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
