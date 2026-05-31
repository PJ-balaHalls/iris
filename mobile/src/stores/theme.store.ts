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