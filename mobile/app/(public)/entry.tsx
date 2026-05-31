import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

export default function EntryScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-flora-offwhite justify-center px-8">
      <View className="mb-16">
        <Text className="font-playfair text-5xl text-flora-black mb-4 tracking-tight">IRÍS</Text>
        <Text className="font-inter text-flora-gray text-lg leading-relaxed">
          Um lugar para guardar histórias,{'\n'}criar vínculos e preservar o que importa.
        </Text>
      </View>

      <View className="gap-y-4">
        <TouchableOpacity 
          onPress={() => router.push('/(public)/register/basic-data')}
          className="bg-flora-black py-4 rounded-2xl items-center"
        >
          <Text className="text-flora-white font-inter font-semibold text-base">Criar minha conta</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={() => router.push('/(public)/invite/memory-keys')}
          className="bg-uslife-soft py-4 rounded-2xl items-center border border-uslife/20"
        >
          <Text className="text-uslife font-inter font-semibold text-base">Recebi um convite</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={() => router.push('/(public)/login')}
          className="py-4 items-center"
        >
          <Text className="text-flora-black font-inter font-medium text-base">Já tenho conta</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}