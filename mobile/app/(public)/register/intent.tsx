import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

export default function IntentScreen() {
  const router = useRouter();
  const options = ['Meu espaço pessoal', 'Um espaço com alguém', 'Família', 'Equipe ou empresa'];

  return (
    <View className="flex-1 bg-flora-offwhite px-8 pt-20">
      <Text className="font-playfair text-3xl text-flora-black mb-10">Como você quer começar?</Text>

      <View className="gap-y-4">
        {options.map((opt, index) => (
          <TouchableOpacity 
            key={index}
            onPress={() => router.push('/(public)/register/onboarding')}
            className="bg-flora-white border border-flora-gray/20 py-5 rounded-2xl px-6"
          >
            <Text className="text-flora-black font-inter text-base font-medium">{opt}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}