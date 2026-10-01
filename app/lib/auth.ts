// lib/auth.ts
// Firebase Authentication service — clean, stable, easy to maintain

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
  User,
} from 'firebase/auth';
import { auth } from './firebase';

/**
 * Sign in with email and password.
 * @returns The authenticated user on success.
 */
export async function signIn(email: string, password: string): Promise<User> {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
}

/**
 * Create a new account with email and password.
 * @returns The newly created user on success.
 */
export async function signUp(email: string, password: string, displayName?: string): Promise<User> {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  if (displayName) {
    await updateProfile(cred.user, { displayName });
  }
  return cred.user;
}

/**
 * Sign out the currently authenticated user.
 */
export async function signOut(): Promise<void> {
  await firebaseSignOut(auth);
}

/**
 * Listen for auth state changes on mount.
 * Returns an unsubscribe function.
 *
 * Usage in a React component:
 *   useEffect(() => {
 *     const unsub = onAuthChange((user) => { ... });
 *     return unsub;
 *   }, []);
 */
export function onAuthChange(callback: (user: User | null) => void): () => void {
  return onAuthStateChanged(auth, callback);
}

export type { User };
