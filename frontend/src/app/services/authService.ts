import api from '../lib/api';

export interface LoginResponse {
  access: string;
  refresh: string;
  employee: {
    id: number;
    username: string;
    email: string;
    role: 'MANAGER' | 'CASHIER';
    role_display: string;
    is_manager: boolean;
    full_name: string;
  };
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export const authService = {
  /**
   * Login with username and password
   */
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/auth/login/', credentials);

    // Store tokens in localStorage
    localStorage.setItem('access_token', response.data.access);
    localStorage.setItem('refresh_token', response.data.refresh);

    return response.data;
  },

  /**
   * Logout - blacklist refresh token
   */
  async logout(): Promise<void> {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        await api.post('/auth/logout/', { refresh: refreshToken });
      }
    } catch (error) {
      // Even if logout API fails, we still clear local tokens
      console.error('Logout API error:', error);
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    }
  },

  /**
   * Refresh access token
   */
  async refreshToken(): Promise<string> {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await api.post<{ access: string }>('/auth/token/refresh/', {
      refresh: refreshToken,
    });

    localStorage.setItem('access_token', response.data.access);
    return response.data.access;
  },

  /**
   * Get current user profile
   */
  async getProfile() {
    const response = await api.get('/profile/');
    return response.data;
  },

  /**
   * Check if user is authenticated (has valid tokens)
   */
  isAuthenticated(): boolean {
    return !!localStorage.getItem('access_token');
  },

  /**
   * Get stored access token
   */
  getAccessToken(): string | null {
    return localStorage.getItem('access_token');
  },
};

export default authService;
