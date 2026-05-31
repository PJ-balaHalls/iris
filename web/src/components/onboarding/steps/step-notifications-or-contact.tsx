// web/src/components/onboarding/steps/step-notifications-or-contact.tsx
import type { OnboardingStepProps } from "@/components/onboarding/types";
import {
  businessPositions,
  notificationChannels,
  notificationFrequencies,
  notificationTopics,
} from "@/constants/onboarding";
import { Input } from "@/components/ui/input";
import { OptionList } from "@/components/ui/option-list";
import { Select } from "@/components/ui/select";

export function StepNotificationsOrContact({ form }: Pick<OnboardingStepProps, "form">) {
  const accountScope = form.watch("accountScope");
  const selectedChannels = form.watch("notificationChannels");
  const selectedTopics = form.watch("notificationTopics");
  const businessPosition = form.watch("businessPosition");

  return (
    <section className="animate-[iris-soft-enter_360ms_ease-out] space-y-6">
      <div>
        <p className="font-mono text-detail uppercase tracking-[0.22em] text-foreground-muted">
          Contato
        </p>
        <h2 className="mt-2 font-serif text-h2 font-semibold tracking-[-0.04em]">
          {accountScope === "internal" ? "Preferências de notificação" : "Contato e papel"}
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-foreground-secondary">
          {accountScope === "internal"
            ? "Ajuste o que merece sua atenção. O objetivo é reduzir ruído."
            : "Nada de campo livre para cargo: selecione o papel mais próximo da sua atuação."}
        </p>
      </div>

      {accountScope === "internal" ? (
        <div className="space-y-6">
          <OptionList
            label="Canais"
            description="Escolha por onde quer receber atividades administrativas."
            items={notificationChannels.map((channel) => ({
              value: channel.value,
              label: channel.label,
              description: channel.description,
            }))}
            value={selectedChannels}
            multiple
            columns={4}
            onChange={(value) => form.setValue("notificationChannels", value as string[], { shouldDirty: true })}
          />

          <Select
            label="Frequência"
            options={notificationFrequencies.map((item) => ({
              value: item.value,
              label: item.label,
            }))}
            {...form.register("notificationFrequency")}
          />

          <OptionList
            label="Assuntos"
            description="Cada assunto controla um tipo de evento no admin."
            items={notificationTopics.map((topic) => ({
              value: topic.value,
              label: topic.label,
              description: topic.description,
            }))}
            value={selectedTopics}
            multiple
            columns={4}
            onChange={(value) => form.setValue("notificationTopics", value as string[], { shouldDirty: true })}
          />
        </div>
      ) : (
        <div className="space-y-5">
          <Input label="Telefone comercial" placeholder="(00) 00000-0000" {...form.register("businessPhone")} />

          <OptionList
            label="Seu papel na organização"
            description="Selecione a alternativa mais próxima. Isso ajuda na validação e nas permissões."
            items={businessPositions.map((position) => ({
              value: position.value,
              label: position.label,
              description: position.description,
            }))}
            value={businessPosition}
            onChange={(value) => form.setValue("businessPosition", value as never, { shouldDirty: true })}
            columns={3}
          />
        </div>
      )}
    </section>
  );
}
