const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://dhmrtidehbmnyabwveds.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRobXJ0aWRlaGJtbnlhYnd2ZWRzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAwMDU1MDMsImV4cCI6MjA5NTU4MTUwM30.wMwMbNRP5nwo08sIWcmN7fNyvK1WepfDwAj_tK-BDYY';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  console.log("Checking Supabase tables data...");
  
  // Query paginas_vinculadas
  const { data: pages, error: errorPages } = await supabase.from('paginas_vinculadas').select('*');
  if (errorPages) {
    console.error("❌ Error fetching paginas_vinculadas:", errorPages.message);
  } else {
    console.log("📋 paginas_vinculadas records count:", pages.length);
    console.log("📋 paginas_vinculadas records:", JSON.stringify(pages, null, 2));
  }

  // Query mensajes_entrantes
  const { data: messages, error: errorMsgs } = await supabase.from('mensajes_entrantes').select('*');
  if (errorMsgs) {
    console.error("❌ Error fetching mensajes_entrantes:", errorMsgs.message);
  } else {
    console.log("📨 mensajes_entrantes records count:", messages.length);
    console.log("📨 mensajes_entrantes records:", JSON.stringify(messages, null, 2));
  }
}

run();
