import React from 'react';
import { Tabs } from 'expo-router';
import { useThemeStore } from '../../src/stores/theme.store';

export default function TabsLayout() {
  const activeTheme = useThemeStore((state) => state.activeTheme);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: activeTheme.tokens.surface,
          borderTopColor: activeTheme.tokens.border,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarActiveTintColor: activeTheme.tokens.primary,
        tabBarInactiveTintColor: activeTheme.tokens.textSecondary,
      }}
    >
      <Tabs.Screen 
        name="ilife" 
        options={{ 
          title: 'iLIFE',
          // O verde original é sobreposto se o tema mudar o primary token
          tabBarActiveTintColor: activeTheme.themeId === 'flora-default' ? '#4CAF50' : activeTheme.tokens.primary 
        }} 
      />
      <Tabs.Screen 
        name="uslife" 
        options={{ 
          title: 'usLIFE',
          tabBarActiveTintColor: activeTheme.themeId === 'flora-default' ? '#9C27B0' : activeTheme.tokens.emotion 
        }} 
      />
      <Tabs.Screen name="invites" options={{ title: 'Convites' }} />
      <Tabs.Screen name="profile" options={{ title: 'Perfil' }} />
    </Tabs>
  );
}