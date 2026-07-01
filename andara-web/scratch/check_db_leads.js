const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://dhmrtidehbmnyabwveds.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRobXJ0aWRlaGJtbnlhYnd2ZWRzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAwMDU1MDMsImV4cCI6MjA5NTU4MTUwM30.wMwMbNRP5nwo08sIWcmN7fNyvK1WepfDwAj_tK-BDYY';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  console.log("Checking leads and messages in Supabase...");
  
  const { data: leads, error: errorLeads } = await supabase
    .from('leads')
    .select('*')
    .eq('guide_email', 'amir234@gmail.com');
    
  if (errorLeads) {
    console.error("❌ Error fetching leads:", errorLeads.message);
  } else {
    console.log("📋 Leads in Supabase for amir234@gmail.com count:", leads.length);
    console.log("📋 Leads records:", JSON.stringify(leads, null, 2));
  }

  const { data: messages, error: errorMsgs } = await supabase
    .from('mensajes')
    .select('*');
    
  if (errorMsgs) {
    console.error("❌ Error fetching mensajes:", errorMsgs.message);
  } else {
    console.log("📨 Messages in Supabase count:", messages.length);
    if (messages.length > 0) {
      console.log("📨 Sample message:", JSON.stringify(messages[0], null, 2));
    }
  }
}

run();
