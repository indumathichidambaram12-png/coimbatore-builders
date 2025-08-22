import React, { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (pin: string) => boolean;
  logout: () => void;
  setupPin: (pin: string) => void;
  hasPin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasPin, setHasPin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if PIN exists and session is valid
    const storedPin = localStorage.getItem('appPin');
    const sessionValid = sessionStorage.getItem('authSession') === 'valid';
    
    setHasPin(!!storedPin);
    setIsAuthenticated(sessionValid);
    setLoading(false);
  }, []);

  const login = (pin: string): boolean => {
    const storedPin = localStorage.getItem('appPin');
    if (!storedPin) return false;
    
    if (pin === storedPin) {
      setIsAuthenticated(true);
      sessionStorage.setItem('authSession', 'valid');
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('authSession');
  };

  const setupPin = (pin: string) => {
    localStorage.setItem('appPin', pin);
    setHasPin(true);
    setIsAuthenticated(true);
    sessionStorage.setItem('authSession', 'valid');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-64 h-48 mx-auto mb-4 flex items-center justify-center">
            <img 
              src="https://mocha-cdn.com/01987f69-986a-7e37-978b-43c0a7c00cf8/image.png_3546.png" 
              alt="Coimbatore Builders Logo" 
              className="w-full h-full object-contain"
            />
          </div>
          <div className="animate-spin w-8 h-8 border-4 border-orange-200 border-t-orange-500 rounded-full mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, setupPin, hasPin }}>
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
