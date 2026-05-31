// mobile/app/(tabs)/_layout.tsx
import { Stack } from "expo-router";

export default function TabsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "fade",
        contentStyle: {
          backgroundColor: "#FAF7F2"
        }
      }}
    />
  );
}
