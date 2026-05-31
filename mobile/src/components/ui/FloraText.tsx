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
      className={`${baseClass} ${sizeClass} ${className}`} 
      style={[{ color: isTitle ? activeTheme?.tokens?.textPrimary : activeTheme?.tokens?.textSecondary }, style]}
      {...props}
    >
      {children}
    </Text>
  );
}