import { useGetDashboardStats, getGetDashboardStatsQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Activity, Ban, AlertTriangle, Clock, TrendingUp } from "lucide-react";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";

export default function Dashboard() {
  const { data: stats, isLoading } = useGetDashboardStats({ guildId: "demo" }, {
    query: { queryKey: getGetDashboardStatsQueryKey({ guildId: "demo" }) }
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Monitor your server's moderation activity</p>
        </div>
        <div className="flex items-center gap-2 text-xs font-medium text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Live
        </div>
      </div>

      {/* Stats Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="border-border shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-8 rounded-lg" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : stats ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <StatCard title="Total Actions" value={stats.totalActions} icon={Activity} color="blue" />
            <StatCard title="Warnings" value={stats.totalWarnings} icon={AlertTriangle} color="amber" />
            <StatCard title="Active Timeouts" value={stats.activeTimeouts} icon={Clock} color="purple" />
            <StatCard title="Total Bans" value={stats.totalBans} icon={Ban} color="red" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-border shadow-sm">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  <CardTitle className="text-sm font-semibold text-foreground">Action Distribution</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-[260px]">
                  {stats.actionBreakdown && stats.actionBreakdown.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={stats.actionBreakdown}>
                        <XAxis dataKey="action" stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} />
                        <YAxis stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} />
                        <Tooltip
                          cursor={{ fill: "rgba(99,102,241,0.05)" }}
                          contentStyle={{ backgroundColor: "#fff", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: 12 }}
                        />
                        <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center gap-2 text-muted-foreground">
                      <Activity className="w-8 h-8 opacity-30" />
                      <p className="text-sm">No data yet</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="border-border shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-foreground">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats.recentActions?.length > 0 ? (
                    stats.recentActions.map((log) => (
                      <div key={log.id} className="flex items-center justify-between py-2 border-b border-border last:border-0 last:pb-0">
                        <div className="flex items-center gap-3 min-w-0">
                          <span className={`shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase ${ACTION_COLOR[log.action ?? ""] ?? "bg-muted text-muted-foreground"}`}>
                            {log.action}
                          </span>
                          <span className="text-sm text-foreground truncate">{log.username || log.userId}</span>
                        </div>
                        <span className="text-xs text-muted-foreground shrink-0 ml-2">
                          {new Date(log.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="py-10 text-center text-muted-foreground">
                      <Activity className="w-8 h-8 opacity-30 mx-auto mb-2" />
                      <p className="text-sm">No recent activity</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      ) : null}
    </div>
  );
}

const ACTION_COLOR: Record<string, string> = {
  ban: "bg-red-100 text-red-700",
  kick: "bg-orange-100 text-orange-700",
  warn: "bg-amber-100 text-amber-700",
  timeout: "bg-purple-100 text-purple-700",
  mute: "bg-purple-100 text-purple-700",
  clear: "bg-blue-100 text-blue-700",
  lock: "bg-slate-100 text-slate-700",
};

function StatCard({ title, value, icon: Icon, color }: { title: string; value: number; icon: any; color: "blue" | "amber" | "purple" | "red" }) {
  const styles = {
    blue:   { bg: "bg-blue-50",   icon: "text-blue-600",   badge: "bg-blue-100" },
    amber:  { bg: "bg-amber-50",  icon: "text-amber-600",  badge: "bg-amber-100" },
    purple: { bg: "bg-purple-50", icon: "text-purple-600", badge: "bg-purple-100" },
    red:    { bg: "bg-red-50",    icon: "text-red-600",    badge: "bg-red-100" },
  }[color];

  return (
    <Card className="border-border shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{title}</CardTitle>
        <div className={`w-8 h-8 rounded-lg ${styles.badge} flex items-center justify-center`}>
          <Icon className={`h-4 w-4 ${styles.icon}`} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-foreground">{value.toLocaleString()}</div>
      </CardContent>
    </Card>
  );
}
