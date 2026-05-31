// web/src/components/ui/select.tsx
import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export type SelectOption = {
  value: string;
  label: string;
};

export type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  error?: string;
  helperText?: string;
  options: SelectOption[];
  placeholder?: string;
};

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, helperText, options, placeholder, id, ...props }, ref) => {
    const selectId = id ?? props.name;

    return (
      <div className="w-full">
        {label ? (
          <label htmlFor={selectId} className="mb-2 block text-sm font-medium text-foreground">
            {label}
          </label>
        ) : null}

        <select
          ref={ref}
          id={selectId}
          className={cn(
            "h-12 w-full rounded-xl border border-border bg-surface px-4 text-sm text-foreground shadow-irisSm",
            "transition-[border-color,box-shadow,background] duration-150",
            "focus:border-accent focus:outline-none focus:ring-2 focus:ring-focus/20",
            "disabled:cursor-not-allowed disabled:opacity-60",
            error && "border-danger focus:border-danger focus:ring-danger/20",
            className,
          )}
          {...props}
        >
          {placeholder ? <option value="">{placeholder}</option> : null}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {error ? (
          <p className="mt-2 text-xs leading-5 text-danger">{error}</p>
        ) : helperText ? (
          <p className="mt-2 text-xs leading-5 text-foreground-muted">{helperText}</p>
        ) : null}
      </div>
    );
  },
);

Select.displayName = "Select";
