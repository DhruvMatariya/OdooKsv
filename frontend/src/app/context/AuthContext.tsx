import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

export type UserRole = 'procurement' | 'vendor' | 'manager' | 'admin';

export interface AuthUser {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: UserRole;
  country: string;
  avatarInitials: string;
  company?: string;
  companyName?: string;
  gstNumber?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (data: SignupData) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

export interface SignupData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: UserRole;
  country: string;
  companyName?: string;
  gstNumber?: string;
  additionalInfo?: string;
  username?: string;
  password?: string;
}

const API_URL = 'http://localhost:3001/api';

const AuthContext = createContext<AuthContextType | null>(null);

function getStoredSession(): { user: AuthUser | null; token: string | null } {
  try {
    const token = localStorage.getItem('vb_token');
    const userStr = localStorage.getItem('vb_user');
    if (!token || !userStr) return { user: null, token: null };
    const user = JSON.parse(userStr);
    return { user, token };
  } catch {
    return { user: null, token: null };
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const stored = getStoredSession();
  const [user, setUser] = useState<AuthUser | null>(stored.user);
  const [token, setToken] = useState<string | null>(stored.token);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const json = await res.json();
      
      if (!res.ok || !json.success) {
        return { success: false, error: json.error || json.message || 'Login failed' };
      }

      const { user: backendUser, token: jwt } = json.data;
      
      const safeUser: AuthUser = {
        ...backendUser,
        username: backendUser.email.split('@')[0],
        avatarInitials: `${backendUser.firstName?.[0] || ''}${backendUser.lastName?.[0] || ''}`.toUpperCase(),
        role: backendUser.role.toLowerCase(),
      };

      localStorage.setItem('vb_token', jwt);
      localStorage.setItem('vb_user', JSON.stringify(safeUser));
      setUser(safeUser);
      setToken(jwt);
      return { success: true };
    } catch (err) {
      return { success: false, error: 'Network error during login' };
    }
  }, []);

  const signup = useCallback(async (data: SignupData) => {
    try {
      const roleMapping: Record<string, string> = {
        'procurement': 'PROCUREMENT_OFFICER',
        'vendor': 'VENDOR',
        'manager': 'MANAGER',
        'admin': 'ADMIN',
      };

      const payload = {
        ...data,
        role: roleMapping[data.role] || data.role.toUpperCase(),
      };

      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();

      if (!res.ok || !json.success) {
        // Validation errors might come as an array
        let errorMsg = json.error || json.message || 'Signup failed';
        if (Array.isArray(json.errors) && json.errors.length > 0) {
          errorMsg = json.errors[0].msg || errorMsg;
        }
        return { success: false, error: errorMsg };
      }

      const { user: backendUser, token: jwt } = json.data;
      
      const newUser: AuthUser = {
        ...backendUser,
        username: backendUser.email.split('@')[0],
        avatarInitials: `${backendUser.firstName?.[0] || ''}${backendUser.lastName?.[0] || ''}`.toUpperCase(),
        role: backendUser.role.toLowerCase(),
      };

      localStorage.setItem('vb_token', jwt);
      localStorage.setItem('vb_user', JSON.stringify(newUser));
      setUser(newUser);
      setToken(jwt);
      return { success: true };
    } catch (err) {
      return { success: false, error: 'Network error during signup' };
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('vb_token');
    localStorage.removeItem('vb_user');
    setUser(null);
    setToken(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export const roleLabels: Record<UserRole, string> = {
  procurement: 'Procurement Officer',
  vendor: 'Vendor',
  manager: 'Manager',
  admin: 'Administrator',
};

// Demo credentials helper removed
