
import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import BusinessInfoForm, { BusinessInfo } from "@/components/BusinessInfoForm";
import ApiKeyInput from "@/components/ApiKeyInput";
import CarouselCreator from "@/components/CarouselCreator";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { PlusIcon } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

interface BusinessCard {
  id: string;
  business_name: string;
  industry: string;
  additional_info: string | null;
}

const Index = () => {
  const [currentStep, setCurrentStep] = useState<"businesses" | "info" | "api" | "creator">("businesses");
  const [businessInfo, setBusinessInfo] = useState<BusinessInfo | null>(null);
  const [openAiKey, setOpenAiKey] = useState<string>("");
  const [unsplashKey, setUnsplashKey] = useState<string>("");
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [userBusinesses, setUserBusinesses] = useState<BusinessCard[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      setLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user ?? null);
        
        if (!session) {
          navigate("/auth");
          return;
        }
        
        // Carregar empresas do usuário
        if (session?.user) {
          fetchUserBusinesses(session.user.id);
        }
        
        // Set up auth state listener
        const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
          setUser(session?.user ?? null);
          if (!session) navigate("/auth");
          else if (session?.user) {
            fetchUserBusinesses(session.user.id);
          }
        });
        
        return () => listener.subscription.unsubscribe();
      } catch (error) {
        console.error("Session check error:", error);
        toast.error("Erro ao verificar sessão", {
          description: "Faça login novamente."
        });
        navigate("/auth");
      } finally {
        setLoading(false);
      }
    };
    
    checkSession();
  }, [navigate]);

  const fetchUserBusinesses = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("business_info")
        .select("id, business_name, industry, additional_info")
        .eq("user_id", userId);

      if (error) throw error;
      setUserBusinesses(data || []);
    } catch (error) {
      console.error("Error fetching businesses:", error);
      toast.error("Erro ao carregar empresas");
    }
  };

  const handleBusinessInfoComplete = async (info: BusinessInfo) => {
    setBusinessInfo(info);
    // Salva as informações essenciais da empresa no Supabase
    if (user) {
      try {
        const { error } = await supabase.from("business_info").upsert([
          {
            user_id: user.id,
            business_name: info.businessName,
            industry: info.industry,
            additional_info: info.description || null
          }
        ]);
        
        if (error) throw error;
        toast.success("Informações da empresa salvas com sucesso!");
        setCurrentStep("api");
      } catch (error) {
        console.error("Error saving business info:", error);
        toast.error("Erro ao salvar informações da empresa", {
          description: "Tente novamente mais tarde."
        });
      }
    }
  };

  const handleSelectBusiness = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from("business_info")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;

      // Mapear os dados para o formato BusinessInfo
      const selectedBusiness: BusinessInfo = {
        businessName: data.business_name,
        industry: data.industry,
        description: data.additional_info || undefined,
        targetAudience: data.target_audience || undefined,
        postObjective: data.post_objective || undefined,
        tone: data.tone || undefined,
        additionalInfo: data.additional_info || undefined
      };

      setBusinessInfo(selectedBusiness);
      setCurrentStep("api");
    } catch (error) {
      console.error("Error selecting business:", error);
      toast.error("Erro ao selecionar empresa");
    }
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
      setCurrentStep("businesses");
    } else if (currentStep === "info") {
      setCurrentStep("businesses");
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      navigate("/auth");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Erro ao fazer logout", {
        description: "Tente novamente."
      });
    }
  };

  const goToProjects = () => {
    navigate("/projects");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <p>Carregando...</p>
      </div>
    );
  }

  if (!user) {
    return null; // Aguarda checagem de sessão
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-brand-light to-white p-4">
      <div className="w-full max-w-6xl">
        <div className="flex justify-end p-2 gap-2">
          <Button variant="outline" onClick={goToProjects}>Meus Projetos</Button>
          <Button variant="outline" onClick={handleLogout}>Sair</Button>
        </div>

        {currentStep === "businesses" && (
          <div className="w-full max-w-3xl mx-auto animate-fade-in">
            <h1 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-brand-purple to-brand-blue bg-clip-text text-transparent">
              Social Spark Carousel
            </h1>
            
            <div className="bg-white p-8 rounded-lg shadow-lg">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold">Suas Empresas</h2>
                <Button onClick={() => setCurrentStep("info")} className="flex items-center gap-2">
                  <PlusIcon size={16} />
                  <span>Nova Empresa</span>
                </Button>
              </div>
              
              {userBusinesses.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">Você ainda não cadastrou nenhuma empresa.</p>
                  <Button onClick={() => setCurrentStep("info")}>
                    Cadastrar Empresa
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {userBusinesses.map((business) => (
                    <Card key={business.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleSelectBusiness(business.id)}>
                      <CardHeader>
                        <CardTitle>{business.business_name}</CardTitle>
                        <CardDescription>{business.industry}</CardDescription>
                      </CardHeader>
                      {business.additional_info && (
                        <CardContent>
                          <p className="text-sm text-muted-foreground truncate">
                            {business.additional_info}
                          </p>
                        </CardContent>
                      )}
                      <CardFooter>
                        <Button variant="outline" className="w-full" onClick={(e) => {
                          e.stopPropagation();
                          handleSelectBusiness(business.id);
                        }}>
                          Selecionar
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
        
        {currentStep === "info" && (
          <BusinessInfoForm onComplete={handleBusinessInfoComplete} onBack={handleBack} />
        )}
        
        {currentStep === "api" && (
          <ApiKeyInput onKeysSubmitted={handleApiKeysSubmitted} onBack={handleBack} />
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
