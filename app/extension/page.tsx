import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Download, Globe, Puzzle, KeyRound, Play } from "lucide-react";
import Link from "next/link";

const steps = [
  {
    icon: Download,
    title: "Download the extension",
    description: 'Click the button above to download the ZIP file.',
  },
  {
    icon: Globe,
    title: "Open Globe Extensions",
    description: 'Go to chrome://extensions in your browser and enable "Developer mode" (top right toggle).',
  },
  {
    icon: Puzzle,
    title: "Load unpacked",
    description: 'Click "Load unpacked", unzip the downloaded file, and select the unzipped folder.',
  },
  {
    icon: KeyRound,
    title: "Connect with your API key",
    description: "Click the Multick icon in your toolbar, paste your API key from Settings, and hit Connect.",
  },
  {
    icon: Play,
    title: "Start tracking",
    description: "Pick a project and hit play. Your timer syncs with the Multick dashboard in real time.",
  },
];

export default function ExtensionPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-20">
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-500/10 mb-6">
          <Globe className="h-8 w-8 text-blue-500" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">
          Globe Extension
        </h1>
        <p className="mt-3 text-muted-foreground max-w-lg mx-auto">
          Start and stop project timers from your browser without opening the dashboard.
          Works with your existing Multick API key.
        </p>
        <div className="mt-8 flex items-center justify-center gap-4">
          <a href="/multick-extension.zip" download>
            <Button size="lg" className="h-12 px-8">
              <Download className="h-4 w-4 mr-2" />
              Download Extension
            </Button>
          </a>
          <Link href="/settings">
            <Button variant="outline" size="lg" className="h-12 px-8">
              Get API Key
            </Button>
          </Link>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-center mb-6">Setup in 2 minutes</h2>
        {steps.map((step, i) => (
          <Card key={i} className="border-border/50">
            <CardContent className="flex items-start gap-4 py-5">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-muted shrink-0">
                <step.icon className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-muted-foreground">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="font-medium">{step.title}</h3>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{step.description}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-12 rounded-xl border border-border/50 bg-card p-6 text-center">
        <p className="text-sm text-muted-foreground">
          Coming soon to the{" "}
          <span className="text-foreground font-medium">Globe Web Store</span>{" "}
          for one-click installation.
        </p>
      </div>
    </div>
  );
}
