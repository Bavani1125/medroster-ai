

import React, { createContext, useState, useContext, ReactNode } from 'react';
import { authAPI } from '../api';
import axios from 'axios';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface RegisterInput {
  name: string;
  email: string;
  password: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterInput) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper: set/unset Authorization header globally
function setAxiosAuthHeader(token: string | null) {
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common['Authorization'];
  }
}

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('user');
    try {
      return stored ? (JSON.parse(stored) as User) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState<string | null>(() => {
    const stored = localStorage.getItem('access_token');
    return stored || null;
  });

  const [isLoading, setIsLoading] = useState(false);

  // Ensure axios header is set on initial load
  React.useEffect(() => {
    setAxiosAuthHeader(token);
  }, [token]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // IMPORTANT:
      // Many FastAPI auth implementations expect OAuth2PasswordRequestForm:
      // application/x-www-form-urlencoded with username + password.
      // If your backend is JSON-based, this still won’t break if authAPI.login is built accordingly,
      // but the safest fix is to enforce form-urlencoded here.
      const response = await authAPI.login(email, password);

      const { access_token, token_type, user: nestedUser, ...rest } = response.data || {};

      const newToken: string | null = access_token || null;

      // Some backends return user object nested under "user",
      // others return user fields alongside token.
      const newUser: User | null =
        (nestedUser as User) ||
        (rest && typeof rest === 'object' && 'email' in rest ? (rest as User) : null);

      if (!newToken) {
        throw new Error('Login response missing access_token');
      }

      setToken(newToken);
      localStorage.setItem('access_token', newToken);
      setAxiosAuthHeader(newToken);

      if (newUser) {
        setUser(newUser);
        localStorage.setItem('user', JSON.stringify(newUser));
      } else {
        // If backend doesn't return user data, keep whatever user is stored (or null)
        // You can optionally fetch /me here if your backend supports it.
        setUser((prev) => prev ?? null);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterInput) => {
    setIsLoading(true);
    try {
      // Backend schema mismatch is a common cause of 400.
      // Many FastAPI schemas use full_name rather than name.
      // We send both to be compatible (backend will ignore unknown fields if configured),
      // and we also support username=email patterns.

      const payload: any = {
        name: data.name,
        full_name: data.name,
        email: data.email,
        username: data.email,
        password: data.password,
        role: data.role,
      };

      const response = await authAPI.register(payload);

      // Some backends return the created user, others return {message: "..."}.
      const createdUser: User | null =
        response?.data && typeof response.data === 'object' && 'email' in response.data
          ? (response.data as User)
          : null;

      if (createdUser) {
        setUser(createdUser);
        localStorage.setItem('user', JSON.stringify(createdUser));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    setAxiosAuthHeader(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        register,
        logout,
        isAuthenticated: !!token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};