import { Link, useLocation } from "wouter";
import {
  LayoutDashboard,
  Clock,
  AlertTriangle,
  ScrollText,
  Settings,
  Bot,
  Gamepad2,
  Smile,
  Wrench,
  Shield,
  Wifi,
  WifiOff,
  Loader2,
} from "lucide-react";
import { useHealthCheck, getHealthCheckQueryKey } from "@workspace/api-client-react";

const NAV_GROUPS = [
  {
    label: "Overview",
    items: [
      { href: "/", label: "Dashboard", icon: LayoutDashboard },
    ],
  },
  {
    label: "Moderation",
    items: [
      { href: "/timeouts", label: "Timeouts", icon: Clock },
      { href: "/warnings", label: "Warnings", icon: AlertTriangle },
      { href: "/logs", label: "Mod Logs", icon: ScrollText },
    ],
  },
  {
    label: "Bot Info",
    items: [
      { href: "/commands", label: "Commands", icon: Bot },
      { href: "/settings", label: "Settings", icon: Settings },
    ],
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { data: health, isLoading, isError } = useHealthCheck({
    query: { queryKey: getHealthCheckQueryKey() }
  });

  const online = !isLoading && !isError && health?.status === "ok";

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-sidebar flex flex-col fixed inset-y-0 z-10 shadow-sm">
        {/* Logo */}
        <div className="h-16 flex items-center px-5 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-sm">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="font-bold text-sm text-foreground leading-none">ModBot</p>
              <p className="text-xs text-muted-foreground mt-0.5">Management Panel</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto">
          {NAV_GROUPS.map((group) => (
            <div key={group.label}>
              <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                {group.label}
              </p>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const isActive = location === item.href;
                  const Icon = item.icon;
                  return (
                    <Link key={item.href} href={item.href}>
                      <div
                        className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-all cursor-pointer ${
                          isActive
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                        }`}
                      >
                        <Icon className="w-4 h-4 shrink-0" />
                        {item.label}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Status footer */}
        <div className="p-4 border-t border-sidebar-border">
          <div className="flex items-center gap-2.5 px-3 py-2 rounded-md bg-card border border-border">
            {isLoading ? (
              <Loader2 className="w-3.5 h-3.5 text-muted-foreground animate-spin" />
            ) : online ? (
              <Wifi className="w-3.5 h-3.5 text-emerald-500" />
            ) : (
              <WifiOff className="w-3.5 h-3.5 text-destructive" />
            )}
            <div className="min-w-0">
              <p className="text-xs font-medium text-foreground">
                {isLoading ? "Connecting…" : online ? "API Online" : "API Offline"}
              </p>
              <p className="text-[10px] text-muted-foreground truncate">demo guild</p>
            </div>
            <div className={`ml-auto w-2 h-2 rounded-full shrink-0 ${
              isLoading ? "bg-muted-foreground animate-pulse" : online ? "bg-emerald-500" : "bg-destructive"
            }`} />
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 ml-64 min-w-0 flex flex-col">
        <div className="flex-1 p-8">
          <div className="max-w-6xl mx-auto">{children}</div>
        </div>
      </main>
    </div>
  );
}
