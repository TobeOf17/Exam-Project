import { create } from 'zustand';
import { authService, LoginResponse } from '../services/authService';

export type UserRole = 'manager' | 'cashier';

export interface User {
  id: number;
  username: string;
  email: string;
  role: UserRole;
  name: string;
  isManager: boolean;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthActions {
  login: (username: string, password: string) => Promise<{ success: boolean; role?: UserRole; error?: string }>;
  logout: () => Promise<void>;
  clearError: () => void;
  initializeAuth: () => void;
}

type AuthStore = AuthState & AuthActions;

// Helper to map backend role to frontend role
const mapRole = (backendRole: 'MANAGER' | 'CASHIER'): UserRole => {
  return backendRole.toLowerCase() as UserRole;
};

// Helper to map login response to User
const mapLoginResponseToUser = (employee: LoginResponse['employee']): User => {
  return {
    id: employee.id,
    username: employee.username,
    email: employee.email,
    role: mapRole(employee.role),
    name: employee.full_name || employee.username,
    isManager: employee.is_manager,
  };
};

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: async (username: string, password: string) => {
    set({ isLoading: true, error: null });

    try {
      const response = await authService.login({ username, password });
      const user = mapLoginResponseToUser(response.employee);

      set({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      return { success: true, role: user.role };
    } catch (error: unknown) {
      let errorMessage = 'Login failed. Please try again.';

      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { detail?: string }; status?: number } };
        if (axiosError.response?.data?.detail) {
          errorMessage = axiosError.response.data.detail;
        } else if (axiosError.response?.status === 401) {
          errorMessage = 'Invalid username or password';
        }
      }

      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: errorMessage,
      });

      return { success: false, error: errorMessage };
    }
  },

  logout: async () => {
    set({ isLoading: true });

    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    }
  },

  clearError: () => {
    set({ error: null });
  },

  // Initialize auth state from localStorage on app load
  initializeAuth: () => {
    if (typeof window === 'undefined') return;

    const token = localStorage.getItem('access_token');
    if (token) {
      // We have a token, but we need to validate it
      // For now, we'll just set isAuthenticated to true
      // A better approach would be to call getProfile() to validate
      set({ isAuthenticated: true });

      // Optionally fetch user profile to validate token and get user data
      authService.getProfile()
        .then((profile) => {
          const user: User = {
            id: profile.id,
            username: profile.username,
            email: profile.email,
            role: mapRole(profile.role),
            name: `${profile.first_name} ${profile.last_name}`.trim() || profile.username,
            isManager: profile.is_manager,
          };
          set({ user, isAuthenticated: true });
        })
        .catch(() => {
          // Token is invalid, clear auth state
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          set({ user: null, isAuthenticated: false });
        });
    }
  },
}));
