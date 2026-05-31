const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, 'mobile', 'app', '(public)');
const registerDir = path.join(publicDir, 'register');

// Certifica-se de que os diretórios existem
if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });
if (!fs.existsSync(registerDir)) fs.mkdirSync(registerDir, { recursive: true });

const filesToCreate = {
  // ==========================================
  // 1. TELA DE ENTRADA (AS 3 PORTAS)
  // ==========================================
  [path.join(publicDir, 'entry.tsx')]: `
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
          Um lugar para guardar histórias,{'\\n'}criar vínculos e preservar o que importa.
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
`,

  // ==========================================
  // 2. REGISTRO - DADOS BÁSICOS
  // ==========================================
  [path.join(registerDir, 'basic-data.tsx')]: `
import React from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

export default function BasicDataScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-flora-offwhite px-8 pt-20">
      <Text className="font-playfair text-3xl text-flora-black mb-2">Quem é você?</Text>
      <Text className="font-inter text-flora-gray text-base mb-10">Precisamos de alguns dados básicos para começar.</Text>

      <View className="gap-y-5">
        <TextInput 
          placeholder="Nome completo" 
          placeholderTextColor="#8E8E93"
          className="bg-flora-white border border-flora-gray/20 rounded-xl px-4 py-4 font-inter text-flora-black"
        />
        <TextInput 
          placeholder="E-mail" 
          keyboardType="email-address"
          placeholderTextColor="#8E8E93"
          className="bg-flora-white border border-flora-gray/20 rounded-xl px-4 py-4 font-inter text-flora-black"
        />
        <TextInput 
          placeholder="Senha" 
          secureTextEntry
          placeholderTextColor="#8E8E93"
          className="bg-flora-white border border-flora-gray/20 rounded-xl px-4 py-4 font-inter text-flora-black"
        />
      </View>

      <TouchableOpacity 
        onPress={() => router.push('/(public)/register/intent')}
        className="bg-flora-black py-4 rounded-2xl items-center mt-auto mb-10"
      >
        <Text className="text-flora-white font-inter font-semibold text-base">Continuar</Text>
      </TouchableOpacity>
    </View>
  );
}
`,

  // ==========================================
  // 3. REGISTRO - INTENÇÃO INICIAL
  // ==========================================
  [path.join(registerDir, 'intent.tsx')]: `
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
`,

  // ==========================================
  // 4. REGISTRO - ONBOARDING RÁPIDO
  // ==========================================
  [path.join(registerDir, 'onboarding.tsx')]: `
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
            className={\`border rounded-full px-5 py-3 \${selected === opt ? 'bg-flora-black border-flora-black' : 'bg-transparent border-flora-gray/30'}\`}
          >
            <Text className={\`font-inter font-medium \${selected === opt ? 'text-flora-white' : 'text-flora-black'}\`}>{opt}</Text>
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
`,

  // ==========================================
  // 5. REGISTRO - A FLORA DISCRETA
  // ==========================================
  [path.join(registerDir, 'flora.tsx')]: `
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
`
};

// Escreve os arquivos
Object.entries(filesToCreate).forEach(([filePath, content]) => {
  fs.writeFileSync(filePath, content.trim());
  // Correção aqui: console.log normal sem escapes nos delimitadores
  console.log(`✅ Código injetado em: ${filePath.split('mobile')[1] || filePath}`);
});

console.log('\n🚀 UI de Entrada e Onboarding geradas com sucesso!');