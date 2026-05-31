import { supabase } from '../lib/supabase';
import { FloraTheme } from '../types/theme.types';

export const ThemeService = {
  // Busca o tema e os tokens da versão ativa diretamente do banco
  async getThemeById(themeId: string): Promise<FloraTheme | null> {
    try {
      const { data, error } = await supabase
        .from('flora_themes')
        .select(`
          id,
          name,
          supported_scopes,
          versions:flora_theme_versions (
            token_payload_json
          )
        `)
        .eq('id', themeId)
        .single();

      if (error || !data) throw error;

      // Monta o objeto formatado para o nosso App
      const tokens = data.versions && data.versions.length > 0 
        ? data.versions[0].token_payload_json 
        : null;

      if (!tokens) throw new Error('Tema sem tokens válidos.');

      return {
        themeId: data.id,
        name: data.name,
        scope: data.supported_scopes,
        version: '1.0.0', // Versão da API
        tokens: tokens,
      };
    } catch (err) {
      console.error('Erro ao buscar tema do Supabase:', err);
      return null;
    }
  }
};