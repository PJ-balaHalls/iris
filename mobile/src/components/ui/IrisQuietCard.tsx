// mobile/src/components/ui/IrisQuietCard.tsx
import { View, type ViewProps } from "react-native";

import { cn } from "@/utils/cn";

export function IrisQuietCard({ children, className, ...props }: ViewProps) {
  return (
    <View
      className={cn(
        "rounded-3xl border border-border bg-surface px-5 py-5",
        className
      )}
      {...props}
    >
      {children}
    </View>
  );
}
