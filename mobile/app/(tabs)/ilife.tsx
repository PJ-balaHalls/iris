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