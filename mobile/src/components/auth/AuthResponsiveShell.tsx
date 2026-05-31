import type { ReactNode } from "react";
import { ScrollView, useWindowDimensions, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type AuthResponsiveShellProps = {
  children: (layout: {
    width: number;
    height: number;
    isTablet: boolean;
    isLargeTablet: boolean;
    isShortScreen: boolean;
    pageMaxWidth: number;
  }) => ReactNode;
};

export function AuthResponsiveShell({ children }: AuthResponsiveShellProps) {
  const { width, height } = useWindowDimensions();

  const isTablet = width >= 768;
  const isLargeTablet = width >= 1040;
  const isShortScreen = height < 720;
  const pageMaxWidth = isLargeTablet ? 1180 : isTablet ? 960 : 540;

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: isTablet ? 48 : width < 380 ? 20 : 26,
          paddingTop: isTablet ? 34 : isShortScreen ? 18 : 28,
          paddingBottom: isTablet ? 38 : 28,
          alignItems: "center"
        }}
      >
        <View
          className="w-full flex-1 justify-center"
          style={{ maxWidth: pageMaxWidth }}
        >
          {children({
            width,
            height,
            isTablet,
            isLargeTablet,
            isShortScreen,
            pageMaxWidth
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
