// src/app/api/ai/route.ts
import { NextResponse } from 'next/server';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

async function callGemini(systemPrompt: string, userMessage: string, isJson: boolean = false) {
  if (!GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY no configurada");
  }

  const payload = {
    system_instruction: { parts: { text: systemPrompt } },
    contents: [{ parts: [{ text: userMessage }] }],
    generationConfig: isJson ? { response_mime_type: "application/json" } : {}
  };

  const response = await fetch(GEMINI_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    // 8 seconds timeout
    signal: AbortSignal.timeout(8000)
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Gemini Error: ${err}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
  
  if (isJson) {
    return JSON.parse(text);
  }
  return text;
}

export async function POST(req: Request) {
  try {
    const { action, payload } = await req.json();

    let result: any = null;

    if (action === 'extract') {
      const systemPrompt = `Eres un asistente de extracción de datos para un CRM turístico.
Extrae el destino turístico, fecha de viaje (YYYY-MM-DD o aproximado) y número de personas.
Devuelve EXACTAMENTE un objeto JSON: {"destination": string|null, "travelDate": string|null, "peopleCount": number|null}.
No inventes datos. Si no existe, pon null.`;
      
      result = await callGemini(systemPrompt, `Mensaje del cliente: "${payload.messageText}"`, true);
    } 
    
    else if (action === 'suggest') {
      const systemPrompt = `Eres un guía turístico respondiendo a un cliente. 
Basado en el contexto del lead, sugiere 2 posibles respuestas cortas (max 1 oración cada una).
Devuelve EXACTAMENTE un objeto JSON con un array de strings: {"suggestions": ["resp1", "resp2"]}.`;
      
      const context = `Contexto del cliente: ${payload.leadContext}\nÚltimo mensaje: "${payload.messageText}"`;
      const res = await callGemini(systemPrompt, context, true);
      result = res.suggestions || [];
    }

    else if (action === 'summarize') {
      const systemPrompt = `Resume la conversación de este cliente de turismo en máximo 2 oraciones.
Muestra el estado principal de sus dudas o reservas.`;
      
      const convo = payload.messages.map((m: any) => `${m.sender}: ${m.text}`).join('\n');
      result = await callGemini(systemPrompt, convo, false);
    }

    else if (action === 'score') {
      const systemPrompt = `Evalúa la intención de compra del cliente basado en su conversación.
Responde ÚNICAMENTE con una de estas tres palabras: Alto, Medio, Bajo.
Alto: Menciona fechas específicas, pregunta cómo pagar, número exacto de personas.
Medio: Pregunta precios, itinerario, pero aún no concreta.
Bajo: Preguntas muy genéricas, deja en visto.`;
      
      const convo = payload.messages.map((m: any) => `${m.sender}: ${m.text}`).join('\n');
      const text = await callGemini(systemPrompt, convo, false);
      const clean = text.trim().toLowerCase();
      if (clean.includes('alto')) result = 'Alto';
      else if (clean.includes('medio')) result = 'Medio';
      else result = 'Bajo';
    }

    else {
      return NextResponse.json({ error: 'Acción no válida' }, { status: 400 });
    }

    return NextResponse.json({ result });
  } catch (error: any) {
    console.error("AI API Error:", error.message);
    return NextResponse.json({ result: null }, { status: 200 }); // Degradar silenciosamente
  }
}
