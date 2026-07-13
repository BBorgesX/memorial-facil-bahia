import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Flame, LoaderCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

const MENSAGENS: Record<string, string> = {
  'Invalid login credentials': 'E-mail ou senha incorretos.',
  'Email not confirmed': 'Confirme seu e-mail: enviamos um link de confirmação para sua caixa de entrada.',
  'User already registered': 'Este e-mail já tem conta — use "Entrar".',
  'Password should be at least 6 characters.': 'A senha precisa ter pelo menos 6 caracteres.',
};

const Login = () => {
  const navigate = useNavigate();
  const [modo, setModo] = useState<'entrar' | 'criar'>('entrar');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [aviso, setAviso] = useState('');
  const [carregando, setCarregando] = useState(false);

  const enviar = async (e: FormEvent) => {
    e.preventDefault();
    setErro('');
    setAviso('');
    setCarregando(true);
    try {
      if (modo === 'entrar') {
        const { error } = await supabase.auth.signInWithPassword({ email, password: senha });
        if (error) throw error;
        navigate('/');
      } else {
        const { data, error } = await supabase.auth.signUp({ email, password: senha });
        if (error) throw error;
        if (data.session) {
          navigate('/');
        } else {
          setAviso('Conta criada! Verifique seu e-mail e clique no link de confirmação para entrar.');
        }
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setErro(MENSAGENS[msg] ?? msg);
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold flex items-center justify-center gap-2">
            <Flame className="w-7 h-7 text-primary" /> Memorial Fácil Bahia
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Entre para acessar seus projetos em qualquer dispositivo.
          </p>
        </div>
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">{modo === 'entrar' ? 'Entrar' : 'Criar conta'}</CardTitle>
            <CardDescription>
              {modo === 'entrar'
                ? 'Use o e-mail e a senha da sua conta.'
                : 'Seus projetos deste navegador serão migrados para a conta automaticamente.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={enviar} className="space-y-4">
              <div>
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="senha">Senha</Label>
                <Input
                  id="senha"
                  type="password"
                  required
                  minLength={6}
                  autoComplete={modo === 'entrar' ? 'current-password' : 'new-password'}
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                />
              </div>
              {erro && <p className="text-sm text-destructive">{erro}</p>}
              {aviso && <p className="text-sm text-emerald-600">{aviso}</p>}
              <Button type="submit" className="w-full" disabled={carregando}>
                {carregando && <LoaderCircle className="w-4 h-4 mr-2 animate-spin" />}
                {modo === 'entrar' ? 'Entrar' : 'Criar conta'}
              </Button>
            </form>
            <p className="text-sm text-muted-foreground text-center mt-4">
              {modo === 'entrar' ? (
                <>
                  Ainda não tem conta?{' '}
                  <button className="text-primary hover:underline" onClick={() => { setModo('criar'); setErro(''); setAviso(''); }}>
                    Criar conta
                  </button>
                </>
              ) : (
                <>
                  Já tem conta?{' '}
                  <button className="text-primary hover:underline" onClick={() => { setModo('entrar'); setErro(''); setAviso(''); }}>
                    Entrar
                  </button>
                </>
              )}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
