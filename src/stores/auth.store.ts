import { create } from 'zustand';
import { api } from '@config/ceoelevator-config';
import { AppConfig } from '@config/ceoelevator-config';
import { TOKEN_KEY, REFRESH_TOKEN_KEY, USER_KEY, TENANT_KEY } from '../utils/constants';

export interface TenantUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  role: string;
  avatarUrl?: string;
  lastLoginAt?: string;
}

export interface TenantInfo {
  id: string;
  code: string;
  companyName: string;
  enabledModules: number;
  moduleNames: string[];
  licenseExpiryDate?: string;
  daysUntilExpiry: number;
}

interface LoginCredentials {
  tenantCode: string;
  email: string;
  password: string;
}

interface LoginResponse {
  jwt: string;
  refreshToken: string;
  sessionExpirationDate: string;
  user: TenantUser;
  tenant: TenantInfo;
}

interface AuthState {
  user: TenantUser | null;
  tenant: TenantInfo | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthActions {
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  initialize: () => void;
  clearError: () => void;
  updateUser: (updates: Partial<TenantUser>) => void;
}

export const useAuthStore = create<AuthState & AuthActions>((set) => ({
  user: null,
  tenant: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  initialize: () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      set({ isAuthenticated: false, user: null, tenant: null });
      return;
    }
    try {
      const userStr = localStorage.getItem(USER_KEY);
      const tenantStr = localStorage.getItem(TENANT_KEY);
      const user = userStr ? JSON.parse(userStr) : null;
      const tenant = tenantStr ? JSON.parse(tenantStr) : null;
      set({ user, tenant, isAuthenticated: !!user });
    } catch {
      set({ isAuthenticated: false, user: null, tenant: null });
    }
  },

  login: async (credentials: LoginCredentials) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post<{ payload: LoginResponse; error: any; hasError: boolean }>(
        `${AppConfig.IAMUrl}/Auth/CeoElevatorLogin`,
        {
          tenantCode: credentials.tenantCode,
          email: credentials.email,
          password: credentials.password,
          platform: 0, // Web
        }
      );

      const { hasError, error, payload } = response.data;

      if (hasError) {
        const errorMessage = error?.code || error?.message || 'Giris basarisiz';
        throw new Error(errorMessage);
      }

      localStorage.setItem(TOKEN_KEY, payload.jwt);
      localStorage.setItem(REFRESH_TOKEN_KEY, payload.refreshToken);
      localStorage.setItem(USER_KEY, JSON.stringify(payload.user));
      localStorage.setItem(TENANT_KEY, JSON.stringify(payload.tenant));

      set({
        user: payload.user,
        tenant: payload.tenant,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (err: any) {
      const msg = err?.response?.data?.error?.code
        || err?.response?.data?.error?.message
        || err?.message
        || 'Giris basarisiz';
      set({
        error: msg,
        isLoading: false,
      });
      throw new Error(msg);
    }
  },

  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(TENANT_KEY);
    set({
      user: null,
      tenant: null,
      isAuthenticated: false,
      isLoading: false,
    });
  },

  clearError: () => set({ error: null }),

  updateUser: (updates: Partial<TenantUser>) => {
    set((state) => {
      if (!state.user) return state;
      const updatedUser = { ...state.user, ...updates };
      localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
      return { user: updatedUser };
    });
  },
}));
