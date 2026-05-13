import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hbpdwkycoatvqujzkyjr.supabase.co';
const supabaseKey = 'sb_publishable_gqfAFKgwdlIB2ZNMmPA0MA_JrK6MUCj';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createAdmin() {
  console.log("Autenticando usuário...");
  
  // 1. Sign in to get session
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'jonathastdsantos@gmail.com',
    password: 'Jtds#0308#',
  });

  if (authError) {
    console.error("Erro no signIn:", authError.message);
    return;
  }

  console.log("Login feito com sucesso! User ID:", authData.user?.id);

  if (authData.user) {
    // 2. Add to profiles table using the authenticated session
    const { error: profileError } = await supabase.from('profiles').upsert({
      id: authData.user.id,
      role: 'admin',
      full_name: 'Jonathas Santos (Admin)',
      specialty: 'Desenvolvedor'
    });

    if (profileError) {
      console.error("Erro ao criar/atualizar profile admin:", profileError.message);
    } else {
      console.log("Profile de Admin criado/atualizado com sucesso!");
    }
  }
}

createAdmin();
