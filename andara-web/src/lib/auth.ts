import { cookies } from 'next/headers'

export async function getSession(): Promise<{ name: string; email: string } | null> {
  const cookieStore = await cookies()
  const session = cookieStore.get('andara_session')
  if (!session) return null
  try {
    return JSON.parse(Buffer.from(session.value, 'base64').toString('utf-8'))
  } catch {
    return null
  }
}
