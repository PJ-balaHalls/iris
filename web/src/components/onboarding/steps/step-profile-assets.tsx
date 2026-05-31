// web/src/components/onboarding/steps/step-profile-assets.tsx
import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import { ImagePlus, Upload } from "lucide-react";
import { Input } from "@/components/ui/input";
import type { OnboardingStepProps } from "@/components/onboarding/types";

export type ProfileAssetDraft = {
  avatarFile: File | null;
  coverFile: File | null;
};

type StepProfileAssetsProps = Pick<OnboardingStepProps, "form"> & {
  profileAssets: ProfileAssetDraft;
  setProfileAssets: Dispatch<SetStateAction<ProfileAssetDraft>>;
};

function useObjectUrl(file: File | null) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!file) {
      setUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  return url;
}

export function StepProfileAssets({
  form,
  profileAssets,
  setProfileAssets,
}: StepProfileAssetsProps) {
  const avatarPreview = useObjectUrl(profileAssets.avatarFile);
  const coverPreview = useObjectUrl(profileAssets.coverFile);

  const avatarTransform = form.watch("avatarTransform") ?? { cropX: 0, cropY: 0, zoom: 1 };
  const coverTransform = form.watch("coverTransform") ?? { cropX: 0, cropY: 0, zoom: 1 };

  return (
    <section className="animate-[iris-soft-enter_360ms_ease-out] space-y-6">
      <div>
        <p className="text-detail font-medium uppercase tracking-[0.22em] text-foreground-muted">
          Perfil visual
        </p>

        <h2 className="mt-3 text-h2 font-semibold tracking-[-0.04em] text-foreground">
          Foto, capa e bio.
        </h2>

        <p className="mt-3 max-w-2xl text-sm leading-6 text-foreground-secondary">
          Tudo aqui é opcional. A imagem será enviada apenas no final da criação da conta.
        </p>
      </div>

      <Input
        label="Bio curta"
        placeholder="Uma descrição breve, elegante e humana."
        maxLength={280}
        helperText="Até 280 caracteres."
        {...form.register("profileBio")}
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-surface/90 p-5 shadow-irisSm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-foreground">Foto de perfil</p>
              <p className="mt-1 text-xs leading-5 text-foreground-muted">
                PNG, JPG ou WEBP. Máximo 5MB.
              </p>
            </div>
            <ImagePlus className="size-5 text-accent" aria-hidden="true" />
          </div>

          <label className="mt-4 flex min-h-44 cursor-pointer items-center justify-center overflow-hidden rounded-2xl border border-dashed border-border bg-background text-center transition hover:border-accent">
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt="Prévia da foto de perfil"
                className="size-32 rounded-full object-cover"
                style={{
                  transform:
                    "translate(" +
                    avatarTransform.cropX +
                    "px, " +
                    avatarTransform.cropY +
                    "px) scale(" +
                    avatarTransform.zoom +
                    ")",
                }}
              />
            ) : (
              <span className="flex flex-col items-center gap-2 text-sm text-foreground-muted">
                <Upload className="size-5" aria-hidden="true" />
                Selecionar foto
              </span>
            )}
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="sr-only"
              onChange={(event) => {
                const file = event.target.files?.[0] ?? null;
                setProfileAssets((current) => ({ ...current, avatarFile: file }));
              }}
            />
          </label>

          <label className="mt-4 block text-xs font-medium text-foreground-muted">
            Zoom da foto
            <input
              type="range"
              min="1"
              max="3"
              step="0.05"
              value={avatarTransform.zoom}
              onChange={(event) => {
                form.setValue(
                  "avatarTransform",
                  {
                    ...avatarTransform,
                    zoom: Number(event.target.value),
                  },
                  { shouldDirty: true },
                );
              }}
              className="mt-2 w-full"
            />
          </label>
        </div>

        <div className="rounded-2xl border border-border bg-surface/90 p-5 shadow-irisSm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-foreground">Capa</p>
              <p className="mt-1 text-xs leading-5 text-foreground-muted">
                Imagem horizontal para presença visual.
              </p>
            </div>
            <ImagePlus className="size-5 text-emotion" aria-hidden="true" />
          </div>

          <label className="mt-4 flex min-h-44 cursor-pointer items-center justify-center overflow-hidden rounded-2xl border border-dashed border-border bg-background text-center transition hover:border-accent">
            {coverPreview ? (
              <img
                src={coverPreview}
                alt="Prévia da capa"
                className="h-36 w-full rounded-xl object-cover"
                style={{
                  transform:
                    "translate(" +
                    coverTransform.cropX +
                    "px, " +
                    coverTransform.cropY +
                    "px) scale(" +
                    coverTransform.zoom +
                    ")",
                }}
              />
            ) : (
              <span className="flex flex-col items-center gap-2 text-sm text-foreground-muted">
                <Upload className="size-5" aria-hidden="true" />
                Selecionar capa
              </span>
            )}
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="sr-only"
              onChange={(event) => {
                const file = event.target.files?.[0] ?? null;
                setProfileAssets((current) => ({ ...current, coverFile: file }));
              }}
            />
          </label>

          <label className="mt-4 block text-xs font-medium text-foreground-muted">
            Zoom da capa
            <input
              type="range"
              min="1"
              max="3"
              step="0.05"
              value={coverTransform.zoom}
              onChange={(event) => {
                form.setValue(
                  "coverTransform",
                  {
                    ...coverTransform,
                    zoom: Number(event.target.value),
                  },
                  { shouldDirty: true },
                );
              }}
              className="mt-2 w-full"
            />
          </label>
        </div>
      </div>
    </section>
  );
}
