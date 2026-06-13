// src/utils/supabase/middleware.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  // Usar credenciales por defecto de desarrollo si no existen en env
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dhmrtidehbmnyabwveds.supabase.co'
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRobXJ0aWRlaGJtbnlhYnd2ZWRzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAwMDU1MDMsImV4cCI6MjA5NTU4MTUwM30.wMwMbNRP5nwo08sIWcmN7fNyvK1WepfDwAj_tK-BDYY'

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Obtener el usuario autenticado actual
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Escribir/sincronizar la cookie de sesión de Andara para consumo local
  if (user) {
    const sessionData = {
      name: user.user_metadata.full_name || user.email?.split('@')[0] || 'Usuario',
      email: user.email
    }
    const encoded = Buffer.from(JSON.stringify(sessionData)).toString('base64')
    supabaseResponse.cookies.set('andara_session', encoded, {
      path: '/',
      maxAge: 60 * 60 * 24 * 7 // 1 semana
    })
  } else {
    supabaseResponse.cookies.delete('andara_session')
  }

  const path = request.nextUrl.pathname
  const isPublic = path === '/' || path.startsWith('/login') || path.startsWith('/register') || path.startsWith('/auth') || path.startsWith('/api')

  if (!user && !isPublic) {
    // Si no hay usuario y no es una ruta pública, redirigir a /login
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
