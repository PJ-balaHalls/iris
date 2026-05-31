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