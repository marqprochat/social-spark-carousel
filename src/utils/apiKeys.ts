
/**
 * Utilitário para gerenciar chaves de API no Supabase e localStorage (fallback)
 */

import { supabase } from "@/integrations/supabase/client";

const STORAGE_KEY = 'social_spark_api_keys';

interface ApiKeys {
  openAiKey: string;
  unsplashKey: string;
}

// Salvar chaves no Supabase e localStorage (fallback)
export const saveApiKeys = async (openAiKey: string, unsplashKey: string): Promise<void> => {
  try {
    // Verificar se o usuário está autenticado
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session) {
      // Verificar se já existe registro para o usuário
      const { data: existingKeys } = await supabase
        .from('api_keys')
        .select('*')
        .eq('user_id', session.user.id)
        .maybeSingle();
      
      if (existingKeys) {
        // Atualizar chaves existentes
        await supabase
          .from('api_keys')
          .update({ openai_key: openAiKey, unsplash_key: unsplashKey, updated_at: new Date() })
          .eq('user_id', session.user.id);
      } else {
        // Inserir novas chaves
        await supabase
          .from('api_keys')
          .insert({ 
            user_id: session.user.id, 
            openai_key: openAiKey, 
            unsplash_key: unsplashKey 
          });
      }
      
      console.log("Chaves de API salvas no Supabase");
    } else {
      // Fallback para localStorage quando não estiver autenticado
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ openAiKey, unsplashKey }));
      console.log("Chaves de API salvas no localStorage (modo offline)");
    }
  } catch (error) {
    console.error("Erro ao salvar chaves de API:", error);
    // Fallback para localStorage em caso de erro
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ openAiKey, unsplashKey }));
  }
};

// Obter chaves do Supabase ou localStorage (fallback)
export const getApiKeys = async (): Promise<ApiKeys | null> => {
  try {
    // Verificar se o usuário está autenticado
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session) {
      // Buscar chaves do Supabase
      const { data: apiKeys, error } = await supabase
        .from('api_keys')
        .select('openai_key, unsplash_key')
        .eq('user_id', session.user.id)
        .maybeSingle();
      
      if (error) {
        throw error;
      }
      
      if (apiKeys) {
        return {
          openAiKey: apiKeys.openai_key || '',
          unsplashKey: apiKeys.unsplash_key || ''
        };
      }
    }
    
    // Fallback para localStorage
    const keys = localStorage.getItem(STORAGE_KEY);
    return keys ? JSON.parse(keys) : null;
  } catch (error) {
    console.error("Erro ao recuperar chaves de API:", error);
    // Fallback para localStorage em caso de erro
    const keys = localStorage.getItem(STORAGE_KEY);
    return keys ? JSON.parse(keys) : null;
  }
};

// Verificar se existem chaves salvas
export const hasApiKeys = async (): Promise<boolean> => {
  const keys = await getApiKeys();
  return !!(keys && keys.openAiKey && keys.unsplashKey);
};

// Limpar chaves de API
export const clearApiKeys = async (): Promise<void> => {
  try {
    // Verificar se o usuário está autenticado
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session) {
      // Remover chaves do Supabase
      await supabase
        .from('api_keys')
        .delete()
        .eq('user_id', session.user.id);
    }
    
    // Remover do localStorage também
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error("Erro ao limpar chaves de API:", error);
    // Garantir que o localStorage é limpo mesmo em caso de erro
    localStorage.removeItem(STORAGE_KEY);
  }
};
