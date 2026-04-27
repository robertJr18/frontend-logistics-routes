import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Portal from "./pages/Portal";
import DespachadorPage from "./pages/DespachadorPage";
import DespachadorDetallePage from "./pages/DespachadorDetallePage";
import DespachadorDespachoPage from "./pages/DespachadorDespachoPage";
import DespachadorHistorialPage from "./pages/DespachadorHistorialPage";
import DespachadorAlertasPage from "./pages/DespachadorAlertasPage";
import ConductorPage from "./pages/ConductorPage";
import ConductorParadaPage from "./pages/ConductorParadaPage";
import ConductorCierrePage from "./pages/ConductorCierrePage";
import AdminPage from "./pages/AdminPage";
import AdminRegistrarPage from "./pages/AdminRegistrarPage";
import AdminRegistrarConductorPage from "./pages/AdminRegistrarConductorPage";
import AdminAsignacionesPage from "./pages/AdminAsignacionesPage";
import AdminVehiculoDetallePage from "./pages/AdminVehiculoDetallePage";
import AdminVehiculoEditarPage from "./pages/AdminVehiculoEditarPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/portal" element={<Portal />} />
          <Route path="/despachador" element={<DespachadorPage />} />
          <Route path="/despachador/ruta/:id" element={<DespachadorDetallePage />} />
          <Route path="/despachador/despacho/:id" element={<DespachadorDespachoPage />} />
          <Route path="/despachador/historial" element={<DespachadorHistorialPage />} />
          <Route path="/despachador/alertas" element={<DespachadorAlertasPage />} />
          <Route path="/conductor" element={<ConductorPage />} />
          <Route path="/conductor/parada/:id" element={<ConductorParadaPage />} />
          <Route path="/conductor/cierre" element={<ConductorCierrePage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/admin/registrar" element={<AdminRegistrarPage />} />
          <Route path="/admin/registrar-conductor" element={<AdminRegistrarConductorPage />} />
          <Route path="/admin/asignaciones" element={<AdminAsignacionesPage />} />
          <Route path="/admin/vehiculo/:placa" element={<AdminVehiculoDetallePage />} />
          <Route path="/admin/vehiculo/:placa/editar" element={<AdminVehiculoEditarPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
