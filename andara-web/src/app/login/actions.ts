'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'

const USERS_DB: Record<string, { name: string; email: string; passwordHash: string }> = {}

function simpleHash(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash
  }
  return Math.abs(hash).toString(36)
}

function hashPassword(password: string): string {
  return simpleHash(password + 'andara_salt_2024')
}

export async function login(formData: FormData) {
  const email = (formData.get('email') as string).toLowerCase()
  const password = formData.get('password') as string
  const user = USERS_DB[email]

  if (!user || user.passwordHash !== hashPassword(password)) {
    redirect('/login?error=credentials')
  }

  const cookieStore = await cookies()
  cookieStore.set('andara_session', Buffer.from(JSON.stringify({ name: user.name, email })).toString('base64'), {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  })

  revalidatePath('/', 'layout')
  redirect('/')
}

export async function signup(formData: FormData) {
  const name = formData.get('name') as string
  const email = (formData.get('email') as string).toLowerCase()
  const password = formData.get('password') as string

  if (USERS_DB[email]) {
    redirect('/register?error=exists')
  }

  USERS_DB[email] = { name, email, passwordHash: hashPassword(password) }

  const cookieStore = await cookies()
  cookieStore.set('andara_session', Buffer.from(JSON.stringify({ name, email })).toString('base64'), {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  })

  revalidatePath('/', 'layout')
  redirect('/')
}

export async function logout() {
  const cookieStore = await cookies()
  cookieStore.delete('andara_session')
  revalidatePath('/', 'layout')
  redirect('/login')
}
