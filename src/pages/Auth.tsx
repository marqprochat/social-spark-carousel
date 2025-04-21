
import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const AuthPage = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        navigate("/");
      }
    });
    // Check for session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate("/");
    });
    return () => listener.subscription.unsubscribe();
  }, [navigate]);

  // Main auth handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    if (!email || !password) {
      toast.error("Preencha todos os campos.", {
        description: "E-mail e senha são obrigatórios."
      });
      setAuthLoading(false);
      return;
    }
    try {
      if (isLogin) {
        // Log in
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          toast.error("Erro ao entrar", {
            description: error.message
          });
          console.error("Login error:", error);
        } else {
          toast.success("Login realizado com sucesso!");
          navigate("/");
        }
      } else {
        // Sign up
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) {
          toast.error("Erro ao cadastrar", {
            description: error.message
          });
          console.error("Signup error:", error);
        } else {
          toast.success("Cadastro realizado!", {
            description: "Verifique seu e-mail para confirmar o cadastro."
          });
          // Note: don't navigate after signup - user needs to verify email first
        }
      }
    } catch (error) {
      console.error("Authentication error:", error);
      toast.error("Erro na autenticação", {
        description: "Ocorreu um erro inesperado. Tente novamente."
      });
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-brand-light to-white p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm bg-white p-8 rounded-lg shadow-lg space-y-4">
        <h2 className="text-2xl font-bold mb-4 text-center">
          {isLogin ? "Entrar" : "Criar Conta"}
        </h2>
        <Input
          type="email"
          placeholder="E-mail"
          autoComplete="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <Input
          type="password"
          placeholder="Senha"
          autoComplete="current-password"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        <Button type="submit" className="w-full" disabled={authLoading}>
          {authLoading ? "Processando..." : isLogin ? "Entrar" : "Cadastrar"}
        </Button>
        <div className="text-center text-sm pt-2">
          {isLogin ? (
            <>
              Não tem cadastro?
              <button
                className="ml-1 text-brand-blue underline"
                type="button"
                onClick={() => setIsLogin(false)}
              >
                Crie uma conta
              </button>
            </>
          ) : (
            <>
              Já possui cadastro?
              <button
                className="ml-1 text-brand-blue underline"
                type="button"
                onClick={() => setIsLogin(true)}
              >
                Entrar
              </button>
            </>
          )}
        </div>
      </form>
    </div>
  );
};

export default AuthPage;
