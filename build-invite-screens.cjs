const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'mobile', 'src');
const storesDir = path.join(srcDir, 'stores');
const servicesDir = path.join(srcDir, 'services');
const inviteDir = path.join(__dirname, 'mobile', 'app', '(public)', 'invite');

// Garante que as pastas existem
[storesDir, servicesDir, inviteDir].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

const filesToCreate = {
  // ==========================================
  // 1. ZUSTAND STORE (Controle de Tentativas)
  // ==========================================
  [path.join(storesDir, 'invite.store.ts')]: `
import { create } from 'zustand';

interface InviteState {
  attemptsLeft: number;
  inviteId: string | null;
  decrementAttempt: () => void;
  setInvite: (id: string) => void;
  reset: () => void;
}

export const useInviteStore = create<InviteState>((set) => ({
  attemptsLeft: 2,
  inviteId: null,
  decrementAttempt: () => set((state) => ({ attemptsLeft: Math.max(0, state.attemptsLeft - 1) })),
  setInvite: (id) => set({ inviteId: id, attemptsLeft: 2 }),
  reset: () => set({ attemptsLeft: 2, inviteId: null }),
}));
`,

  // ==========================================
  // 2. SERVIÇO DE CONVITE (API Mockada)
  // ==========================================
  [path.join(servicesDir, 'invite.service.ts')]: `
// Este serviço conectará com a tabela uslife_invites no Supabase
export const InviteService = {
  async getMemoryKeys(slug: string) {
    // Simulação de busca no Supabase
    return {
      inviteId: '123-abc',
      creatorName: 'Lucas',
      relationshipType: 'couple',
      questions: [
        {
          id: 'q1',
          text: 'Qual foi nosso primeiro passeio?',
          options: ['Cinema', 'Praia', 'Parque', 'Restaurante'],
        }
      ]
    };
  },
  
  async validateKeys(inviteId: string, answers: Record<string, string>) {
    // Simulação de validação (backend)
    // Retorna true se as respostas baterem com a tabela uslife_invite_memory_keys
    return answers['q1'] === 'Praia'; 
  }
};
`,

  // ==========================================
  // 3. TELA DE RECPÇÃO DO LINK [slug].tsx
  // ==========================================
  [path.join(inviteDir, '[slug].tsx')]: `
import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useInviteStore } from '../../../src/stores/invite.store';

export default function InviteEntryScreen() {
  const { slug } = useLocalSearchParams();
  const router = useRouter();
  const setInvite = useInviteStore((state) => state.setInvite);

  useEffect(() => {
    // Aqui buscaríamos os dados iniciais do convite via slug
    if (slug) {
      setInvite(slug as string);
    }
  }, [slug]);

  return (
    <View className="flex-1 bg-flora-offwhite justify-center px-8">
      <View className="items-center mb-12">
        <View className="w-20 h-20 bg-uslife-soft rounded-full mb-8 items-center justify-center border border-uslife/20">
          <Text className="text-uslife text-2xl font-playfair">?</Text>
        </View>
        <Text className="font-playfair text-3xl text-flora-black mb-4 text-center">Você recebeu um convite para o IRÍS.</Text>
        <Text className="font-inter text-flora-gray text-base text-center leading-relaxed">
          Antes de entrar, vamos confirmar suas chaves de lembrança.
        </Text>
      </View>

      <View className="gap-y-4 w-full">
        <TouchableOpacity 
          onPress={() => router.push('/(public)/invite/memory-keys')}
          className="bg-flora-black py-4 rounded-2xl items-center"
        >
          <Text className="text-flora-white font-inter font-semibold text-base">Continuar</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={() => router.replace('/(public)/entry')}
          className="py-4 items-center"
        >
          <Text className="text-flora-gray font-inter font-medium text-base">Não reconheço este convite</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
`,

  // ==========================================
  // 4. TELA DE CHAVES DE MEMÓRIA (O QUIZ)
  // ==========================================
  [path.join(inviteDir, 'memory-keys.tsx')]: `
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useInviteStore } from '../../../src/stores/invite.store';
import { InviteService } from '../../../src/services/invite.service';

export default function MemoryKeysScreen() {
  const router = useRouter();
  const { attemptsLeft, decrementAttempt, inviteId } = useInviteStore();
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  // Exemplo estático baseado no MVP (idealmente vem do InviteService)
  const question = "Qual foi nosso primeiro passeio?";
  const options = ['Cinema', 'Praia', 'Parque', 'Restaurante'];

  const handleValidation = async () => {
    if (!selectedOption) return;

    // Simula a validação
    const isValid = await InviteService.validateKeys(inviteId || '', { q1: selectedOption });

    if (isValid) {
      router.push('/(public)/invite/create-account');
    } else {
      decrementAttempt();
      if (attemptsLeft - 1 <= 0) {
        Alert.alert("Bloqueado", "Este convite foi bloqueado por segurança. Peça um novo convite.");
        router.replace('/(public)/entry');
      } else {
        Alert.alert("Incorreto", \`As respostas não combinaram. Você ainda tem \${attemptsLeft - 1} tentativa(s).\`);
      }
    }
  };

  return (
    <View className="flex-1 bg-flora-offwhite px-8 pt-20">
      <Text className="font-playfair text-3xl text-flora-black mb-2">Chaves de lembrança</Text>
      <Text className="font-inter text-flora-gray text-base mb-10">
        Responda com cuidado. Você tem {attemptsLeft} tentativa(s).
      </Text>

      <View className="mb-8">
        <Text className="font-inter font-semibold text-lg text-flora-black mb-4">{question}</Text>
        <View className="gap-y-3">
          {options.map((opt, index) => (
            <TouchableOpacity 
              key={index}
              onPress={() => setSelectedOption(opt)}
              className={\`border rounded-xl px-5 py-4 \${selectedOption === opt ? 'bg-uslife-soft border-uslife text-uslife' : 'bg-flora-white border-flora-gray/20'}\`}
            >
              <Text className={\`font-inter text-base \${selectedOption === opt ? 'font-semibold text-uslife' : 'text-flora-black'}\`}>
                {opt}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity 
        onPress={handleValidation}
        disabled={!selectedOption}
        className={\`py-4 rounded-2xl items-center mt-auto mb-10 \${selectedOption ? 'bg-flora-black' : 'bg-flora-gray/30'}\`}
      >
        <Text className="text-flora-white font-inter font-semibold text-base">Validar lembranças</Text>
      </TouchableOpacity>
    </View>
  );
}
`
};

Object.entries(filesToCreate).forEach(([filePath, content]) => {
  fs.writeFileSync(filePath, content.trim());
  console.log(`✅ Arquivo gerado: ${filePath.split('mobile')[1] || filePath}`);
});

console.log('\n🚀 Fluxo de Convite (usLIFE) e Stores gerados com sucesso!');