import { View, type ViewProps } from "react-native";

import { cn } from "@/utils/cn";

type AuthTranslucentPanelProps = ViewProps & {
  intense?: boolean;
};

export function AuthTranslucentPanel({
  children,
  className,
  intense = false,
  ...props
}: AuthTranslucentPanelProps) {
  return (
    <View
      className={cn(
        "rounded-[34px] border px-5 py-5",
        intense
          ? "border-foreground/10 bg-[#F5F0E8]/85"
          : "border-border/80 bg-[#FAF7F2]/55",
        className
      )}
      {...props}
    >
      {children}
    </View>
  );
}
