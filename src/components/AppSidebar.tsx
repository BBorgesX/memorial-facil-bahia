import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar';
import {
  Building2,
  Calculator,
  ClipboardList,
  Clock,
  ExternalLink,
  FileText,
  Flame,
  LayoutDashboard,
  LogOut,
  Route,
  Users,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

const NAVEGACAO = [
  { titulo: 'Meus Projetos', url: '/', icone: FileText },
  { titulo: 'Painel de Gestão', url: '/painel', icone: LayoutDashboard },
  { titulo: 'Clientes', url: '/clientes', icone: Users },
];

/** Atalhos para as ferramentas avulsas (abrem em nova aba). */
const FERRAMENTAS = [
  { titulo: 'Classificador PPCI', url: '/ferramentas/classificador-ppci.html', icone: ClipboardList },
  { titulo: 'Calculadora TRRF', url: '/ferramentas/calculadora-trrf.html', icone: Clock },
  { titulo: 'Cálculo de RTI', url: '/ferramentas/calculo-rti.html', icone: Calculator },
  { titulo: 'Distâncias máximas', url: '/ferramentas/distancias-maximas.html', icone: Route },
  { titulo: 'Memorial de Brigada (IT 25)', url: '/ferramentas/memorial-brigada-it25.html', icone: Building2 },
];

export function AppSidebar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const ativo = (url: string) =>
    url === '/' ? pathname === '/' : pathname === url || pathname.startsWith(`${url}/`);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild tooltip="Memorial Fácil Bahia">
              <Link to="/">
                <span className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Flame className="size-4" />
                </span>
                <span className="font-semibold truncate">Memorial Fácil Bahia</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Gestão</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAVEGACAO.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild isActive={ativo(item.url)} tooltip={item.titulo}>
                    <Link to={item.url}>
                      <item.icone />
                      <span>{item.titulo}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Ferramentas</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {FERRAMENTAS.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild tooltip={item.titulo}>
                    <a href={item.url} target="_blank" rel="noreferrer">
                      <item.icone />
                      <span className="truncate">{item.titulo}</span>
                      <ExternalLink className="ml-auto size-3.5 opacity-50" />
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Sair da conta"
              onClick={async () => {
                await supabase.auth.signOut();
                navigate('/login');
              }}
            >
              <LogOut />
              <span>Sair</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
