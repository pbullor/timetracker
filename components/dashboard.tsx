"use client";

import { useEffect } from "react";
import { TimerCard } from "@/components/timer-card";
import { DaySummary } from "@/components/day-summary";
import { api } from "@/lib/api-client";
import { useApi } from "@/lib/hooks";
import type { TimerResponse, ProjectResponse, StatsSummary } from "@/lib/api-client";

export function Dashboard() {
  const { data: timer, refetch: refetchTimer } = useApi<TimerResponse | null>(
    () => api.timer.current(),
    []
  );
  const { data: projects } = useApi<ProjectResponse[]>(
    () => api.projects.list(),
    []
  );
  const { data: stats, refetch: refetchStats } = useApi<StatsSummary>(
    () => api.stats.summary("today"),
    []
  );

  useEffect(() => {
    const interval = setInterval(() => {
      refetchTimer();
      refetchStats();
    }, 30000);
    const onFocus = () => { refetchTimer(); refetchStats(); };
    window.addEventListener("focus", onFocus);
    return () => { clearInterval(interval); window.removeEventListener("focus", onFocus); };
  }, [refetchTimer, refetchStats]);

  async function handleStart(projectId: string) {
    await api.timer.start(projectId);
    refetchTimer();
  }

  async function handleStop() {
    await api.timer.stop();
    refetchTimer();
    refetchStats();
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <TimerCard
        timer={timer}
        projects={projects ?? []}
        onStop={handleStop}
        onStart={handleStart}
      />
      <DaySummary stats={stats} />
    </div>
  );
}
