import { create } from 'zustand';
import { Session, User } from '@supabase/supabase-js';
import { authService, AuthServiceError } from '../services/supabase/auth';

interface AuthState {
  // State
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;

  // Computed
  userEmail: string | null;
  isEmailVerified: boolean;

  // Actions
  initialize: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<boolean>;
  signUp: (email: string, password: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<boolean>;
  resendVerification: (email: string) => Promise<boolean>;
  clearError: () => void;
  setSession: (session: Session | null) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  // Initial state
  user: null,
  session: null,
  isLoading: true,
  isAuthenticated: false,
  error: null,

  // Computed getters
  get userEmail() {
    return get().user?.email || null;
  },

  get isEmailVerified() {
    const user = get().user;
    return user?.email_confirmed_at != null;
  },

  // Initialize auth state and listen for changes
  initialize: async () => {
    try {
      // Get current session
      const session = await authService.getSession();

      set({
        session,
        user: session?.user || null,
        isAuthenticated: !!session,
        isLoading: false,
      });

      // Listen for auth state changes
      authService.onAuthStateChange((event, session) => {
        console.log('Auth state changed:', event);

        set({
          session,
          user: session?.user || null,
          isAuthenticated: !!session,
        });

        // Handle specific events
        if (event === 'SIGNED_OUT') {
          set({ error: null });
        }
      });
    } catch (error) {
      console.error('Error initializing auth:', error);
      set({ isLoading: false });
    }
  },

  // Sign in with email and password
  signIn: async (email: string, password: string): Promise<boolean> => {
    set({ isLoading: true, error: null });

    try {
      const { user, session } = await authService.signIn(email, password);

      set({
        user,
        session,
        isAuthenticated: !!session,
        isLoading: false,
      });

      return true;
    } catch (error) {
      const authError = error as AuthServiceError;
      set({
        error: authError.message,
        isLoading: false,
      });
      return false;
    }
  },

  // Sign up with email and password
  signUp: async (email: string, password: string): Promise<boolean> => {
    set({ isLoading: true, error: null });

    try {
      const { user, session } = await authService.signUp(email, password);

      // Note: session may be null if email verification is required
      set({
        user,
        session,
        isAuthenticated: !!session,
        isLoading: false,
      });

      return true;
    } catch (error) {
      const authError = error as AuthServiceError;
      set({
        error: authError.message,
        isLoading: false,
      });
      return false;
    }
  },

  // Sign out
  signOut: async () => {
    set({ isLoading: true, error: null });

    try {
      await authService.signOut();

      set({
        user: null,
        session: null,
        isAuthenticated: false,
        isLoading: false,
      });
    } catch (error) {
      const authError = error as AuthServiceError;
      set({
        error: authError.message,
        isLoading: false,
      });
    }
  },

  // Request password reset
  resetPassword: async (email: string): Promise<boolean> => {
    set({ isLoading: true, error: null });

    try {
      await authService.resetPassword(email);
      set({ isLoading: false });
      return true;
    } catch (error) {
      const authError = error as AuthServiceError;
      set({
        error: authError.message,
        isLoading: false,
      });
      return false;
    }
  },

  // Resend verification email
  resendVerification: async (email: string): Promise<boolean> => {
    set({ isLoading: true, error: null });

    try {
      await authService.resendVerificationEmail(email);
      set({ isLoading: false });
      return true;
    } catch (error) {
      const authError = error as AuthServiceError;
      set({
        error: authError.message,
        isLoading: false,
      });
      return false;
    }
  },

  // Clear error message
  clearError: () => {
    set({ error: null });
  },

  // Manually set session (used by auth listener)
  setSession: (session: Session | null) => {
    set({
      session,
      user: session?.user || null,
      isAuthenticated: !!session,
    });
  },
}));

// Selector hooks for common use cases
export const useUser = () => useAuthStore((state) => state.user);
export const useIsAuthenticated = () => useAuthStore((state) => state.isAuthenticated);
export const useAuthLoading = () => useAuthStore((state) => state.isLoading);
export const useAuthError = () => useAuthStore((state) => state.error);
