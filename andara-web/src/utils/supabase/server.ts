import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    'https://dhmrtidehbmnyabwveds.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRobXJ0aWRlaGJtbnlhYnd2ZWRzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAwMDU1MDMsImV4cCI6MjA5NTU4MTUwM30.wMwMbNRP5nwo08sIWcmN7fNyvK1WepfDwAj_tK-BDYY',
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // ignorado en Server Components
          }
        },
      },
    }
  )
}