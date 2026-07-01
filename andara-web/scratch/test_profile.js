const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://dhmrtidehbmnyabwveds.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRobXJ0aWRlaGJtbnlhYnd2ZWRzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAwMDU1MDMsImV4cCI6MjA5NTU4MTUwM30.wMwMbNRP5nwo08sIWcmN7fNyvK1WepfDwAj_tK-BDYY'
);

async function testProfile(senderId, pageAccessToken, platform) {
  const fields = platform === 'facebook' ? 'first_name,last_name,name' : 'username,name';
  const url = `https://graph.facebook.com/v25.0/${senderId}?fields=${fields}&access_token=${pageAccessToken}`;
  console.log(`[${platform}] Fetching profile for ${senderId}...`);
  try {
    const res = await fetch(url);
    const data = await res.json();
    console.log(`Response status: ${res.status}`);
    console.log(`Response data:`, data);
  } catch(e) {
    console.error(`Error:`, e.message);
  }
}

async function run() {
  const { data: pages } = await supabase.from('paginas_vinculadas').select('*');
  
  const fbPage = pages.find(p => p.platform === 'facebook');
  const igPage = pages.find(p => p.platform === 'instagram');
  
  if (fbPage) {
    console.log(`Using FB Token: ${fbPage.page_access_token.substring(0,20)}...`);
    await testProfile('26801045606261839', fbPage.page_access_token, 'facebook');
  } else {
    console.log("No FB page token found.");
  }
  
  if (igPage) {
    console.log(`Using IG Token: ${igPage.page_access_token.substring(0,20)}...`);
    await testProfile('985570204115027', igPage.page_access_token, 'instagram');
  } else {
    console.log("No IG page token found.");
  }
}

run();
