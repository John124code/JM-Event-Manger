import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiService } from '../services/api';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  avatar?: string;
  bio?: string;
  location?: string;
  joinedDate: string;
  isVerified: boolean;
  stats: {
    eventsCreated: number;
    eventsAttended: number;
    totalRatings: number;
    averageRating: number;
  };
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

// Mock user data
const mockUser: User = {
  id: '1',
  name: 'John Doe',
  email: 'john@example.com',
  role: 'admin', // Make default user an admin for testing
  avatar: '/placeholder-avatar.jpg',
  bio: 'Event enthusiast and tech lover',
  location: 'San Francisco, CA',
  joinedDate: '2023-01-15T10:00:00Z',
  isVerified: true,
  stats: {
    eventsCreated: 5,
    eventsAttended: 23,
    totalRatings: 18,
    averageRating: 4.7
  }
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check for existing token and validate on mount
  useEffect(() => {
    const checkAuth = async () => {
      const savedToken = localStorage.getItem('authToken');
      
      if (savedToken) {
        try {
          setLoading(true);
          apiService.setToken(savedToken);
          const response = await apiService.getMe();
          
          if (response.success && response.user) {
            setUser(response.user);
            setToken(savedToken);
          } else {
            // Token is invalid, clear it
            localStorage.removeItem('authToken');
            apiService.clearToken();
          }
        } catch (error) {
          console.error('Auth check failed:', error);
          localStorage.removeItem('authToken');
          apiService.clearToken();
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔄 Attempting real backend login...');
      
      // ONLY use real API login - no more mock data!
      const response = await apiService.login(email, password);
      
      if (response.success && response.user && response.token) {
        console.log('✅ Real backend authentication successful:', response.user);
        setUser(response.user);
        setToken(response.token);
        
        // Save to localStorage
        localStorage.setItem('authUser', JSON.stringify(response.user));
        localStorage.setItem('authToken', response.token);
      } else {
        throw new Error('Login failed - Invalid credentials');
      }
    } catch (err: any) {
      console.error('❌ Backend authentication failed:', err);
      setError(err.message || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiService.register(name, email, password);
      
      if (response.success && response.user && response.token) {
        setUser(response.user);
        setToken(response.token);
        
        // Save to localStorage  
        localStorage.setItem('authUser', JSON.stringify(response.user));
      } else {
        throw new Error('Registration failed');
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    apiService.clearToken();
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (!user) throw new Error('No user logged in');
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiService.updateProfile(updates);
      
      if (response.success && response.user) {
        setUser(response.user);
        localStorage.setItem('authUser', JSON.stringify(response.user));
      }
    } catch (err: any) {
      setError(err.message || 'Profile update failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const isAuthenticated = !!user && !!token;

  const value: AuthContextType = {
    user,
    token,
    login,
    register,
    logout,
    updateProfile,
    isAuthenticated,
    loading,
    error
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};