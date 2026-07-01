const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://dhmrtidehbmnyabwveds.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRobXJ0aWRlaGJtbnlhYnd2ZWRzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAwMDU1MDMsImV4cCI6MjA5NTU4MTUwM30.wMwMbNRP5nwo08sIWcmN7fNyvK1WepfDwAj_tK-BDYY';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  console.log("Testing database insert on table 'mensajes_entrantes'...");
  
  const testPayload = {
    guide_email: 'guia@andara.pe',
    name: 'Cliente Prueba DB',
    phone: '123456789',
    text: 'Hola, esto es una prueba directa a la base de datos.'
  };

  try {
    const { data, error } = await supabase
      .from('mensajes_entrantes')
      .insert([testPayload]);

    if (error) {
      console.error("❌ Database insert failed:", error.message);
      console.error("Details:", error);
    } else {
      console.log("✅ Database insert succeeded!");
      console.log("Returned data:", data);
    }
  } catch (e) {
    console.error("❌ Exception occurred during insert:", e.message);
  }
}

run();
