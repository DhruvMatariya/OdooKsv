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
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
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
  additionalInfo?: string;
  username?: string;
  password?: string;
}

// Mock user store (in real Next.js: this would be a DB + bcrypt)
const MOCK_USERS: Array<AuthUser & { password: string }> = [
  {
    id: 'usr_001',
    username: 'james.donovan',
    password: 'password123',
    firstName: 'James',
    lastName: 'Donovan',
    email: 'james@vendorbridge.in',
    phone: '+91 98765 43210',
    role: 'procurement',
    country: 'India',
    avatarInitials: 'JD',
    company: 'VendorBridge Corp.',
  },
  {
    id: 'usr_002',
    username: 'techparts.vendor',
    password: 'vendor123',
    firstName: 'Sunita',
    lastName: 'Patel',
    email: 'sunita@techparts.in',
    phone: '+91 87654 32109',
    role: 'vendor',
    country: 'India',
    avatarInitials: 'SP',
    company: 'TechParts Ltd',
  },
  {
    id: 'usr_003',
    username: 'sarah.manager',
    password: 'manager123',
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 'sarah@vendorbridge.in',
    phone: '+91 76543 21098',
    role: 'manager',
    country: 'India',
    avatarInitials: 'SJ',
    company: 'VendorBridge Corp.',
  },
  {
    id: 'usr_004',
    username: 'admin',
    password: 'admin123',
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@vendorbridge.in',
    phone: '+91 65432 10987',
    role: 'admin',
    country: 'India',
    avatarInitials: 'AU',
    company: 'VendorBridge Corp.',
  },
];

// Mock JWT utilities (in real Next.js: use `jose` or `jsonwebtoken` server-side)
function createMockJWT(user: AuthUser): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(
    JSON.stringify({
      sub: user.id,
      username: user.username,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 86400, // 24h
    })
  );
  const signature = btoa(`vendorbridge-secret-${user.id}`);
  return `${header}.${payload}.${signature}`;
}

function parseJWT(token: string): AuthUser | null {
  try {
    const [, payload] = token.split('.');
    const decoded = JSON.parse(atob(payload));
    if (decoded.exp * 1000 < Date.now()) return null;
    const found = MOCK_USERS.find(u => u.id === decoded.sub);
    return found ? { ...found, password: undefined as any } : null;
  } catch {
    return null;
  }
}

const AuthContext = createContext<AuthContextType | null>(null);

function getStoredSession(): { user: AuthUser | null; token: string | null } {
  try {
    const token = localStorage.getItem('vb_token');
    if (!token) return { user: null, token: null };
    const user = parseJWT(token);
    return user ? { user, token } : { user: null, token: null };
  } catch {
    return { user: null, token: null };
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const stored = getStoredSession();
  const [user, setUser] = useState<AuthUser | null>(stored.user);
  const [token, setToken] = useState<string | null>(stored.token);

  const login = useCallback(async (username: string, password: string) => {
    // Simulate network delay (in Next.js: POST /api/auth/login)
    await new Promise(r => setTimeout(r, 400));

    const found = MOCK_USERS.find(
      u => u.username === username.trim().toLowerCase() && u.password === password
    );

    if (!found) {
      return { success: false, error: 'Invalid username or password' };
    }

    const { password: _, ...safeUser } = found;
    const jwt = createMockJWT(safeUser);
    localStorage.setItem('vb_token', jwt);
    setUser(safeUser);
    setToken(jwt);
    return { success: true };
  }, []);

  const signup = useCallback(async (data: SignupData) => {
    await new Promise(r => setTimeout(r, 600));

    const newUser: AuthUser = {
      id: `usr_${Date.now()}`,
      username: data.username || data.email.split('@')[0],
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      role: data.role,
      country: data.country,
      avatarInitials: `${data.firstName[0]}${data.lastName[0]}`.toUpperCase(),
    };

    const jwt = createMockJWT(newUser);
    localStorage.setItem('vb_token', jwt);
    setUser(newUser);
    setToken(jwt);
    return { success: true };
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('vb_token');
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
  manager: 'Manager / Approver',
  admin: 'Administrator',
};

// Demo credentials helper
export const demoCredentials: Array<{ role: UserRole; username: string; password: string }> = [
  { role: 'procurement', username: 'james.donovan', password: 'password123' },
  { role: 'vendor', username: 'techparts.vendor', password: 'vendor123' },
  { role: 'manager', username: 'sarah.manager', password: 'manager123' },
  { role: 'admin', username: 'admin', password: 'admin123' },
];
