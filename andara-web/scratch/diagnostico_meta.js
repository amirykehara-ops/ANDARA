/**
 * DIAGNÓSTICO COMPLETO - Andara Meta Integration
 * Ejecutar: node scratch/diagnostico_meta.js
 * 
 * Este script verifica:
 * 1. Estado actual de los tokens guardados en Supabase
 * 2. Si el token puede resolver perfiles de usuarios en Meta Graph API
 * 3. Qué hay en mensajes_entrantes (duplicados?)
 */

const SUPABASE_URL = 'https://dhmrtidehbmnyabwveds.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRobXJ0aWRlaGJtbnlhYnd2ZWRzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAwMDU1MDMsImV4cCI6MjA5NTU4MTUwM30.wMwMbNRP5nwo08sIWcmN7fNyvK1WepfDwAj_tK-BDYY';

async function supabaseQuery(table, params = '') {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}${params}`, {
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
    }
  });
  return res.json();
}

async function testMetaProfile(senderId, pageToken, platform) {
  const fields = platform === 'facebook' ? 'first_name,last_name,name' : 'username,name';
  const url = `https://graph.facebook.com/v25.0/${senderId}?fields=${fields}&access_token=${pageToken}`;
  const res = await fetch(url);
  const data = await res.json();
  return { status: res.status, data };
}

async function testTokenValidity(pageToken) {
  const url = `https://graph.facebook.com/v25.0/me?access_token=${pageToken}`;
  const res = await fetch(url);
  const data = await res.json();
  return { status: res.status, data };
}

async function run() {
  console.log('='.repeat(60));
  console.log('🔍 DIAGNÓSTICO DE INTEGRACIÓN META - ANDARA');
  console.log('='.repeat(60));
  console.log('');

  // ─── 1. Páginas vinculadas y sus tokens ─────────────────────────────────
  console.log('📄 1. PÁGINAS VINCULADAS EN SUPABASE:');
  console.log('-'.repeat(40));
  const paginas = await supabaseQuery('paginas_vinculadas', '?select=guide_email,page_id,page_name,platform,page_access_token&order=platform');
  
  if (!Array.isArray(paginas) || paginas.length === 0) {
    console.log('❌ No hay páginas vinculadas en la tabla paginas_vinculadas');
    console.log('   → El usuario necesita conectar su cuenta en /settings');
  } else {
    for (const p of paginas) {
      const tokenPreview = p.page_access_token ? p.page_access_token.substring(0, 30) + '...' : 'NULL';
      console.log(`  [${p.platform?.toUpperCase()}] ${p.page_name} (ID: ${p.page_id})`);
      console.log(`    Email guía: ${p.guide_email}`);
      console.log(`    Token: ${tokenPreview}`);
      
      // Verificar validez del token
      if (p.page_access_token) {
        const validity = await testTokenValidity(p.page_access_token);
        if (validity.status === 200) {
          console.log(`    ✅ TOKEN VÁLIDO - Representa: ${JSON.stringify(validity.data)}`);
        } else {
          console.log(`    ❌ TOKEN INVÁLIDO/EXPIRADO: ${JSON.stringify(validity.data?.error?.message || validity.data)}`);
        }
      }
      console.log('');
    }
  }

  // ─── 2. Mensajes_entrantes recientes ────────────────────────────────────
  console.log('📨 2. ÚLTIMOS 20 MENSAJES EN mensajes_entrantes:');
  console.log('-'.repeat(40));
  const mensajes = await supabaseQuery('mensajes_entrantes', '?select=id,guide_email,name,phone,text,created_at&order=created_at.desc&limit=20');
  
  if (!Array.isArray(mensajes) || mensajes.length === 0) {
    console.log('   (vacío)');
  } else {
    // Detectar duplicados
    const seen = {};
    for (const m of mensajes) {
      const key = `${m.phone}_${m.text}`;
      console.log(`  [${new Date(m.created_at).toLocaleTimeString()}] ${m.name} | ${m.phone}`);
      console.log(`    Texto: "${m.text?.substring(0, 60)}"`);
      if (seen[key]) {
        console.log(`    ⚠️  DUPLICADO DETECTADO con el mensaje anterior (misma clave phone+text)`);
        const diff = new Date(m.created_at) - new Date(seen[key]);
        console.log(`    ⚠️  Diferencia de tiempo: ${Math.abs(diff)}ms`);
      }
      seen[key] = m.created_at;
      console.log('');
    }
  }

  // ─── 3. Test de resolución de perfil ─────────────────────────────────────
  console.log('👤 3. TEST DE RESOLUCIÓN DE NOMBRE DE PERFIL:');
  console.log('-'.repeat(40));
  
  // Usar el primer token de facebook disponible
  const fbPage = Array.isArray(paginas) && paginas.find(p => p.platform === 'facebook' && p.page_access_token);
  const igPage = Array.isArray(paginas) && paginas.find(p => p.platform === 'instagram' && p.page_access_token);
  
  // Buscar IDs de remitentes reales de los mensajes
  const fbMessages = Array.isArray(mensajes) && mensajes.filter(m => m.phone?.startsWith('facebook:'));
  const igMessages = Array.isArray(mensajes) && mensajes.filter(m => m.phone?.startsWith('instagram:'));
  
  if (fbPage && fbMessages.length > 0) {
    const senderId = fbMessages[0].phone.replace('facebook:', '');
    console.log(`  Probando Messenger: sender_id = ${senderId}`);
    const result = await testMetaProfile(senderId, fbPage.page_access_token, 'facebook');
    console.log(`  Status: ${result.status}`);
    console.log(`  Respuesta: ${JSON.stringify(result.data)}`);
    if (result.data.first_name) {
      console.log(`  ✅ Nombre resuelto: ${result.data.first_name} ${result.data.last_name || ''}`);
    } else if (result.data.error) {
      console.log(`  ❌ Error: ${result.data.error.message}`);
      console.log(`     Código: ${result.data.error.code} | Tipo: ${result.data.error.type}`);
    }
    console.log('');
  } else {
    console.log('  ⚠️  No hay mensajes de Messenger o token de FB para probar.');
    if (!fbPage) console.log('     → Sin token de FB página en Supabase');
    if (fbMessages.length === 0) console.log('     → Sin mensajes de Messenger en mensajes_entrantes');
    console.log('');
  }
  
  if (igPage && igMessages.length > 0) {
    const senderId = igMessages[0].phone.replace('instagram:', '');
    console.log(`  Probando Instagram: sender_id = ${senderId}`);
    const result = await testMetaProfile(senderId, igPage.page_access_token, 'instagram');
    console.log(`  Status: ${result.status}`);
    console.log(`  Respuesta: ${JSON.stringify(result.data)}`);
    if (result.data.username) {
      console.log(`  ✅ Usuario resuelto: @${result.data.username}`);
    } else if (result.data.error) {
      console.log(`  ❌ Error: ${result.data.error.message}`);
      console.log(`     Código: ${result.data.error.code} | Tipo: ${result.data.error.type}`);
    }
    console.log('');
  } else {
    console.log('  ⚠️  No hay mensajes de Instagram o token de IG para probar.');
    console.log('');
  }

  // ─── 4. Leads duplicados en tabla leads ──────────────────────────────────
  console.log('🃏 4. VERIFICACIÓN DE LEADS DUPLICADOS (tabla leads):');
  console.log('-'.repeat(40));
  const leads = await supabaseQuery('leads', '?select=id,name,source,phone,created_at&order=created_at.desc&limit=30');
  
  if (Array.isArray(leads) && leads.length > 0) {
    const phoneSeen = {};
    for (const l of leads) {
      const key = `${l.phone}_${l.source}`;
      if (phoneSeen[key]) {
        console.log(`  ⚠️  LEAD DUPLICADO: ${l.name} (${l.source}) phone="${l.phone}"`);
        console.log(`      ID1: ${phoneSeen[key].id} | ID2: ${l.id}`);
      } else {
        phoneSeen[key] = l;
      }
    }
    const dups = Object.entries(phoneSeen).filter(([, v]) => v.duplicate).length;
    if (dups === 0) {
      console.log('  ✅ No se detectaron leads duplicados en la tabla leads.');
    }
  } else {
    console.log('  (tabla leads vacía)');
  }
  
  console.log('');
  console.log('='.repeat(60));
  console.log('✅ DIAGNÓSTICO COMPLETO');
  console.log('='.repeat(60));
}

run().catch(console.error);
