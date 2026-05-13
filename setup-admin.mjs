import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
if (!url || !key) { console.error('env missing'); process.exit(1); }
const supabase = createClient(url, key);

const EMAIL = 'jonathastdsantos@gmail.com';
const PASS = 'Jtds#0308#';
const CODE = 'sublime';

let { data: signIn } = await supabase.auth.signInWithPassword({ email: EMAIL, password: PASS });
if (!signIn?.user) {
  const { data, error } = await supabase.auth.signUp({ email: EMAIL, password: PASS });
  if (error) { console.error(error.message); process.exit(1); }
  if (!data.session) {
    const r = await supabase.auth.signInWithPassword({ email: EMAIL, password: PASS });
    signIn = r.data;
  } else signIn = data;
}
const userId = signIn.user.id;

let { data: clinic } = await supabase.from('clinics').select('*').eq('code', CODE).maybeSingle();
if (!clinic) {
  const { data, error } = await supabase.from('clinics').insert({ name: 'Sublime - Clínica do Desenvolvedor', code: CODE }).select().single();
  if (error) { console.error('clinic:', error.message); process.exit(1); }
  clinic = data;
}

const { error: pErr } = await supabase.from('profiles').upsert({
  id: userId, role: 'admin', full_name: 'Jonathas Santos', clinic_id: clinic.id
});
if (pErr) { console.error('profile:', pErr.message); process.exit(1); }
console.log('✅ Admin pronto. Código:', CODE, '— User:', userId);
