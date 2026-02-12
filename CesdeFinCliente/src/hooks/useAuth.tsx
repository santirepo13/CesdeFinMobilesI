import { useState, useEffect, createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import type { User } from '../services/authService';
import { login, register, logout, checkAuthStatus } from '../services/authService';
import { getBalance } from '../services/bankingService';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (identifier: string, clave: string) => Promise<{ success: boolean; message: string }>;
  register: (usuario: string, clave: string, nombre: string, correo: string) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<{ success: boolean; message: string }>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check authentication status on component mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await checkAuthStatus();
        if (response.authenticated && response.user) {
          // Try to get the freshest balance from the banking API (avoids relying solely on session copy)
          try {
            const balanceRes = await getBalance();
            if (balanceRes.success) {
              setUser({ ...response.user, saldo: balanceRes.balance });
            } else {
              setUser(response.user);
            }
          } catch (err) {
            console.error('Failed to fetch balance during auth check:', err);
            setUser(response.user);
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Login function
  const handleLogin = async (identifier: string, clave: string) => {
    try {
      const response = await login(identifier, clave);
      if (response.success && response.user) {
        setUser(response.user);
      }
      return {
        success: response.success,
        message: response.message
      };
    } catch (error) {
      console.error('Login failed:', error);
      return {
        success: false,
        message: 'Error al iniciar sesión'
      };
    }
  };

  // Register function
  const handleRegister = async (usuario: string, clave: string, nombre: string, correo: string) => {
    try {
      const response = await register(usuario, clave, nombre, correo);
      if (response.success && response.user) {
        setUser(response.user);
      }
      return {
        success: response.success,
        message: response.message
      };
    } catch (error) {
      console.error('Registration failed:', error);
      return {
        success: false,
        message: 'Error al registrar usuario'
      };
    }
  };

  // Logout function
  const handleLogout = async () => {
    try {
      const response = await logout();
      if (response.success) {
        setUser(null);
      }
      return {
        success: response.success,
        message: response.message
      };
    } catch (error) {
      console.error('Logout failed:', error);
      return {
        success: false,
        message: 'Error al cerrar sesión'
      };
    }
  };

  // Refresh user data
  const refreshUser = async () => {
    try {
      const response = await checkAuthStatus();
      if (response.authenticated && response.user) {
        setUser(response.user);
      }
    } catch (error) {
      console.error('Failed to refresh user data:', error);
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    refreshUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
