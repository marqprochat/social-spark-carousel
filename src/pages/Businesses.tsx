
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { PlusIcon, Pencil, Trash2 } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

interface BusinessCard {
  id: string;
  business_name: string;
  industry: string;
  additional_info: string | null;
}

const Businesses = () => {
  const [businesses, setBusinesses] = useState<BusinessCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [businessToEdit, setBusinessToEdit] = useState<BusinessCard | null>(null);
  const [businessToDelete, setBusinessToDelete] = useState<string | null>(null);
  const [businessForm, setBusinessForm] = useState({
    business_name: "",
    industry: "",
    additional_info: ""
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
        
        fetchUserBusinesses(session.user.id);
        
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
      setBusinesses(data || []);
    } catch (error) {
      console.error("Error fetching businesses:", error);
      toast.error("Erro ao carregar empresas");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setBusinessForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateBusiness = async () => {
    if (!businessForm.business_name || !businessForm.industry) {
      toast.error("Nome da empresa e indústria são obrigatórios");
      return;
    }

    try {
      const { data, error } = await supabase.from("business_info").insert([
        {
          user_id: user.id,
          business_name: businessForm.business_name,
          industry: businessForm.industry,
          additional_info: businessForm.additional_info || null
        }
      ]).select();
      
      if (error) throw error;
      
      toast.success("Empresa criada com sucesso!");
      setDialogOpen(false);
      setBusinessForm({ business_name: "", industry: "", additional_info: "" });
      fetchUserBusinesses(user.id);
    } catch (error) {
      console.error("Error creating business:", error);
      toast.error("Erro ao criar empresa");
    }
  };

  const handleEditBusiness = async () => {
    if (!businessToEdit) return;
    if (!businessForm.business_name || !businessForm.industry) {
      toast.error("Nome da empresa e indústria são obrigatórios");
      return;
    }

    try {
      const { error } = await supabase
        .from("business_info")
        .update({
          business_name: businessForm.business_name,
          industry: businessForm.industry,
          additional_info: businessForm.additional_info || null
        })
        .eq("id", businessToEdit.id);
      
      if (error) throw error;
      
      toast.success("Empresa atualizada com sucesso!");
      setDialogOpen(false);
      setBusinessToEdit(null);
      fetchUserBusinesses(user.id);
    } catch (error) {
      console.error("Error updating business:", error);
      toast.error("Erro ao atualizar empresa");
    }
  };

  const handleDeleteBusiness = async () => {
    if (!businessToDelete) return;

    try {
      // Check if there are projects associated with this business
      const { data: projects, error: checkError } = await supabase
        .from("projects")
        .select("id")
        .eq("business_id", businessToDelete);
      
      if (checkError) throw checkError;
      
      // Delete projects associated with this business if any
      if (projects && projects.length > 0) {
        const projectIds = projects.map(p => p.id);
        
        // Delete carousels associated with these projects
        for (const projectId of projectIds) {
          const { error: carouselError } = await supabase
            .from("carousels")
            .delete()
            .eq("project_id", projectId);
          
          if (carouselError) throw carouselError;
        }
        
        // Delete projects
        const { error: projectError } = await supabase
          .from("projects")
          .delete()
          .in("id", projectIds);
        
        if (projectError) throw projectError;
      }
      
      // Finally delete the business
      const { error } = await supabase
        .from("business_info")
        .delete()
        .eq("id", businessToDelete);
      
      if (error) throw error;
      
      toast.success("Empresa excluída com sucesso!");
      setAlertDialogOpen(false);
      setBusinessToDelete(null);
      fetchUserBusinesses(user.id);
    } catch (error) {
      console.error("Error deleting business:", error);
      toast.error("Erro ao excluir empresa");
    }
  };

  const openEditDialog = (business: BusinessCard) => {
    setBusinessToEdit(business);
    setBusinessForm({
      business_name: business.business_name,
      industry: business.industry,
      additional_info: business.additional_info || ""
    });
    setDialogOpen(true);
  };

  const openCreateDialog = () => {
    setBusinessToEdit(null);
    setBusinessForm({ business_name: "", industry: "", additional_info: "" });
    setDialogOpen(true);
  };

  const viewProjects = (businessId: string, businessName: string) => {
    navigate(`/businesses/${businessId}`, { state: { businessName } });
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
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-brand-primary">Suas Empresas</h1>
          
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openCreateDialog} className="flex items-center gap-2">
                <PlusIcon size={16} />
                <span>Nova Empresa</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {businessToEdit ? "Editar Empresa" : "Criar Nova Empresa"}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nome da Empresa</label>
                  <Input
                    name="business_name"
                    value={businessForm.business_name}
                    onChange={handleInputChange}
                    placeholder="Nome da empresa"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Indústria</label>
                  <Input
                    name="industry"
                    value={businessForm.industry}
                    onChange={handleInputChange}
                    placeholder="Ex: Tecnologia, Varejo, etc."
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Descrição (opcional)</label>
                  <Textarea
                    name="additional_info"
                    value={businessForm.additional_info}
                    onChange={handleInputChange}
                    placeholder="Descrição da empresa"
                    rows={3}
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <DialogClose asChild>
                    <Button variant="outline">Cancelar</Button>
                  </DialogClose>
                  <Button 
                    onClick={businessToEdit ? handleEditBusiness : handleCreateBusiness}
                  >
                    {businessToEdit ? "Salvar" : "Criar"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        
        {businesses.length === 0 ? (
          <div className="text-center py-20 bg-muted/30 rounded-lg">
            <h3 className="text-xl font-medium mb-2">Nenhuma empresa encontrada</h3>
            <p className="text-muted-foreground mb-6">
              Crie sua primeira empresa para começar a gerenciar seus projetos.
            </p>
            <Button onClick={openCreateDialog}>
              Criar Nova Empresa
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {businesses.map(business => (
              <Card key={business.id} className="overflow-hidden">
                <CardHeader>
                  <CardTitle>{business.business_name}</CardTitle>
                  <CardDescription>{business.industry}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {business.additional_info || "Sem descrição"}
                  </p>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button 
                    variant="outline" 
                    onClick={() => viewProjects(business.id, business.business_name)}
                  >
                    Ver Projetos
                  </Button>
                  <div className="flex gap-2">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => openEditDialog(business)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <AlertDialog open={alertDialogOpen} onOpenChange={setAlertDialogOpen}>
                      <AlertDialogTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => {
                            setBusinessToDelete(business.id);
                            setAlertDialogOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Excluir Empresa</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza que deseja excluir esta empresa? Esta ação não pode ser desfeita e todos os projetos e carrosséis associados serão excluídos.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={handleDeleteBusiness}
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

export default Businesses;
