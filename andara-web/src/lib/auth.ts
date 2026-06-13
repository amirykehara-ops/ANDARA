import { cookies } from 'next/headers'

export async function getSession(): Promise<{ name: string; email: string } | null> {
  const cookieStore = await cookies()
  const session = cookieStore.get('andara_session')
  if (!session) return null
  try {
    let val = session.value.trim()
    if (val.startsWith('"') && val.endsWith('"')) {
      val = val.slice(1, -1)
    }
    val = decodeURIComponent(val)
    if (val.startsWith('"') && val.endsWith('"')) {
      val = val.slice(1, -1)
    }
    return JSON.parse(Buffer.from(val, 'base64').toString('utf-8'))
  } catch {
    return null
  }
}

