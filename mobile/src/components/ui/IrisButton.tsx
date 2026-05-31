// mobile/src/components/ui/IrisButton.tsx
import { ActivityIndicator, Pressable, Text, type PressableProps } from "react-native";

import { cn } from "@/utils/cn";

type IrisButtonVariant = "primary" | "secondary" | "ghost";

type IrisButtonProps = PressableProps & {
  label: string;
  variant?: IrisButtonVariant;
  loading?: boolean;
  fullWidth?: boolean;
};

const variantClasses: Record<IrisButtonVariant, string> = {
  primary: "bg-foreground border-foreground",
  secondary: "bg-surface border-border",
  ghost: "bg-transparent border-transparent"
};

const textClasses: Record<IrisButtonVariant, string> = {
  primary: "text-white",
  secondary: "text-foreground",
  ghost: "text-foreground-muted"
};

export function IrisButton({
  label,
  variant = "primary",
  loading = false,
  disabled,
  fullWidth = true,
  className,
  ...props
}: IrisButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={isDisabled}
      className={cn(
        "min-h-[56px] items-center justify-center rounded-xl border px-5",
        variantClasses[variant],
        fullWidth ? "w-full" : "self-start",
        isDisabled && "opacity-45",
        className
      )}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={variant === "primary" ? "#FFFFFF" : "#111111"} />
      ) : (
        <Text
          className={cn(
            "text-center text-[15px] font-semibold tracking-[-0.2px]",
            textClasses[variant]
          )}
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
}
