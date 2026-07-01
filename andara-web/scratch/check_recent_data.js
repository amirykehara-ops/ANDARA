const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://dhmrtidehbmnyabwveds.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRobXJ0aWRlaGJtbnlhYnd2ZWRzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAwMDU1MDMsImV4cCI6MjA5NTU4MTUwM30.wMwMbNRP5nwo08sIWcmN7fNyvK1WepfDwAj_tK-BDYY'
);

async function run() {
  console.log('--- LEADS ---');
  const { data: leads } = await supabase.from('leads').select('*').order('created_at', { ascending: false }).limit(20);
  console.log(leads.map(l => ({ id: l.id, name: l.name, phone: l.phone, source: l.source, created: l.created_at })));

  console.log('\n--- MENSAJES_ENTRANTES ---');
  const { data: incoming } = await supabase.from('mensajes_entrantes').select('*').order('created_at', { ascending: false }).limit(20);
  console.log(incoming.map(i => ({ id: i.id, name: i.name, phone: i.phone, source: i.source, text: i.text, created: i.created_at })));
}

run();
