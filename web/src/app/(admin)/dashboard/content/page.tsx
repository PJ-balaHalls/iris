import { 
  FileText, GitCommit, Scale, Palette, 
  Terminal, ShieldAlert, Image as ImageIcon, LayoutTemplate 
} from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

const creators = [
  {
    title: "Changelog & Migrations",
    description: "Registre notas de lançamento, atualizações de sistema e mudanças de impacto.",
    href: "/dashboard/content/changelog",
    icon: GitCommit,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  {
    title: "Documentos Legais",
    description: "Gerencie termos de uso, políticas de privacidade e contratos de compliance.",
    href: "/dashboard/content/legal",
    icon: Scale,
    color: "text-purple-500",
    bg: "bg-purple-500/10",
  },
  {
    title: "Design System",
    description: "Crie guias de componentes, tokens visuais e diretrizes de experiência (UX/UI).",
    href: "/dashboard/content/design-system",
    icon: Palette,
    color: "text-pink-500",
    bg: "bg-pink-500/10",
  },
  {
    title: "Arquitetura & Engenharia",
    description: "Documente APIs, diagramas de banco de dados e contratos do Motor Flora.",
    href: "/dashboard/content/architecture",
    icon: Terminal,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
  },
  {
    title: "Políticas de Moderação",
    description: "Estabeleça regras de comunidade, guias de ética e fluxos de escalonamento.",
    href: "/dashboard/content/moderation",
    icon: ShieldAlert,
    color: "text-rose-500",
    bg: "bg-rose-500/10",
  },
  {
    title: "Artigos e Manuais Livres",
    description: "Crie documentação geral, tutoriais de onboarding e base de conhecimento.",
    href: "/dashboard/content/articles",
    icon: FileText,
    color: "text-amber-500",
    bg: "bg-amber-500/10",
  },
];

export default function ContentStudioHubPage() {
  return (
    <div className="p-6 max-w-6xl mx-auto w-full space-y-10">
      {/* Header do Hub */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-accent mb-1">
            <LayoutTemplate className="size-4" /> Content Studio
          </div>
          <h1 className="text-3xl font-bold tracking-[-0.04em] text-foreground">
            Central de Criação
          </h1>
          <p className="text-sm text-foreground-secondary mt-1">
            Selecione um criador especializado para gerenciar o acervo do ecossistema IRÍS.
          </p>
        </div>
        <Link 
          href="/dashboard/content/media"
          className="inline-flex items-center justify-center gap-2 rounded-full bg-surface border border-border px-5 py-2.5 text-sm font-semibold text-foreground-secondary hover:text-foreground hover:bg-surface-hover transition-all"
        >
          <ImageIcon className="size-4" />
          Media Library
        </Link>
      </div>

      {/* Grid de Criadores */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {creators.map((creator) => {
          const Icon = creator.icon;
          return (
            <Link 
              key={creator.href} 
              href={creator.href}
              className="group flex flex-col justify-between p-6 rounded-2xl border border-border bg-surface/40 hover:bg-surface/80 shadow-irisSm hover:shadow-irisMd transition-all duration-300"
            >
              <div>
                <div className={`w-12 h-12 rounded-xl ${creator.bg} ${creator.color} flex items-center justify-center mb-5 group-hover:scale-105 transition-transform`}>
                  <Icon className="size-6" />
                </div>
                <h2 className="text-xl font-bold text-foreground tracking-tight mb-2">
                  {creator.title}
                </h2>
                <p className="text-sm text-foreground-secondary leading-relaxed">
                  {creator.description}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}