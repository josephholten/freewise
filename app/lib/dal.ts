import 'server-only'
 
import { cookies } from 'next/headers'
import { decrypt } from '@/app/lib/session'
import { cache } from 'react'
import { redirect } from 'next/navigation'

export const verifySession = cache(async () => {
  const cookieStore = await cookies()
  const session = cookieStore.get('freewise-session')?.value
  const payload = await decrypt(session)
 
  if (!payload?.id) {
    redirect('/login')
  }
 
  return { isAuth: true, id: payload.id }
})