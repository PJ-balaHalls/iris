const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'mobile', 'src');
const libDir = path.join(srcDir, 'lib');
const uiDir = path.join(srcDir, 'components', 'ui');

// Garante que as pastas existem
[libDir, uiDir].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

const filesToCreate = {
  // ==========================================
  // 1. CLIENTE SUPABASE REAL
  // ==========================================
  [path.join(libDir, 'supabase.ts')]: `
import 'react-native-url-polyfill/auto';
import * as SecureStore from 'expo-secure-store';
import { createClient } from '@supabase/supabase-js';

// Adaptador de Storage Seguro para manter a sessão no dispositivo
const ExpoSecureStoreAdapter = {
  getItem: (key: string) => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
};

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
`,

  // ==========================================
  // 2. COMPONENTES DO DESIGN SYSTEM FLORA
  // ==========================================
  
  [path.join(uiDir, 'FloraText.tsx')]: `
import React from 'react';
import { Text, TextProps } from 'react-native';
import { useFloraTheme } from '../providers/theme-provider';

interface FloraTextProps extends TextProps {
  variant?: 'h1' | 'h2' | 'h3' | 'body' | 'caption';
}

export function FloraText({ variant = 'body', className = '', style, children, ...props }: FloraTextProps) {
  const { activeTheme } = useFloraTheme() as any;
  const isTitle = variant === 'h1' || variant === 'h2' || variant === 'h3';
  
  // Mapeamento base
  const baseClass = isTitle ? 'font-playfair' : 'font-inter';
  const sizeClass = {
    h1: 'text-4xl',
    h2: 'text-2xl',
    h3: 'text-xl',
    body: 'text-base',
    caption: 'text-sm'
  }[variant];

  return (
    <Text 
      className={\`\${baseClass} \${sizeClass} \${className}\`} 
      style={[{ color: isTitle ? activeTheme?.tokens?.textPrimary : activeTheme?.tokens?.textSecondary }, style]}
      {...props}
    >
      {children}
    </Text>
  );
}
`,

  [path.join(uiDir, 'FloraButton.tsx')]: `
import React from 'react';
import { TouchableOpacity, TouchableOpacityProps, ActivityIndicator } from 'react-native';
import { FloraText } from './FloraText';
import { useFloraTheme } from '../providers/theme-provider';

interface FloraButtonProps extends TouchableOpacityProps {
  label: string;
  variant?: 'primary' | 'secondary' | 'outline';
  isLoading?: boolean;
}

export function FloraButton({ label, variant = 'primary', isLoading, className = '', ...props }: FloraButtonProps) {
  const { activeTheme } = useFloraTheme() as any;
  const isPrimary = variant === 'primary';

  return (
    <TouchableOpacity
      disabled={isLoading || props.disabled}
      className={\`py-4 rounded-2xl items-center flex-row justify-center \${isPrimary ? '' : 'border border-flora-gray/20'} \${className}\`}
      style={{ backgroundColor: isPrimary ? activeTheme?.tokens?.primary : 'transparent', opacity: props.disabled ? 0.5 : 1 }}
      {...props}
    >
      {isLoading ? (
        <ActivityIndicator color={isPrimary ? '#FFF' : activeTheme?.tokens?.primary} />
      ) : (
        <FloraText variant="body" className={\`font-semibold \${isPrimary ? 'text-flora-white' : ''}\`} style={isPrimary ? {} : { color: activeTheme?.tokens?.primary }}>
          {label}
        </FloraText>
      )}
    </TouchableOpacity>
  );
}
`,

  [path.join(uiDir, 'FloraInput.tsx')]: `
import React from 'react';
import { TextInput, TextInputProps, View } from 'react-native';
import { useFloraTheme } from '../providers/theme-provider';

export function FloraInput(props: TextInputProps) {
  const { activeTheme } = useFloraTheme() as any;

  return (
    <TextInput
      placeholderTextColor="#8E8E93"
      className="border rounded-xl px-4 py-4 font-inter text-base"
      style={{ 
        backgroundColor: activeTheme?.tokens?.surface, 
        borderColor: activeTheme?.tokens?.border,
        color: activeTheme?.tokens?.textPrimary 
      }}
      {...props}
    />
  );
}
`
};

Object.entries(filesToCreate).forEach(([filePath, content]) => {
  fs.writeFileSync(filePath, content.trim());
  console.log(`✅ Base Core gerada: ${filePath.split('mobile')[1] || filePath}`);
});

console.log('\\n🚀 Cliente Supabase Real e Componentes FLORA criados!');