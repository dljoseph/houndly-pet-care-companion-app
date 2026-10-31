import type { AuthError } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

const GENERIC_ERROR = 'Something went wrong. Please try again.';
const NETWORK_ERROR = "We couldn't reach Houndly. Check your connection and try again.";

export function describeAuthError(error: unknown): string {
  if (error instanceof TypeError) return NETWORK_ERROR;
  const authError = error as AuthError | null;
  const message = authError?.message?.toLowerCase() ?? '';
  if (message.includes('invalid login credentials')) return "That email and password don't match. Try again.";
  if (message.includes('user already registered') || message.includes('already been registered')) {
    return 'An account with this email already exists. Log in instead.';
  }
  if (message.includes('password')) return 'Your password needs to be at least 8 characters.';
  if (message.includes('rate limit') || message.includes('too many')) {
    return 'Too many attempts. Wait a few minutes and try again.';
  }
  return GENERIC_ERROR;
}

export async function signUpWithEmail(email: string, password: string): Promise<boolean> {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  return data.session !== null;
}

export async function signInWithEmail(email: string, password: string): Promise<void> {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
}

export async function signOutOfHoundly(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}
