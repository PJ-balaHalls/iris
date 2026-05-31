import { supabase } from '../lib/supabase';

export const InviteService = {
  // Busca os dados do convite e as perguntas (sem as respostas corretas, por segurança)
  async getMemoryKeys(inviteId: string) {
    const { data: invite, error: inviteError } = await supabase
      .from('uslife_invites')
      .select('id, target_name, relationship_type, status')
      .eq('id', inviteId)
      .single();

    if (inviteError || !invite) throw new Error('Convite não encontrado ou inválido.');
    if (invite.status !== 'pending') throw new Error('Este convite não está mais pendente.');

    const { data: keys, error: keysError } = await supabase
      .from('uslife_invite_memory_keys')
      .select('id, question_text, options_jsonb')
      .eq('invite_id', inviteId)
      .order('sort_order', { ascending: true });

    if (keysError) throw keysError;

    return {
      invite,
      questions: keys || []
    };
  },
  
  // Chama a Função RPC Segura no Supabase (Zero-Knowledge)
  async validateKeys(inviteId: string, answers: Record<string, number>) {
    const { data, error } = await supabase.rpc('validate_invite_keys', {
      p_invite_id: inviteId,
      p_answers: answers
    });

    if (error) {
      console.error("Erro na validação RPC:", error);
      return false;
    }

    return data === true;
  }
};