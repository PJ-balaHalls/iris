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