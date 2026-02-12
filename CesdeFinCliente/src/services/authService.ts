// Authentication service for API calls
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export interface User {
  id: string;
  usuario: string;
  nombre: string;
  correo: string;
  saldo: number;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  user?: User;
  error?: string;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  user?: User;
  error?: string;
}

export interface AuthStatusResponse {
  authenticated: boolean;
  user?: User;
}

// Login user
export const login = async (identifier: string, clave: string): Promise<LoginResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ identifier, clave }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      return {
        success: false,
        message: data.error || 'Error al iniciar sesión',
        error: data.error || 'Error al iniciar sesión'
      };
    }

    return {
      success: true,
      message: data.message || 'Inicio de sesión exitoso',
      user: data.user
    };
  } catch (error) {
    console.error('Login error:', error);
    return {
      success: false,
      message: 'Error de conexión al servidor',
      error: 'Error de conexión al servidor'
    };
  }
};

// Register new user
export const register = async (
  usuario: string,
  clave: string,
  nombre: string,
  correo: string
): Promise<RegisterResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ usuario, clave, nombre, correo }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      return {
        success: false,
        message: data.error || 'Error al registrar usuario',
        error: data.error || 'Error al registrar usuario'
      };
    }

    return {
      success: true,
      message: data.message || 'Usuario registrado exitosamente',
      user: data.user
    };
  } catch (error) {
    console.error('Register error:', error);
    return {
      success: false,
      message: 'Error de conexión al servidor',
      error: 'Error de conexión al servidor'
    };
  }
};

// Logout user
export const logout = async (): Promise<{ success: boolean; message: string; error?: string }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    });

    const data = await response.json();
    
    if (!response.ok) {
      return {
        success: false,
        message: data.error || 'Error al cerrar sesión',
        error: data.error || 'Error al cerrar sesión'
      };
    }

    return {
      success: true,
      message: data.message || 'Sesión cerrada exitosamente'
    };
  } catch (error) {
    console.error('Logout error:', error);
    return {
      success: false,
      message: 'Error de conexión al servidor',
      error: 'Error de conexión al servidor'
    };
  }
};

// Check authentication status
export const checkAuthStatus = async (): Promise<AuthStatusResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/status`, {
      method: 'GET',
      credentials: 'include',
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Auth status check error:', error);
    return {
      authenticated: false
    };
  }
};

// Password validation function
export const validatePassword = (password: string): boolean => {
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

// Get password validation error message
export const getPasswordValidationError = (password: string): string => {
  if (!password) {
    return 'La contraseña es obligatoria';
  }
  
  if (password.length < 8) {
    return 'La contraseña debe tener al menos 8 caracteres';
  }
  
  if (!/[A-Z]/.test(password)) {
    return 'La contraseña debe tener al menos una letra mayúscula';
  }
  
  if (!/[a-z]/.test(password)) {
    return 'La contraseña debe tener al menos una letra minúscula';
  }
  
  if (!/\d/.test(password)) {
    return 'La contraseña debe tener al menos un número';
  }
  
  if (!/[@$!%*?&]/.test(password)) {
    return 'La contraseña debe tener al menos un carácter especial (@, $, !, %, *, ?, &)';
  }
  
  return '';
};