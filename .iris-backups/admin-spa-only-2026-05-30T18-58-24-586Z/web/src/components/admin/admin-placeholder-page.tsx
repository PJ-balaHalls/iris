// /web/src/components/admin/admin-placeholder-page.tsx
import { ArrowUpRight, ShieldCheck, Sparkles } from "lucide-react";

type AdminPlaceholderPageProps = {
  title: string;
  description: string;
  badge: string;
};

export function AdminPlaceholderPage({ title, description, badge }: AdminPlaceholderPageProps) {
  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-[36px] border border-[#E0DDD6] bg-white/78 p-6 shadow-[0_20px_70px_rgba(17,17,17,0.06)] backdrop-blur-2xl dark:border-[#2A2A2A] dark:bg-[#1C1C1C]/78 sm:p-8">
        <div className="pointer-events-none absolute -right-20 -top-24 size-64 rounded-full bg-[#006D4E]/10 blur-3xl" />
        <div className="relative max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#006D4E]/15 bg-[#006D4E]/10 px-3 py-1.5 text-xs font-medium text-[#006D4E]">
            <Sparkles className="size-3.5" />
            {badge}
          </div>
          <h1 className="mt-5 text-3xl font-semibold tracking-tight text-[#111111] dark:text-[#FAF7F2] sm:text-4xl">{title}</h1>
          <p className="mt-4 max-w-2xl text-base leading-8 text-[#444444] dark:text-[#C0C0C0]">{description}</p>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-[28px] border border-[#E0DDD6] bg-white/72 p-5 dark:border-[#2A2A2A] dark:bg-[#1C1C1C]/72">
          <h2 className="flex items-center gap-2 text-base font-semibold text-[#111111] dark:text-[#FAF7F2]">
            <ShieldCheck className="size-4 text-[#006D4E]" /> Segurança preservada
          </h2>
          <p className="mt-3 text-sm leading-6 text-[#444444] dark:text-[#C0C0C0]">
            Esta rota já herda o layout protegido do Dashboard. A implementação real deve continuar usando Server Components, RLS e validação no servidor.
          </p>
        </article>

        <article className="rounded-[28px] border border-[#E0DDD6] bg-white/72 p-5 dark:border-[#2A2A2A] dark:bg-[#1C1C1C]/72">
          <h2 className="flex items-center gap-2 text-base font-semibold text-[#111111] dark:text-[#FAF7F2]">
            <ArrowUpRight className="size-4 text-[#006D4E]" /> Próximo incremento
          </h2>
          <p className="mt-3 text-sm leading-6 text-[#444444] dark:text-[#C0C0C0]">
            O placeholder evita 404 durante a navegação e deixa o caminho preparado para a próxima tela real do Admin.
          </p>
        </article>
      </section>
    </div>
  );
}
