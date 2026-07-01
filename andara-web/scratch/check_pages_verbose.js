const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://dhmrtidehbmnyabwveds.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRobXJ0aWRlaGJtbnlhYnd2ZWRzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAwMDU1MDMsImV4cCI6MjA5NTU4MTUwM30.wMwMbNRP5nwo08sIWcmN7fNyvK1WepfDwAj_tK-BDYY';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  console.log("Checking ALL records in paginas_vinculadas...");
  const { data, error } = await supabase
    .from('paginas_vinculadas')
    .select('*');
    
  if (error) {
    console.error("Error:", error);
  } else {
    console.log("Total records:", data.length);
    console.log(JSON.stringify(data, null, 2));
  }
}

run();
