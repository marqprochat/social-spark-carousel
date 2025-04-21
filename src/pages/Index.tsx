
import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import BusinessInfoForm, { BusinessInfo } from "@/components/BusinessInfoForm";
import ApiKeyInput from "@/components/ApiKeyInput";
import CarouselCreator from "@/components/CarouselCreator";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Index = () => {
  const [currentStep, setCurrentStep] = useState<"info" | "api" | "creator">("info");
  const [businessInfo, setBusinessInfo] = useState<BusinessInfo | null>(null);
  const [openAiKey, setOpenAiKey] = useState<string>("");
  const [unsplashKey, setUnsplashKey] = useState<string>("");
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (!session) navigate("/auth");
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (!session) navigate("/auth");
    });
    return () => listener.subscription.unsubscribe();
  }, [navigate]);

  const handleBusinessInfoComplete = async (info: BusinessInfo) => {
    setBusinessInfo(info);
    // Salva info do negócio na tabela business_info, associando ao usuário autenticado
    if (user) {
      await supabase.from("business_info").upsert([
        {
          user_id: user.id,
          business_name: info.businessName,
          // Pode adicionar outros campos se a tabela for expandida futuramente
        }
      ]);
    }
    setCurrentStep("api");
  };

  const handleApiKeysSubmitted = (openAiKey: string, unsplashKey: string) => {
    setOpenAiKey(openAiKey);
    setUnsplashKey(unsplashKey);
    setCurrentStep("creator");
  };

  const handleBack = () => {
    if (currentStep === "creator") {
      setCurrentStep("api");
    } else if (currentStep === "api") {
      setCurrentStep("info");
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    navigate("/auth");
  };

  if (!user) {
    return null; // Aguarda checagem de sessão
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-brand-light to-white p-4">
      <div className="w-full max-w-6xl">
        <div className="flex justify-end p-2">
          <Button variant="outline" onClick={handleLogout}>Sair</Button>
        </div>
        {currentStep === "info" && (
          <BusinessInfoForm onComplete={handleBusinessInfoComplete} />
        )}
        
        {currentStep === "api" && (
          <ApiKeyInput onKeysSubmitted={handleApiKeysSubmitted} />
        )}
        
        {currentStep === "creator" && businessInfo && (
          <CarouselCreator
            businessInfo={businessInfo}
            openAiKey={openAiKey}
            unsplashKey={unsplashKey}
            onBack={handleBack}
          />
        )}
      </div>
    </div>
  );
};

export default Index;
