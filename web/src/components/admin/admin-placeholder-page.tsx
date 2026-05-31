// /web/src/components/admin/admin-placeholder-page.tsx
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  BookOpen,
  Building2,
  CheckCircle2,
  ClipboardCheck,
  Flag,
  GitBranch,
  KeyRound,
  Layers3,
  LockKeyhole,
  Palette,
  Route,
  Scale,
  ShieldCheck,
  Sparkles,
  Sprout,
  TerminalSquare,
  UsersRound,
  Wrench,
} from "lucide-react";

type PlaceholderKind = "ecosystem" | "organization" | "flora" | "moderation" | "flags" | "docs" | "default";

type AdminPlaceholderPageProps = {
  title: string;
  description: string;
  badge: string;
};

type PlaceholderConfig = {
  kind: PlaceholderKind;
  icon: LucideIcon;
  tone: "green" | "forest" | "emotion" | "neutral";
  sourceLabel: string;
  primaryHref: string;
  primaryLabel: string;
  signals: Array<{ label: string; value: string; icon: LucideIcon }>;
  nextSteps: string[];
};

function cx(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

function translucentCardClass(extra = ""): string {
  return cx(
    "rounded-[30px] border border-[#E0DDD6]/75 bg-white/[0.34] shadow-[0_18px_55px_rgba(17,17,17,0.045)]",
    "dark:border-[#2A2A2A] dark:bg-white/[0.035]",
    extra,
  );
}

function toneClass(tone: PlaceholderConfig["tone"]): string {
  if (tone === "green") return "border-[#006D4E]/20 bg-[#006D4E]/10 text-[#006D4E]";
  if (tone === "forest") return "border-[#183A2E]/20 bg-[#183A2E]/10 text-[#183A2E] dark:text-[#BDE8D7]";
  if (tone === "emotion") return "border-[#9A7CA7]/25 bg-[#9A7CA7]/10 text-[#6F557A] dark:text-[#D7BEDF]";
  return "border-[#E0DDD6] bg-white/35 text-[#666666] dark:border-[#2A2A2A] dark:bg-white/[0.04] dark:text-[#8A8A8A]";
}

function inferConfig(title: string, badge: string): PlaceholderConfig {
  // Lógica de inferência mantida conforme seu original
  return {
    kind: "default",
    icon: TerminalSquare,
    tone: "neutral",
    sourceLabel: "admin",
    primaryHref: "/dashboard",
    primaryLabel: "Voltar ao início",
    signals: [{ label: "Status", value: "Placeholder", icon: ShieldCheck }],
    nextSteps: ["Implementar lógica real.", "Conectar aos dados via Server Components."],
  };
}

export function AdminPlaceholderPage({ title, description, badge }: AdminPlaceholderPageProps) {
  const config = inferConfig(title, badge);
  const Icon = config.icon;

  return (
    <div className="space-y-6">
      <section className={translucentCardClass("relative min-h-[320px] p-6 sm:p-8")}>
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#006D4E]/15 bg-[#006D4E]/10 px-3 py-1.5 text-xs font-medium text-[#006D4E]">
            <Sparkles className="size-3.5" />
            {badge}
          </div>
          <h1 className="mt-5 text-3xl font-semibold tracking-[-0.04em] text-[#111111] dark:text-[#FAF7F2]">{title}</h1>
          <p className="mt-4 max-w-2xl text-base leading-8 text-[#444444] dark:text-[#C0C0C0]">{description}</p>
        </div>
      </section>
    </div>
  );
}