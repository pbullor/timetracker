"use client";

import { useState } from "react";
import { useApi } from "@/lib/hooks";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Copy, RefreshCw, Trash2, Eye, EyeOff } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>
      <ApiKeySection />
      <HookInstructions />
    </div>
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
