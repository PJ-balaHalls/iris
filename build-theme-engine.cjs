const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'mobile', 'src');
const typesDir = path.join(srcDir, 'types');
const storesDir = path.join(srcDir, 'stores');
const providersDir = path.join(srcDir, 'components', 'providers');
const tabsDir = path.join(__dirname, 'mobile', 'app', '(tabs)');

// Garante que as pastas existem
[typesDir, storesDir, providersDir, tabsDir].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

const filesToCreate = {
  // ==========================================
  // 1. TIPAGENS DO TEMA (JSON Validado)
  // ==========================================
  [path.join(typesDir, 'theme.types.ts')]: `
export interface ThemeTokens {
  background: string;
  surface: string;
  primary: string;
  emotion: string;
  textPrimary: string;
  textSecondary: string;
  border: string;
  cardStyle: 'soft' | 'hard' | 'glass';
  titleFont: string;
}

export interface FloraTheme {
  themeId: string;
  name: string;
  scope: ('ilife' | 'uslife' | 'memory' | 'space')[];
  version: string;
  tokens: ThemeTokens;
  assets?: {
    backgroundPattern?: string;
    coverFrame?: string;
    ornament?: string;
  };
}
`,

  // ==========================================
  // 2. ZUSTAND STORE (Gerenciador do Motor de Temas)
  // ==========================================
  [path.join(storesDir, 'theme.store.ts')]: `
import { create } from 'zustand';
import { FloraTheme } from '../types/theme.types';

// Tema Padrão do Sistema FLORA (Fallback de Segurança)
export const DEFAULT_FLORA_THEME: FloraTheme = {
  themeId: 'flora-default',
  name: 'FLORA Padrão',
  scope: ['ilife', 'uslife'],
  version: '1.0.0',
  tokens: {
    background: '#FAF9F6', // offwhite
    surface: '#FFFFFF',
    primary: '#121212',    // black
    emotion: '#9C27B0',    // lilás do usLIFE
    textPrimary: '#121212',
    textSecondary: '#8E8E93',
    border: '#E5E5E5',
    cardStyle: 'soft',
    titleFont: 'playfair',
  }
};

interface ThemeState {
  activeTheme: FloraTheme;
  applyTheme: (themeJson: FloraTheme) => boolean;
  resetTheme: () => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  activeTheme: DEFAULT_FLORA_THEME,
  
  applyTheme: (themeJson) => {
    // Aqui entra o "Theme Validator" (Validação de segurança)
    if (!themeJson || !themeJson.tokens || !themeJson.tokens.background) {
      console.warn("Tema inválido rejeitado pelo motor FLORA.");
      return false;
    }
    set({ activeTheme: themeJson });
    return true;
  },

  resetTheme: () => set({ activeTheme: DEFAULT_FLORA_THEME }),
}));
`,

  // ==========================================
  // 3. PROVIDER DE TEMA (Injeção no React)
  // ==========================================
  [path.join(providersDir, 'theme-provider.tsx')]: `
import React, { createContext, useContext } from 'react';
import { View } from 'react-native';
import { useThemeStore } from '../../stores/theme.store';

const ThemeContext = createContext({});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const activeTheme = useThemeStore((state) => state.activeTheme);

  return (
    <ThemeContext.Provider value={{ activeTheme }}>
      <View style={{ flex: 1, backgroundColor: activeTheme.tokens.background }}>
        {children}
      </View>
    </ThemeContext.Provider>
  );
}

export const useFloraTheme = () => useContext(ThemeContext);
`,

  // ==========================================
  // 4. LAYOUT DAS ABAS (Navegação com Tema Dinâmico)
  // ==========================================
  [path.join(tabsDir, '_layout.tsx')]: `
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
`,

  // ==========================================
  // 5. TELA iLIFE (Exemplo de Consumo do Tema)
  // ==========================================
  [path.join(tabsDir, 'ilife.tsx')]: `
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useThemeStore } from '../../src/stores/theme.store';

export default function ILifeScreen() {
  const theme = useThemeStore((state) => state.activeTheme);

  return (
    <View style={{ flex: 1, backgroundColor: theme.tokens.background, padding: 32, paddingTop: 80 }}>
      <Text style={{ color: theme.tokens.textPrimary, fontFamily: theme.tokens.titleFont, fontSize: 32, marginBottom: 8 }}>
        Meu iLIFE
      </Text>
      <Text style={{ color: theme.tokens.textSecondary, fontSize: 16, marginBottom: 32 }}>
        Tema ativo: {theme.name}
      </Text>

      {/* Exemplo de Card renderizado via tokens do tema */}
      <View 
        style={{ 
          backgroundColor: theme.tokens.surface, 
          borderColor: theme.tokens.border,
          borderWidth: 1,
          borderRadius: theme.tokens.cardStyle === 'soft' ? 24 : 8,
          padding: 24
        }}
      >
        <Text style={{ color: theme.tokens.textPrimary, fontSize: 18, fontWeight: '600', marginBottom: 12 }}>
          Diário de Hoje
        </Text>
        <TouchableOpacity 
          style={{ backgroundColor: theme.tokens.primary, padding: 16, borderRadius: 12, alignItems: 'center' }}
        >
          <Text style={{ color: '#FFF', fontWeight: 'bold' }}>Escrever</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
`
};

Object.entries(filesToCreate).forEach(([filePath, content]) => {
  fs.writeFileSync(filePath, content.trim());
  console.log(`✅ Motor de Temas injetado: ${filePath.split('mobile')[1] || filePath}`);
});

console.log('\n🚀 Motor FLORA (Theme Renderer & Validator) gerado com sucesso!');