// web/src/components/onboarding/shared/address-lookup-card.tsx
import { useState } from "react";
import { Loader2, MapPin, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { OnboardingStepProps } from "@/components/onboarding/types";
import { formatCep, onlyDigits } from "@/components/onboarding/utils";

type AddressLookupCardProps = Pick<OnboardingStepProps, "form">;

export function AddressLookupCard({ form }: AddressLookupCardProps) {
  const [isSearching, setIsSearching] = useState(false);
  const [lookupMessage, setLookupMessage] = useState<string | null>(null);

  const cep = form.watch("cep");
  const addressLine = form.watch("addressLine");
  const neighborhood = form.watch("neighborhood");
  const city = form.watch("city");
  const state = form.watch("state");

  const hasAddress = Boolean(addressLine || city || state);

  async function searchCep() {
    const digits = onlyDigits(form.getValues("cep"));

    if (digits.length !== 8) {
      setLookupMessage("Digite um CEP com 8 números para buscar.");
      return;
    }

    try {
      setIsSearching(true);
      setLookupMessage(null);

      const response = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
      const data = (await response.json()) as {
        erro?: boolean;
        logradouro?: string;
        bairro?: string;
        localidade?: string;
        uf?: string;
      };

      if (data.erro) {
        setLookupMessage("CEP não encontrado. Verifique o número digitado.");
        return;
      }

      form.setValue("addressLine", data.logradouro ?? "", { shouldDirty: true });
      form.setValue("neighborhood", data.bairro ?? "", { shouldDirty: true });
      form.setValue("city", data.localidade ?? "", { shouldDirty: true });
      form.setValue("state", data.uf ?? "", { shouldDirty: true });

      setLookupMessage("Endereço encontrado automaticamente.");
    } catch {
      setLookupMessage("Não foi possível buscar o CEP agora.");
    } finally {
      setIsSearching(false);
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-background p-4">
      <div className="grid gap-3 md:grid-cols-[1fr_auto]">
        <Input
          label="CEP"
          placeholder="00000-000"
          value={cep ?? ""}
          onChange={(event) => {
            form.setValue("cep", formatCep(event.target.value), { shouldDirty: true });
            setLookupMessage(null);
          }}
          helperText="Digite o CEP e clique em buscar. O endereço aparece automaticamente."
        />

        <div className="flex items-end">
          <Button type="button" onClick={searchCep} disabled={isSearching} className="h-12">
            {isSearching ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                Buscando
              </>
            ) : (
              <>
                <Search className="size-4" aria-hidden="true" />
                Buscar
              </>
            )}
          </Button>
        </div>
      </div>

      {lookupMessage ? (
        <p className="mt-3 text-sm leading-6 text-foreground-secondary">{lookupMessage}</p>
      ) : null}

      {hasAddress ? (
        <div className="mt-4 animate-[iris-soft-enter_360ms_ease-out] rounded-xl border border-border bg-surface p-4 shadow-irisSm">
          <div className="flex items-start gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent text-white">
              <MapPin className="size-4" aria-hidden="true" />
            </span>

            <div className="min-w-0">
              <p className="font-serif text-xl tracking-[-0.03em] text-foreground">
                Endereço encontrado
              </p>
              <p className="mt-1 text-sm leading-6 text-foreground-secondary">
                {[addressLine, neighborhood, city, state].filter(Boolean).join(" · ")}
              </p>
            </div>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <Input label="Número" placeholder="123" {...form.register("addressNumber")} />
            <Input label="Complemento" placeholder="Apto, sala..." {...form.register("addressComplement")} />
          </div>
        </div>
      ) : null}
    </div>
  );
}
