/**
 * Casca (shell) do FirePro Suite — sidebar fixa + topbar com o contexto
 * global: seletor de Projeto ativo e seletor de UF (BA/SP).
 */

import { NavLink, Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  Calculator,
  Droplets,
  FilePlus2,
  FileText,
  Flame,
  FolderKanban,
  Home,
  ListChecks,
  LogOut,
  MailWarning,
  Menu,
  Ruler,
  Settings,
  ShieldCheck,
  Timer,
  User,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useApp } from '@/store/appStore';
import type { UFProjeto } from '@/lib/projeto';
import { cn } from '@/lib/utils';

interface ItemNav {
  rota: string;
  rotulo: string;
  icone: typeof Home;
  fim?: boolean;
}

interface GrupoNav {
  titulo?: string;
  itens: ItemNav[];
}

const NAVEGACAO: GrupoNav[] = [
  {
    itens: [
      { rota: '/', rotulo: 'Dashboard', icone: Home, fim: true },
      { rota: '/projetos', rotulo: 'Projetos', icone: FolderKanban },
      { rota: '/classificacao', rotulo: 'Classificação & Enquadramento', icone: ShieldCheck },
    ],
  },
  {
    titulo: 'Cálculos',
    itens: [
      { rota: '/calculos/rti', rotulo: 'RTI', icone: Calculator },
      { rota: '/calculos/trrf', rotulo: 'TRRF', icone: Timer },
      { rota: '/calculos/hidraulica', rotulo: 'Hidráulica (Hidrantes)', icone: Droplets },
      { rota: '/distancias', rotulo: 'Distâncias / Rotas de Fuga', icone: Ruler },
    ],
  },
  {
    titulo: 'Memoriais',
    itens: [
      { rota: '/memoriais/descritivo', rotulo: 'Memorial Descritivo', icone: FileText },
      { rota: '/memoriais/brigada', rotulo: 'Memorial de Brigada (IT 25)', icone: Flame },
    ],
  },
  {
    titulo: 'Aprovação',
    itens: [
      { rota: '/checklist', rotulo: 'Checklist CBM', icone: ListChecks },
      { rota: '/notificacao', rotulo: 'Resposta a Notificação', icone: MailWarning },
    ],
  },
  {
    itens: [{ rota: '/configuracoes', rotulo: 'Configurações', icone: Settings }],
  },
];

function Sidebar({ aoNavegar }: { aoNavegar?: () => void }) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 px-4 py-4 border-b">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Flame className="h-5 w-5" />
        </div>
        <div>
          <p className="font-bold leading-tight">FirePro Suite</p>
          <p className="text-[11px] text-muted-foreground leading-tight">PPCI · BA & SP</p>
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-4">
        {NAVEGACAO.map((grupo, i) => (
          <div key={i}>
            {grupo.titulo && (
              <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                {grupo.titulo}
              </p>
            )}
            <div className="space-y-0.5">
              {grupo.itens.map((item) => (
                <NavLink
                  key={item.rota}
                  to={item.rota}
                  end={item.fim}
                  onClick={aoNavegar}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors',
                      isActive
                        ? 'bg-primary text-primary-foreground font-medium'
                        : 'text-foreground/80 hover:bg-muted hover:text-foreground',
                    )
                  }
                >
                  <item.icone className="h-4 w-4 shrink-0" />
                  <span className="truncate">{item.rotulo}</span>
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>
      <p className="px-4 py-3 text-[10px] text-muted-foreground border-t">
        A plataforma que evita o comunique-se no Corpo de Bombeiros.
      </p>
    </div>
  );
}

export default function AppShell() {
  const {
    usuario,
    sair,
    projetos,
    projetoAtivo,
    setProjetoAtivoId,
    recarregarProjetoAtivo,
    criarProjeto,
    uf,
    setUf,
    normas,
  } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuAberto, setMenuAberto] = useState(false);

  // O editor de projeto grava direto no armazenamento: ao trocar de rota,
  // reler o projeto ativo garante que os módulos vejam os dados atuais.
  useEffect(() => {
    recarregarProjetoAtivo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  if (!usuario) return <Navigate to="/login" replace />;

  return (
    <div className="min-h-screen bg-muted/40">
      {/* Sidebar fixa (desktop) */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r bg-card lg:block">
        <Sidebar />
      </aside>

      {/* Sidebar móvel */}
      {menuAberto && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMenuAberto(false)} />
          <aside className="absolute inset-y-0 left-0 w-64 bg-card shadow-xl">
            <Sidebar aoNavegar={() => setMenuAberto(false)} />
          </aside>
        </div>
      )}

      <div className="lg:pl-64">
        {/* Topbar: contexto global — Projeto ativo + UF */}
        <header className="sticky top-0 z-20 border-b bg-card">
          <div className="flex flex-wrap items-center gap-2 px-4 py-2.5">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setMenuAberto(true)}
              aria-label="Abrir menu"
            >
              <Menu className="h-5 w-5" />
            </Button>

            <div className="flex items-center gap-2 min-w-0">
              <span className="text-xs text-muted-foreground hidden sm:inline">Projeto:</span>
              <Select
                value={projetoAtivo?.id ?? ''}
                onValueChange={(v) => {
                  if (v === '__novo__') {
                    const p = criarProjeto();
                    navigate(`/projeto/${p.id}`);
                  } else {
                    setProjetoAtivoId(v);
                  }
                }}
              >
                <SelectTrigger className="h-9 w-[210px] sm:w-[260px]">
                  <SelectValue placeholder="Selecionar projeto ativo…" />
                </SelectTrigger>
                <SelectContent>
                  {projetos.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.nome}
                    </SelectItem>
                  ))}
                  <SelectItem value="__novo__">
                    <span className="flex items-center gap-1.5">
                      <FilePlus2 className="h-3.5 w-3.5" /> Novo projeto…
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-xs text-muted-foreground hidden sm:inline">UF:</span>
              <Select value={uf} onValueChange={(v) => setUf(v as UFProjeto)}>
                <SelectTrigger className="h-9 w-[132px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BA">BA · CBMBA</SelectItem>
                  <SelectItem value="SP">SP · CBMSP</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {projetoAtivo?.status && (
              <Badge variant="secondary" className="hidden md:inline-flex">
                {projetoAtivo.status}
              </Badge>
            )}

            <div className="ml-auto">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <User className="h-4 w-4" />
                    <span className="hidden sm:inline max-w-[140px] truncate">{usuario.nome}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
                    {usuario.email}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/configuracoes')}>
                    <Settings className="h-4 w-4 mr-2" /> Configurações
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      sair();
                      navigate('/login');
                    }}
                  >
                    <LogOut className="h-4 w-4 mr-2" /> Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Aviso obrigatório: UF com referências ainda não validadas */}
          {!normas.validado && (
            <div className="flex items-start gap-2 border-t bg-amber-50 px-4 py-2 text-xs text-amber-900">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
              <p>
                <strong>{normas.orgao}:</strong> {normas.avisoValidacao}{' '}
                <a href={normas.linkITs} target="_blank" rel="noreferrer" className="underline">
                  Consultar ITs vigentes
                </a>
              </p>
            </div>
          )}
        </header>

        <main className="px-4 py-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}