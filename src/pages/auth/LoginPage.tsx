import { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Eye, EyeOff, Lock, Mail } from "lucide-react";
import BrandLogo from "@/components/BrandLogo";
import heroImg from "@/assets/hero-logistics.jpg";
import { useAuth } from "@/auth/useAuth";
import { HOME_BY_ROLE } from "@/auth/constants";
import { ApiError } from "@/services/api";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPwd, setShowPwd] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Ingresa correo y contraseña.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const role = await login({ email, password });
      navigate(HOME_BY_ROLE[role], { replace: true });
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setError("Credenciales incorrectas.");
      } else {
        setError("No se pudo iniciar sesión. Intenta de nuevo.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* LEFT — visual */}
      <div className="relative hidden lg:flex flex-col justify-between p-12 overflow-hidden">
        <img
          src={heroImg}
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-50"
          width={1920}
          height={1080}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(135deg, hsl(228 61% 14% / 0.85) 0%, hsl(228 55% 22% / 0.7) 100%)",
          }}
        />

        <div className="relative">
          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors mb-12"
          >
            <ArrowLeft className="w-4 h-4" /> Volver al inicio
          </button>
          <BrandLogo size="md" />
        </div>

        <div className="relative">
          <h2 className="text-4xl font-bold leading-tight mb-4 max-w-md">
            Tu operación logística, <span className="gradient-primary-text">bajo control</span>.
          </h2>
          <p className="text-subtle max-w-md">
            Accede al panel correspondiente a tu rol y opera con la información que necesitas en
            tiempo real.
          </p>

          <div className="mt-10 flex items-center gap-8">
            {[
              { v: "100%", l: "Trazabilidad" },
              { v: "3", l: "Roles" },
              { v: "24/7", l: "Disponibilidad" },
            ].map((s) => (
              <div key={s.l}>
                <div className="text-2xl font-bold gradient-primary-text">{s.v}</div>
                <div className="text-xs text-subtle">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT — form */}
      <div className="flex flex-col items-center justify-center p-6 md:p-12 bg-background">
        <div className="lg:hidden mb-8 self-start">
          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Volver
          </button>
        </div>

        <div className="lg:hidden mb-8">
          <BrandLogo size="md" />
        </div>

        <div className="w-full max-w-md">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Iniciar sesión</h1>
          <p className="text-subtle mb-8">Ingresa tus credenciales para acceder a tu panel.</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-2">Correo</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="usuario@empresa.com"
                  className="input-dark w-full h-12 pl-10 pr-3 text-sm"
                  autoComplete="username"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium">Contraseña</label>
                <button type="button" className="text-xs text-primary hover:underline">
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <input
                  type={showPwd ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input-dark w-full h-12 pl-10 pr-10 text-sm"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
                >
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-[#e05555] text-sm" role="alert">
                {error}
              </p>
            )}

            <label className="flex items-center gap-2 text-sm text-subtle cursor-pointer">
              <input type="checkbox" className="w-4 h-4 rounded accent-[hsl(var(--primary))]" />
              Mantener sesión iniciada
            </label>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full h-12 flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {loading ? (
                "Ingresando..."
              ) : (
                <>
                  Ingresar <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 p-4 rounded-lg bg-white/5 border border-white/10 text-xs text-subtle">
            <strong className="text-white">Acceso restringido.</strong> Si necesitas acceso,
            contacta a tu supervisor.
          </div>

          <p className="text-center text-xs text-muted-soft mt-8">
            © 2026 LogisticsRoutes · Santa Marta, Colombia
          </p>
        </div>
      </div>
    </div>
  );
}
