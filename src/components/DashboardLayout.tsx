import { ReactNode, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Bell, ChevronLeft, LucideIcon } from "lucide-react";

interface SidebarItem {
  label: string;
  icon: LucideIcon;
  path: string;
}

interface DashboardLayoutProps {
  children: ReactNode;
  title: string;
  items: SidebarItem[];
  alertCount?: number;
}

export default function DashboardLayout({ children, title, items, alertCount = 0 }: DashboardLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside
        className={`bg-card border-r-2 border-foreground flex flex-col ${
          collapsed ? "w-14" : "w-52"
        }`}
      >
        <div className="p-3 border-b-2 border-foreground flex items-center justify-between">
          {!collapsed && (
            <button onClick={() => navigate("/")} className="text-xs font-bold uppercase tracking-wide">
              LogisticsRoutes
            </button>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1 hover:bg-muted"
          >
            <ChevronLeft className={`h-4 w-4 ${collapsed ? "rotate-180" : ""}`} />
          </button>
        </div>

        <nav className="flex-1 py-1">
          {items.map((item) => {
            const active = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-3 py-2 text-xs ${
                  active
                    ? "bg-foreground text-background font-bold"
                    : "hover:bg-muted"
                }`}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {!collapsed && <span className="uppercase tracking-wide">{item.label}</span>}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-12 border-b-2 border-foreground flex items-center justify-between px-6 bg-card">
          <h1 className="text-sm font-bold uppercase tracking-wide">{title}</h1>
          <button className="relative p-2 hover:bg-muted">
            <Bell className="h-4 w-4" />
            {alertCount > 0 && (
              <span className="absolute top-1 right-1 h-2 w-2 bg-foreground rounded-full" />
            )}
          </button>
        </header>
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}
