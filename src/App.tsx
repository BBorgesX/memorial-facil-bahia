import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import ProjetoEditor from "./pages/ProjetoEditor";
import Painel from "./pages/Painel";
import Clientes from "./pages/Clientes";
import ClienteDetalhe from "./pages/ClienteDetalhe";
import PortalCliente from "./pages/PortalCliente";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import { AuthGate } from "./components/AuthGate";
import { AppLayout } from "./components/AppLayout";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Páginas públicas: login e portal do cliente */}
          <Route path="/login" element={<Login />} />
          <Route path="/portal" element={<PortalCliente />} />
          <Route path="/portal/:token" element={<PortalCliente />} />
          {/* Páginas internas (exigem login, com menu lateral) */}
          <Route path="/" element={<AuthGate><AppLayout><Index /></AppLayout></AuthGate>} />
          <Route path="/projeto/:id" element={<AuthGate><AppLayout><ProjetoEditor /></AppLayout></AuthGate>} />
          <Route path="/painel" element={<AuthGate><AppLayout><Painel /></AppLayout></AuthGate>} />
          <Route path="/clientes" element={<AuthGate><AppLayout><Clientes /></AppLayout></AuthGate>} />
          <Route path="/clientes/:id" element={<AuthGate><AppLayout><ClienteDetalhe /></AppLayout></AuthGate>} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
