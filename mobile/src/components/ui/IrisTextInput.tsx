import { Text, TextInput, View, type TextInputProps } from "react-native";

import { cn } from "@/utils/cn";

type IrisTextInputProps = TextInputProps & {
  label: string;
  error?: string | null;
};

export function IrisTextInput({
  label,
  error,
  className,
  ...props
}: IrisTextInputProps) {
  return (
    <View>
      <Text className="mb-2 text-detail font-semibold uppercase tracking-[1.4px] text-foreground-muted">
        {label}
      </Text>

      <TextInput
        placeholderTextColor="#8A8177"
        className={cn(
          "min-h-[54px] rounded-2xl border border-border/80 bg-[#FAF7F2]/60 px-4 text-[16px] text-foreground",
          error && "border-danger",
          className
        )}
        {...props}
      />

      {error ? (
        <Text className="mt-2 text-detail leading-4 text-danger">{error}</Text>
      ) : null}
    </View>
  );
}
