// mobile/src/components/ui/IrisScreen.tsx
import { ScrollView, View, type ViewProps } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { cn } from "@/utils/cn";

type IrisScreenProps = ViewProps & {
  scroll?: boolean;
};

export function IrisScreen({
  children,
  scroll = true,
  className,
  ...props
}: IrisScreenProps) {
  if (!scroll) {
    return (
      <SafeAreaView className="flex-1 bg-background" {...props}>
        <View className={cn("flex-1 px-7 pb-8 pt-5", className)}>{children}</View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background" {...props}>
      <ScrollView
        className="flex-1"
        contentContainerClassName={cn("grow px-7 pb-8 pt-5", className)}
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}
