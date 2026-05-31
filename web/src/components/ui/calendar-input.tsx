// web/src/components/ui/calendar-input.tsx
import { CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";

type CalendarInputProps = {
  label: string;
  value?: string;
  onChange: (value: string) => void;
  helperText?: string;
  error?: string;
  max?: string;
  min?: string;
};

export function CalendarInput({
  label,
  value,
  onChange,
  helperText,
  error,
  max,
  min,
}: CalendarInputProps) {
  return (
    <div className="w-full">
      <label className="mb-2 block text-sm font-medium text-foreground">{label}</label>

      <div className="relative">
        <CalendarDays
          className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-foreground-muted"
          aria-hidden="true"
        />

        <input
          type="date"
          value={value ?? ""}
          min={min}
          max={max}
          onChange={(event) => onChange(event.target.value)}
          className={cn(
            "h-12 w-full rounded-xl border border-border bg-surface px-4 pl-11 text-sm text-foreground shadow-irisSm",
            "transition-[border-color,box-shadow,background] duration-150",
            "focus:border-accent focus:outline-none focus:ring-2 focus:ring-focus/20",
            error && "border-danger focus:border-danger focus:ring-danger/20",
          )}
        />
      </div>

      {error ? (
        <p className="mt-2 text-xs leading-5 text-danger">{error}</p>
      ) : helperText ? (
        <p className="mt-2 text-xs leading-5 text-foreground-muted">{helperText}</p>
      ) : null}
    </div>
  );
}
