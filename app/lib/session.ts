import 'server-only'
import { JWTPayload, SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { SessionPayload } from './definitions'
import { cache } from 'react'
import { redirect } from 'next/navigation'

const secretKey = process.env.JWT_SECRET
const encodedKey = new TextEncoder().encode(secretKey)
const hour = 60 * 60 * 1000;
const day = 24 * hour;
 
export async function encrypt(payload: SessionPayload) {
  console.log("ENCRYPT serverside","payload", payload);
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('2h')
    .sign(encodedKey)
}
 
export async function decrypt(session: string | undefined = '') {
  try {
    const { payload } = await jwtVerify(session, encodedKey, {
      algorithms: ['HS256'],
    })
    return payload as SessionPayload
  } catch (error) {
    console.log('Failed to verify session')
  }
}

export async function createSession(id: string) {
  const session = await encrypt({ id })
  console.log("CREATE SESSION serverside","session", session);
  const cookieStore = await cookies()
  const expiresAt = new Date(Date.now() + 2*hour)
 
  cookieStore.set('freewise-session', session, {
    httpOnly: true,
    secure: false, // TODO: set to true in production
    expires: expiresAt,
    sameSite: 'lax',
    path: '/',
  })
}

export async function updateSession() {
  const cookieStore = await cookies()
  const session = cookieStore.get('freewise-session')?.value
  const payload = await decrypt(session)
 
  if (!session || !payload) {
    return null
  }
 
  const expires = new Date(Date.now() + 2*hour)
 
  cookieStore.set('freewise-session', session, {
    httpOnly: true,
    secure: true,
    expires: expires,
    sameSite: 'lax',
    path: '/',
  })
}

export async function deleteSession() {
  const cookieStore = await cookies()
  cookieStore.delete('freewise-session')
}

export const verifySession = cache(async () => {
  const cookieStore = await cookies()
  const session = cookieStore.get('freewise-session')?.value
  const payload = await decrypt(session)
 
  if (!payload?.id) {
    redirect('/login')
  }
 
  return { isAuth: true, id: payload.id }
})