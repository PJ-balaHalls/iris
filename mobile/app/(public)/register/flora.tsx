import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

export default function FloraScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-flora-offwhite justify-center px-8">
      <View className="items-center mb-12">
        <View className="w-20 h-20 bg-flora-green/20 rounded-full mb-8 items-center justify-center">
          <View className="w-10 h-10 bg-flora-green/50 rounded-full" />
        </View>
        
        <Text className="font-playfair text-3xl text-flora-black mb-4 text-center">Sua Flora foi criada.</Text>
        <Text className="font-inter text-flora-gray text-base text-center leading-relaxed px-4">
          Ela ajuda o IRÍS a organizar sua experiência, seus espaços e suas permissões silenciosamente.
        </Text>
      </View>

      <View className="gap-y-4 w-full">
        <TouchableOpacity 
          onPress={() => router.replace('/(tabs)/ilife')}
          className="bg-flora-black py-4 rounded-2xl items-center"
        >
          <Text className="text-flora-white font-inter font-semibold text-base">Continuar para o IRÍS</Text>
        </TouchableOpacity>

        <TouchableOpacity className="py-4 items-center">
          <Text className="text-flora-gray font-inter font-medium text-base">Ver detalhes da Flora</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}