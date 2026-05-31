import { Text, View, type DimensionValue } from "react-native";

type OnboardingProgressProps = {
  current: number;
  total: number;
};

export function OnboardingProgress({
  current,
  total
}: OnboardingProgressProps) {
  const percent = Math.max(8, (current / total) * 100);
  const progressWidth = `${percent}%` as DimensionValue;

  return (
    <View>
      <View className="flex-row items-center justify-between">
        <Text className="text-detail font-semibold text-foreground-muted">
          etapa {current}/{total}
        </Text>

        <Text className="text-detail text-foreground-muted">
          conta oficial
        </Text>
      </View>

      <View className="mt-3 h-[3px] overflow-hidden rounded-full bg-border">
        <View
          className="h-full rounded-full bg-foreground"
          style={{ width: progressWidth }}
        />
      </View>
    </View>
  );
}
