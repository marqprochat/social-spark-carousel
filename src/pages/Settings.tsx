import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowLeft, Save } from "lucide-react";
import { getApiKeys, saveApiKeys } from "@/utils/apiKeys";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const Settings = () => {
  const [openAiKey, setOpenAiKey] = useState<string>("");
  const [unsplashKey, setUnsplashKey] = useState<string>("");
  const [grokKey, setGrokKey] = useState<string>("");
  const [geminiKey, setGeminiKey] = useState<string>("");
  const [selectedProvider, setSelectedProvider] = useState<string>("openai");
  const [loading, setLoading] = useState<boolean>(false);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Verificar se o usuário está autenticado
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUser(session.user);
      }
      loadApiKeys();
    };

    checkAuth();
  }, []);

  const loadApiKeys = async () => {
    try {
      setLoading(true);
      const keys = await getApiKeys();
      if (keys) {
        setOpenAiKey(keys.openAiKey || "");
        setUnsplashKey(keys.unsplashKey || "");
        setGrokKey(keys.grokKey || "");
        setGeminiKey(keys.geminiKey || "");
        setSelectedProvider(keys.selectedProvider || "openai");
      }
    } catch (error) {
      console.error("Erro ao carregar chaves:", error);
      toast.error("Erro ao carregar configurações");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
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
      toast.error(`Por favor, forneça a chave para o provedor ${selectedProvider.toUpperCase()}.`);
      return;
    }
    
    if (!unsplashKey) {
      toast.error("Por favor, forneça a chave da API Unsplash.");
      return;
    }

    try {
      setLoading(true);
      await saveApiKeys(openAiKey, unsplashKey, grokKey, geminiKey, selectedProvider);
      toast.success("Configurações salvas com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar chaves:", error);
      toast.error("Erro ao salvar configurações");
    } finally {
      setLoading(false);
    }
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
        
        {!user ? (
          <div className="text-center py-6">
            <p className="text-muted-foreground mb-4">
              Faça login para gerenciar suas chaves de API de forma mais segura.
            </p>
            <Button 
              onClick={() => navigate("/auth")}
              className="bg-gradient-to-r from-brand-purple to-brand-blue hover:opacity-90"
            >
              Fazer Login
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="providerSelect">Provedor de IA</Label>
              <Select 
                value={selectedProvider} 
                onValueChange={setSelectedProvider} 
                disabled={loading}
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
              <p className="text-xs text-muted-foreground">
                Selecione o provedor de IA para geração de conteúdo
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="openAiKey">OpenAI API Key</Label>
              <Input
                id="openAiKey"
                type="password"
                value={openAiKey}
                onChange={(e) => setOpenAiKey(e.target.value)}
                placeholder="sk-..."
                disabled={loading}
                className={selectedProvider !== "openai" ? "opacity-50" : ""}
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
              <Label htmlFor="grokKey">Grok API Key</Label>
              <Input
                id="grokKey"
                type="password"
                value={grokKey}
                onChange={(e) => setGrokKey(e.target.value)}
                placeholder="grok-..."
                disabled={loading}
                className={selectedProvider !== "grok" ? "opacity-50" : ""}
              />
              <p className="text-xs text-muted-foreground">
                Obtenha sua chave em{" "}
                <a 
                  href="https://api.grok.ai/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-brand-purple hover:underline"
                >
                  api.grok.ai
                </a>
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="geminiKey">Google Gemini API Key</Label>
              <Input
                id="geminiKey"
                type="password"
                value={geminiKey}
                onChange={(e) => setGeminiKey(e.target.value)}
                placeholder="AIza..."
                disabled={loading}
                className={selectedProvider !== "gemini" ? "opacity-50" : ""}
              />
              <p className="text-xs text-muted-foreground">
                Obtenha sua chave em{" "}
                <a 
                  href="https://ai.google.dev/tutorials/setup" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-brand-purple hover:underline"
                >
                  ai.google.dev/tutorials/setup
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
                disabled={loading}
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
              disabled={loading}
            >
              {loading ? "Salvando..." : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Salvar Configurações
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;
