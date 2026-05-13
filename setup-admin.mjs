import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error('Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const admin = createClient(url, serviceKey, { auth: { persistSession: false } });

const EMAIL = 'jonathastdsantos@gmail.com';
const PASS = 'Jtds#0308#';
const CODE = 'sublime';

// 1. Ensure auth user (idempotent via listUsers + create or update)
const { data: list } = await admin.auth.admin.listUsers();
let user = list?.users?.find((u) => u.email?.toLowerCase() === EMAIL);
if (!user) {
  const { data, error } = await admin.auth.admin.createUser({
    email: EMAIL,
    password: PASS,
    email_confirm: true,
  });
  if (error) { console.error('createUser:', error.message); process.exit(1); }
  user = data.user;
  console.log('• Created auth user', user.id);
} else {
  await admin.auth.admin.updateUserById(user.id, { password: PASS, email_confirm: true });
  console.log('• Updated auth user', user.id);
}

// 2. Ensure clinic with code 'sublime'
let { data: clinic } = await admin.from('clinics').select('*').eq('code', CODE).maybeSingle();
if (!clinic) {
  const { data, error } = await admin
    .from('clinics')
    .insert({ name: 'Sublime - Clínica do Desenvolvedor', code: CODE })
    .select()
    .single();
  if (error) { console.error('clinic:', error.message); process.exit(1); }
  clinic = data;
  console.log('• Created clinic', clinic.id);
} else {
  console.log('• Clinic exists', clinic.id);
}

// 3. Ensure profile linking user <-> clinic as admin
const { error: pErr } = await admin.from('profiles').upsert({
  id: user.id,
  role: 'admin',
  full_name: 'Jonathas Santos',
  clinic_id: clinic.id,
});
if (pErr) { console.error('profile:', pErr.message); process.exit(1); }

console.log('\n✅ Pronto!');
console.log('   Código da empresa:', CODE);
console.log('   Email:', EMAIL);
console.log('   Senha:', PASS);
