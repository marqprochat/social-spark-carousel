
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { PlusIcon } from "lucide-react";

interface Project {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  business_id: string;
  business_info?: {
    business_name: string;
  };
}

const Projects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [newProject, setNewProject] = useState({ name: "", description: "" });
  const [businessOptions, setBusinessOptions] = useState<{ id: string; business_name: string }[]>([]);
  const [selectedBusinessId, setSelectedBusinessId] = useState<string>("");
  const [dialogOpen, setDialogOpen] = useState(false);
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
        
        fetchUserBusinesses();
        fetchProjects();
        
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
  }, [navigate]);

  const fetchUserBusinesses = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from("business_info")
        .select("id, business_name")
        .eq("user_id", user.id);
      
      if (error) throw error;
      
      setBusinessOptions(data || []);
      if (data && data.length > 0) {
        setSelectedBusinessId(data[0].id);
      }
    } catch (error) {
      console.error("Error fetching businesses:", error);
      toast.error("Erro ao carregar informações das empresas");
    }
  };

  const fetchProjects = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("projects")
        .select(`
          *,
          business_info (
            business_name
          )
        `)
        .eq("user_id", user.id)
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

  const createProject = async () => {
    if (!user) return;
    if (!newProject.name.trim()) {
      toast.error("Nome do projeto é obrigatório");
      return;
    }
    if (!selectedBusinessId) {
      toast.error("Selecione uma empresa para o projeto");
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from("projects")
        .insert([
          {
            user_id: user.id,
            business_id: selectedBusinessId,
            name: newProject.name,
            description: newProject.description || null
          }
        ])
        .select();
      
      if (error) throw error;
      
      toast.success("Projeto criado com sucesso!");
      setNewProject({ name: "", description: "" });
      setDialogOpen(false);
      fetchProjects();
    } catch (error) {
      console.error("Error creating project:", error);
      toast.error("Erro ao criar projeto");
    }
  };

  const viewProject = (projectId: string) => {
    navigate(`/projects/${projectId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <p>Carregando projetos...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 bg-gradient-to-br from-brand-light to-white">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-brand-primary">Seus Projetos</h1>
          
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <PlusIcon size={16} />
                <span>Novo Projeto</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar Novo Projeto</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                {businessOptions.length > 0 ? (
                  <>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Empresa</label>
                      <select 
                        className="w-full rounded-md border border-input bg-background px-3 h-10"
                        value={selectedBusinessId}
                        onChange={(e) => setSelectedBusinessId(e.target.value)}
                      >
                        {businessOptions.map(business => (
                          <option key={business.id} value={business.id}>
                            {business.business_name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Nome do Projeto</label>
                      <Input
                        value={newProject.name}
                        onChange={(e) => setNewProject(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Nome do projeto"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Descrição (opcional)</label>
                      <Textarea
                        value={newProject.description}
                        onChange={(e) => setNewProject(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Descrição do projeto"
                        rows={3}
                      />
                    </div>
                    <Button onClick={createProject} className="w-full">
                      Criar Projeto
                    </Button>
                  </>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-sm text-muted-foreground mb-4">
                      Você precisa cadastrar uma empresa antes de criar projetos.
                    </p>
                    <Button onClick={() => navigate('/')} variant="outline">
                      Cadastrar Empresa
                    </Button>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
        
        {projects.length === 0 ? (
          <div className="text-center py-20 bg-muted/30 rounded-lg">
            <h3 className="text-xl font-medium mb-2">Nenhum projeto encontrado</h3>
            <p className="text-muted-foreground mb-6">
              Crie seu primeiro projeto para começar a gerenciar seus carrosséis.
            </p>
            {businessOptions.length > 0 && (
              <Button onClick={() => setDialogOpen(true)}>
                Criar Novo Projeto
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map(project => (
              <Card key={project.id} className="overflow-hidden">
                <CardHeader>
                  <CardTitle>{project.name}</CardTitle>
                  <CardDescription>
                    {project.business_info?.business_name}
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
                    onClick={() => viewProject(project.id)}
                  >
                    Ver Detalhes
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

export default Projects;
