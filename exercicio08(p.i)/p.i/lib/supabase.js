import { createClient } from "@supabase/supabase-js";

// Lê as credenciais do Vite (definidas em .env com prefixo VITE_)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
	// Ajuda no diagnóstico em ambiente de dev
	// eslint-disable-next-line no-console
	console.warn(
		"Supabase não configurado: defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no arquivo .env"
	);
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
	auth: {
		persistSession: true,
		autoRefreshToken: true,
		detectSessionInUrl: true,
		flowType: 'pkce',
	},
});