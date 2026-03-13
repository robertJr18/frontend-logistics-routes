import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import DespachadorPage from "./pages/DespachadorPage";
import DespachadorDetallePage from "./pages/DespachadorDetallePage";
import DespachadorDespachoPage from "./pages/DespachadorDespachoPage";
import ConductorPage from "./pages/ConductorPage";
import ConductorParadaPage from "./pages/ConductorParadaPage";
import ConductorCierrePage from "./pages/ConductorCierrePage";
import AdminPage from "./pages/AdminPage";
import AdminRegistrarPage from "./pages/AdminRegistrarPage";
import AdminAsignacionesPage from "./pages/AdminAsignacionesPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/despachador" element={<DespachadorPage />} />
          <Route path="/despachador/ruta/:id" element={<DespachadorDetallePage />} />
          <Route path="/despachador/despacho/:id" element={<DespachadorDespachoPage />} />
          <Route path="/conductor" element={<ConductorPage />} />
          <Route path="/conductor/parada/:id" element={<ConductorParadaPage />} />
          <Route path="/conductor/cierre" element={<ConductorCierrePage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/admin/registrar" element={<AdminRegistrarPage />} />
          <Route path="/admin/asignaciones" element={<AdminAsignacionesPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
