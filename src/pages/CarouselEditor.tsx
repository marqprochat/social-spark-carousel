
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import CarouselCreator from "@/components/CarouselCreator";
import { BusinessInfo } from "@/components/BusinessInfoForm";
import { getApiKeys } from "@/utils/apiKeys";

const CarouselEditor = () => {
  const { carouselId } = useParams<{ carouselId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [businessInfo, setBusinessInfo] = useState<BusinessInfo | null>(null);
  const [openAiKey, setOpenAiKey] = useState<string>(""); 
  const [unsplashKey, setUnsplashKey] = useState<string>("");
  const [carouselDescription, setCarouselDescription] = useState<string>(""); // Adicionar estado para a descrição

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          toast.error("Por favor, faça login para continuar");
          navigate("/auth");
          return;
        }
        
        // Carregar chaves de API
        const apiKeys = await getApiKeys();
        if (apiKeys) {
          setOpenAiKey(apiKeys.openAiKey || "");
          setUnsplashKey(apiKeys.unsplashKey || "");
        }
        
        fetchCarouselData();
        
      } catch (error) {
        console.error("Session check error:", error);
        toast.error("Erro ao verificar sessão");
        navigate("/auth");
      }
    };
    
    checkSession();
  }, [carouselId, navigate]);

  const fetchCarouselData = async () => {
    if (!carouselId) return;
    
    try {
      setLoading(true);
      
      // Fetch carousel data
      const { data: carouselData, error: carouselError } = await supabase
        .from("carousels")
        .select(`
          *,
          project:project_id (
            *,
            business_info:business_id (*)
          )
        `)
        .eq("id", carouselId)
        .single();
      
      if (carouselError) {
        console.error("Error fetching carousel:", carouselError);
        throw carouselError;
      }
      
      if (!carouselData) {
        console.error("No carousel data found");
        throw new Error("Carrossel não encontrado");
      }
      
      console.log("Carousel data:", carouselData);
      
      // Extrair a descrição do carrossel, se disponível
      const description = carouselData.description || "";
      setCarouselDescription(description);
      
      // Extract business info from the carousel data
      const businessInfo: BusinessInfo = {
        businessName: carouselData.project.business_info.business_name,
        industry: carouselData.project.business_info.industry,
        targetAudience: carouselData.project.business_info.target_audience,
        postObjective: carouselData.project.business_info.post_objective,
        tone: carouselData.project.business_info.tone,
        additionalInfo: carouselData.project.business_info.additional_info
      };
      
      setBusinessInfo(businessInfo);
      
    } catch (error) {
      console.error("Error fetching carousel data:", error);
      toast.error("Erro ao carregar dados do carrossel");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    // Return to the project page
    navigate(-1);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Carregando...</p>
      </div>
    );
  }

  if (!businessInfo) {
    return (
      <div className="min-h-screen p-4">
        <div className="max-w-6xl mx-auto text-center py-20">
          <h2 className="text-2xl font-bold mb-4">Informações da empresa não encontradas</h2>
          <button 
            onClick={() => navigate("/businesses")}
            className="px-4 py-2 bg-primary text-white rounded-md"
          >
            Voltar para Empresas
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-light to-white">
      <CarouselCreator
        businessInfo={businessInfo}
        openAiKey={openAiKey}
        unsplashKey={unsplashKey}
        onBack={handleBack}
        carouselDescription={carouselDescription} // Passa a descrição para o componente CarouselCreator
      />
    </div>
  );
};

export default CarouselEditor;
