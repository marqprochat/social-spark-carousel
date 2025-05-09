
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { ChevronLeft, PlusIcon } from "lucide-react";

interface Project {
  id: string;
  name: string;
  description: string | null;
  business_id: string;
  business_info?: {
    business_name: string;
  };
}

interface Carousel {
  id: string;
  title: string;
  description: string | null;
  slides: any[];
  created_at: string;
}

const ProjectDetail = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [carousels, setCarousels] = useState<Carousel[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newCarousel, setNewCarousel] = useState({ title: "", description: "" });
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user ?? null);
        
        if (!session) {
          navigate("/auth");
          return;
        }
        
        fetchProjectData();
        
        // Set up auth state listener
        const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
          setUser(session?.user ?? null);
          if (!session) navigate("/auth");
        });
        
        return () => listener.subscription.unsubscribe();
      } catch (error) {
        console.error("Session check error:", error);
        toast.error("Erro ao verificar sessão", {
          description: "Faça login novamente."
        });
        navigate("/auth");
      }
    };
    
    checkSession();
  }, [navigate, projectId]);

  const fetchProjectData = async () => {
    if (!projectId) return;
    
    try {
      setLoading(true);
      
      // Fetch project details
      const { data: projectData, error: projectError } = await supabase
        .from("projects")
        .select(`
          *,
          business_info (
            business_name
          )
        `)
        .eq("id", projectId)
        .single();
      
      if (projectError) throw projectError;
      setProject(projectData);
      
      // Fetch carousels for this project
      const { data: carouselsData, error: carouselsError } = await supabase
        .from("carousels")
        .select("*")
        .eq("project_id", projectId)
        .order("created_at", { ascending: false });
      
      if (carouselsError) throw carouselsError;
      
      // Ensure slides are always an array by parsing the JSON if needed
      const formattedCarousels = carouselsData?.map(carousel => ({
        ...carousel,
        slides: Array.isArray(carousel.slides) ? carousel.slides : []
      })) || [];
      
      setCarousels(formattedCarousels);
    } catch (error) {
      console.error("Error fetching project data:", error);
      toast.error("Erro ao carregar dados do projeto");
    } finally {
      setLoading(false);
    }
  };

  const createCarousel = async () => {
    if (!projectId || !newCarousel.title.trim()) {
      toast.error("Título do carrossel é obrigatório");
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from("carousels")
        .insert([
          {
            project_id: projectId,
            title: newCarousel.title,
            description: newCarousel.description || null,
            slides: []
          }
        ])
        .select();
      
      if (error) throw error;
      
      toast.success("Carrossel criado com sucesso!");
      setNewCarousel({ title: "", description: "" });
      setDialogOpen(false);
      fetchProjectData();
    } catch (error) {
      console.error("Error creating carousel:", error);
      toast.error("Erro ao criar carrossel");
    }
  };

  const editCarousel = (carouselId: string) => {
    // Navigate to carousel editor page
    navigate(`/carousels/${carouselId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <p>Carregando...</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen p-4">
        <div className="max-w-6xl mx-auto text-center py-20">
          <h2 className="text-2xl font-bold mb-4">Projeto não encontrado</h2>
          <Button onClick={() => navigate("/projects")}>
            Voltar para Projetos
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 bg-gradient-to-br from-brand-light to-white">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <Button 
            variant="outline" 
            onClick={() => navigate("/projects")}
            className="mb-4"
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Voltar para Projetos
          </Button>
          
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-brand-primary">{project.name}</h1>
              <p className="text-muted-foreground">
                {project.business_info?.business_name}
              </p>
              {project.description && (
                <p className="mt-2 text-sm">{project.description}</p>
              )}
            </div>
            
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <PlusIcon size={16} />
                  <span>Novo Carrossel</span>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Criar Novo Carrossel</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Título</label>
                    <Input
                      value={newCarousel.title}
                      onChange={(e) => setNewCarousel(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Título do carrossel"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Descrição (opcional)</label>
                    <Textarea
                      value={newCarousel.description}
                      onChange={(e) => setNewCarousel(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Descrição do carrossel"
                      rows={3}
                    />
                  </div>
                  <Button onClick={createCarousel} className="w-full">
                    Criar Carrossel
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        
        <h2 className="text-xl font-semibold mb-4">Carrosséis</h2>
        
        {carousels.length === 0 ? (
          <div className="text-center py-20 bg-muted/30 rounded-lg">
            <h3 className="text-xl font-medium mb-2">Nenhum carrossel encontrado</h3>
            <p className="text-muted-foreground mb-6">
              Crie seu primeiro carrossel para começar a criar conteúdo.
            </p>
            <Button onClick={() => setDialogOpen(true)}>
              Criar Novo Carrossel
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {carousels.map(carousel => (
              <Card key={carousel.id} className="overflow-hidden">
                <CardHeader>
                  <CardTitle>{carousel.title}</CardTitle>
                  <CardDescription>
                    {new Date(carousel.created_at).toLocaleDateString("pt-BR")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {carousel.description || "Sem descrição"}
                  </p>
                  <p className="text-sm mt-2">
                    {carousel.slides.length} slide{carousel.slides.length !== 1 ? 's' : ''}
                  </p>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button 
                    onClick={() => editCarousel(carousel.id)}
                  >
                    Editar Carrossel
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectDetail;
