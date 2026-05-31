import { supabase } from '../lib/supabase';

export const AuthService = {
  async signUp(email: string, password: string, fullName: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName } // Salva o nome nos metadados do utilizador
      }
    });
    if (error) throw error;
    return data;
  }
};