
import { supabase } from "@/integrations/supabase/client";

interface ApiKeys {
  openAiKey?: string;
  unsplashKey?: string;
  grokKey?: string;
  geminiKey?: string;
  selectedProvider?: string;
}

// Function to check if we have the stored keys
export const hasApiKeys = async (): Promise<boolean> => {
  try {
    // First, check if authenticated
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session) {
      // If authenticated, check keys in the table
      const { data } = await supabase
        .from('api_keys')
        .select('*')
        .eq('user_id', session.user.id)
        .single();
        
      if (data?.unsplash_key) return true;
    } else {
      // If not authenticated, check in localStorage
      const keys = localStorage.getItem('api_keys');
      if (keys) {
        const parsedKeys = JSON.parse(keys);
        return Boolean(parsedKeys?.unsplashKey);
      }
    }
    
    return false;
  } catch (error) {
    console.error("Error checking keys:", error);
    return false;
  }
};

// Function to get the stored keys
export const getApiKeys = async (): Promise<ApiKeys | null> => {
  try {
    // First check if authenticated
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session) {
      // If authenticated, fetch from table
      const { data, error } = await supabase
        .from('api_keys')
        .select('*')
        .eq('user_id', session.user.id)
        .single();
        
      if (error) {
        console.error("Error getting keys:", error);
        
        // Fallback to localStorage
        const keys = localStorage.getItem('api_keys');
        if (keys) return JSON.parse(keys);
        
        return null;
      }
      
      if (data) {
        // Map the database columns to our ApiKeys interface
        return {
          openAiKey: data.openai_key,
          unsplashKey: data.unsplash_key,
          grokKey: data.grok_key || "",
          geminiKey: data.gemini_key || "",
          selectedProvider: data.selected_provider || 'openai'
        };
      }
    } else {
      // If not authenticated, use localStorage
      const keys = localStorage.getItem('api_keys');
      if (keys) return JSON.parse(keys);
    }
    
    return null;
  } catch (error) {
    console.error("Error getting keys:", error);
    return null;
  }
};

// Function to save the keys
export const saveApiKeys = async (
  openAiKey: string,
  unsplashKey: string,
  grokKey: string = "",
  geminiKey: string = "",
  selectedProvider: string = "openai"
): Promise<void> => {
  try {
    // Check if authenticated
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session) {
      // First check if the user already has an entry
      const { data } = await supabase
        .from('api_keys')
        .select('*')
        .eq('user_id', session.user.id);
      
      if (data && data.length > 0) {
        // Update existing record
        const { error } = await supabase
          .from('api_keys')
          .update({
            openai_key: openAiKey,
            unsplash_key: unsplashKey,
            grok_key: grokKey,
            gemini_key: geminiKey,
            selected_provider: selectedProvider
          })
          .eq('user_id', session.user.id);
          
        if (error) {
          console.error("Error updating keys:", error);
          throw error;
        }
      } else {
        // Insert new record
        const { error } = await supabase
          .from('api_keys')
          .insert({
            user_id: session.user.id,
            openai_key: openAiKey,
            unsplash_key: unsplashKey,
            grok_key: grokKey,
            gemini_key: geminiKey,
            selected_provider: selectedProvider
          });
          
        if (error) {
          console.error("Error inserting keys:", error);
          throw error;
        }
      }
    }
    
    // Always save to localStorage as backup/for unauthenticated users
    localStorage.setItem('api_keys', JSON.stringify({
      openAiKey,
      unsplashKey,
      grokKey,
      geminiKey,
      selectedProvider
    }));
    
  } catch (error) {
    console.error("Error saving keys:", error);
    throw error;
  }
};
