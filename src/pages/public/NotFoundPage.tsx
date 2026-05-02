import { useNavigate } from "react-router-dom";

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <h1 className="text-4xl font-bold text-white">404</h1>
      <p className="text-white/60">Página no encontrada</p>
      <button onClick={() => navigate("/")} className="btn-primary">Volver al inicio</button>
    </div>
  );
}
