import { Route, Routes } from "react-router-dom";
import ProtectedRoute from "@/auth/ProtectedRoute";

import LandingPage from "@/pages/public/LandingPage";
import PortalPage from "@/pages/public/PortalPage";
import NotFoundPage from "@/pages/public/NotFoundPage";

import LoginPage from "@/pages/auth/LoginPage";

import DespachadorPage from "@/pages/despachador/DespachadorPage";
import DespachadorDetallePage from "@/pages/despachador/DespachadorDetallePage";
import DespachadorDespachoPage from "@/pages/despachador/DespachadorDespachoPage";
import DespachadorHistorialPage from "@/pages/despachador/DespachadorHistorialPage";
import DespachadorAlertasPage from "@/pages/despachador/DespachadorAlertasPage";

import ConductorPage from "@/pages/conductor/ConductorPage";
import ConductorParadaPage from "@/pages/conductor/ConductorParadaPage";
import ConductorCierrePage from "@/pages/conductor/ConductorCierrePage";

import AdminPage from "@/pages/admin/AdminPage";
import AdminRegistrarPage from "@/pages/admin/AdminRegistrarPage";
import AdminRegistrarConductorPage from "@/pages/admin/AdminRegistrarConductorPage";
import AdminAsignacionesPage from "@/pages/admin/AdminAsignacionesPage";
import AdminVehiculoDetallePage from "@/pages/admin/AdminVehiculoDetallePage";
import AdminVehiculoEditarPage from "@/pages/admin/AdminVehiculoEditarPage";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/portal" element={<PortalPage />} />
      </Route>

      <Route element={<ProtectedRoute roles={["DISPATCHER"]} />}>
        <Route path="/despachador">
          <Route index element={<DespachadorPage />} />
          <Route path="ruta/:id" element={<DespachadorDetallePage />} />
          <Route path="despacho/:id" element={<DespachadorDespachoPage />} />
          <Route path="historial" element={<DespachadorHistorialPage />} />
          <Route path="alertas" element={<DespachadorAlertasPage />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute roles={["DRIVER"]} />}>
        <Route path="/conductor">
          <Route index element={<ConductorPage />} />
          <Route path="parada/:id" element={<ConductorParadaPage />} />
          <Route path="cierre" element={<ConductorCierrePage />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute roles={["FLEET_ADMIN"]} />}>
        <Route path="/admin">
          <Route index element={<AdminPage />} />
          <Route path="registrar" element={<AdminRegistrarPage />} />
          <Route path="registrar-conductor" element={<AdminRegistrarConductorPage />} />
          <Route path="asignaciones" element={<AdminAsignacionesPage />} />
          <Route path="vehiculo/:placa" element={<AdminVehiculoDetallePage />} />
          <Route path="vehiculo/:placa/editar" element={<AdminVehiculoEditarPage />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
