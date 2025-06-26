'use server';

import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

// WARNING: Using a default secret for development.
// It is NOT secure for production. Please set JWT_SECRET_KEY in your .env file.
const secretKey = process.env.JWT_SECRET_KEY || 'this-is-a-default-dev-secret-and-should-be-changed';

if (!process.env.JWT_SECRET_KEY && process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET_KEY is not set in environment variables for production.');
}
const key = new TextEncoder().encode(secretKey);

// Encrypts a JWT with a 1 hour expiration and a custom expires field for inactivity
export async function encrypt(payload: any) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1h') // 1 hour expiration (absolute)
    .sign(key);
}

// Decrypts and checks for inactivity expiry
export async function decrypt(input: string): Promise<any> {
  try {
    const { payload } = await jwtVerify(input, key, {
      algorithms: ['HS256'],
    });
    // Check for custom expires field (for inactivity)
    if (payload.expires && Date.now() > new Date(payload.expires as string).getTime()) {
      return null;
    }
    return payload;
  } catch (error) {
    return null; // Invalid token or expired
  }
}

// Creates a session with 1 hour expiry
export async function login(userId: string, role: 'admin' | 'doctor' | 'patient') {
  // Set expiry to 1 hour from now
  const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
  const session = await encrypt({ userId, role, expires });

  // Save the session in a cookie
  const cookieStore = await cookies();
  cookieStore.set('session', session, { expires, httpOnly: true, path: '/' });
}

export async function logout() {
  // Destroy the session
  const cookieStore = await cookies();
  cookieStore.set('session', '', { expires: new Date(0) });
}

// Only read and validate the session; do not refresh cookies here
export async function getSession() {
  const cookieStore = await cookies();
  const session = cookieStore.get('session')?.value;
  if (!session) return null;
  const payload = await decrypt(session);
  if (!payload) return null;
  return payload;
}
