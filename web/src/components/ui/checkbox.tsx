// web/src/components/ui/checkbox.tsx
import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export type CheckboxProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
};

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, id, ...props }, ref) => {
    const checkboxId = id ?? props.name;

    return (
      <label
        htmlFor={checkboxId}
        className="flex cursor-pointer items-center gap-3 text-sm text-foreground-secondary"
      >
        <input
          ref={ref}
          id={checkboxId}
          type="checkbox"
          className={cn(
            "size-4 rounded border-border bg-surface accent-[var(--color-accent)]",
            "focus:outline-none focus:ring-2 focus:ring-focus/20",
            className,
          )}
          {...props}
        />

        <span>{label}</span>
      </label>
    );
  },
);

Checkbox.displayName = "Checkbox";
