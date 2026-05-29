import { cookies } from 'next/headers'

export async function createClient() {
  // Stub sin Supabase - compatibilidad con imports existentes
  return {
    auth: {
      signInWithPassword: async () => ({ error: new Error('No Supabase') }),
      signUp: async () => ({ error: new Error('No Supabase') }),
      signOut: async () => {},
      getUser: async () => ({ data: { user: null } }),
    },
    from: (table: string) => ({
      select: () => ({
        eq: () => ({
          single: async () => ({ data: null, error: null }),
        }),
      }),
      upsert: async (data: any) => ({ error: null }),
      insert: async (data: any) => ({ error: null }),
    })
  } as any
}
export async function fetchLeads() {
  // In development, use mockLeads utilities to simulate leads data
  if (typeof window !== 'undefined') {
    // client‑side usage (will be called from React components)
    const { getLeads } = await import('../mockLeads');
    return getLeads();
  }
  // server‑side fallback (no access to localStorage)
  return [];
}
