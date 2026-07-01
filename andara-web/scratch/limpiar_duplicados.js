/**
 * Limpieza profunda: normaliza phones con prefijos y elimina TODOS los leads
 * con nombres de placeholder para empezar limpio. Los leads reales de WhatsApp
 * (que tienen nombre de perfil real) se conservan.
 */
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://dhmrtidehbmnyabwveds.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRobXJ0aWRlaGJtbnlhYnd2ZWRzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAwMDU1MDMsImV4cCI6MjA5NTU4MTUwM30.wMwMbNRP5nwo08sIWcmN7fNyvK1WepfDwAj_tK-BDYY'
);

async function run() {
  console.log('🧹 LIMPIEZA PROFUNDA v2');
  console.log('='.repeat(50));

  const { data: leads } = await supabase
    .from('leads')
    .select('id, name, source, phone, guide_email');

  if (!leads || leads.length === 0) { console.log('Sin leads.'); return; }

  const PLACEHOLDERS = ['usuario ig', 'usuario fb', 'cliente nuevo', 'meta tester', 'wa (', 'cliente wa'];
  const toDeleteIds = [];

  for (const lead of leads) {
    const nameLower = (lead.name || '').toLowerCase();
    const isPlaceholder = PLACEHOLDERS.some(p => nameLower.includes(p));
    if (isPlaceholder) {
      toDeleteIds.push(lead.id);
      console.log(`  🗑️  Eliminando placeholder: "${lead.name}" [${lead.source}] ID=${lead.id.substring(0, 20)}`);
    }
  }

  console.log(`\n📋 A eliminar: ${toDeleteIds.length} leads con nombres de placeholder`);

  for (const id of toDeleteIds) {
    await supabase.from('mensajes').delete().eq('lead_id', id);
    const { error } = await supabase.from('leads').delete().eq('id', id);
    if (error) console.error(`  ❌ Error: ${error.message}`);
  }

  // También limpiar mensajes_entrantes
  await supabase.from('mensajes_entrantes').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  console.log('  ✅ mensajes_entrantes vaciada.');

  const { data: remaining } = await supabase.from('leads').select('id,name,source,phone').order('created_at', { ascending: false });
  console.log(`\n📋 Leads restantes: ${(remaining||[]).length}`);
  for (const l of (remaining||[])) console.log(`   [${l.source}] "${l.name}" | ${l.phone}`);

  console.log('\n✅ LISTO - Ahora reconecta en /settings y prueba enviar mensajes nuevos.');
}

run().catch(console.error);
