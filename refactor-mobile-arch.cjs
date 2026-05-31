const fs = require('fs');
const path = require('path');

const mobileAppDir = path.join(__dirname, 'mobile', 'app');
const tailwindConfigPath = path.join(__dirname, 'mobile', 'tailwind.config.js');

// 1. Apagar a pasta (auth) antiga se existir
const authDir = path.join(mobileAppDir, '(auth)');
if (fs.existsSync(authDir)) {
    fs.rmSync(authDir, { recursive: true, force: true });
    console.log('🗑️  Pasta (auth) antiga removida.');
}

// 2. Definir a nova estrutura de arquivos
const newStructure = [
    // Roteamento Público (As 3 portas)
    '(public)/entry.tsx',
    '(public)/login.tsx',
    // Porta 1: Registro Normal
    '(public)/register/_layout.tsx',
    '(public)/register/start.tsx',
    '(public)/register/basic-data.tsx',
    '(public)/register/intent.tsx',
    '(public)/register/onboarding.tsx',
    '(public)/register/flora.tsx',
    '(public)/register/complete.tsx',
    // Porta 2: Convite
    '(public)/invite/_layout.tsx',
    '(public)/invite/[slug].tsx',
    '(public)/invite/memory-keys.tsx',
    '(public)/invite/create-account.tsx',
    '(public)/invite/onboarding.tsx',
    '(public)/invite/flora.tsx',
    '(public)/invite/waiting-approval.tsx',
    '(public)/invite/activated.tsx',
    // Área Logada (Tabs)
    '(tabs)/ilife.tsx',
    '(tabs)/uslife.tsx',
    '(tabs)/invites.tsx',
    '(tabs)/profile.tsx',
];

// Template básico para não quebrar o Expo Router
const generateTemplate = (filename) => {
    const componentName = path.basename(filename, '.tsx').replace(/[^a-zA-Z0-9]/g, '') || 'Layout';
    const isLayout = filename.includes('_layout');
    
    if (isLayout) {
        return `import { Stack } from 'expo-router';\n\nexport default function ${componentName}Layout() {\n  return <Stack screenOptions={{ headerShown: false }} />;\n}\n`;
    }

    return `import { View, Text } from 'react-native';\n\nexport default function ${componentName}Screen() {\n  return (\n    <View className="flex-1 bg-flora-offwhite items-center justify-center">\n      <Text className="text-flora-black font-inter text-lg">${filename}</Text>\n    </View>\n  );\n}\n`;
};

// 3. Criar os arquivos e pastas
newStructure.forEach(relPath => {
    const fullPath = path.join(mobileAppDir, relPath);
    const dir = path.dirname(fullPath);

    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    if (!fs.existsSync(fullPath)) {
        fs.writeFileSync(fullPath, generateTemplate(relPath));
        console.log(`✅ Criado: ${relPath}`);
    }
});

// 4. Atualizar Tailwind Config com as Cores FLORA
if (fs.existsSync(tailwindConfigPath)) {
    const tailwindContent = `/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        flora: {
          offwhite: '#FAF9F6',
          black: '#121212',
          white: '#FFFFFF',
          gray: '#8E8E93',
          green: '#81C784', // Discreto para onboarding/flora
        },
        ilife: {
          DEFAULT: '#4CAF50',
          soft: '#E8F5E9',
        },
        uslife: {
          DEFAULT: '#9C27B0',
          soft: '#F3E5F5',
        },
      },
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
        playfair: ['Playfair Display', 'serif'],
      },
    },
  },
  plugins: [],
};`;
    fs.writeFileSync(tailwindConfigPath, tailwindContent);
    console.log('🎨 tailwind.config.js atualizado com as cores do Sistema FLORA.');
}

console.log('🚀 Refatoração da arquitetura mobile concluída com sucesso!');