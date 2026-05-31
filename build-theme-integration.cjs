const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'mobile', 'src');
const servicesDir = path.join(srcDir, 'services');
const storesDir = path.join(srcDir, 'stores');
const tabsDir = path.join(__dirname, 'mobile', 'app', '(tabs)');

// Garante que as pastas existem
[servicesDir, storesDir, tabsDir].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

const filesToCreate = {
  // ==========================================
  // 1. SERVIÇO DE TEMAS (Busca no Supabase)
  // ==========================================
  [path.join(servicesDir, 'theme.service.ts')]: `
import { supabase } from '../lib/supabase';
import { FloraTheme } from '../types/theme.types';

export const ThemeService = {
  // Busca o tema e os tokens da versão ativa diretamente do banco
  async getThemeById(themeId: string): Promise<FloraTheme | null> {
    try {
      const { data, error } = await supabase
        .from('flora_themes')
        .select(\`
          id,
          name,
          supported_scopes,
          versions:flora_theme_versions (
            token_payload_json
          )
        \`)
        .eq('id', themeId)
        .single();

      if (error || !data) throw error;

      // Monta o objeto formatado para o nosso App
      const tokens = data.versions && data.versions.length > 0 
        ? data.versions[0].token_payload_json 
        : null;

      if (!tokens) throw new Error('Tema sem tokens válidos.');

      return {
        themeId: data.id,
        name: data.name,
        scope: data.supported_scopes,
        version: '1.0.0', // Versão da API
        tokens: tokens,
      };
    } catch (err) {
      console.error('Erro ao buscar tema do Supabase:', err);
      return null;
    }
  }
};
`,

  // ==========================================
  // 2. STORE DO TEMA (Atualizada com Async Fetch)
  // ==========================================
  [path.join(storesDir, 'theme.store.ts')]: `
import { create } from 'zustand';
import { FloraTheme } from '../types/theme.types';
import { ThemeService } from '../services/theme.service';

export const DEFAULT_FLORA_THEME: FloraTheme = {
  themeId: 'flora-default',
  name: 'FLORA Padrão',
  scope: ['ilife', 'uslife', 'memory', 'space'],
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
  isLoadingTheme: boolean;
  applyTheme: (themeJson: FloraTheme) => boolean;
  fetchAndApplyTheme: (themeId: string) => Promise<void>;
  resetTheme: () => void;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  activeTheme: DEFAULT_FLORA_THEME,
  isLoadingTheme: false,
  
  applyTheme: (themeJson) => {
    if (!themeJson || !themeJson.tokens || !themeJson.tokens.background) {
      console.warn("Tema inválido rejeitado pelo motor FLORA.");
      return false;
    }
    set({ activeTheme: themeJson });
    return true;
  },

  fetchAndApplyTheme: async (themeId: string) => {
    set({ isLoadingTheme: true });
    const themeData = await ThemeService.getThemeById(themeId);
    
    if (themeData) {
      get().applyTheme(themeData);
    } else {
      console.warn("Falha ao baixar tema, mantendo o atual.");
    }
    set({ isLoadingTheme: false });
  },

  resetTheme: () => set({ activeTheme: DEFAULT_FLORA_THEME }),
}));
`,

  // ==========================================
  // 3. TELA usLIFE (Consumindo Tema e Componentes FLORA)
  // ==========================================
  [path.join(tabsDir, 'uslife.tsx')]: `
import React from 'react';
import { View, ScrollView } from 'react-native';
import { FloraText } from '../../src/components/ui/FloraText';
import { FloraButton } from '../../src/components/ui/FloraButton';
import { useFloraTheme } from '../../src/components/providers/theme-provider';

export default function UsLifeScreen() {
  const { activeTheme } = useFloraTheme() as any;

  return (
    <ScrollView 
      style={{ flex: 1, backgroundColor: activeTheme?.tokens?.background }}
      contentContainerStyle={{ padding: 32, paddingTop: 80, paddingBottom: 100 }}
    >
      <View className="mb-10 items-center">
        {/* Simulação de Avatar de Casal/Grupo */}
        <View className="flex-row mb-6">
          <View className="w-16 h-16 rounded-full bg-flora-gray/20 border-2 border-flora-white z-10" />
          <View className="w-16 h-16 rounded-full bg-uslife-soft border-2 border-flora-white -ml-4 items-center justify-center">
            <FloraText variant="h3" style={{ color: activeTheme?.tokens?.emotion }}>?</FloraText>
          </View>
        </View>

        <FloraText variant="h2" className="text-center mb-2">Nosso Espaço</FloraText>
        <FloraText variant="caption" className="text-center text-flora-gray">
          Vínculo criado hoje • Tema: {activeTheme?.name}
        </FloraText>
      </View>

      {/* Cartão de Memória (usando a cor Emocional do tema - Lilás por padrão) */}
      <View 
        style={{ 
          backgroundColor: activeTheme?.tokens?.surface, 
          borderColor: activeTheme?.tokens?.border,
          borderWidth: 1,
          borderRadius: activeTheme?.tokens?.cardStyle === 'soft' ? 24 : 8,
          padding: 24,
          marginBottom: 24
        }}
      >
        <View className="flex-row items-center mb-4">
          <View 
            style={{ backgroundColor: activeTheme?.tokens?.emotion }} 
            className="w-3 h-3 rounded-full mr-3" 
          />
          <FloraText variant="caption">Primeira Memória</FloraText>
        </View>
        
        <FloraText variant="h3" className="mb-3">O dia em que tudo começou</FloraText>
        <FloraText variant="body" className="text-flora-gray mb-6 leading-relaxed">
          Escolhemos esta memória porque ela representa o início do nosso espaço compartilhado.
        </FloraText>

        <FloraButton 
          label="Adicionar Nova Memória" 
          variant="secondary"
        />
      </View>
    </ScrollView>
  );
}
`
};

Object.entries(filesToCreate).forEach(([filePath, content]) => {
  fs.writeFileSync(filePath, content.trim());
  console.log(`✅ Arquivo criado/atualizado: ${filePath.split('mobile')[1] || filePath}`);
});

console.log('\\n🚀 Serviço de Temas (Backend) e tela usLIFE integrados com sucesso!');