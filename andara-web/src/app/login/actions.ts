'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()

  // Evita crash si las variables de entorno no existen (modo vista previa local)
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    console.log("Modo de desarrollo: Simulando login")
    redirect('/')
  }

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    redirect('/login?error=true')
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    console.log("Modo de desarrollo: Simulando registro")
    redirect('/')
  }

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    options: {
      data: {
        full_name: formData.get('name') as string,
      }
    }
  }

  const { error } = await supabase.auth.signUp(data)

  if (error) {
    redirect('/register?error=true')
  }

  // Despues de registrar, podemos redirigir a una pagina de espera o dashboard
  revalidatePath('/', 'layout')
  redirect('/')
}

export async function logout() {
  const supabase = await createClient()
  
  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    await supabase.auth.signOut()
  }
  
  revalidatePath('/', 'layout')
  redirect('/login')
}
