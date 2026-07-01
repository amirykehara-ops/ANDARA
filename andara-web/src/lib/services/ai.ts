// src/lib/services/ai.ts

export interface AIConfig {
  enableExtraction: boolean;
  enableSuggestions: boolean;
  enableSummary: boolean;
  enableScoring: boolean;
}

const DEFAULT_CONFIG: AIConfig = {
  enableExtraction: true,
  enableSuggestions: true,
  enableSummary: true,
  enableScoring: true,
};

function getLocalConfig(): AIConfig {
  if (typeof window === 'undefined') return DEFAULT_CONFIG;
  try {
    const data = localStorage.getItem('andara_ai_config');
    return data ? JSON.parse(data) : DEFAULT_CONFIG;
  } catch (e) {
    return DEFAULT_CONFIG;
  }
}

export function saveAIConfig(config: AIConfig): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('andara_ai_config', JSON.stringify(config));
}

export function getAIConfig(): AIConfig {
  return getLocalConfig();
}

/**
 * Llama al endpoint del servidor interno de manera segura.
 * Falla silenciosamente si hay error (retorna null).
 */
async function callAIEngine(action: string, payload: any): Promise<any> {
  try {
    const res = await fetch('/api/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, payload })
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.result;
  } catch (e) {
    console.error("Error en llamada a IA:", e);
    return null;
  }
}

// 1. Extracción de datos
export async function extractLeadData(messageText: string): Promise<{ destination?: string, travelDate?: string, peopleCount?: number } | null> {
  if (!getLocalConfig().enableExtraction) return null;
  return callAIEngine('extract', { messageText });
}

// 2. Sugerencias de respuesta
export async function suggestReply(messageText: string, leadContext: string): Promise<string[] | null> {
  if (!getLocalConfig().enableSuggestions) return null;
  return callAIEngine('suggest', { messageText, leadContext });
}

// 3. Resumen de conversación
export async function summarizeConversation(messages: {sender: string, text: string}[]): Promise<string | null> {
  if (!getLocalConfig().enableSummary) return null;
  if (messages.length === 0) return null;
  return callAIEngine('summarize', { messages });
}

// 4. Scoring de Lead
export async function scoreLead(leadId: string, messages: {sender: string, text: string}[]): Promise<'Alto' | 'Medio' | 'Bajo' | null> {
  if (!getLocalConfig().enableScoring) return null;
  if (messages.length === 0) return null;
  return callAIEngine('score', { messages });
}
