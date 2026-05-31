// /web/src/components/admin/admin-dashboard-skeleton.tsx
"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  Building2,
  ClipboardCheck,
  Flag,
  KeyRound,
  LayoutDashboard,
  Scale,
  ShieldCheck,
  Sprout,
  UsersRound,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

type SkeletonMode = "overview" | "table" | "queue" | "governance" | "docs" | "flags" | "moderation";

type SkeletonConfig = {
  mode: SkeletonMode;
  title: string;
  eyebrow: string;
  description: string;
  icon: LucideIcon;
};

function cx(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

function getSkeletonConfig(pathname: string): SkeletonConfig {
  if (pathname === "/dashboard") {
    return {
      mode: "overview",
      title: "Carregando visão geral",
      eyebrow: "Admin IRÍS",
      description: "Sincronizando métricas, identidade Flora e atalhos administrativos.",
      icon: LayoutDashboard,
    };
  }

  if (pathname.includes("/organizations/requests")) {
    return {
      mode: "queue",
      title: "Carregando solicitações",
      eyebrow: "Institucional",
      description: "Preparando fila de revisão, estados de aprovação e vínculos institucionais.",
      icon: ClipboardCheck,
    };
  }

  if (pathname.includes("/organizations/access-codes")) {
    return {
      mode: "governance",
      title: "Carregando códigos de acesso",
      eyebrow: "Root Governance",
      description: "Montando chaves institucionais, uso, expiração e auditoria.",
      icon: KeyRound,
    };
  }

  if (pathname.includes("/organizations")) {
    return {
      mode: "table",
      title: "Carregando organizações",
      eyebrow: "B2B",
      description: "Buscando diretório institucional, membros e status de verificação.",
      icon: Building2,
    };
  }

  if (pathname.includes("/flora")) {
    return {
      mode: "governance",
      title: "Carregando Motor Flora",
      eyebrow: "Botanic Identity",
      description: "Validando identidades, taxonomia, chaves internas e trilhas sensíveis.",
      icon: Sprout,
    };
  }

  if (pathname.includes("/moderation")) {
    return {
      mode: "moderation",
      title: "Carregando moderação",
      eyebrow: "Ética",
      description: "Preparando casos, conselhos, denúncias e sinais de retenção segura.",
      icon: Scale,
    };
  }

  if (pathname.includes("/feature-flags")) {
    return {
      mode: "flags",
      title: "Carregando feature flags",
      eyebrow: "Engenharia",
      description: "Sincronizando módulos, kill switches, rotas e experimentos controlados.",
      icon: Flag,
    };
  }

  if (pathname.includes("/docs")) {
    return {
      mode: "docs",
      title: "Carregando documentação",
      eyebrow: "Documentação",
      description: "Organizando manuais, design system, changelog e migrations.",
      icon: BookOpen,
    };
  }

  if (pathname.includes("/ecosystem/profiles")) {
    return {
      mode: "table",
      title: "Carregando perfis globais",
      eyebrow: "Ecossistema",
      description: "Preparando usernames, status de onboarding e perfis públicos.",
      icon: UsersRound,
    };
  }

  return {
    mode: "table",
    title: "Carregando área administrativa",
    eyebrow: "Admin",
    description: "Preparando dados e componentes da página atual.",
    icon: ShieldCheck,
  };
}

function AnimatedBrandBlur() {
  return (
    <>
      <div 
        className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-[#006D4E]/15 blur-3xl" 
        style={{ animation: "iris-brand-blur 3s ease-in-out infinite" }} 
      />
      <div 
        className="pointer-events-none absolute -bottom-28 left-10 size-64 rounded-full bg-[#9A7CA7]/10 blur-3xl" 
        style={{ animation: "iris-brand-blur-secondary 4s ease-in-out infinite" }} 
      />
      <style>{`
        @keyframes iris-brand-blur {
          0% { opacity: 0.4; transform: translate3d(0, 0, 0) scale(0.95); }
          50% { opacity: 0.8; transform: translate3d(-20px, 15px, 0) scale(1.05); }
          100% { opacity: 0.4; transform: translate3d(0, 0, 0) scale(0.95); }
        }
        @keyframes iris-brand-blur-secondary {
          0% { opacity: 0.3; transform: translate3d(0, 0, 0) scale(1); }
          50% { opacity: 0.6; transform: translate3d(20px, -15px, 0) scale(1.05); }
          100% { opacity: 0.3; transform: translate3d(0, 0, 0) scale(1); }
        }
        @keyframes shimmer-slide {
          100% { transform: translateX(100%); }
        }
        @media (prefers-reduced-motion: reduce) {
          div { animation: none !important; }
        }
      `}</style>
    </>
  );
}

function SkeletonBlock({ className = "", rounded = "rounded-2xl" }: { className?: string; rounded?: string }) {
  return (
    <div
      className={cx(
        "relative overflow-hidden bg-[#E0DDD6]/40 dark:bg-[#2A2A2A]/50",
        rounded,
        className
      )}
    >
      <div className="absolute inset-0 -translate-x-full animate-[shimmer-slide_1.5s_infinite] bg-gradient-to-r from-transparent via-white/40 to-transparent dark:via-white/5" />
    </div>
  );
}

function SkeletonLine({ className = "" }: { className?: string }) {
  return <SkeletonBlock className={cx("h-3", className)} rounded="rounded-full" />;
}

function SkeletonHeader({ config }: { config: SkeletonConfig }) {
  const Icon = config.icon;
  return (
    <section className="relative overflow-hidden rounded-[38px] border border-[#E0DDD6]/70 bg-white/[0.45] p-6 shadow-sm backdrop-blur-2xl dark:border-[#2A2A2A] dark:bg-[#1C1C1C]/[0.45] sm:p-8">
      <AnimatedBrandBlur />
      
      <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#006D4E]/15 bg-[#006D4E]/10 px-3 py-1.5 text-[11px] font-medium text-[#006D4E]">
            <Icon className="size-3.5" />
            {config.eyebrow}
          </div>
          
          <h1 className="mt-5 text-3xl font-semibold tracking-[-0.04em] text-[#111111] dark:text-[#FAF7F2] sm:text-4xl">
            {config.title}
          </h1>
          
          <p className="mt-4 max-w-2xl text-sm leading-7 text-[#444444] dark:text-[#C0C0C0]">
            {config.description}
          </p>
        </div>
        
        <div className="grid gap-3 sm:grid-cols-2 lg:w-[420px]">
          <SkeletonBlock className="h-28" rounded="rounded-[24px]" />
          <SkeletonBlock className="h-28" rounded="rounded-[24px]" />
        </div>
      </div>
    </section>
  );
}

function OverviewSkeleton() {
  return (
    <>
      <section className="grid gap-4 md:grid-cols-3 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="rounded-[30px] border border-[#E0DDD6]/70 bg-white/[0.45] p-5 backdrop-blur-xl dark:border-[#2A2A2A] dark:bg-[#1C1C1C]/[0.45]">
            <SkeletonBlock className="size-11" rounded="rounded-2xl" />
            <SkeletonLine className="mt-6 w-24" />
            <SkeletonLine className="mt-3 h-8 w-16" />
            <SkeletonLine className="mt-4 w-full" />
            <SkeletonLine className="mt-2 w-2/3" />
          </div>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-[28px] border border-[#E0DDD6]/70 bg-white/[0.45] p-5 backdrop-blur-xl dark:border-[#2A2A2A] dark:bg-[#1C1C1C]/[0.45]">
            <SkeletonBlock className="size-10" rounded="rounded-2xl" />
            <SkeletonLine className="mt-5 w-32" />
            <SkeletonLine className="mt-3 w-full" />
            <SkeletonLine className="mt-2 w-4/5" />
          </div>
        ))}
      </section>
    </>
  );
}

function TableSkeleton() {
  return (
    <section className="rounded-[32px] border border-[#E0DDD6]/70 bg-white/[0.45] p-6 backdrop-blur-xl dark:border-[#2A2A2A] dark:bg-[#1C1C1C]/[0.45]">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <SkeletonBlock className="h-10 w-full max-w-sm" rounded="rounded-full" />
        <div className="flex gap-2">
          <SkeletonBlock className="h-10 w-24" rounded="rounded-full" />
          <SkeletonBlock className="h-10 w-24" rounded="rounded-full" />
        </div>
      </div>

      <div className="mt-8 space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 rounded-[20px] border border-[#E0DDD6]/50 bg-white/40 p-4 dark:border-[#2A2A2A]/50 dark:bg-[#1C1C1C]/40">
            <SkeletonBlock className="size-10 shrink-0" rounded="rounded-full" />
            <div className="flex-1 space-y-2">
              <SkeletonLine className="w-1/3" />
              <SkeletonLine className="w-1/4" />
            </div>
            <div className="hidden flex-1 space-y-2 md:block">
              <SkeletonLine className="w-1/2" />
              <SkeletonLine className="w-1/3" />
            </div>
            <SkeletonBlock className="h-8 w-20 shrink-0" rounded="rounded-full" />
          </div>
        ))}
      </div>
    </section>
  );
}

function QueueSkeleton() {
  return (
    <section className="grid gap-6 md:grid-cols-3">
      {["Nova análise", "Em revisão", "Concluído"].map((col) => (
        <div key={col} className="rounded-[30px] border border-[#E0DDD6]/70 bg-white/[0.30] p-4 backdrop-blur-xl dark:border-[#2A2A2A] dark:bg-[#1C1C1C]/[0.30]">
          <div className="mb-5 flex items-center justify-between px-2">
            <SkeletonLine className="h-4 w-28" />
            <SkeletonBlock className="size-6" rounded="rounded-full" />
          </div>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-[20px] border border-[#E0DDD6]/50 bg-white/60 p-4 dark:border-[#2A2A2A]/50 dark:bg-[#111111]/40">
                <div className="flex items-center gap-2">
                  <SkeletonBlock className="size-8" rounded="rounded-full" />
                  <SkeletonLine className="w-24" />
                </div>
                <SkeletonLine className="mt-4 w-full" />
                <SkeletonLine className="mt-2 w-4/5" />
                <div className="mt-4 flex gap-2">
                  <SkeletonBlock className="h-6 w-16" rounded="rounded-md" />
                  <SkeletonBlock className="h-6 w-16" rounded="rounded-md" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}

function DocsSkeleton() {
  return (
    <section className="grid gap-6 lg:grid-cols-[280px_1fr]">
      <div className="space-y-6 rounded-[30px] border border-[#E0DDD6]/70 bg-white/[0.45] p-5 backdrop-blur-xl dark:border-[#2A2A2A] dark:bg-[#1C1C1C]/[0.45]">
        <SkeletonLine className="h-6 w-32" />
        <div className="space-y-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonLine key={i} className="h-4 w-full" />
          ))}
        </div>
      </div>
      
      <div className="rounded-[32px] border border-[#E0DDD6]/70 bg-white/[0.45] p-8 backdrop-blur-xl dark:border-[#2A2A2A] dark:bg-[#1C1C1C]/[0.45]">
        <SkeletonLine className="h-10 w-2/3" />
        <SkeletonLine className="mt-4 h-5 w-1/3" />
        
        <div className="mt-10 space-y-4">
          <SkeletonLine className="w-full" />
          <SkeletonLine className="w-full" />
          <SkeletonLine className="w-11/12" />
          <SkeletonLine className="w-full" />
          <SkeletonLine className="w-4/5" />
        </div>
        
        <SkeletonBlock className="mt-8 h-48 w-full" rounded="rounded-[20px]" />
        
        <div className="mt-8 space-y-4">
          <SkeletonLine className="w-full" />
          <SkeletonLine className="w-10/12" />
        </div>
      </div>
    </section>
  );
}

function SkeletonBody({ mode }: { mode: SkeletonMode }) {
  if (mode === "overview") return <OverviewSkeleton />;
  if (mode === "queue" || mode === "moderation") return <QueueSkeleton />;
  if (mode === "docs") return <DocsSkeleton />;
  return <TableSkeleton />;
}

export function AdminDashboardSkeleton({ pathname: pathnameOverride }: { pathname?: string }) {
  const currentPathname = usePathname();
  const config = React.useMemo(() => getSkeletonConfig(pathnameOverride ?? currentPathname), [pathnameOverride, currentPathname]);

  return (
    <div className="space-y-6">
      <SkeletonHeader config={config} />
      <SkeletonBody mode={config.mode} />
    </div>
  );
}