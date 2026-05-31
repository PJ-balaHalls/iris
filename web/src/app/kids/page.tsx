// web/src/app/kids/page.tsx
import Link from "next/link";
import { ArrowLeft, Baby, LockKeyhole, ShieldCheck } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";

export default function KidsPage() {
  return (
    <main className="min-h-screen px-6 py-8 md:px-10">
      <div className="mx-auto w-full max-w-[var(--layout-reading-max)]">
        <Link
          href="/register"
          className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-sm text-foreground-secondary shadow-irisSm transition hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Voltar ao cadastro
        </Link>

        <section className="py-16">
          <div className="flex size-14 items-center justify-center rounded-full bg-emotion text-white">
            <Baby className="size-6" aria-hidden="true" />
          </div>

          <h1 className="mt-7 font-serif text-[3.6rem] font-semibold leading-[0.95] tracking-[-0.06em] text-foreground">
            IRÍS Kids
          </h1>

          <p className="mt-6 text-lead leading-8 text-foreground-secondary">
            Contas identificadas como menores de idade entram em um modo protegido, com
            isolamento de rede, permissões restritas, ausência de exposição pública e camadas
            adicionais de segurança.
          </p>

          <div className="mt-10 grid gap-4">
            <div className="rounded-2xl border border-border bg-surface p-5 shadow-irisMd">
              <ShieldCheck className="mb-4 size-5 text-accent" aria-hidden="true" />
              <h2 className="font-serif text-h3 text-foreground">Ambiente protegido</h2>
              <p className="mt-2 text-sm leading-6 text-foreground-secondary">
                A conta Kids não aparece em buscas públicas e exige regras específicas de acesso.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-surface p-5 shadow-irisMd">
              <LockKeyhole className="mb-4 size-5 text-emotion" aria-hidden="true" />
              <h2 className="font-serif text-h3 text-foreground">Privacidade primeiro</h2>
              <p className="mt-2 text-sm leading-6 text-foreground-secondary">
                Dados de menores devem ser tratados com isolamento, retenção mínima e políticas
                conservadoras.
              </p>
            </div>
          </div>

          <div className="mt-8">
            <ButtonLink href="/register">Voltar ao onboarding</ButtonLink>
          </div>
        </section>
      </div>
    </main>
  );
}
