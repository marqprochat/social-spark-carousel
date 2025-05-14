
import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { ChevronLeft, PlusIcon, Pencil, Trash2 } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

interface Project {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  business_id: string;
}

const BusinessDetail = () => {
  const { businessId } = useParams<{ businessId: string }>();
  const location = useLocation();
  const businessName = (location.state as any)?.businessName || "Empresa";
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [projectToEdit, setProjectToEdit] = useState<Project | null>(null);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
  const [projectForm, setProjectForm] = useState({
    name: "",
    description: ""
  });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [alertDialogOpen, setAlertDialogOpen] = useState(false);
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
        
        if (businessId) {
          fetchProjects();
        }
        
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
      } finally {
        setLoading(false);
      }
    };
    
    checkSession();
  }, [navigate, businessId]);

  const fetchProjects = async () => {
    if (!businessId) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("business_id", businessId)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error("Error fetching projects:", error);
      toast.error("Erro ao carregar projetos");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProjectForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateProject = async () => {
    if (!projectForm.name || !businessId) {
      toast.error("Nome do projeto é obrigatório");
      return;
    }

    try {
      const { data, error } = await supabase
        .from("projects")
        .insert({
          user_id: user.id,
          business_id: businessId,
          name: projectForm.name,
          description: projectForm.description || null
        })
        .select();
      
      if (error) throw error;
      
      toast.success("Projeto criado com sucesso!");
      setDialogOpen(false);
      setProjectForm({ name: "", description: "" });
      fetchProjects();
    } catch (error) {
      console.error("Error creating project:", error);
      toast.error("Erro ao criar projeto");
    }
  };

  const handleEditProject = async () => {
    if (!projectToEdit) return;
    if (!projectForm.name) {
      toast.error("Nome do projeto é obrigatório");
      return;
    }

    try {
      const { error } = await supabase
        .from("projects")
        .update({
          name: projectForm.name,
          description: projectForm.description || null
        })
        .eq("id", projectToEdit.id);
      
      if (error) throw error;
      
      toast.success("Projeto atualizado com sucesso!");
      setDialogOpen(false);
      setProjectToEdit(null);
      fetchProjects();
    } catch (error) {
      console.error("Error updating project:", error);
      toast.error("Erro ao atualizar projeto");
    }
  };

  const handleDeleteProject = async () => {
    if (!projectToDelete) return;

    try {
      // Delete carousels associated with this project first
      const { error: carouselError } = await supabase
        .from("carousels")
        .delete()
        .eq("project_id", projectToDelete);
      
      if (carouselError) throw carouselError;
      
      // Delete the project
      const { error } = await supabase
        .from("projects")
        .delete()
        .eq("id", projectToDelete);
      
      if (error) throw error;
      
      toast.success("Projeto excluído com sucesso!");
      setAlertDialogOpen(false);
      setProjectToDelete(null);
      fetchProjects();
    } catch (error) {
      console.error("Error deleting project:", error);
      toast.error("Erro ao excluir projeto");
    }
  };

  const openEditDialog = (project: Project) => {
    setProjectToEdit(project);
    setProjectForm({
      name: project.name,
      description: project.description || ""
    });
    setDialogOpen(true);
  };

  const openCreateDialog = () => {
    setProjectToEdit(null);
    setProjectForm({ name: "", description: "" });
    setDialogOpen(true);
  };

  const viewCarousels = (projectId: string) => {
    navigate(`/projects/${projectId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <p>Carregando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 bg-gradient-to-br from-brand-light to-white">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <Button 
            variant="outline" 
            onClick={() => navigate("/businesses")}
            className="mb-4"
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Voltar para Empresas
          </Button>
          
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-brand-primary">Projetos de {businessName}</h1>
            </div>
            
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={openCreateDialog} className="flex items-center gap-2">
                  <PlusIcon size={16} />
                  <span>Novo Projeto</span>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {projectToEdit ? "Editar Projeto" : "Criar Novo Projeto"}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Nome do Projeto</label>
                    <Input
                      name="name"
                      value={projectForm.name}
                      onChange={handleInputChange}
                      placeholder="Nome do projeto"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Descrição (opcional)</label>
                    <Textarea
                      name="description"
                      value={projectForm.description}
                      onChange={handleInputChange}
                      placeholder="Descrição do projeto"
                      rows={3}
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <DialogClose asChild>
                      <Button variant="outline">Cancelar</Button>
                    </DialogClose>
                    <Button 
                      onClick={projectToEdit ? handleEditProject : handleCreateProject}
                    >
                      {projectToEdit ? "Salvar" : "Criar"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        
        {projects.length === 0 ? (
          <div className="text-center py-20 bg-muted/30 rounded-lg">
            <h3 className="text-xl font-medium mb-2">Nenhum projeto encontrado</h3>
            <p className="text-muted-foreground mb-6">
              Crie seu primeiro projeto para começar a gerenciar seus carrosséis.
            </p>
            <Button onClick={openCreateDialog}>
              Criar Novo Projeto
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map(project => (
              <Card key={project.id} className="overflow-hidden">
                <CardHeader>
                  <CardTitle>{project.name}</CardTitle>
                  <CardDescription>
                    {new Date(project.created_at).toLocaleDateString("pt-BR")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {project.description || "Sem descrição"}
                  </p>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button 
                    variant="outline" 
                    onClick={() => viewCarousels(project.id)}
                  >
                    Ver Carrosséis
                  </Button>
                  <div className="flex gap-2">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => openEditDialog(project)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <AlertDialog open={alertDialogOpen} onOpenChange={setAlertDialogOpen}>
                      <AlertDialogTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => {
                            setProjectToDelete(project.id);
                            setAlertDialogOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Excluir Projeto</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza que deseja excluir este projeto? Esta ação não pode ser desfeita e todos os carrosséis associados serão excluídos.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={handleDeleteProject}
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

export default BusinessDetail;
