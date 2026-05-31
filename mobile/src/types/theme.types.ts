export interface ThemeTokens {
  background: string;
  surface: string;
  primary: string;
  emotion: string;
  textPrimary: string;
  textSecondary: string;
  border: string;
  cardStyle: 'soft' | 'hard' | 'glass';
  titleFont: string;
}

export interface FloraTheme {
  themeId: string;
  name: string;
  scope: ('ilife' | 'uslife' | 'memory' | 'space')[];
  version: string;
  tokens: ThemeTokens;
  assets?: {
    backgroundPattern?: string;
    coverFrame?: string;
    ornament?: string;
  };
}