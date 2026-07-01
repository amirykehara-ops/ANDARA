const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://dhmrtidehbmnyabwveds.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRobXJ0aWRlaGJtbnlhYnd2ZWRzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAwMDU1MDMsImV4cCI6MjA5NTU4MTUwM30.wMwMbNRP5nwo08sIWcmN7fNyvK1WepfDwAj_tK-BDYY';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  console.log("Fetching latest page access token from Supabase...");
  const { data, error } = await supabase
    .from('paginas_vinculadas')
    .select('*')
    .eq('page_id', '1063762986829721')
    .single();
    
  if (error) {
    console.error("❌ Error fetching from Supabase:", error.message);
    return;
  }
  
  const pageId = data.page_id;
  const pageAccessToken = data.page_access_token;
  console.log(`✅ Loaded token for page: ${data.page_name} (ID: ${pageId})`);
  
  console.log("Querying Meta Graph API for connected Instagram account...");
  const igUrl = `https://graph.facebook.com/v25.0/${pageId}?fields=instagram_business_account,name&access_token=${pageAccessToken}`;
  
  try {
    const res = await fetch(igUrl);
    const result = await res.json();
    console.log("Graph API Response:", JSON.stringify(result, null, 2));
    
    if (result.instagram_business_account) {
      const igId = result.instagram_business_account.id;
      console.log(`✅ Instagram Account ID detected: ${igId}`);
      
      const igDetailsUrl = `https://graph.facebook.com/v25.0/${igId}?fields=username,name&access_token=${pageAccessToken}`;
      const resDetails = await fetch(igDetailsUrl);
      const details = await resDetails.json();
      console.log("Instagram Account Details:", JSON.stringify(details, null, 2));
    } else {
      console.log("❌ instagram_business_account field is missing or null in Meta's response!");
    }
  } catch (e) {
    console.error("Error connecting to Meta:", e);
  }
}

run();
