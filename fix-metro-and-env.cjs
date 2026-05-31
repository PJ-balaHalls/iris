const fs = require('fs');
const path = require('path');

const mobileAppDir = path.join(__dirname, 'mobile', 'app');
const libDir = path.join(__dirname, 'mobile', 'src', 'lib');

// 1. Apagar ficheiros fantasmas da arquitetura antiga que estão a confundir o Metro
const filesToDelete = [
  path.join(mobileAppDir, '(tabs)', 'home.tsx'), // A Home foi substituída pelo iLIFE
];

filesToDelete.forEach(file => {
  if (fs.existsSync(file)) {
    fs.unlinkSync(file);
    console.log(`🗑️ Ficheiro fantasma removido: ${path.basename(file)}`);
  }
});

const filesToCreate = {
  // ==========================================
  // 1. SUPABASE CLIENT (Com proteção Anti-Crash)
  // ==========================================
  [path.join(libDir, 'supabase.ts')]: `
import 'react-native-url-polyfill/auto';
import * as SecureStore from 'expo-secure-store';
import { createClient } from '@supabase/supabase-js';

const ExpoSecureStoreAdapter = {
  getItem: (key: string) => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
};

// Se não encontrar o .env, usa placeholders provisórios apenas para não "crachar" a UI
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
`,

  // ==========================================
  // 2. ROOT LAYOUT (Injetando o Tema Global)
  // ==========================================
  [path.join(mobileAppDir, '_layout.tsx')]: `
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
`,

  // ==========================================
  // 3. INDEX (Redirecionamento para o Entry)
  // ==========================================
  [path.join(mobileAppDir, 'index.tsx')]: `
import React from 'react';
import { Redirect } from 'expo-router';

export default function Index() {
  // O utilizador entra no app e é imediatamente redirecionado para as 3 portas do FLORA
  return <Redirect href="/(public)/entry" />;
}
`
};

Object.entries(filesToCreate).forEach(([filePath, content]) => {
  fs.writeFileSync(filePath, content.trim());
  console.log(`✅ Ficheiro corrigido: ${filePath.split('mobile')[1] || filePath}`);
});

console.log('\n🚀 Correções aplicadas com sucesso!');