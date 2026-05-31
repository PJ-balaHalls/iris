import { Sparkles } from "lucide-react-native";
import { Text, View } from "react-native";

import { AuthFadeInView } from "@/components/auth/AuthFadeInView";
import { cn } from "@/utils/cn";

type EntryHeroProps = {
  isTablet: boolean;
};

export function EntryHero({ isTablet }: EntryHeroProps) {
  return (
    <View className={cn("relative", isTablet ? "justify-center" : "")}>
      <View className="absolute -left-8 top-2 h-44 w-44 rounded-full bg-[#EEE8DF]/70" />
      <View className="absolute right-0 top-28 h-24 w-24 rounded-full bg-[#E6DED2]/70" />
      <View className="absolute -bottom-8 right-8 h-56 w-56 rounded-full bg-[#F4EFE8]/90" />

      <AuthFadeInView delay={0}>
        <View className="flex-row items-center gap-3">
          <View className="h-11 w-11 items-center justify-center rounded-full bg-foreground">
            <Sparkles size={17} color="#FFFFFF" />
          </View>

          <View>
            <Text className="text-detail font-semibold uppercase tracking-[2px] text-foreground-muted">
              IRIS private
            </Text>
            <Text className="mt-0.5 text-caption text-foreground-muted">
              entrada afetiva
            </Text>
          </View>
        </View>
      </AuthFadeInView>

      <AuthFadeInView delay={90} distance={18}>
        <Text
          className={cn(
            "mt-12 text-foreground",
            isTablet
              ? "max-w-[490px] text-[58px] leading-[63px] tracking-[-2.6px]"
              : "text-[43px] leading-[48px] tracking-[-2px]"
          )}
        >
          Uma porta feita para uma pessoa só.
        </Text>
      </AuthFadeInView>

      <AuthFadeInView delay={170} distance={16}>
        <Text
          className={cn(
            "mt-6 max-w-[410px] text-foreground-muted",
            isTablet ? "text-[18px] leading-8" : "text-body leading-7"
          )}
        >
          A IRIS começa perguntando se a memória reconhece quem está tentando
          entrar.
        </Text>
      </AuthFadeInView>

      <AuthFadeInView delay={250} distance={14}>
        <View className="mt-10 flex-row gap-3">
          <View className="flex-1 rounded-[28px] border border-border/80 bg-[#FAF7F2]/50 px-4 py-4">
            <Text className="text-detail uppercase tracking-[1.4px] text-foreground-muted">
              acesso
            </Text>
            <Text className="mt-3 text-[19px] leading-6 text-foreground">
              por memória
            </Text>
          </View>

          <View className="mt-8 flex-1 rounded-[28px] bg-[#EEE8DF]/70 px-4 py-4">
            <Text className="text-detail uppercase tracking-[1.4px] text-foreground-muted">
              espaço
            </Text>
            <Text className="mt-3 text-[19px] leading-6 text-foreground">
              só nosso
            </Text>
          </View>
        </View>
      </AuthFadeInView>
    </View>
  );
}
