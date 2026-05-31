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