
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Settings } from "lucide-react";
import { getApiKeys, hasApiKeys, saveApiKeys } from "@/utils/apiKeys";
import { Link } from "react-router-dom";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";

interface ApiKeyInputProps {
  onKeysSubmitted: (openAiKey: string, unsplashKey: string, grokKey: string, geminiKey: string, selectedProvider: string) => void;
  onBack?: () => void;
}

const ApiKeyInput: React.FC<ApiKeyInputProps> = ({ onKeysSubmitted, onBack }) => {
  const [openAiKey, setOpenAiKey] = useState("");
  const [unsplashKey, setUnsplashKey] = useState("");
  const [grokKey, setGrokKey] = useState("");
  const [geminiKey, setGeminiKey] = useState("");
  const [selectedProvider, setSelectedProvider] = useState("openai");
  const [loading, setLoading] = useState(true);
  const [showProviderSelection, setShowProviderSelection] = useState(false);

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
          
          // Se já temos chaves armazenadas para múltiplos provedores,
          // mostramos a seleção de provedor
          if ((storedKeys.openAiKey && storedKeys.grokKey) || 
              (storedKeys.openAiKey && storedKeys.geminiKey) || 
              (storedKeys.grokKey && storedKeys.geminiKey)) {
            setShowProviderSelection(true);
          }
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
            keys.openAiKey || "",
            keys.unsplashKey || "",
            keys.grokKey || "",
            keys.geminiKey || "",
            keys.selectedProvider || "openai"
          );
        }
      }
    };
    
    checkForKeys();
  }, [onKeysSubmitted]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!unsplashKey) {
      toast.error("Chave Unsplash obrigatória", {
        description: "Por favor, forneça a chave da API Unsplash."
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
      toast.error("Chave de API obrigatória", {
        description: `Por favor, forneça a chave para o provedor ${selectedProvider.toUpperCase()}.`
      });
      return;
    }

    try {
      // Salvar as chaves no banco de dados/localStorage
      await saveApiKeys(openAiKey, unsplashKey, grokKey, geminiKey, selectedProvider);
      
      // Continuar com a criação do carrossel
      onKeysSubmitted(openAiKey, unsplashKey, grokKey, geminiKey, selectedProvider);
    } catch (error) {
      console.error("Erro ao salvar chaves:", error);
      toast.error("Erro ao salvar configurações", {
        description: "Não foi possível salvar suas chaves de API."
      });
    }
  };

  // Função para continuar com o provedor selecionado
  const handleContinueWithProvider = async () => {
    const keys = await getApiKeys();
    if (keys) {
      try {
        // Atualizar o provedor selecionado
        await saveApiKeys(
          keys.openAiKey || "",
          keys.unsplashKey || "",
          keys.grokKey || "",
          keys.geminiKey || "",
          selectedProvider
        );
        
        // Continuar com a criação do carrossel
        onKeysSubmitted(
          keys.openAiKey || "",
          keys.unsplashKey || "",
          keys.grokKey || "",
          keys.geminiKey || "",
          selectedProvider
        );
      } catch (error) {
        console.error("Erro ao atualizar provedor:", error);
        toast.error("Erro ao atualizar provedor", {
          description: "Não foi possível atualizar o provedor selecionado."
        });
      }
    }
  };

  if (loading) {
    return (
      <div className="w-full max-w-3xl animate-fade-in flex items-center justify-center p-8">
        <p className="text-muted-foreground">Carregando configurações...</p>
      </div>
    );
  }

  // Se temos múltiplos provedores configurados, mostramos a tela de seleção primeiro
  if (showProviderSelection) {
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

          <h2 className="text-2xl font-semibold mb-6">Escolha o provedor de IA</h2>
          
          <form className="space-y-6">
            <RadioGroup value={selectedProvider} onValueChange={setSelectedProvider} className="space-y-3">
              <div className="flex items-center space-x-2 border rounded-md p-3 hover:bg-muted/50 cursor-pointer">
                <RadioGroupItem value="openai" id="openai" />
                <Label htmlFor="openai" className="w-full cursor-pointer">OpenAI (GPT)</Label>
              </div>
              
              <div className="flex items-center space-x-2 border rounded-md p-3 hover:bg-muted/50 cursor-pointer">
                <RadioGroupItem value="grok" id="grok" />
                <Label htmlFor="grok" className="w-full cursor-pointer">Grok AI</Label>
              </div>
              
              <div className="flex items-center space-x-2 border rounded-md p-3 hover:bg-muted/50 cursor-pointer">
                <RadioGroupItem value="gemini" id="gemini" />
                <Label htmlFor="gemini" className="w-full cursor-pointer">Google Gemini</Label>
              </div>
            </RadioGroup>
            
            <div className="flex justify-between">
              <Button 
                type="button"
                variant="outline"
                onClick={() => setShowProviderSelection(false)}
              >
                Alterar chaves
              </Button>
              
              <Button 
                type="button"
                onClick={handleContinueWithProvider}
                className="bg-gradient-to-r from-brand-purple to-brand-blue hover:opacity-90"
              >
                Continuar
              </Button>
            </div>
          </form>
        </div>
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
