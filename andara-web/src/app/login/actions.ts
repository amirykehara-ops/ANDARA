'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import fs from 'fs/promises'
import path from 'path'

const DB_PATH = path.join(process.cwd(), '.andara_users.json')

type User = { name: string; email: string; passwordHash: string }

async function getDb(): Promise<Record<string, User>> {
  try {
    const data = await fs.readFile(DB_PATH, 'utf8')
    return JSON.parse(data)
  } catch (error) {
    // If file doesn't exist, start with empty DB
    return {}
  }
}

async function saveDb(db: Record<string, User>) {
  await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2), 'utf8')
}

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
  
  const db = await getDb()
  const user = db[email]

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

  revalidatePath('/')
  redirect('/dashboard')
}

export async function signup(formData: FormData) {
  const name = formData.get('name') as string
  const email = (formData.get('email') as string).toLowerCase()
  const password = formData.get('password') as string

  const db = await getDb()

  if (db[email]) {
    redirect('/register?error=exists')
  }

  db[email] = { name, email, passwordHash: hashPassword(password) }
  await saveDb(db)

  const cookieStore = await cookies()
  cookieStore.set('andara_session', Buffer.from(JSON.stringify({ name, email })).toString('base64'), {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  })

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function logout() {
  const cookieStore = await cookies()
  cookieStore.delete('andara_session')
  revalidatePath('/', 'layout')
  redirect('/login')
}
