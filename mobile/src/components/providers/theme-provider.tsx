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