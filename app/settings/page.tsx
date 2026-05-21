"use client";

import { useState } from "react";
import { useApi } from "@/lib/hooks";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Copy, RefreshCw, Trash2, Eye, EyeOff, CreditCard, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>
      <BillingSection />
      <ApiKeySection />
      <HookInstructions />
    </div>
  );
}

const PLAN_LABELS: Record<string, { label: string; color: string }> = {
  free: { label: "Free", color: "bg-muted text-muted-foreground" },
  starter: { label: "Starter", color: "bg-blue-500/10 text-blue-500" },
  pro: { label: "Pro", color: "bg-purple-500/10 text-purple-500" },
  team: { label: "Team", color: "bg-emerald-500/10 text-emerald-500" },
};

function BillingSection() {
  const { data, loading } = useApi<{
    plan: string;
    planStatus: string;
    stripeCustomerId: string | null;
    stripeSubscriptionId: string | null;
    planExpiresAt: string | null;
    trialEndsAt: string | null;
  }>(() => fetch("/api/settings/billing").then((r) => r.json()), []);

  const [portalLoading, setPortalLoading] = useState(false);

  async function openPortal() {
    setPortalLoading(true);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const json = await res.json();
      if (json.url) window.location.href = json.url;
    } finally {
      setPortalLoading(false);
    }
  }

  const plan = data?.plan ?? "free";
  const planInfo = PLAN_LABELS[plan] ?? PLAN_LABELS.free;
  const hasSubscription = !!data?.stripeSubscriptionId;
  const isTrial = data?.planStatus === "trialing";
  const trialEndsAt = data?.trialEndsAt ? new Date(data.trialEndsAt) : null;
  const expiresAt = data?.planExpiresAt ? new Date(data.planExpiresAt) : null;

  const trialDaysLeft = trialEndsAt
    ? Math.max(0, Math.ceil((trialEndsAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <CreditCard className="h-4 w-4" />
          Plan & Billing
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="h-16 flex items-center text-sm text-muted-foreground">Loading...</div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Current plan</span>
                  <Badge variant="secondary" className={planInfo.color}>
                    {planInfo.label}
                  </Badge>
                  {isTrial && (
                    <Badge variant="secondary" className="bg-amber-500/10 text-amber-500">
                      Trial
                    </Badge>
                  )}
                </div>
                {isTrial && trialEndsAt && (
                  <p className="text-xs text-muted-foreground">
                    {trialDaysLeft > 0
                      ? `Trial ends in ${trialDaysLeft} day${trialDaysLeft === 1 ? "" : "s"} (${trialEndsAt.toLocaleDateString("en-US", { month: "short", day: "numeric" })})`
                      : "Trial ends today"}
                  </p>
                )}
                {hasSubscription && !isTrial && expiresAt && (
                  <p className="text-xs text-muted-foreground">
                    Renews {expiresAt.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                  </p>
                )}
                {!hasSubscription && (
                  <p className="text-xs text-muted-foreground">
                    No active subscription
                  </p>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <Link href="/pricing">
                <Button variant="outline" size="sm">
                  {hasSubscription ? "Change plan" : "Choose a plan"}
                  <ArrowRight className="h-3.5 w-3.5 ml-1" />
                </Button>
              </Link>
              {hasSubscription && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={openPortal}
                  disabled={portalLoading}
                >
                  {portalLoading ? "Loading..." : "Manage billing"}
                </Button>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function ApiKeySection() {
  const { data, refetch } = useApi<{ apiKey: string | null }>(
    () => fetch("/api/settings/api-key").then((r) => r.json()),
    []
  );
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);

  async function generate() {
    setLoading(true);
    await fetch("/api/settings/api-key", { method: "POST" });
    await refetch();
    setVisible(true);
    setLoading(false);
  }

  async function revoke() {
    setLoading(true);
    await fetch("/api/settings/api-key", { method: "DELETE" });
    await refetch();
    setVisible(false);
    setLoading(false);
  }

  function copyKey() {
    if (data?.apiKey) {
      navigator.clipboard.writeText(data.apiKey);
    }
  }

  const hasKey = !!data?.apiKey;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">API Key for Claude Code Hooks</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Generate an API key to authenticate your Claude Code hooks.
          This key identifies you when sessions are tracked from your terminal.
        </p>

        {hasKey ? (
          <div className="space-y-3">
            <div className="flex gap-2">
              <Input
                readOnly
                value={visible ? data.apiKey! : "tt_" + "•".repeat(40)}
                className="font-mono text-sm"
              />
              <Button variant="outline" size="icon" onClick={() => setVisible(!visible)}>
                {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
              <Button variant="outline" size="icon" onClick={copyKey}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={generate} disabled={loading}>
                <RefreshCw className="h-3.5 w-3.5 mr-1" />
                Regenerate
              </Button>
              <Button variant="outline" size="sm" onClick={revoke} disabled={loading} className="text-destructive">
                <Trash2 className="h-3.5 w-3.5 mr-1" />
                Revoke
              </Button>
            </div>
          </div>
        ) : (
          <Button onClick={generate} disabled={loading}>
            Generate API Key
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

function HookInstructions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Install Claude Code Hooks</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">
          After generating your API key, run the installer from the TimeTracker repo:
        </p>
        <pre className="rounded-lg bg-muted p-3 text-sm font-mono overflow-x-auto">
          bash hooks/install.sh
        </pre>
        <p className="text-sm text-muted-foreground">
          It will ask for your email, the backend URL, and your API key.
          Once installed, Claude Code sessions will be tracked automatically.
        </p>
        <p className="text-sm text-muted-foreground">
          Each project member uses their own API key and sets their own CWD pattern
          to match their local directory structure.
        </p>
      </CardContent>
    </Card>
  );
}
