import { Text, View } from "react-native";

type OnboardingStepHeaderProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export function OnboardingStepHeader({
  eyebrow,
  title,
  description
}: OnboardingStepHeaderProps) {
  return (
    <View>
      <Text className="text-detail font-semibold uppercase tracking-[1.8px] text-foreground-muted">
        {eyebrow}
      </Text>

      <Text className="mt-5 text-[34px] leading-[39px] tracking-[-1.3px] text-foreground">
        {title}
      </Text>

      <Text className="mt-4 text-body leading-7 text-foreground-muted">
        {description}
      </Text>
    </View>
  );
}
