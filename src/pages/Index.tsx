
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          navigate("/auth");
          return;
        }
        
        // Redirect to businesses page
        navigate("/businesses");
        
      } catch (error) {
        console.error("Session check error:", error);
        toast.error("Erro ao verificar sessão", {
          description: "Faça login novamente."
        });
        navigate("/auth");
      }
    };
    
    checkSession();
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <p>Redirecionando...</p>
    </div>
  );
};

export default Index;
