"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Clock,
  Zap,
  Users,
  BarChart3,
  Terminal,
  ArrowRight,
  Timer,
  Bot,
  TrendingUp,
  Globe,
  Check,
} from "lucide-react";

type Lang = "en" | "es";

const t = {
  en: {
    hero: {
      badge: "Built for developers who ship with AI",
      title: "Know exactly where your dev time goes.",
      titleAccent: "And how much AI saves you.",
      subtitle:
        "Multick automatically logs your Claude Code sessions alongside manual timers. See real hours vs AI-assisted hours per project — the metric that matters.",
      cta: "Start Free Trial",
      ctaSecondary: "See how it works",
    },
    features: {
      title: "Everything you need. Nothing you don't.",
      items: [
        {
          icon: Timer,
          title: "Start/Stop Timers",
          desc: "One-click project timers. No complex setup, no bloat. Just track your time.",
        },
        {
          icon: Bot,
          title: "Auto-track Claude Code",
          desc: "Hooks capture every session automatically. See prompt count, working time, and idle gaps.",
        },
        {
          icon: TrendingUp,
          title: "AI Productivity Multiplier",
          desc: "See how much output Claude generates while you invest your time. Your real ROI, quantified.",
        },
        {
          icon: Users,
          title: "Team Projects",
          desc: "Invite teammates, each with their own local paths. One project, multiple contributors.",
        },
        {
          icon: BarChart3,
          title: "Reports & CSV Export",
          desc: "Filter by day, week, or month. Breakdown by project and source. Export for invoicing.",
        },
        {
          icon: Terminal,
          title: "Developer-First",
          desc: "No Electron app. No browser extension. A bash hook and a clean web dashboard. That's it.",
        },
      ],
    },
    how: {
      title: "Three minutes to setup",
      steps: [
        { num: "01", title: "Sign in", desc: "Google or GitHub. No credit card." },
        { num: "02", title: "Create a project", desc: "Set your local directory path to auto-match sessions." },
        { num: "03", title: "Install the hook", desc: "One bash command. Claude Code starts logging automatically." },
      ],
    },
    metrics: {
      title: "The dashboard that sells itself",
      subtitle: "Your clients see the hours. You see the multiplier.",
      items: [
        { label: "Your time", value: "4.2h", color: "text-foreground" },
        { label: "AI working", value: "1.8h", color: "text-purple-400" },
        { label: "Effective output", value: "6.0h", color: "text-amber-400" },
        { label: "Multiplier", value: "143%", color: "text-emerald-400" },
      ],
    },
    pricing: {
      title: "Simple pricing. No surprises.",
      subtitle: "Start with a 7-day free trial. No credit card required.",
      viewAll: "See all plans",
      plans: [
        {
          name: "Starter",
          price: "$3",
          period: "/mo",
          features: ["1 user", "3 projects", "Claude Code auto-tracking", "7-day reports"],
        },
        {
          name: "Pro",
          price: "$9",
          period: "/mo",
          features: ["Unlimited projects", "AI working time metrics", "Productivity multiplier", "CSV export", "Full history"],
          popular: true,
        },
        {
          name: "Team",
          price: "$14",
          period: "/user/mo",
          features: ["Everything in Pro", "Team members", "Team reports", "Per-member CWD", "Priority support"],
        },
      ],
    },
    cta: {
      title: "Stop guessing. Start measuring.",
      subtitle: "7-day free trial. Set up in under 3 minutes.",
      button: "Start Tracking",
    },
    footer: "Built with Next.js, Drizzle, and Neon. Open source.",
    langSwitch: "Espanol",
  },
  es: {
    hero: {
      badge: "Hecho para devs que shipean con IA",
      title: "Sabe exactamente a donde va tu tiempo de desarrollo.",
      titleAccent: "Y cuanto te ahorra la IA.",
      subtitle:
        "Multick loguea tus sesiones de Claude Code automaticamente junto con timers manuales. Ve horas reales vs horas asistidas por IA por proyecto — la metrica que importa.",
      cta: "Probar Gratis 7 Dias",
      ctaSecondary: "Ver como funciona",
    },
    features: {
      title: "Todo lo que necesitas. Nada que no.",
      items: [
        {
          icon: Timer,
          title: "Timers Start/Stop",
          desc: "Timers por proyecto con un click. Sin setup complejo, sin bloat.",
        },
        {
          icon: Bot,
          title: "Auto-tracking de Claude Code",
          desc: "Los hooks capturan cada sesion automaticamente. Prompts, tiempo de trabajo y gaps idle.",
        },
        {
          icon: TrendingUp,
          title: "Multiplicador de Productividad IA",
          desc: "Ve cuanto output genera Claude mientras invertis tu tiempo. Tu ROI real, cuantificado.",
        },
        {
          icon: Users,
          title: "Proyectos en Equipo",
          desc: "Invita companeros, cada uno con sus rutas locales. Un proyecto, multiples contributors.",
        },
        {
          icon: BarChart3,
          title: "Reportes y Export CSV",
          desc: "Filtra por dia, semana o mes. Breakdown por proyecto y source. Exporta para facturar.",
        },
        {
          icon: Terminal,
          title: "Developer-First",
          desc: "Sin app Electron. Sin extension de browser. Un hook bash y un dashboard web limpio.",
        },
      ],
    },
    how: {
      title: "Tres minutos de setup",
      steps: [
        { num: "01", title: "Inicia sesion", desc: "Google o GitHub. Sin tarjeta de credito." },
        { num: "02", title: "Crea un proyecto", desc: "Configura tu directorio local para matchear sesiones." },
        { num: "03", title: "Instala el hook", desc: "Un comando bash. Claude Code empieza a loguear solo." },
      ],
    },
    metrics: {
      title: "El dashboard que se vende solo",
      subtitle: "Tus clientes ven las horas. Vos ves el multiplicador.",
      items: [
        { label: "Tu tiempo", value: "4.2h", color: "text-foreground" },
        { label: "IA trabajando", value: "1.8h", color: "text-purple-400" },
        { label: "Output efectivo", value: "6.0h", color: "text-amber-400" },
        { label: "Multiplicador", value: "143%", color: "text-emerald-400" },
      ],
    },
    pricing: {
      title: "Pricing simple. Sin sorpresas.",
      subtitle: "Empeza con 7 dias de prueba gratis. Sin tarjeta de credito.",
      viewAll: "Ver todos los planes",
      plans: [
        {
          name: "Starter",
          price: "$3",
          period: "/mes",
          features: ["1 usuario", "3 proyectos", "Auto-tracking Claude Code", "Reportes 7 dias"],
        },
        {
          name: "Pro",
          price: "$9",
          period: "/mes",
          features: ["Proyectos ilimitados", "Metricas de IA", "Multiplicador productividad", "Export CSV", "Historial completo"],
          popular: true,
        },
        {
          name: "Team",
          price: "$14",
          period: "/usuario/mes",
          features: ["Todo de Pro", "Miembros de equipo", "Reportes de equipo", "CWD por miembro", "Soporte prioritario"],
        },
      ],
    },
    cta: {
      title: "Deja de adivinar. Empeza a medir.",
      subtitle: "7 dias de prueba gratis. Setup en menos de 3 minutos.",
      button: "Empezar a Trackear",
    },
    footer: "Hecho con Next.js, Drizzle y Neon. Open source.",
    langSwitch: "English",
  },
};

export function Landing() {
  const [lang, setLang] = useState<Lang>("en");
  const c = t[lang];

  return (
    <div className="min-h-screen">
      {/* Nav */}
      <header className="border-b border-border/50">
        <div className="mx-auto max-w-6xl px-4 flex items-center justify-between h-14">
          <img src="/multick-lockup-dark.svg" alt="Multick" className="h-7" />
          <div className="flex items-center gap-3">
            <Link href="/extension" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Extension
            </Link>
            <Link href="/pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Pricing
            </Link>
            <button
              onClick={() => setLang(lang === "en" ? "es" : "en")}
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Globe className="h-3.5 w-3.5" />
              {c.langSwitch}
            </button>
            <Link href="/login">
              <Button variant="outline" size="sm">
                Log in
              </Button>
            </Link>
            <Link href="/login">
              <Button size="sm">
                Sign up
                <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 pt-24 pb-20 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-border/50 bg-muted/50 px-4 py-1.5 text-sm text-muted-foreground mb-8">
          <Zap className="h-3.5 w-3.5 text-amber-400" />
          {c.hero.badge}
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1] max-w-4xl mx-auto">
          {c.hero.title}
          <br />
          <span className="bg-gradient-to-r from-purple-400 to-emerald-400 bg-clip-text text-transparent">
            {c.hero.titleAccent}
          </span>
        </h1>
        <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          {c.hero.subtitle}
        </p>
        <div className="mt-10 flex items-center justify-center gap-4">
          <Link href="/login">
            <Button size="lg" className="h-12 px-8 text-base">
              {c.hero.cta}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
          <a href="#how">
            <Button variant="outline" size="lg" className="h-12 px-8 text-base">
              {c.hero.ctaSecondary}
            </Button>
          </a>
        </div>

        {/* Fake dashboard preview */}
        <div className="mt-16 mx-auto max-w-4xl rounded-xl border border-border/50 bg-card p-6 shadow-2xl shadow-black/20">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-sm font-medium">Tracking: Longevity App</span>
            </div>
            <span className="text-3xl font-mono font-bold tabular-nums">1:47:23</span>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {c.metrics.items.map((m) => (
              <div key={m.label} className="rounded-lg bg-muted/50 p-3 text-center">
                <p className="text-xs text-muted-foreground">{m.label}</p>
                <p className={`text-xl font-bold font-mono ${m.color}`}>{m.value}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 flex h-2.5 rounded-full overflow-hidden bg-muted">
            <div className="bg-blue-500 w-[55%]" />
            <div className="bg-emerald-500 w-[30%]" />
            <div className="bg-purple-500 w-[15%]" />
          </div>
          <div className="mt-2 flex gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-500" /> Manual
            </span>
            <span className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> AI-Assisted
            </span>
            <span className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-purple-500" /> AI Working
            </span>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-4 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">{c.features.title}</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {c.features.items.map((f) => (
            <div
              key={f.title}
              className="rounded-xl border border-border/50 bg-card p-6 hover:border-border transition-colors"
            >
              <f.icon className="h-8 w-8 text-muted-foreground mb-4" />
              <h3 className="font-semibold mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="mx-auto max-w-6xl px-4 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">{c.how.title}</h2>
        <div className="grid sm:grid-cols-3 gap-8">
          {c.how.steps.map((step) => (
            <div key={step.num} className="text-center">
              <span className="text-5xl font-bold text-muted-foreground/20">{step.num}</span>
              <h3 className="font-semibold text-lg mt-2">{step.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Metrics showcase */}
      <section className="mx-auto max-w-6xl px-4 py-20">
        <div className="rounded-2xl border border-border/50 bg-card p-12 text-center">
          <h2 className="text-3xl font-bold mb-2">{c.metrics.title}</h2>
          <p className="text-muted-foreground mb-10">{c.metrics.subtitle}</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-2xl mx-auto">
            {c.metrics.items.map((m) => (
              <div key={m.label}>
                <p className={`text-4xl font-bold font-mono ${m.color}`}>{m.value}</p>
                <p className="text-sm text-muted-foreground mt-1">{m.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="mx-auto max-w-5xl px-4 py-20">
        <h2 className="text-3xl font-bold text-center mb-2">{c.pricing.title}</h2>
        <p className="text-center text-muted-foreground mb-12">{c.pricing.subtitle}</p>
        <div className="grid sm:grid-cols-3 gap-6">
          {c.pricing.plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-xl border p-6 bg-card ${
                "popular" in plan && plan.popular
                  ? "border-2 border-primary relative"
                  : "border-border/50"
              }`}
            >
              {"popular" in plan && plan.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-medium px-3 py-1 rounded-full">
                  Popular
                </span>
              )}
              <h3 className="font-semibold text-lg">{plan.name}</h3>
              <div className="mt-3 mb-4">
                <span className="text-4xl font-bold">{plan.price}</span>
                <span className="text-muted-foreground ml-1">{plan.period}</span>
              </div>
              <ul className="space-y-2 mb-6">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/pricing">
                <Button
                  className="w-full"
                  variant={"popular" in plan && plan.popular ? "default" : "outline"}
                >
                  {c.hero.cta}
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>
          ))}
        </div>
        <p className="text-center mt-6">
          <Link href="/pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4">
            {c.pricing.viewAll} →
          </Link>
        </p>
      </section>

      {/* Final CTA */}
      <section className="mx-auto max-w-6xl px-4 py-20 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold">{c.cta.title}</h2>
        <p className="text-muted-foreground mt-3 mb-8">{c.cta.subtitle}</p>
        <Link href="/login">
          <Button size="lg" className="h-12 px-8 text-base">
            {c.cta.button}
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8 text-center text-sm text-muted-foreground">
        {c.footer}
      </footer>
    </div>
  );
}
