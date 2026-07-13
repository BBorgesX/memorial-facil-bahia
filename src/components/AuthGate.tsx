import { ReactNode, useEffect, useRef, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { LoaderCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { sincronizarTudo } from '@/lib/sync';

/**
 * Protege as páginas internas: exige login e roda a sincronização com a
 * nuvem antes de exibir o conteúdo (assim as páginas já leem dados atuais).
 */
export function AuthGate({ children }: { children: ReactNode }) {
  const [estado, setEstado] = useState<'carregando' | 'logado' | 'deslogado'>('carregando');
  const sincronizado = useRef(false);

  useEffect(() => {
    const aplicar = async (logado: boolean) => {
      if (!logado) {
        sincronizado.current = false;
        setEstado('deslogado');
        return;
      }
      if (!sincronizado.current) {
        sincronizado.current = true;
        await sincronizarTudo();
      }
      setEstado('logado');
    };

    supabase.auth.getSession().then(({ data }) => aplicar(!!data.session));
    const { data: escuta } = supabase.auth.onAuthStateChange((_evento, sessao) => {
      void aplicar(!!sessao);
    });
    return () => escuta.subscription.unsubscribe();
  }, []);

  if (estado === 'carregando') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 text-muted-foreground">
        <LoaderCircle className="w-8 h-8 animate-spin" />
        <p className="text-sm">Sincronizando seus dados…</p>
      </div>
    );
  }
  if (estado === 'deslogado') return <Navigate to="/login" replace />;
  return <>{children}</>;
}
