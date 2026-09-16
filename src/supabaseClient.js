import { createClient } from '@supabase/supabase-js';

// As credenciais vêm exclusivamente do ambiente (.env / variáveis do host).
// Só a URL e a ANON KEY podem viver aqui: ambas são públicas por design no
// Supabase e a proteção real é o RLS (ver supabase/security_hardening.sql).
// A SERVICE ROLE KEY nunca pode ser usada no frontend — ela ignora o RLS.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Configuração ausente: defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY ' +
      'no arquivo .env (veja .env.example). Sem elas o site não sobe.'
  );
}

// Guarda de segurança: impede que uma service_role key seja publicada por
// engano no bundle. O payload do JWT traz "role":"service_role".
try {
  const payload = JSON.parse(atob(supabaseAnonKey.split('.')[1]));
  if (payload.role && payload.role !== 'anon') {
    throw new Error(
      `VITE_SUPABASE_ANON_KEY tem role "${payload.role}". Só a chave "anon" ` +
        'pode ir para o frontend.'
    );
  }
} catch (erro) {
  if (erro instanceof Error && erro.message.startsWith('VITE_SUPABASE_ANON_KEY')) {
    throw erro;
  }
  // Formato inesperado de chave: segue o fluxo, o próprio Supabase rejeita.
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

// Retorna true apenas se existir sessão válida E o usuário estiver na
// allowlist public.admins. A checagem real acontece no banco (RLS); isto aqui
// só decide o que a interface mostra.
export async function usuarioEhAdmin() {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) return false;

  const { data, error } = await supabase.rpc('is_admin');
  if (error) {
    console.error('Falha ao verificar permissão de administrador:', error.message);
    return false;
  }
  return data === true;
}
