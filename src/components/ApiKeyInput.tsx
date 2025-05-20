
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Settings } from "lucide-react";
import { getApiKeys, hasApiKeys } from "@/utils/apiKeys";
import { Link } from "react-router-dom";

interface ApiKeyInputProps {
  onKeysSubmitted: (openAiKey: string, unsplashKey: string, grokKey: string, geminiKey: string, selectedProvider: string) => void;
  onBack?: () => void;
}

const ApiKeyInput: React.FC<ApiKeyInputProps> = ({ onKeysSubmitted, onBack }) => {
  const { toast } = useToast();
  const [openAiKey, setOpenAiKey] = useState("");
  const [unsplashKey, setUnsplashKey] = useState("");
  const [grokKey, setGrokKey] = useState("");
  const [geminiKey, setGeminiKey] = useState("");
  const [selectedProvider, setSelectedProvider] = useState("openai");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar se já temos as chaves armazenadas
    const loadKeys = async () => {
      try {
        setLoading(true);
        const storedKeys = await getApiKeys();
        if (storedKeys) {
          setOpenAiKey(storedKeys.openAiKey || "");
          setUnsplashKey(storedKeys.unsplashKey || "");
          setGrokKey(storedKeys.grokKey || "");
          setGeminiKey(storedKeys.geminiKey || "");
          setSelectedProvider(storedKeys.selectedProvider || "openai");
        }
      } catch (error) {
        console.error("Erro ao carregar chaves:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadKeys();
  }, []);

  useEffect(() => {
    // Automaticamente usar as chaves armazenadas quando disponíveis
    const checkForKeys = async () => {
      if (await hasApiKeys()) {
        const keys = await getApiKeys();
        if (keys) {
          onKeysSubmitted(
            keys.openAiKey,
            keys.unsplashKey,
            keys.grokKey || "",
            keys.geminiKey || "",
            keys.selectedProvider || "openai"
          );
        }
      }
    };
    
    checkForKeys();
  }, [onKeysSubmitted]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!unsplashKey) {
      toast({
        title: "Chave Unsplash obrigatória",
        description: "Por favor, forneça a chave da API Unsplash.",
        variant: "destructive",
      });
      return;
    }
    
    // Verificar se há chave para o provedor selecionado
    let hasProviderKey = false;
    
    switch (selectedProvider) {
      case "openai":
        hasProviderKey = !!openAiKey;
        break;
      case "grok":
        hasProviderKey = !!grokKey;
        break;
      case "gemini":
        hasProviderKey = !!geminiKey;
        break;
    }
    
    if (!hasProviderKey) {
      toast({
        title: "Chave de API obrigatória",
        description: `Por favor, forneça a chave para o provedor ${selectedProvider.toUpperCase()}.`,
        variant: "destructive",
      });
      return;
    }
    
    onKeysSubmitted(openAiKey, unsplashKey, grokKey, geminiKey, selectedProvider);
  };

  if (loading) {
    return (
      <div className="w-full max-w-3xl animate-fade-in flex items-center justify-center p-8">
        <p className="text-muted-foreground">Carregando configurações...</p>
      </div>
    );
  }

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
            <Label htmlFor="providerSelect">Provedor de IA</Label>
            <Select 
              value={selectedProvider} 
              onValueChange={setSelectedProvider}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione o provedor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="openai">OpenAI (GPT)</SelectItem>
                <SelectItem value="grok">Grok AI</SelectItem>
                <SelectItem value="gemini">Google Gemini</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {selectedProvider === "openai" && (
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
          )}
          
          {selectedProvider === "grok" && (
            <div className="space-y-2">
              <Label htmlFor="grokKey">Grok API Key</Label>
              <Input
                id="grokKey"
                type="password"
                value={grokKey}
                onChange={(e) => setGrokKey(e.target.value)}
                placeholder="grok-..."
              />
            </div>
          )}
          
          {selectedProvider === "gemini" && (
            <div className="space-y-2">
              <Label htmlFor="geminiKey">Google Gemini API Key</Label>
              <Input
                id="geminiKey"
                type="password"
                value={geminiKey}
                onChange={(e) => setGeminiKey(e.target.value)}
                placeholder="AIza..."
              />
            </div>
          )}
          
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
