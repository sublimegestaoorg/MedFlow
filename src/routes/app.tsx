import { createFileRoute, Outlet, useNavigate, useLocation } from "@tanstack/react-router";
import {
  Calendar,
  LayoutDashboard,
  Users,
  Wallet,
  Settings,
  LogOut,
  HeartPulse,
  Bell,
  Menu,
  Radio,
} from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { useClinicPresence } from "@/hooks/use-presence";

export const Route = createFileRoute("/app")({
  component: AppLayout,
});

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/app" },
  { icon: Calendar, label: "Agendamentos", href: "/app/agendamentos" },
  { icon: HeartPulse, label: "Pacientes", href: "/app/pacientes" },
  { icon: Wallet, label: "Financeiro", href: "/app/financeiro" },
  { icon: Users, label: "Equipe", href: "/app/equipe" },
  { icon: Radio, label: "Online agora", href: "/app/online", adminOnly: true },
];

function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [me, setMe] = useState<{
    id: string;
    full_name: string;
    role: string;
    avatar_url: string | null;
    clinic_id: string | null;
  } | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) return;
      const { data: profile } = await supabase
        .from("profiles")
        .select("id, full_name, role, avatar_url, clinic_id")
        .eq("id", data.user.id)
        .single();
      if (profile) setMe(profile as typeof me);
    })();
  }, []);

  const onlineUsers = useClinicPresence({
    clinicId: me?.clinic_id ?? null,
    me: me
      ? { user_id: me.id, full_name: me.full_name, role: me.role, avatar_url: me.avatar_url }
      : null,
    currentPage: location.pathname,
  });
  const isAdmin = me?.role === "admin" || me?.role === "owner";

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Você saiu da plataforma.");
    navigate({ to: "/login" });
  };

  return (
    <div className="dark min-h-screen bg-background text-foreground flex">
      {/* Sidebar */}
      <aside 
        className={`${
          isSidebarOpen ? "w-64" : "w-20"
        } bg-card border-r border-border transition-all duration-300 flex flex-col`}
      >
        <div className="h-20 flex items-center justify-between px-6 border-b border-border">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="size-8 bg-brand rounded-lg grid place-items-center shrink-0">
              <HeartPulse className="size-4 text-brand-foreground" />
            </div>
            {isSidebarOpen && <span className="font-display font-bold text-xl">MedFlow</span>}
          </div>
        </div>

        <nav className="flex-1 py-6 px-3 space-y-1">
          {navItems
            .filter((item) => !item.adminOnly || isAdmin)
            .map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="flex items-center gap-3 px-3 py-3 rounded-xl text-muted-foreground hover:text-brand hover:bg-brand/10 transition-colors"
              >
                <item.icon className="size-5 shrink-0" />
                {isSidebarOpen && (
                  <span className="font-medium text-sm flex-1">{item.label}</span>
                )}
                {isSidebarOpen && item.href === "/app/online" && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-500">
                    {onlineUsers.length}
                  </span>
                )}
              </a>
            ))}
        </nav>

        <div className="p-3 border-t border-border">
          <a href="/app/configuracoes" className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
            <Settings className="size-5 shrink-0" />
            {isSidebarOpen && <span className="font-medium text-sm">Configurações</span>}
          </a>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors mt-1"
          >
            <LogOut className="size-5 shrink-0" />
            {isSidebarOpen && <span className="font-medium text-sm">Sair</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Header */}
        <header className="h-20 bg-card border-b border-border flex items-center justify-between px-8 shrink-0">
          <button 
            onClick={() => setSidebarOpen(!isSidebarOpen)}
            className="p-2 rounded-lg hover:bg-secondary text-muted-foreground transition-colors"
          >
            <Menu className="size-5" />
          </button>
          
          <div className="flex items-center gap-4">
            <button className="relative p-2 rounded-lg hover:bg-secondary text-muted-foreground transition-colors">
              <Bell className="size-5" />
              <span className="absolute top-1 right-1 size-2 bg-destructive rounded-full" />
            </button>
            <div className="h-8 w-px bg-border mx-2" />
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <div className="text-sm font-bold text-foreground">Dra. Geisa Lorena</div>
                <div className="text-xs text-muted-foreground">Administrador</div>
              </div>
              <div className="size-10 rounded-full bg-brand/20 border-2 border-brand-surface grid place-items-center font-bold text-brand">
                GL
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
