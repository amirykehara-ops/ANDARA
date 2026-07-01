const pageAccessToken = "EAAsjiOzZAaosBRwOPPYY3rtuJHHglXlQ9kcnCrN0h4ulgS7zUzV4vDId6UoXuBZCDZB6ZA951iMkchZCr5kUYjBmBDZBxfZAMj9oHtoVkvqys0kz1ulIsIovtoWNCnMYtPtI0HzxMIaTqtxZCGees42AumsQ71iNX0oVsmxOQpscxotIHmuAtLZCspN4Bu9PH2phgmzm6OOelGAyV2nZAS0UOdy07AW1mhD4P7gOvYz2Ni";

const fbSenderId = "26801045606261839";
const igSenderId = "985570204115027";

async function testFB() {
  console.log("Testing Facebook profile fetch...");
  const url = `https://graph.facebook.com/v25.0/${fbSenderId}?fields=first_name,last_name&access_token=${pageAccessToken}`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    console.log("FB Result Status:", res.status);
    console.log("FB Result Data:", JSON.stringify(data, null, 2));
  } catch (e) {
    console.error("FB Error:", e);
  }
}

async function testIG() {
  console.log("Testing Instagram profile fetch...");
  const url = `https://graph.facebook.com/v25.0/${igSenderId}?fields=username,name&access_token=${pageAccessToken}`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    console.log("IG Result Status:", res.status);
    console.log("IG Result Data:", JSON.stringify(data, null, 2));
  } catch (e) {
    console.error("IG Error:", e);
  }
}

async function run() {
  await testFB();
  await testIG();
}

run();
