// 1. ESTA LINHA É OBRIGATÓRIA PARA O TAILWIND FUNCIONAR!
import '../global.css'; 

import React from 'react';
import { Stack } from 'expo-router';
import { ThemeProvider } from '../src/components/providers/theme-provider';

export default function RootLayout() {
  return (
    <ThemeProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </ThemeProvider>
  );
}