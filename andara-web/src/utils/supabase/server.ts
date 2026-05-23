import { cookies } from 'next/headers'

export async function createClient() {
  // Stub sin Supabase - compatibilidad con imports existentes
  return {
    auth: {
      signInWithPassword: async () => ({ error: new Error('No Supabase') }),
      signUp: async () => ({ error: new Error('No Supabase') }),
      signOut: async () => {},
      getUser: async () => ({ data: { user: null } }),
    }
  }
}
