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
      className={`py-4 rounded-2xl items-center flex-row justify-center ${isPrimary ? '' : 'border border-flora-gray/20'} ${className}`}
      style={{ backgroundColor: isPrimary ? activeTheme?.tokens?.primary : 'transparent', opacity: props.disabled ? 0.5 : 1 }}
      {...props}
    >
      {isLoading ? (
        <ActivityIndicator color={isPrimary ? '#FFF' : activeTheme?.tokens?.primary} />
      ) : (
        <FloraText variant="body" className={`font-semibold ${isPrimary ? 'text-flora-white' : ''}`} style={isPrimary ? {} : { color: activeTheme?.tokens?.primary }}>
          {label}
        </FloraText>
      )}
    </TouchableOpacity>
  );
}