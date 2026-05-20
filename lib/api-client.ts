const API_BASE = "";

function getHeaders(): Record<string, string> {
  const email = typeof window !== "undefined" ? localStorage.getItem("tt-user-email") : null;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (email) {
    headers["X-User-Email"] = email;
  }
  return headers;
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      ...getHeaders(),
      ...options?.headers,
    },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(body.error || `Request failed: ${res.status}`);
  }
  return res.json();
}

export const api = {
  projects: {
    list: () => request<ProjectResponse[]>("/api/projects"),
    create: (data: CreateProject) => request<ProjectResponse>("/api/projects", { method: "POST", body: JSON.stringify(data) }),
    update: (id: string, data: UpdateProject) => request<ProjectResponse>(`/api/projects/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    archive: (id: string) => request<ProjectResponse>(`/api/projects/${id}`, { method: "DELETE" }),
  },
  timer: {
    current: () => request<TimerResponse | null>("/api/timer/current"),
    start: (projectId: string, note?: string) => request<TimerResponse>("/api/timer/start", { method: "POST", body: JSON.stringify({ projectId, note }) }),
    stop: () => request<TimerResponse>("/api/timer/stop", { method: "POST" }),
  },
  entries: {
    list: (from: string, to: string) => request<EntryResponse[]>(`/api/entries?from=${from}&to=${to}`),
    update: (id: string, data: UpdateEntry) => request<EntryResponse>(`/api/entries/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    delete: (id: string) => request<void>(`/api/entries/${id}`, { method: "DELETE" }),
  },
  stats: {
    summary: (period: string) => request<StatsSummary>(`/api/stats/summary?period=${period}`),
  },
};

export interface ProjectResponse {
  id: string;
  name: string;
  client: string | null;
  color: string;
  hourlyRate: string | null;
  cwdPattern: string | null;
  archived: boolean;
  createdAt: string;
  totalSeconds?: number;
}

export interface CreateProject {
  name: string;
  client?: string | null;
  color?: string;
  hourlyRate?: string | null;
  cwdPattern?: string | null;
}

export interface UpdateProject extends Partial<CreateProject> {
  archived?: boolean;
}

export interface TimerResponse {
  id: string;
  projectId: string;
  projectName: string;
  projectColor: string;
  startAt: string;
  note: string | null;
  source: string;
}

export interface EntryResponse {
  id: string;
  projectId: string;
  projectName: string;
  projectColor: string;
  startAt: string;
  endAt: string | null;
  source: string;
  note: string | null;
  durationSeconds: number;
  hourlyRate: string | null;
}

export interface UpdateEntry {
  note?: string | null;
  projectId?: string;
  startAt?: string;
  endAt?: string | null;
}

export interface StatsSummary {
  totalSeconds: number;
  byProject: { projectId: string; projectName: string; projectColor: string; totalSeconds: number }[];
  bySource: { manual: number; claude_code: number };
}
