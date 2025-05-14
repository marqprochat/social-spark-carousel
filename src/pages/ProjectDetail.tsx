import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { ChevronLeft, PlusIcon, Pencil, Trash2, Sparkles } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

interface Project {
  id: string;
  name: string;
  description: string | null;
  business_id: string;
  business_info?: {
    business_name: string;
    industry?: string;
    target_audience?: string;
    post_objective?: string;
    tone?: string;
    additional_info?: string;
  };
}

interface Carousel {
  id: string;
  title: string;
  description: string | null;
  slides: any[];
  created_at: string;
}

interface BusinessInfo {
  business_name: string;
  industry?: string;
  target_audience?: string;
  post_objective?: string;
  tone?: string;
  additional_info?: string;
}

const ProjectDetail = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [carousels, setCarousels] = useState<Carousel[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [carouselToEdit, setCarouselToEdit] = useState<Carousel | null>(null);
  const [carouselToDelete, setCarouselToDelete] = useState<string | null>(null);
  const [carouselForm, setCarouselForm] = useState({
    title: "",
    description: ""
  });
  const [alertDialogOpen, setAlertDialogOpen] = useState(false);
  const [businessInfo, setBusinessInfo] = useState<BusinessInfo | null>(null);
  const [isCreatingWithAI, setIsCreatingWithAI] = useState(false);
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
      
      // Fetch project details with business info
      const { data: projectData, error: projectError } = await supabase
        .from("projects")
        .select(`
          *,
          business_info (
            business_name,
            industry,
            target_audience,
            post_objective,
            tone,
            additional_info
          )
        `)
        .eq("id", projectId)
        .single();
      
      if (projectError) throw projectError;
      setProject(projectData);
      setBusinessInfo(projectData.business_info as BusinessInfo);
      
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCarouselForm((prev) => ({ ...prev, [name]: value }));
  };

  const createCarouselWithAI = async () => {
    if (!projectId || !carouselForm.title.trim()) {
      toast.error("Título do carrossel é obrigatório");
      return;
    }

    try {
      setIsCreatingWithAI(true);
      
      // Create empty carousel first
      const { data: carouselData, error: carouselError } = await supabase
        .from("carousels")
        .insert({
          project_id: projectId,
          title: carouselForm.title,
          description: carouselForm.description || null,
          slides: []
        })
        .select();
      
      if (carouselError) throw carouselError;
      
      toast.success("Carrossel criado com sucesso!");
      setCarouselForm({ title: "", description: "" });
      setDialogOpen(false);
      
      // Navigate to carousel editor where AI will automatically generate content
      if (carouselData && carouselData[0]) {
        navigate(`/carousels/${carouselData[0].id}`);
      } else {
        fetchProjectData(); // Refresh carousels list
      }
    } catch (error) {
      console.error("Error creating carousel:", error);
      toast.error("Erro ao criar carrossel");
    } finally {
      setIsCreatingWithAI(false);
    }
  };

  const createCarousel = async () => {
    if (!projectId || !carouselForm.title.trim()) {
      toast.error("Título do carrossel é obrigatório");
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from("carousels")
        .insert({
          project_id: projectId,
          title: carouselForm.title,
          description: carouselForm.description || null,
          slides: []
        })
        .select();
      
      if (error) throw error;
      
      toast.success("Carrossel criado com sucesso!");
      setCarouselForm({ title: "", description: "" });
      setDialogOpen(false);
      fetchProjectData();
    } catch (error) {
      console.error("Error creating carousel:", error);
      toast.error("Erro ao criar carrossel");
    }
  };

  const editCarousel = async () => {
    if (!carouselToEdit) return;
    if (!carouselForm.title) {
      toast.error("Título do carrossel é obrigatório");
      return;
    }

    try {
      const { error } = await supabase
        .from("carousels")
        .update({
          title: carouselForm.title,
          description: carouselForm.description || null
        })
        .eq("id", carouselToEdit.id);
      
      if (error) throw error;
      
      toast.success("Carrossel atualizado com sucesso!");
      setDialogOpen(false);
      setCarouselToEdit(null);
      fetchProjectData();
    } catch (error) {
      console.error("Error updating carousel:", error);
      toast.error("Erro ao atualizar carrossel");
    }
  };

  const deleteCarousel = async () => {
    if (!carouselToDelete) return;

    try {
      const { error } = await supabase
        .from("carousels")
        .delete()
        .eq("id", carouselToDelete);
      
      if (error) throw error;
      
      toast.success("Carrossel excluído com sucesso!");
      setAlertDialogOpen(false);
      setCarouselToDelete(null);
      fetchProjectData();
    } catch (error) {
      console.error("Error deleting carousel:", error);
      toast.error("Erro ao excluir carrossel");
    }
  };

  const openEditDialog = (carousel: Carousel) => {
    setCarouselToEdit(carousel);
    setCarouselForm({
      title: carousel.title,
      description: carousel.description || ""
    });
    setDialogOpen(true);
  };

  const openCreateDialog = () => {
    setCarouselToEdit(null);
    setCarouselForm({ title: "", description: "" });
    setDialogOpen(true);
  };

  const goToCarouselEditor = (carouselId: string) => {
    navigate(`/carousels/${carouselId}`);
  };

  const goToBusinessProjects = () => {
    if (project && project.business_id) {
      navigate(`/businesses/${project.business_id}`, { 
        state: { businessName: project.business_info?.business_name || "Empresa" } 
      });
    } else {
      navigate("/businesses");
    }
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
          <Button onClick={() => navigate("/businesses")}>
            Voltar para Empresas
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
            onClick={goToBusinessProjects}
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
                <Button onClick={openCreateDialog} className="flex items-center gap-2">
                  <PlusIcon size={16} />
                  <span>Novo Carrossel</span>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {carouselToEdit ? "Editar Carrossel" : "Criar Novo Carrossel"}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Título</label>
                    <Input
                      name="title"
                      value={carouselForm.title}
                      onChange={handleInputChange}
                      placeholder="Título do carrossel"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Descrição (opcional)</label>
                    <Textarea
                      name="description"
                      value={carouselForm.description}
                      onChange={handleInputChange}
                      placeholder="Descrição do carrossel"
                      rows={3}
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <DialogClose asChild>
                      <Button variant="outline">Cancelar</Button>
                    </DialogClose>
                    {carouselToEdit ? (
                      <Button onClick={editCarousel}>
                        Salvar
                      </Button>
                    ) : (
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          onClick={createCarousel}
                        >
                          Criar Vazio
                        </Button>
                        <Button 
                          onClick={createCarouselWithAI}
                          disabled={isCreatingWithAI}
                          className="flex items-center gap-2"
                        >
                          <Sparkles className="h-4 w-4" />
                          {isCreatingWithAI ? "Criando..." : "Criar com IA"}
                        </Button>
                      </div>
                    )}
                  </div>
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
            <div className="flex justify-center gap-4">
              <Button onClick={openCreateDialog} variant="outline">
                Criar Carrossel Vazio
              </Button>
              <Button onClick={() => {
                openCreateDialog();
                // Pre-fill with suggestion for AI generation
                setCarouselForm({
                  title: `Carrossel de ${project.business_info?.business_name || "Marketing"}`,
                  description: "Gerado com inteligência artificial"
                });
              }} className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Criar com IA
              </Button>
            </div>
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
                    onClick={() => goToCarouselEditor(carousel.id)}
                  >
                    Editar Carrossel
                  </Button>
                  <div className="flex gap-2">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => openEditDialog(carousel)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <AlertDialog open={alertDialogOpen} onOpenChange={setAlertDialogOpen}>
                      <AlertDialogTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => {
                            setCarouselToDelete(carousel.id);
                            setAlertDialogOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Excluir Carrossel</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza que deseja excluir este carrossel? Esta ação não pode ser desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={deleteCarousel}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Excluir
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
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
