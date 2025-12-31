/**
 * Auth Context
 * Simple authentication state management
 */

import React, {createContext, useContext, useState} from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  user: UserData | null;
  login: (userData: UserData) => void;
  logout: () => void;
}

interface UserData {
  phone: string;
  name?: string;
  class?: string;
  board?: string;
  plan?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({children}: {children: React.ReactNode}) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<UserData | null>(null);

  const login = (userData: UserData) => {
    setUser(userData);
    setIsAuthenticated(true);
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{isAuthenticated, user, login, logout}}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
