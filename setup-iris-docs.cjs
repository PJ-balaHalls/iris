#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const root = process.cwd();
const startedAt = new Date();

function exists(p) {
  return fs.existsSync(p);
}

function resolveWebRoot() {
  if (exists(path.join(root, "web", "src", "app"))) return path.join(root, "web");
  if (exists(path.join(root, "src", "app")) && exists(path.join(root, "package.json"))) return root;
  throw new Error("Execute este setup na raiz do monorepo IRIS ou dentro da pasta web.");
}

const webRoot = resolveWebRoot();
const repoRoot = path.basename(webRoot) === "web" ? path.dirname(webRoot) : webRoot;
const backupRoot = path.join(
  repoRoot,
  ".iris-backups",
  "docs-setup-" + startedAt.toISOString().replace(/[:.]/g, "-")
);

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function writeWebFile(relativePath, content) {
  const absPath = path.join(webRoot, relativePath);
  const normalized = content.trimStart().replace(/\s+$/g, "") + "\n";

  ensureDir(path.dirname(absPath));

  if (exists(absPath) && fs.readFileSync(absPath, "utf8") !== normalized) {
    const backupPath = path.join(backupRoot, relativePath);
    ensureDir(path.dirname(backupPath));
    fs.copyFileSync(absPath, backupPath);
  }

  fs.writeFileSync(absPath, normalized, "utf8");
  console.log("+ escrito:", relativePath);
}

writeWebFile("src/components/docs/docs-header.tsx", String.raw`
// /web/src/components/docs/docs-header.tsx
"use client";

import Link from "next/link";
import { BookOpen, Braces, LifeBuoy, Scale, Search, Sparkles, TerminalSquare } from "lucide-react";
import { usePathname } from "next/navigation";

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function DocsHeader() {
  const pathname = usePathname();

  const links = [
    { href: "/docs/guias", label: "Guias", icon: BookOpen },
    { href: "/docs/api", label: "API Reference", icon: Braces },
    { href: "/docs/legal", label: "Legal", icon: Scale },
    { href: "/docs/comunidade", label: "Comunidade", icon: Sparkles },
    { href: "/docs/changelog", label: "Changelog", icon: TerminalSquare },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#E0DDD6] bg-white/80 px-4 py-3 backdrop-blur-md dark:border-[#2A2A2A] dark:bg-[#111111]/80 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6">
        
        <div className="flex items-center gap-8">
          <Link href="/docs" className="flex items-center gap-2 transition hover:opacity-80">
            <div className="grid size-8 place-items-center rounded-xl bg-[#006D4E] text-white">
              <BookOpen className="size-4" />
            </div>
            <span className="font-semibold tracking-tight text-[#111111] dark:text-[#FAF7F2]">IRÍS Docs</span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {links.map((link) => {
              const active = pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cx(
                    "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm transition",
                    active
                      ? "bg-[#006D4E]/10 font-medium text-[#006D4E]"
                      : "text-[#666666] hover:bg-black/5 hover:text-[#111111] dark:text-[#A0A0A0] dark:hover:bg-white/10 dark:hover:text-[#FAF7F2]"
                  )}
                >
                  <link.icon className="size-3.5" />
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex flex-1 items-center justify-end gap-4 md:flex-none">
          <div className="relative hidden w-full max-w-[240px] md:block">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#8A8A8A]" />
            <input
              type="text"
              placeholder="Buscar documentos..."
              className="w-full rounded-full border border-[#E0DDD6] bg-[#FAF7F2] py-1.5 pl-9 pr-4 text-sm text-[#111111] outline-none transition focus:border-[#006D4E] dark:border-[#2A2A2A] dark:bg-[#1C1C1C] dark:text-[#FAF7F2] dark:focus:border-[#006D4E]"
            />
          </div>

          <Link
            href="/suporte"
            className="hidden items-center gap-2 rounded-full border border-[#E0DDD6] bg-white px-4 py-1.5 text-sm font-medium text-[#111111] transition hover:bg-[#FAF7F2] dark:border-[#2A2A2A] dark:bg-[#1C1C1C] dark:text-[#FAF7F2] dark:hover:bg-[#2A2A2A] sm:flex"
          >
            <LifeBuoy className="size-3.5" />
            Suporte
          </Link>
        </div>

      </div>
    </header>
  );
}
`);

writeWebFile("src/components/docs/docs-footer.tsx", String.raw`
// /web/src/components/docs/docs-footer.tsx
export function DocsFooter() {
  return (
    <footer className="mt-20 border-t border-[#E0DDD6] bg-[#FAF7F2] py-12 dark:border-[#2A2A2A] dark:bg-[#111111]">
      <div className="mx-auto max-w-7xl px-4 text-center text-sm text-[#666666] dark:text-[#8A8A8A] sm:px-6 lg:px-8">
        <p>IRÍS Social &copy; {new Date().getFullYear()}. Ecossistema operado sob regras de privacidade E2EE.</p>
      </div>
    </footer>
  );
}
`);

writeWebFile("src/app/docs/layout.tsx", String.raw`
// /web/src/app/docs/layout.tsx
import { DocsHeader } from "@/components/docs/docs-header";
import { DocsFooter } from "@/components/docs/docs-footer";

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-[#FAF7F2] dark:bg-[#111111]">
      <DocsHeader />
      <main className="flex-1">{children}</main>
      <DocsFooter />
    </div>
  );
}
`);

writeWebFile("src/app/docs/page.tsx", String.raw`
// /web/src/app/docs/page.tsx
import Link from "next/link";
import { ArrowRight, BookOpen, Braces, Building2, TerminalSquare } from "lucide-react";

export const metadata = {
  title: "IRÍS Docs - Central de Conhecimento",
  description: "Guias, APIs e documentação do ecossistema IRÍS.",
};

const TRAIL_CARDS = [
  {
    title: "Operação e Atendimento",
    description: "Guias sobre filas, Control Desk, monitoramento de SLAs e relatórios.",
    icon: BookOpen,
    href: "/docs/guias/operacao",
    color: "text-[#006D4E]",
    bg: "bg-[#006D4E]/10",
  },
  {
    title: "Administração B2B",
    description: "Gestão de organizações, usuários, convites e permissões.",
    icon: Building2,
    href: "/docs/guias/administracao",
    color: "text-[#6F557A]",
    bg: "bg-[#9A7CA7]/10",
  },
  {
    title: "Desenvolvimento",
    description: "Autenticação, endpoints, webhooks e implantação.",
    icon: TerminalSquare,
    href: "/docs/api",
    color: "text-[#183A2E]",
    bg: "bg-[#183A2E]/10",
  },
];

export default function DocsHomePage() {
  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white px-4 py-20 text-center dark:bg-[#1C1C1C] sm:px-6 lg:px-8">
        <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2">
          <div className="size-[600px] rounded-full bg-[#006D4E]/10 blur-[80px]" />
        </div>
        
        <div className="relative z-10 mx-auto max-w-2xl">
          <h1 className="text-4xl font-bold tracking-tight text-[#111111] dark:text-[#FAF7F2] sm:text-5xl">
            Como podemos ajudar hoje?
          </h1>
          <p className="mt-4 text-lg text-[#666666] dark:text-[#C0C0C0]">
            Explore tutoriais, guias operacionais e referência de API do ecossistema IRÍS.
          </p>

          <div className="mx-auto mt-8 flex max-w-xl items-center rounded-full border border-[#E0DDD6] bg-[#FAF7F2] p-2 shadow-sm transition-shadow focus-within:ring-2 focus-within:ring-[#006D4E]/20 dark:border-[#2A2A2A] dark:bg-[#111111]">
            <input
              type="text"
              placeholder="Digite o que você procura..."
              className="w-full bg-transparent px-4 text-base outline-none dark:text-white"
            />
            <button className="rounded-full bg-[#006D4E] px-6 py-2 text-sm font-medium text-white transition hover:bg-[#005a40]">
              Buscar
            </button>
          </div>
          
          <div className="mt-4 flex flex-wrap justify-center gap-2 text-sm text-[#8A8A8A]">
            <span>Buscas comuns:</span>
            <Link href="/docs/guias/onboarding" className="underline underline-offset-2 hover:text-[#006D4E]">Onboarding</Link>
            <Link href="/docs/api/auth" className="underline underline-offset-2 hover:text-[#006D4E]">Autenticação API</Link>
            <Link href="/docs/legal/termos" className="underline underline-offset-2 hover:text-[#006D4E]">Termos de Uso</Link>
          </div>
        </div>
      </section>

      {/* Trilhas por Perfil */}
      <section className="mx-auto mt-12 max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-xl font-semibold text-[#111111] dark:text-[#FAF7F2]">Navegue pelo seu perfil</h2>
        <div className="mt-6 grid gap-6 md:grid-cols-3">
          {TRAIL_CARDS.map((card) => (
            <Link
              key={card.title}
              href={card.href}
              className="group flex flex-col justify-between rounded-3xl border border-[#E0DDD6] bg-white p-6 transition-all hover:-translate-y-1 hover:shadow-md dark:border-[#2A2A2A] dark:bg-[#1C1C1C]"
            >
              <div>
                <div className={"grid size-12 place-items-center rounded-2xl " + card.bg + " " + card.color}>
                  <card.icon className="size-6" />
                </div>
                <h3 className="mt-5 text-lg font-semibold text-[#111111] dark:text-[#FAF7F2]">{card.title}</h3>
                <p className="mt-2 text-sm leading-6 text-[#666666] dark:text-[#A0A0A0]">{card.description}</p>
              </div>
              <div className="mt-6 flex items-center gap-2 text-sm font-medium text-[#006D4E]">
                Explorar trilha <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Descoberta Rápida */}
      <section className="mx-auto mb-20 mt-16 max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-2">
          
          <div className="rounded-3xl border border-[#E0DDD6] bg-white p-6 dark:border-[#2A2A2A] dark:bg-[#1C1C1C]">
            <div className="flex items-center gap-3">
              <Sparkles className="size-5 text-[#006D4E]" />
              <h2 className="text-lg font-semibold text-[#111111] dark:text-[#FAF7F2]">Artigos Populares</h2>
            </div>
            <ul className="mt-6 space-y-4">
              <li>
                <Link href="/docs/guias/arquitetura-inicial" className="group block">
                  <h3 className="text-sm font-medium text-[#111111] group-hover:text-[#006D4E] dark:text-white">Como entender a Assinatura Flora</h3>
                  <p className="mt-1 text-xs text-[#8A8A8A]">Entenda o formato IRIS-BIOMA-NULO-IRS/001</p>
                </Link>
              </li>
              <li>
                <Link href="/docs/api/webhooks" className="group block">
                  <h3 className="text-sm font-medium text-[#111111] group-hover:text-[#006D4E] dark:text-white">Configurando Webhooks de Moderação</h3>
                  <p className="mt-1 text-xs text-[#8A8A8A]">Receba eventos da Aurora em tempo real.</p>
                </Link>
              </li>
              <li>
                <Link href="/docs/guias/convites-b2b" className="group block">
                  <h3 className="text-sm font-medium text-[#111111] group-hover:text-[#006D4E] dark:text-white">Aprovação de Organizações B2B</h3>
                  <p className="mt-1 text-xs text-[#8A8A8A]">Como o Root Administrator aprova acessos.</p>
                </Link>
              </li>
            </ul>
          </div>

          <div className="flex flex-col justify-center rounded-3xl border border-[#006D4E]/20 bg-[#006D4E]/5 p-8 dark:bg-[#006D4E]/10">
            <span className="w-fit rounded-full bg-[#006D4E] px-3 py-1 text-xs font-semibold text-white">Última Atualização</span>
            <h2 className="mt-4 text-2xl font-bold text-[#111111] dark:text-[#FAF7F2]">Onboarding SPA Liberado</h2>
            <p className="mt-3 text-sm leading-6 text-[#666666] dark:text-[#C0C0C0]">
              Agora todo o painel administrativo opera em transições suaves, sem barras de loading globais, utilizando componentes esqueletos em Server Actions nativas.
            </p>
            <Link href="/docs/changelog" className="mt-6 font-medium text-[#006D4E] hover:underline">
              Ler o Changelog completo &rarr;
            </Link>
          </div>

        </div>
      </section>
    </div>
  );
}
`);

writeWebFile("src/components/docs/article-feedback.tsx", String.raw`
// /web/src/components/docs/article-feedback.tsx
"use client";

import { useState } from "react";
import { ThumbsDown, ThumbsUp } from "lucide-react";

export function ArticleFeedback({ urlPath }: { urlPath: string }) {
  const [status, setStatus] = useState<"idle" | "positive" | "negative_prompt" | "submitted">("idle");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submitFeedback(isHelpful: boolean, feedbackMsg: string = "") {
    setIsSubmitting(true);
    try {
      await fetch("/api/docs/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ urlPath, isHelpful, feedbackMessage: feedbackMsg }),
      });
      setStatus("submitted");
    } catch {
      alert("Erro ao enviar feedback. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (status === "submitted") {
    return (
      <div className="mt-12 rounded-2xl border border-[#E0DDD6] bg-[#FAF7F2] p-6 text-center dark:border-[#2A2A2A] dark:bg-[#1C1C1C]">
        <p className="text-sm font-medium text-[#006D4E]">Obrigado pelo seu feedback!</p>
        <p className="mt-1 text-xs text-[#8A8A8A]">Sua contribuição ajuda a melhorar nossa documentação.</p>
      </div>
    );
  }

  if (status === "negative_prompt") {
    return (
      <div className="mt-12 rounded-2xl border border-[#E0DDD6] bg-white p-6 dark:border-[#2A2A2A] dark:bg-[#1C1C1C]">
        <p className="text-sm font-semibold text-[#111111] dark:text-white">O que faltou neste artigo?</p>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Conte-nos como podemos melhorar..."
          className="mt-3 w-full rounded-xl border border-[#E0DDD6] p-3 text-sm outline-none focus:border-[#006D4E] dark:border-[#2A2A2A] dark:bg-[#111111] dark:text-white"
          rows={3}
        />
        <div className="mt-4 flex gap-3">
          <button
            onClick={() => submitFeedback(false, message)}
            disabled={isSubmitting || message.trim().length === 0}
            className="rounded-full bg-[#006D4E] px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            Enviar feedback
          </button>
          <button onClick={() => setStatus("idle")} className="text-sm text-[#8A8A8A] hover:text-[#111111] dark:hover:text-white">
            Cancelar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-12 flex items-center justify-between rounded-2xl border border-[#E0DDD6] bg-white p-6 dark:border-[#2A2A2A] dark:bg-[#1C1C1C]">
      <p className="text-sm font-medium text-[#111111] dark:text-white">Este artigo resolveu seu problema?</p>
      <div className="flex gap-2">
        <button
          onClick={() => submitFeedback(true)}
          disabled={isSubmitting}
          className="flex items-center gap-2 rounded-full border border-[#E0DDD6] px-4 py-2 text-sm transition hover:bg-[#FAF7F2] dark:border-[#2A2A2A] dark:text-white dark:hover:bg-[#2A2A2A]"
        >
          <ThumbsUp className="size-4" /> Sim
        </button>
        <button
          onClick={() => setStatus("negative_prompt")}
          disabled={isSubmitting}
          className="flex items-center gap-2 rounded-full border border-[#E0DDD6] px-4 py-2 text-sm transition hover:bg-[#FAF7F2] dark:border-[#2A2A2A] dark:text-white dark:hover:bg-[#2A2A2A]"
        >
          <ThumbsDown className="size-4" /> Não
        </button>
      </div>
    </div>
  );
}
`);

writeWebFile("src/app/api/docs/feedback/route.ts", String.raw`
// web/src/app/api/docs/feedback/route.ts
import { NextResponse } from "next/server";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export async function POST(request: Request) {
  try {
    const { urlPath, isHelpful, feedbackMessage } = await request.json();

    const supabase = createSupabaseBrowserClient();
    if (!supabase) throw new Error("Supabase não configurado.");

    // Tenta pegar o ID do usuário se ele estiver logado, mas não impede envio anônimo.
    const { data: authData } = await supabase.auth.getUser();

    const { error } = await supabase.from("docs_feedback").insert({
      url_path: urlPath,
      is_helpful: isHelpful,
      feedback_message: feedbackMessage || null,
      user_id: authData?.user?.id || null,
    });

    if (error) throw error;

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ ok: false, error: "Falha ao enviar feedback." }, { status: 500 });
  }
}
`);

writeWebFile("src/app/docs/guias/primeiros-passos/page.tsx", String.raw`
// /web/src/app/docs/guias/primeiros-passos/page.tsx
import { ArticleFeedback } from "@/components/docs/article-feedback";

export const metadata = {
  title: "Primeiros Passos | IRÍS Docs",
};

export default function PrimeirosPassosDoc() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="mb-10">
        <span className="text-xs font-semibold uppercase tracking-widest text-[#006D4E]">Guias / Iniciante</span>
        <h1 className="mt-2 text-4xl font-bold tracking-tight text-[#111111] dark:text-white">
          Primeiros Passos no IRÍS Social
        </h1>
        <p className="mt-4 text-lg text-[#666666] dark:text-[#A0A0A0]">
          Entenda a estrutura base da sua conta, o que é o Motor Flora e como configurar seu primeiro perfil institucional. Tempo estimado: 5 min.
        </p>
      </header>

      <div className="prose prose-zinc max-w-none dark:prose-invert prose-headings:font-semibold prose-a:text-[#006D4E]">
        <h2>1. O que é a Assinatura Flora?</h2>
        <p>
          No IRÍS, não utilizamos níveis estáticos (como "Admin" ou "User"). Utilizamos o <strong>Motor Flora</strong>, que categoriza seu poder e função em quatro vetores: <em>Espécie, Estágio, Inclinação e Papel de Governança</em>.
        </p>
        <blockquote>
          <strong>Dica:</strong> Você pode visualizar a sua assinatura completa na sua página de Dashboard, ela se assemelha a algo como <code>LOTUS-BROTO-NULO-IRS/001</code>.
        </blockquote>

        <h2>2. Adicionando sua Organização</h2>
        <p>
          Se a sua conta for B2B (Fornecedor, Parceiro Comercial), você precisará estar vinculado a uma Organização. O processo é simples:
        </p>
        <ol>
          <li>Acesse a rota de onboarding corporativo.</li>
          <li>Busque pelo seu <strong>CNPJ</strong>.</li>
          <li>Se não encontrar, clique em "Cadastrar Nova Organização". Você assumirá o status de Responsável Legal provisório.</li>
        </ol>

        <h2>3. Próximos Passos</h2>
        <p>Após validar seu cadastro, você poderá começar a ler a documentação da API para webhooks ou integrar seus canais de atendimento nas configurações.</p>
      </div>

      <ArticleFeedback urlPath="/docs/guias/primeiros-passos" />
    </article>
  );
}
`);

const packagePath = path.join(webRoot, "package.json");
if (exists(packagePath) && process.env.IRIS_SKIP_TYPECHECK !== "1") {
  console.log("\nExecutando typecheck...");
  const result = spawnSync("npm", ["run", "typecheck"], { cwd: webRoot, stdio: "inherit", shell: process.platform === "win32" });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

console.log("\nSetup Docs concluído.");
