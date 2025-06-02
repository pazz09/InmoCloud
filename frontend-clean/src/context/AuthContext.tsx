import { token_t, user_role_enum_t, UserRoleEnum } from '@/backend/types';
import { jwtDecode } from 'jwt-decode';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type AuthContextType = {
  isAuthenticated: boolean;
  login: (token: string) => void;
  logout: () => void;
  role: user_role_enum_t
};

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  role: UserRoleEnum.ARRENDATARIO,
  login: () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  // TODO: Change with NO_SESSION user
  const [role, setRole] = useState(UserRoleEnum.SIN_SESION)

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded: token_t = jwtDecode(token);
        setIsAuthenticated(true);
        setRole(decoded.role); // adjust key as per your JWT payload
      } catch (error) {
        console.error('Invalid token');
        logout(); // clear bad token
      }
    }
  }, []);

  const login = (token: string) => {
    localStorage.setItem('token', token);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ role, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
