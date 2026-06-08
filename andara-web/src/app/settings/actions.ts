'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateProfile(formData: FormData) {
  const supabase = await createClient()
  
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    console.log("Modo de desarrollo: Simulando actualización de perfil")
    return
  }

  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    console.error('No autorizado')
    return
  }

  const name = formData.get('name') as string
  const bio = formData.get('bio') as string
  const location = formData.get('location') as string
  const whatsapp_link = formData.get('whatsapp_link') as string

  const { error } = await supabase
    .from('profiles')
    .upsert({
      id: user.id,
      email: user.email,
      name,
      bio,
      location,
      whatsapp_link,
      updated_at: new Date().toISOString(),
    })

  if (error) {
    console.error(error.message)
    return
  }

  revalidatePath('/settings')
}
