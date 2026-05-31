// web/src/components/ui/option-list.tsx
import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type OptionListItem = {
  value: string;
  label: string;
  description?: string;
  eyebrow?: string;
};

type OptionListProps = {
  label?: string;
  description?: string;
  items: OptionListItem[];
  value: string | string[] | undefined;
  onChange: (value: string | string[]) => void;
  multiple?: boolean;
  columns?: 1 | 2 | 3 | 4;
};

export function OptionList({
  label,
  description,
  items,
  value,
  onChange,
  multiple = false,
  columns = 2,
}: OptionListProps) {
  function isSelected(itemValue: string) {
    return Array.isArray(value) ? value.includes(itemValue) : value === itemValue;
  }

  function handleSelect(itemValue: string) {
    if (!multiple) {
      onChange(itemValue);
      return;
    }

    const current = Array.isArray(value) ? value : [];
    const next = current.includes(itemValue)
      ? current.filter((entry) => entry !== itemValue)
      : [...current, itemValue];

    onChange(next);
  }

  return (
    <div className="space-y-3">
      {label || description ? (
        <div>
          {label ? <p className="text-sm font-medium text-foreground">{label}</p> : null}
          {description ? (
            <p className="mt-1 text-sm leading-6 text-foreground-secondary">{description}</p>
          ) : null}
        </div>
      ) : null}

      <div
        className={cn(
          "grid gap-3",
          columns === 1 && "grid-cols-1",
          columns === 2 && "md:grid-cols-2",
          columns === 3 && "md:grid-cols-3",
          columns === 4 && "md:grid-cols-2 xl:grid-cols-4",
        )}
      >
        {items.map((item) => {
          const selected = isSelected(item.value);

          return (
            <button
              key={item.value}
              type="button"
              onClick={() => handleSelect(item.value)}
              className={cn(
                "group min-h-[7.2rem] rounded-2xl border p-4 text-left shadow-irisSm",
                "transition-[border-color,background,box-shadow,transform] duration-300 ease-iris",
                "hover:-translate-y-0.5 hover:border-accent hover:shadow-irisMd",
                selected
                  ? "border-accent bg-accent/10"
                  : "border-border bg-surface/90",
              )}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  {item.eyebrow ? (
                    <p className="mb-2 font-mono text-[0.65rem] uppercase tracking-[0.18em] text-foreground-muted">
                      {item.eyebrow}
                    </p>
                  ) : null}

                  <p className="font-serif text-xl leading-tight tracking-[-0.03em] text-foreground">
                    {item.label}
                  </p>
                </div>

                <span
                  className={cn(
                    "mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border transition",
                    selected
                      ? "border-accent bg-accent text-white"
                      : "border-border bg-background text-transparent group-hover:text-accent",
                  )}
                >
                  <CheckCircle2 className="size-4" aria-hidden="true" />
                </span>
              </div>

              {item.description ? (
                <p className="mt-3 text-sm leading-6 text-foreground-secondary">
                  {item.description}
                </p>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
