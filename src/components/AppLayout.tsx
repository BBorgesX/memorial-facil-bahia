import { ReactNode } from 'react';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Flame } from 'lucide-react';
import { AppSidebar } from '@/components/AppSidebar';

/** Estrutura das páginas internas: menu lateral + conteúdo. */
export function AppLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        {/* Barra do celular: botão que abre o menu (no desktop o menu fica fixo) */}
        <div className="md:hidden sticky top-0 z-30 flex items-center gap-2 border-b bg-card px-3 py-2">
          <SidebarTrigger aria-label="Abrir menu" />
          <span className="font-semibold text-sm flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-primary" /> Memorial Fácil Bahia
          </span>
        </div>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
