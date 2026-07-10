/**
 * Autenticação (MVP mock/local) — login, cadastro e recuperação de senha.
 * A camada services/auth.ts está isolada para trocar por Supabase Auth.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Flame } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { cadastrar, entrar, recuperarSenha } from '@/services/auth';
import { useApp } from '@/store/appStore';
import heroImage from '@/assets/fire-safety-hero.jpg';

export default function Login() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { setUsuario } = useApp();
  const [carregando, setCarregando] = useState(false);

  const [loginEmail, setLoginEmail] = useState('');
  const [loginSenha, setLoginSenha] = useState('');

  const [cadNome, setCadNome] = useState('');
  const [cadEmail, setCadEmail] = useState('');
  const [cadSenha, setCadSenha] = useState('');

  const [recEmail, setRecEmail] = useState('');
  const [recSenha, setRecSenha] = useState('');

  const executar = (acao: () => void) => {
    setCarregando(true);
    try {
      acao();
    } catch (e) {
      toast({
        title: 'Não foi possível continuar',
        description: e instanceof Error ? e.message : 'Erro inesperado.',
        variant: 'destructive',
      });
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div
        className="relative hidden lg:block bg-cover bg-center"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-professional opacity-90" />
        <div className="relative h-full flex items-center justify-center p-12 text-white">
          <div className="max-w-md">
            <h1 className="text-4xl font-bold mb-4 flex items-center gap-3">
              <Flame className="w-10 h-10" /> FirePro Suite
            </h1>
            <p className="text-xl text-white/90 mb-3">
              A plataforma que evita reprovação (comunique-se) no Corpo de Bombeiros.
            </p>
            <p className="text-white/75 text-sm">
              Entre com os dados da edificação uma única vez e gere classificação, cálculos,
              memoriais, checklists e respostas — parametrizado por UF (BA · CBMBA e SP · CBMSP).
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center p-6 bg-muted/40">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 lg:hidden">
              <Flame className="w-6 h-6 text-primary" /> FirePro Suite
            </CardTitle>
            <CardTitle className="hidden lg:block">Acesse a sua conta</CardTitle>
            <CardDescription>
              MVP local: as contas e projetos ficam salvos neste navegador.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="entrar">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="entrar">Entrar</TabsTrigger>
                <TabsTrigger value="cadastrar">Cadastrar</TabsTrigger>
                <TabsTrigger value="recuperar">Recuperar</TabsTrigger>
              </TabsList>

              <TabsContent value="entrar" className="space-y-4 mt-4">
                <div className="space-y-1.5">
                  <Label htmlFor="login-email">E-mail</Label>
                  <Input
                    id="login-email"
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="voce@empresa.com.br"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="login-senha">Senha</Label>
                  <Input
                    id="login-senha"
                    type="password"
                    value={loginSenha}
                    onChange={(e) => setLoginSenha(e.target.value)}
                  />
                </div>
                <Button
                  className="w-full"
                  disabled={carregando}
                  onClick={() =>
                    executar(() => {
                      const u = entrar(loginEmail, loginSenha);
                      setUsuario(u);
                      toast({ title: `Bem-vindo de volta, ${u.nome.split(' ')[0]}!` });
                      navigate('/');
                    })
                  }
                >
                  Entrar
                </Button>
              </TabsContent>

              <TabsContent value="cadastrar" className="space-y-4 mt-4">
                <div className="space-y-1.5">
                  <Label htmlFor="cad-nome">Nome completo</Label>
                  <Input id="cad-nome" value={cadNome} onChange={(e) => setCadNome(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="cad-email">E-mail</Label>
                  <Input
                    id="cad-email"
                    type="email"
                    value={cadEmail}
                    onChange={(e) => setCadEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="cad-senha">Senha (mínimo 6 caracteres)</Label>
                  <Input
                    id="cad-senha"
                    type="password"
                    value={cadSenha}
                    onChange={(e) => setCadSenha(e.target.value)}
                  />
                </div>
                <Button
                  className="w-full"
                  disabled={carregando}
                  onClick={() =>
                    executar(() => {
                      const u = cadastrar(cadNome, cadEmail, cadSenha);
                      setUsuario(u);
                      toast({
                        title: 'Conta criada!',
                        description: 'Preencha o seu perfil de responsável técnico em Configurações.',
                      });
                      navigate('/configuracoes');
                    })
                  }
                >
                  Criar conta
                </Button>
              </TabsContent>

              <TabsContent value="recuperar" className="space-y-4 mt-4">
                <p className="text-xs text-muted-foreground">
                  MVP local: a redefinição é imediata. Na fase 2 este fluxo passa a ser por e-mail
                  (Supabase Auth).
                </p>
                <div className="space-y-1.5">
                  <Label htmlFor="rec-email">E-mail da conta</Label>
                  <Input
                    id="rec-email"
                    type="email"
                    value={recEmail}
                    onChange={(e) => setRecEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="rec-senha">Nova senha</Label>
                  <Input
                    id="rec-senha"
                    type="password"
                    value={recSenha}
                    onChange={(e) => setRecSenha(e.target.value)}
                  />
                </div>
                <Button
                  className="w-full"
                  variant="outline"
                  disabled={carregando}
                  onClick={() =>
                    executar(() => {
                      recuperarSenha(recEmail, recSenha);
                      toast({ title: 'Senha redefinida', description: 'Entre com a nova senha.' });
                    })
                  }
                >
                  Redefinir senha
                </Button>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
