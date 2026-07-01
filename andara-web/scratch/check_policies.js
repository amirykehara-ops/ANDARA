const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://dhmrtidehbmnyabwveds.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRobXJ0aWRlaGJtbnlhYnd2ZWRzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAwMDU1MDMsImV4cCI6MjA5NTU4MTUwM30.wMwMbNRP5nwo08sIWcmN7fNyvK1WepfDwAj_tK-BDYY';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  console.log("Checking RLS policies on paginas_vinculadas...");
  // We can query using RPC or direct SQL if allowed, but since we only have anon key, we can try to do a select.
  // Wait, anon key cannot select from pg_policies directly unless a custom RPC is defined.
  // But we can test if we can do an insert/update from the script and see the error ourselves!
  try {
    const { data, error } = await supabase
      .from('paginas_vinculadas')
      .insert({
        guide_email: 'test_script@gmail.com',
        page_id: 'test_page_id_' + Date.now(),
        page_name: 'Test Page',
        page_access_token: 'test_token',
        platform: 'facebook'
      });
      
    if (error) {
      console.error("❌ Insert error:", error.message);
    } else {
      console.log("✅ Insert succeeded!");
    }
  } catch (e) {
    console.error("Exception:", e);
  }
}

run();
