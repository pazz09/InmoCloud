import { token_decoded_t, token_t, user_role_enum_t, UserRoleEnum } from '@/types';
import { jwtDecode } from 'jwt-decode';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type AuthContextType = {
  isAuthenticated: boolean;
  login: (token: string) => void;
  logout: () => void;
  role: user_role_enum_t;
};

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  role: UserRoleEnum.SIN_SESION,
  login: () => {},
  logout: () => {},
});

const isTokenExpired = (decoded: token_decoded_t): boolean => {
  if (!decoded.exp) return true;
  const now = Date.now() / 1000; // in seconds
  return decoded.exp < now;
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [role, setRole] = useState<user_role_enum_t>(UserRoleEnum.SIN_SESION);
  const [mounted, setMounted] = useState(false); // <-- hydration fix

  useEffect(() => {
    const token = localStorage.getItem('token');
    // console.log('Login token:', token);
    if (token) {
      try {
        const decoded: token_decoded_t = jwtDecode(token);
        if (isTokenExpired(decoded)) throw new Error('Token expired');
        setIsAuthenticated(true);
        setRole(decoded.role);
      } catch (error) {
        console.error('Invalid or expired token');
        logout();
      }
    }
    setMounted(true); // render only after client has mounted
  }, []);

  const login = (token: string) => {
    try {
      const decoded: token_t = jwtDecode(token);
      localStorage.setItem('token', token);
      setIsAuthenticated(true);
      setRole(decoded.role);
    } catch (error) {
      console.error('Login failed: invalid token');
      logout();
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setRole(UserRoleEnum.SIN_SESION);
  };

  if (!mounted) return null; // prevents SSR/client mismatch

  return (
    <AuthContext.Provider value={{ role, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
