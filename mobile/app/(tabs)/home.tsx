import { router } from "expo-router";
import {
  ArrowRight,
  ExternalLink,
  Globe2,
  Heart,
  LockKeyhole,
  LogOut,
  Sparkles
} from "lucide-react-native";
import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  Animated,
  Easing,
  Linking,
  Pressable,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
  type ViewProps
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { IrisButton } from "@/components/ui/IrisButton";
import {
  signOutPrivateSession
} from "@/services/private-login.service";
import {
  clearPrivateKeepConnectedPreference,
  getPrivateKeepConnectedPreference
} from "@/services/private-session-preferences.service";
import { usePrivateAccessStore } from "@/stores/private-access.store";
import { cn } from "@/utils/cn";

type FadeInViewProps = ViewProps & {
  delay?: number;
  distance?: number;
};

const IRIS_SITE_URL = "https://iris-social.vercel.app";

function FadeInView({
  children,
  delay = 0,
  distance = 14,
  style,
  ...props
}: FadeInViewProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(distance)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 440,
        delay,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 440,
        delay,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true
      })
    ]).start();
  }, [delay, distance, opacity, translateY]);

  return (
    <Animated.View
      {...props}
      style={[
        style,
        {
          opacity,
          transform: [{ translateY }]
        }
      ]}
    >
      {children}
    </Animated.View>
  );
}

function HubActionCard({
  title,
  description,
  icon,
  variant = "light",
  onPress
}: {
  title: string;
  description: string;
  icon: ReactNode;
  variant?: "dark" | "light" | "muted";
  onPress: () => void;
}) {
  const isDark = variant === "dark";

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      className={cn(
        "overflow-hidden rounded-[32px] border active:opacity-90",
        isDark && "border-foreground bg-foreground",
        variant === "light" && "border-border/80 bg-[#FAF7F2]/55",
        variant === "muted" && "border-border/80 bg-[#EEE8DF]/75"
      )}
    >
      <View className="px-5 py-5">
        <View className="flex-row items-start justify-between gap-4">
          <View
            className={cn(
              "h-12 w-12 items-center justify-center rounded-full",
              isDark ? "bg-white/10" : "bg-background/70"
            )}
          >
            {icon}
          </View>

          <View
            className={cn(
              "h-10 w-10 items-center justify-center rounded-full",
              isDark ? "bg-white" : "bg-foreground"
            )}
          >
            <ArrowRight size={18} color={isDark ? "#111111" : "#FFFFFF"} />
          </View>
        </View>

        <Text
          className={cn(
            "mt-8 text-[25px] leading-[30px] tracking-[-0.8px]",
            isDark ? "text-white" : "text-foreground"
          )}
        >
          {title}
        </Text>

        <Text
          className={cn(
            "mt-3 text-caption leading-6",
            isDark ? "text-white/68" : "text-foreground-muted"
          )}
        >
          {description}
        </Text>
      </View>
    </Pressable>
  );
}

export default function HomeScreen() {
  const { width, height } = useWindowDimensions();

  const activeAccess = usePrivateAccessStore((state) => state.activeAccess);
  const keepConnected = usePrivateAccessStore((state) => state.keepConnected);
  const setKeepConnected = usePrivateAccessStore((state) => state.setKeepConnected);
  const clearActiveAccess = usePrivateAccessStore((state) => state.clearActiveAccess);

  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const isTablet = width >= 768;
  const isLargeTablet = width >= 1024;
  const isShortScreen = height < 720;

  useEffect(() => {
    async function syncPreference() {
      const value = await getPrivateKeepConnectedPreference();
      setKeepConnected(value);
    }

    void syncPreference();
  }, [setKeepConnected]);

  const name =
    activeAccess?.nickname ??
    activeAccess?.full_name ??
    activeAccess?.name ??
    "Isa";

  async function handleExit() {
    await clearPrivateKeepConnectedPreference();
    setKeepConnected(false);
    clearActiveAccess();
    await signOutPrivateSession();
    router.replace("/entry");
  }

  async function handleOpenSite() {
    try {
      const supported = await Linking.canOpenURL(IRIS_SITE_URL);

      if (!supported) {
        setActionMessage("Não consegui abrir o site neste aparelho.");
        return;
      }

      await Linking.openURL(IRIS_SITE_URL);
    } catch {
      setActionMessage("Não consegui abrir o site agora.");
    }
  }

  function handleEnterApp() {
    setActionMessage(
      "O app principal será conectado aqui na próxima etapa. Este hub confirma que a entrada privada e a conta oficial funcionaram."
    );
  }

  const pageMaxWidth = isLargeTablet ? 1060 : isTablet ? 920 : 520;

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: isTablet ? 44 : 26,
          paddingTop: isTablet ? 34 : isShortScreen ? 18 : 28,
          paddingBottom: isTablet ? 36 : 28,
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        <View
          className={cn(
            "w-full",
            isTablet ? "flex-row items-center justify-between gap-10" : "gap-8"
          )}
          style={{ maxWidth: pageMaxWidth }}
        >
          <View className={isTablet ? "flex-1" : undefined}>
            <FadeInView delay={0} distance={12}>
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-3">
                  <View className="h-11 w-11 items-center justify-center rounded-full bg-foreground">
                    <Sparkles size={17} color="#FFFFFF" />
                  </View>

                  <View>
                    <Text className="text-detail font-semibold uppercase tracking-[2px] text-foreground-muted">
                      IRIS private
                    </Text>
                    <Text className="mt-0.5 text-caption text-foreground-muted">
                      acesso confirmado
                    </Text>
                  </View>
                </View>

                <View className="rounded-full border border-border/80 bg-[#FAF7F2]/55 px-3 py-1.5">
                  <Text className="text-detail font-semibold text-foreground-muted">
                    hub
                  </Text>
                </View>
              </View>
            </FadeInView>

            <FadeInView delay={90} distance={18}>
              <Text
                className={cn(
                  "mt-12 text-foreground",
                  isTablet
                    ? "max-w-[430px] text-[54px] leading-[59px] tracking-[-2.4px]"
                    : "text-[42px] leading-[47px] tracking-[-1.9px]"
                )}
              >
                Bem-vinda,{"\n"}
                {name}.
              </Text>
            </FadeInView>

            <FadeInView delay={170} distance={16}>
              <Text
                className={cn(
                  "mt-6 max-w-[390px] text-foreground-muted",
                  isTablet ? "text-[18px] leading-8" : "text-body leading-7"
                )}
              >
                Esta ainda não é a tela principal. É uma pequena sala de entrada
                para escolher o próximo caminho.
              </Text>
            </FadeInView>

            <FadeInView delay={250} distance={16}>
              <View className="mt-10 rounded-[30px] border border-border/80 bg-[#FAF7F2]/55 px-5 py-5">
                <Text className="text-caption font-semibold text-foreground">
                  Porta privada aberta
                </Text>

                <Text className="mt-2 text-detail leading-5 text-foreground-muted">
                  {keepConnected
                    ? "Este aparelho pode entrar direto enquanto a preferência estiver ativa."
                    : "Na próxima abertura, a IRIS pedirá o quiz novamente."}
                </Text>
              </View>
            </FadeInView>
          </View>

          <FadeInView
            delay={isTablet ? 170 : 280}
            distance={18}
            style={isTablet ? { flex: 1 } : undefined}
          >
            <View className="w-full gap-4">
              <HubActionCard
                title="Entrar no App"
                description="Acessar o ambiente principal quando os módulos forem conectados."
                variant="dark"
                icon={<Heart size={21} color="#FFFFFF" />}
                onPress={handleEnterApp}
              />

              <View className={isTablet ? "flex-row gap-4" : "gap-4"}>
                <View className="flex-1">
                  <HubActionCard
                    title="Ir para o site"
                    description="Abrir a presença web da IRIS fora do aplicativo."
                    variant="light"
                    icon={<Globe2 size={21} color="#111111" />}
                    onPress={handleOpenSite}
                  />
                </View>

                <View className="flex-1">
                  <HubActionCard
                    title="Voltar ao login"
                    description="Encerrar este acesso e pedir o quiz novamente."
                    variant="muted"
                    icon={<LockKeyhole size={21} color="#111111" />}
                    onPress={handleExit}
                  />
                </View>
              </View>

              {actionMessage ? (
                <FadeInView delay={0} distance={10}>
                  <View className="rounded-[26px] border border-border/80 bg-[#FAF7F2]/55 px-5 py-4">
                    <Text className="text-caption leading-6 text-foreground-muted">
                      {actionMessage}
                    </Text>
                  </View>
                </FadeInView>
              ) : null}

              <View className="mt-2 border-t border-border/80 pt-5">
                <IrisButton
                  label="Sair deste acesso"
                  variant="secondary"
                  onPress={handleExit}
                />

                <View className="mt-4 flex-row items-center justify-center gap-2">
                  <LogOut size={14} color="#666666" />
                  <Text className="text-detail text-foreground-muted">
                    Sair desativa “manter conectado”.
                  </Text>
                </View>
              </View>

              <View className="mt-1 flex-row items-center justify-center gap-2">
                <ExternalLink size={13} color="#666666" />
                <Text className="text-detail text-foreground-muted">
                  hub de entrada • app em construção
                </Text>
              </View>
            </View>
          </FadeInView>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
