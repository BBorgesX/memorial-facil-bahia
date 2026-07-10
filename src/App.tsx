import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// HashRouter: funciona em qualquer hospedagem estática (sem rewrites de
// servidor) e em prévias de arquivo único — as rotas ficam após o "#".
import { HashRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "@/store/appStore";
import AppShell from "@/components/shell/AppShell";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Projetos from "./pages/Projetos";
import Configuracoes from "./pages/Configuracoes";
import ProjetoEditor from "./pages/ProjetoEditor";
import Classificacao from "./pages/modulos/Classificacao";
import CalculoRTI from "./pages/modulos/CalculoRTI";
import CalculoTRRF from "./pages/modulos/CalculoTRRF";
import CalculoHidraulica from "./pages/modulos/CalculoHidraulica";
import Distancias from "./pages/modulos/Distancias";
import MemorialDescritivo from "./pages/modulos/MemorialDescritivo";
import MemorialBrigada from "./pages/modulos/MemorialBrigada";
import Checklist from "./pages/modulos/Checklist";
import Notificacao from "./pages/modulos/Notificacao";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <HashRouter>
        <AppProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            {/* Casca FirePro Suite: sidebar + topbar (Projeto ativo + UF) */}
            <Route element={<AppShell />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/projetos" element={<Projetos />} />
              <Route path="/projeto/:id" element={<ProjetoEditor />} />
              <Route path="/classificacao" element={<Classificacao />} />
              <Route path="/calculos/rti" element={<CalculoRTI />} />
              <Route path="/calculos/trrf" element={<CalculoTRRF />} />
              <Route path="/calculos/hidraulica" element={<CalculoHidraulica />} />
              <Route path="/distancias" element={<Distancias />} />
              <Route path="/memoriais/descritivo" element={<MemorialDescritivo />} />
              <Route path="/memoriais/brigada" element={<MemorialBrigada />} />
              <Route path="/checklist" element={<Checklist />} />
              <Route path="/notificacao" element={<Notificacao />} />
              <Route path="/configuracoes" element={<Configuracoes />} />
            </Route>
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AppProvider>
      </HashRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
