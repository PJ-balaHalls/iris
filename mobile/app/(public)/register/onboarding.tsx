import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

export default function OnboardingScreen() {
  const router = useRouter();
  const [selected, setSelected] = useState('');
  
  const options = ['Memórias', 'Diários', 'Fotos', 'Cartas', 'Projetos'];

  return (
    <View className="flex-1 bg-flora-offwhite px-8 pt-20">
      <Text className="font-playfair text-3xl text-flora-black mb-2">O que você quer preservar?</Text>
      <Text className="font-inter text-flora-gray text-base mb-10">Isso moldará a sua experiência.</Text>

      <View className="flex-row flex-wrap gap-3">
        {options.map((opt, index) => (
          <TouchableOpacity 
            key={index}
            onPress={() => setSelected(opt)}
            className={`border rounded-full px-5 py-3 ${selected === opt ? 'bg-flora-black border-flora-black' : 'bg-transparent border-flora-gray/30'}`}
          >
            <Text className={`font-inter font-medium ${selected === opt ? 'text-flora-white' : 'text-flora-black'}`}>{opt}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity 
        onPress={() => router.push('/(public)/register/flora')}
        className="bg-flora-black py-4 rounded-2xl items-center mt-auto mb-10"
      >
        <Text className="text-flora-white font-inter font-semibold text-base">Próximo</Text>
      </TouchableOpacity>
    </View>
  );
}