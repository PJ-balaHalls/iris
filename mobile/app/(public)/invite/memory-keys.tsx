import React, { useState } from 'react';
import { View, Alert, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useInviteStore } from '../../../src/stores/invite.store';
import { InviteService } from '../../../src/services/invite.service';
import { FloraText } from '../../../src/components/ui/FloraText';
import { FloraButton } from '../../../src/components/ui/FloraButton';

export default function MemoryKeysScreen() {
  const router = useRouter();
  const { attemptsLeft, decrementAttempt, inviteId } = useInviteStore();
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // NOTA: Num cenário 100% integrado, buscaríamos a lista de perguntas do InviteService no useEffect.
  // Para manter o MVP visível, estamos a usar uma estrutura estática simulando o retorno do banco.
  const mockQuestionId = 'q1-uuid';
  const question = "Qual foi o nosso primeiro passeio?";
  const options = ['Cinema', 'Praia', 'Parque', 'Restaurante'];

  const handleValidation = async () => {
    if (selectedOptionIndex === null) return;
    setIsLoading(true);

    try {
      // Como ainda não tem o ID real no banco para testar, se o inviteId for null, simulamos erro.
      if (!inviteId) throw new Error("ID do convite não fornecido.");

      // Chamada real para o Supabase (RPC)
      const isValid = await InviteService.validateKeys(inviteId, { [mockQuestionId]: selectedOptionIndex });

      if (isValid) {
        router.push('/(public)/invite/create-account');
      } else {
        processFailure();
      }
    } catch (error) {
      // Fallback para falha local caso a RPC falhe por falta de dados reais no seu Supabase agora
      processFailure();
    } finally {
      setIsLoading(false);
    }
  };

  const processFailure = () => {
    decrementAttempt();
    if (attemptsLeft - 1 <= 0) {
      Alert.alert("Bloqueado", "Este convite foi bloqueado por segurança. Peça um novo convite.");
      router.replace('/(public)/entry');
    } else {
      Alert.alert("Incorreto", `As respostas não combinaram. Ainda tem ${attemptsLeft - 1} tentativa(s).`);
    }
  };

  return (
    <View className="flex-1 bg-flora-offwhite px-8 pt-20">
      <FloraText variant="h2" className="mb-2">Chaves de lembrança</FloraText>
      <FloraText variant="body" className="mb-10 text-flora-gray">
        Responda com cuidado. Tem {attemptsLeft} tentativa(s).
      </FloraText>

      <View className="mb-8">
        <FloraText variant="h3" className="mb-4">{question}</FloraText>
        <View className="gap-y-3">
          {options.map((opt, index) => {
            const isSelected = selectedOptionIndex === index;
            return (
              <TouchableOpacity 
                key={index}
                onPress={() => setSelectedOptionIndex(index)}
                className={`border rounded-xl px-5 py-4 ${isSelected ? 'bg-uslife-soft border-uslife' : 'bg-flora-white border-flora-gray/20'}`}
              >
                <FloraText variant="body" className={isSelected ? 'font-semibold text-uslife' : ''}>
                  {opt}
                </FloraText>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <FloraButton 
        label="Validar lembranças" 
        onPress={handleValidation}
        disabled={selectedOptionIndex === null}
        isLoading={isLoading}
        className="mt-auto mb-10"
      />
    </View>
  );
}