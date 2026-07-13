/**
 * Store global do FirePro Suite (Context + cache local + Supabase).
 *
 * Mantém: usuário autenticado (Supabase Auth), perfil do responsável
 * técnico, projeto ativo e lista de projetos do usuário. O localStorage
 * funciona como cache de leitura; as gravações replicam para a nuvem e a
 * sincronização completa roda no login (lib/sync.ts).
 */

/* eslint-disable react-refresh/only-export-components */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  carregarProjeto,
  DadosProjeto,
  listarProjetos,
  novoProjeto,
  ResumoProjeto,
  salvarProjeto,
  UFProjeto,
} from '@/lib/projeto';
import {
  carregarPerfil,
  PerfilProfissional,
  perfilPadrao,
  salvarPerfil as persistirPerfil,
  sair as authSair,
  Usuario,
  usuarioAtual,
} from '@/services/auth';
import { sincronizarTudo } from '@/lib/sync';
import { ConfigUF, getNormas } from '@/data/normas';

const CHAVE_ATIVO = (userId: string) => `fps:ativo:${userId}`;

interface AppStore {
  usuario: Usuario | null;
  /** true enquanto a sessão é restaurada e os dados sincronizam com a nuvem */
  carregandoSessao: boolean;
  /** Atualiza o usuário após login/cadastro (páginas de auth chamam isto). */
  setUsuario: (u: Usuario | null) => void;
  sair: () => void;

  perfil: PerfilProfissional;
  salvarPerfil: (p: PerfilProfissional) => void;

  projetos: ResumoProjeto[];
  recarregarProjetos: () => void;

  /** Projeto ativo — contexto de todos os módulos. */
  projetoAtivo: DadosProjeto | null;
  setProjetoAtivoId: (id: string | null) => void;
  /** Relê o projeto ativo do armazenamento (após edições no editor). */
  recarregarProjetoAtivo: () => void;
  /** Atualiza e persiste o projeto ativo (usado pelos módulos). */
  atualizarProjetoAtivo: (mudancas: Partial<DadosProjeto>) => void;
  criarProjeto: (nome?: string) => DadosProjeto;

  /** UF ativa (do projeto ativo, ou padrão do perfil) + normas da UF. */
  uf: UFProjeto;
  setUf: (uf: UFProjeto) => void;
  normas: ConfigUF;
}

const AppContext = createContext<AppStore | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuarioEstado] = useState<Usuario | null>(null);
  const [carregandoSessao, setCarregandoSessao] = useState(true);
  const [perfil, setPerfil] = useState<PerfilProfissional>(() => perfilPadrao());
  const [projetos, setProjetos] = useState<ResumoProjeto[]>([]);
  const [projetoAtivo, setProjetoAtivo] = useState<DadosProjeto | null>(null);
  // UF exibida quando não há projeto ativo (padrão do perfil)
  const [ufSemProjeto, setUfSemProjeto] = useState<UFProjeto>('BA');

  const recarregarProjetos = useCallback(() => {
    setProjetos(listarProjetos(usuario?.id));
  }, [usuario]);

  const setUsuario = useCallback((u: Usuario | null) => {
    setUsuarioEstado(u);
    if (u) {
      const p = carregarPerfil(u.id);
      setPerfil(p);
      setUfSemProjeto(p.ufPadrao);
      setProjetos(listarProjetos(u.id));
      const id = localStorage.getItem(CHAVE_ATIVO(u.id));
      setProjetoAtivo(id ? carregarProjeto(id) : null);
      // Sincroniza com a nuvem em segundo plano e relê o cache ao terminar
      void sincronizarTudo().then(() => {
        setProjetos(listarProjetos(u.id));
        const ativo = localStorage.getItem(CHAVE_ATIVO(u.id));
        setProjetoAtivo(ativo ? carregarProjeto(ativo) : null);
      });
    } else {
      setPerfil(perfilPadrao());
      setProjetoAtivo(null);
      setProjetos([]);
    }
  }, []);

  // Restaura a sessão do Supabase ao abrir o app
  useEffect(() => {
    let montado = true;
    usuarioAtual()
      .then((u) => {
        if (!montado) return;
        if (u) setUsuario(u);
      })
      .finally(() => {
        if (montado) setCarregandoSessao(false);
      });
    return () => {
      montado = false;
    };
  }, [setUsuario]);

  const sair = useCallback(() => {
    authSair();
    setUsuario(null);
  }, [setUsuario]);

  const salvarPerfil = useCallback(
    (p: PerfilProfissional) => {
      setPerfil(p);
      setUfSemProjeto(p.ufPadrao);
      if (usuario) persistirPerfil(usuario.id, p);
    },
    [usuario],
  );

  const setProjetoAtivoId = useCallback(
    (id: string | null) => {
      if (usuario) {
        if (id) localStorage.setItem(CHAVE_ATIVO(usuario.id), id);
        else localStorage.removeItem(CHAVE_ATIVO(usuario.id));
      }
      setProjetoAtivo(id ? carregarProjeto(id) : null);
    },
    [usuario],
  );

  const recarregarProjetoAtivo = useCallback(() => {
    setProjetoAtivo((atual) => (atual ? carregarProjeto(atual.id) : atual));
    recarregarProjetos();
  }, [recarregarProjetos]);

  const atualizarProjetoAtivo = useCallback(
    (mudancas: Partial<DadosProjeto>) => {
      setProjetoAtivo((atual) => {
        if (!atual) return atual;
        const atualizado = salvarProjeto({ ...atual, ...mudancas });
        return atualizado;
      });
      recarregarProjetos();
    },
    [recarregarProjetos],
  );

  const criarProjeto = useCallback(
    (nome = 'Novo Projeto') => {
      const base = novoProjeto(nome, usuario?.id ?? '', perfil.ufPadrao);
      // Injeta o responsável técnico do perfil automaticamente
      base.respTecnicoNome = perfil.nome;
      base.respTecnicoRegistro = perfil.registro;
      const salvo = salvarProjeto(base);
      recarregarProjetos();
      if (usuario) localStorage.setItem(CHAVE_ATIVO(usuario.id), salvo.id);
      setProjetoAtivo(salvo);
      return salvo;
    },
    [usuario, perfil, recarregarProjetos],
  );

  // Sincroniza o projeto ativo quando editado em outra tela (ex.: editor)
  useEffect(() => {
    const aoFocar = () => {
      setProjetoAtivo((atual) => (atual ? carregarProjeto(atual.id) : atual));
      recarregarProjetos();
    };
    window.addEventListener('focus', aoFocar);
    return () => window.removeEventListener('focus', aoFocar);
  }, [recarregarProjetos]);

  const uf: UFProjeto = projetoAtivo?.uf ?? ufSemProjeto;

  const setUf = useCallback(
    (novaUf: UFProjeto) => {
      if (projetoAtivo) atualizarProjetoAtivo({ uf: novaUf });
      else setUfSemProjeto(novaUf);
    },
    [projetoAtivo, atualizarProjetoAtivo],
  );

  const valor = useMemo<AppStore>(
    () => ({
      usuario,
      carregandoSessao,
      setUsuario,
      sair,
      perfil,
      salvarPerfil,
      projetos,
      recarregarProjetos,
      projetoAtivo,
      setProjetoAtivoId,
      recarregarProjetoAtivo,
      atualizarProjetoAtivo,
      criarProjeto,
      uf,
      setUf,
      normas: getNormas(uf),
    }),
    [
      usuario,
      carregandoSessao,
      setUsuario,
      sair,
      perfil,
      salvarPerfil,
      projetos,
      recarregarProjetos,
      projetoAtivo,
      setProjetoAtivoId,
      recarregarProjetoAtivo,
      atualizarProjetoAtivo,
      criarProjeto,
      uf,
      setUf,
    ],
  );

  return <AppContext.Provider value={valor}>{children}</AppContext.Provider>;
}

export function useApp(): AppStore {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp deve ser usado dentro de <AppProvider>.');
  return ctx;
}
