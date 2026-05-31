// web/src/components/ui/input.tsx
import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
  helperText?: string;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, id, ...props }, ref) => {
    const inputId = id ?? props.name;

    return (
      <div className="w-full">
        {label ? (
          <label
            htmlFor={inputId}
            className="mb-2 block text-sm font-medium text-foreground"
          >
            {label}
          </label>
        ) : null}

        <input
          ref={ref}
          id={inputId}
          className={cn(
            "h-12 w-full rounded-xl border border-border bg-surface px-4 text-sm text-foreground shadow-irisSm",
            "placeholder:text-foreground-muted",
            "transition-[border-color,box-shadow,background] duration-150",
            "focus:border-accent focus:outline-none focus:ring-2 focus:ring-focus/20",
            "disabled:cursor-not-allowed disabled:opacity-60",
            error && "border-danger focus:border-danger focus:ring-danger/20",
            className,
          )}
          {...props}
        />

        {error ? (
          <p className="mt-2 text-xs leading-5 text-danger">{error}</p>
        ) : helperText ? (
          <p className="mt-2 text-xs leading-5 text-foreground-muted">
            {helperText}
          </p>
        ) : null}
      </div>
    );
  },
);

Input.displayName = "Input";
