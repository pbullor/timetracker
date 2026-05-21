"use client";

import { useApi } from "@/lib/hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, FolderOpen, Clock, Bot } from "lucide-react";

interface Stats {
  totalUsers: number;
  usersLast7d: number;
  usersLast30d: number;
  planBreakdown: { plan: string; planStatus: string; count: number }[];
  totalProjects: number;
  totalEntries: number;
  totalClaudeSessions: number;
  recentUsers: {
    id: string;
    name: string | null;
    email: string;
    plan: string;
    planStatus: string;
    createdAt: string;
  }[];
}

const PLAN_COLORS: Record<string, string> = {
  free: "bg-muted text-muted-foreground",
  starter: "bg-blue-500/10 text-blue-500",
  pro: "bg-purple-500/10 text-purple-500",
  team: "bg-emerald-500/10 text-emerald-500",
};

export default function AdminPage() {
  const { data, loading, error } = useApi<Stats>(
    () => fetch("/api/admin/stats").then((r) => {
      if (!r.ok) throw new Error(r.status === 403 ? "Not authorized" : "Failed to load");
      return r.json();
    }),
    []
  );

  if (loading) return <div className="p-8 text-muted-foreground">Loading...</div>;
  if (error) return <div className="p-8 text-destructive">{error}</div>;
  if (!data) return null;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Total Users" value={data.totalUsers} />
        <StatCard icon={Users} label="Last 7 days" value={data.usersLast7d} />
        <StatCard icon={FolderOpen} label="Projects" value={data.totalProjects} />
        <StatCard icon={Bot} label="Claude Sessions" value={data.totalClaudeSessions} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Plan Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.planBreakdown.map((row) => (
                <div key={`${row.plan}-${row.planStatus}`} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className={PLAN_COLORS[row.plan] ?? PLAN_COLORS.free}>
                      {row.plan}
                    </Badge>
                    {row.planStatus === "trialing" && (
                      <span className="text-xs text-amber-500">trial</span>
                    )}
                  </div>
                  <span className="font-mono text-sm font-medium">{row.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Signups (30d)</span>
                <span className="font-mono font-medium">{data.usersLast30d}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Signups (7d)</span>
                <span className="font-mono font-medium">{data.usersLast7d}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Time entries</span>
                <span className="font-mono font-medium">{data.totalEntries}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Claude sessions</span>
                <span className="font-mono font-medium">{data.totalClaudeSessions}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Signups</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50 text-left text-muted-foreground">
                  <th className="pb-2 font-medium">User</th>
                  <th className="pb-2 font-medium">Plan</th>
                  <th className="pb-2 font-medium">Status</th>
                  <th className="pb-2 font-medium text-right">Signed up</th>
                </tr>
              </thead>
              <tbody>
                {data.recentUsers.map((u) => (
                  <tr key={u.id} className="border-b border-border/30">
                    <td className="py-2.5">
                      <div>{u.name ?? "—"}</div>
                      <div className="text-xs text-muted-foreground">{u.email}</div>
                    </td>
                    <td>
                      <Badge variant="secondary" className={PLAN_COLORS[u.plan] ?? PLAN_COLORS.free}>
                        {u.plan}
                      </Badge>
                    </td>
                    <td className="text-muted-foreground">
                      {u.planStatus === "trialing" ? (
                        <span className="text-amber-500">trial</span>
                      ) : u.planStatus === "active" ? (
                        <span className="text-emerald-500">active</span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="text-right text-muted-foreground">
                      {new Date(u.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: number }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center gap-3">
          <Icon className="h-5 w-5 text-muted-foreground" />
          <div>
            <p className="text-2xl font-bold font-mono">{value}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
