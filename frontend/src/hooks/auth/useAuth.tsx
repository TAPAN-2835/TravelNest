import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../../types';
import { authApi } from '../../api/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (data: any) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    try {
      const { data } = await authApi.getMe();
      setUser(data);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('jwt_token');
    if (token) {
      checkAuth();
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (data: any) => {
    const { data: authData } = await authApi.login(data);
    localStorage.setItem('jwt_token', authData.accessToken);
    setUser(authData.user);
  };

  const logout = () => {
    localStorage.removeItem('jwt_token');
    setUser(null);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
