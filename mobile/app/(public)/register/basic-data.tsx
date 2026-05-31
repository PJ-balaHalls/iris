import React, { useState } from 'react';
import { View, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { FloraText } from '../../../src/components/ui/FloraText';
import { FloraInput } from '../../../src/components/ui/FloraInput';
import { FloraButton } from '../../../src/components/ui/FloraButton';
import { AuthService } from '../../../src/services/auth.service';

export default function BasicDataScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !password) {
      Alert.alert('Atenção', 'Por favor, preencha todos os campos.');
      return;
    }
    
    setIsLoading(true);
    try {
      // Registo real no Supabase
      await AuthService.signUp(email, password, name);
      // Avança para a intenção
      router.push('/(public)/register/intent');
    } catch (error: any) {
      Alert.alert('Erro no Registo', error.message || 'Não foi possível criar a conta.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-flora-offwhite px-8 pt-20">
      <FloraText variant="h2" className="mb-2">Quem é você?</FloraText>
      <FloraText variant="body" className="mb-10 text-flora-gray">Precisamos de alguns dados básicos para começar.</FloraText>

      <View className="gap-y-5">
        <FloraInput 
          placeholder="Nome completo" 
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
        />
        <FloraInput 
          placeholder="E-mail" 
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <FloraInput 
          placeholder="Senha" 
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
      </View>

      <FloraButton 
        label="Continuar" 
        onPress={handleRegister} 
        isLoading={isLoading}
        className="mt-auto mb-10"
      />
    </View>
  );
}