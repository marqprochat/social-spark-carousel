
import { supabase } from "@/integrations/supabase/client";

interface ApiKeys {
  openAiKey?: string;
  unsplashKey?: string;
  grokKey?: string;
  geminiKey?: string;
  selectedProvider?: string;
}

// Função para verificar se temos as chaves armazenadas
export const hasApiKeys = async (): Promise<boolean> => {
  try {
    // Primeiro, verificar se está autenticado
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session) {
      // Se autenticado, verificar keys na tabela
      const { data } = await supabase
        .from('api_keys')
        .select('*')
        .eq('user_id', session.user.id)
        .single();
        
      if (data?.unsplash_key) return true;
    } else {
      // Se não autenticado, verificar no localStorage
      const keys = localStorage.getItem('api_keys');
      if (keys) {
        const parsedKeys = JSON.parse(keys);
        return Boolean(parsedKeys?.unsplashKey);
      }
    }
    
    return false;
  } catch (error) {
    console.error("Erro ao verificar chaves:", error);
    return false;
  }
};

// Função para obter as chaves armazenadas
export const getApiKeys = async (): Promise<ApiKeys | null> => {
  try {
    // Primeiro verificar se está autenticado
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session) {
      // Se autenticado, buscar da tabela
      const { data, error } = await supabase
        .from('api_keys')
        .select('*')
        .eq('user_id', session.user.id)
        .single();
        
      if (error) {
        console.error("Erro ao obter chaves:", error);
        
        // Fallback para localStorage
        const keys = localStorage.getItem('api_keys');
        if (keys) return JSON.parse(keys);
        
        return null;
      }
      
      if (data) {
        return {
          openAiKey: data.openai_key,
          unsplashKey: data.unsplash_key,
          grokKey: data.grok_key,
          geminiKey: data.gemini_key,
          selectedProvider: data.selected_provider || 'openai'
        };
      }
    } else {
      // Se não autenticado, usar localStorage
      const keys = localStorage.getItem('api_keys');
      if (keys) return JSON.parse(keys);
    }
    
    return null;
  } catch (error) {
    console.error("Erro ao obter chaves:", error);
    return null;
  }
};

// Função para salvar as chaves
export const saveApiKeys = async (
  openAiKey: string,
  unsplashKey: string,
  grokKey: string = "",
  geminiKey: string = "",
  selectedProvider: string = "openai"
): Promise<void> => {
  try {
    // Verificar se está autenticado
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session) {
      // Se autenticado, salvar na tabela
      const { error } = await supabase
        .from('api_keys')
        .upsert({
          user_id: session.user.id,
          openai_key: openAiKey,
          unsplash_key: unsplashKey,
          grok_key: grokKey,
          gemini_key: geminiKey,
          selected_provider: selectedProvider
        }, {
          onConflict: 'user_id'
        });
        
      if (error) {
        console.error("Erro ao salvar chaves:", error);
        throw error;
      }
    }
    
    // Sempre salvar no localStorage como backup/para usuários não autenticados
    localStorage.setItem('api_keys', JSON.stringify({
      openAiKey,
      unsplashKey,
      grokKey,
      geminiKey,
      selectedProvider
    }));
    
  } catch (error) {
    console.error("Erro ao salvar chaves:", error);
    throw error;
  }
};
