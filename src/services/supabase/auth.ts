import { AuthError, Session, User } from '@supabase/supabase-js';
import { getSupabaseClient, supabase } from './client';

export interface AuthResult {
  user: User | null;
  session: Session | null;
}

export interface AuthServiceError {
  message: string;
  code?: string;
}

function formatError(error: AuthError): AuthServiceError {
  // Map common Supabase auth errors to user-friendly messages
  const errorMessages: Record<string, string> = {
    'invalid_credentials': 'Invalid email or password',
    'email_not_confirmed': 'Please verify your email address',
    'user_already_exists': 'An account with this email already exists',
    'weak_password': 'Password is too weak. Use at least 6 characters.',
    'invalid_email': 'Please enter a valid email address',
  };

  const message = errorMessages[error.code || ''] || error.message;
  return { message, code: error.code };
}

export const authService = {
  /**
   * Sign up a new user with email and password.
   * User will receive a verification email.
   */
  async signUp(email: string, password: string): Promise<AuthResult> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      throw formatError(error);
    }

    return {
      user: data.user,
      session: data.session,
    };
  },

  /**
   * Sign in an existing user with email and password.
   * Will fail if email is not verified.
   */
  async signIn(email: string, password: string): Promise<AuthResult> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw formatError(error);
    }

    return {
      user: data.user,
      session: data.session,
    };
  },

  /**
   * Sign out the current user.
   */
  async signOut(): Promise<void> {
    const supabase = getSupabaseClient();
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw formatError(error);
    }
  },

  /**
   * Send a password reset email.
   */
  async resetPassword(email: string): Promise<void> {
    const supabase = getSupabaseClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      // Redirect URL for password reset - update when web version is ready
      redirectTo: 'https://marathontrainingplan.com/reset-password',
    });

    if (error) {
      throw formatError(error);
    }
  },

  /**
   * Get the current session if one exists.
   */
  async getSession(): Promise<Session | null> {
    if (!supabase) return null;
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.error('Error getting session:', error);
      return null;
    }
    return data.session;
  },

  /**
   * Get the current user if authenticated.
   */
  async getUser(): Promise<User | null> {
    if (!supabase) return null;
    const { data, error } = await supabase.auth.getUser();
    if (error) {
      return null;
    }
    return data.user;
  },

  /**
   * Subscribe to auth state changes.
   * Returns an unsubscribe function.
   */
  onAuthStateChange(
    callback: (event: string, session: Session | null) => void
  ): () => void {
    if (!supabase) return () => {};
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      callback(event, session);
    });

    return () => {
      data.subscription.unsubscribe();
    };
  },

  /**
   * Resend verification email to the user.
   */
  async resendVerificationEmail(email: string): Promise<void> {
    const supabase = getSupabaseClient();
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
    });

    if (error) {
      throw formatError(error);
    }
  },
};
