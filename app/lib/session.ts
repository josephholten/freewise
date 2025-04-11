import 'server-only'
import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { SessionPayload } from './definitions'
import { cache } from 'react'
import { JWSInvalid } from 'jose/errors'

const SECRET_KEY = process.env.JWT_SECRET
const ENCODED_KEY = new TextEncoder().encode(SECRET_KEY)
const hour = 60 * 60 * 1000;

const SESSION_NAME = 'freewise-session'

export async function encrypt(payload: SessionPayload) {
  console.log("ENCRYPT serverside","payload", payload);
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('2h')
    .sign(ENCODED_KEY)
}
 
export async function decrypt(session: string | undefined = '') {
  try {
    const { payload } = await jwtVerify(session, ENCODED_KEY, {
      algorithms: ['HS256'],
    })
    return { isAuth: true, payload: payload as SessionPayload }
  } catch (error) {
    if (error instanceof JWSInvalid) {
      console.log(`session.ts:decrypt: invalid session '${session}'`)
      return { isAuth: false, error: 'JWSInvalid' }
    } else {
      console.error('unknown error', error)
      return { isAuth: false, error: 'unknown error' }
    }
  }
}

export async function createSession(id: string, role: string) {
  const session = await encrypt({ id, role })
  console.log("CREATE SESSION serverside", session);
  const cookieStore = await cookies()
  const expiresAt = new Date(Date.now() + 2*hour)
 
  cookieStore.set(SESSION_NAME, session, {
    httpOnly: true,
    secure: false, // TODO: set to true in production
    expires: expiresAt,
    sameSite: 'lax',
    path: '/',
  })
}

export async function updateSession() {
  const cookieStore = await cookies()
  const session = cookieStore.get(SESSION_NAME)?.value
  const res = await decrypt(session)
 
  if (!session || !res.isAuth) {
    return null
  }
 
  const expires = new Date(Date.now() + 2*hour)
 
  cookieStore.set(SESSION_NAME, session, {
    httpOnly: true,
    secure: true,
    expires: expires,
    sameSite: 'lax',
    path: '/',
  })
}

export async function deleteSession() {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_NAME)
}

export const verifySession = cache(async () => {
  const cookieStore = await cookies()
  const session = cookieStore.get(SESSION_NAME)?.value
  return await decrypt(session)
})

export const verifyAdmin = cache(async () => {
  const res = await verifySession()

  if (!res.isAuth || !res.payload) {
    return { isAuth: false, error: 'INVALID_SESSION' }
  }

  if (res.payload.role !== 'admin') {
    return { isAuth: false, error: 'NOT_ADMIN' }
  }

  return res
})