import React, { createContext, useState, useContext, useEffect } from 'react';
import Cookies from 'js-cookie';
import api from '@/lib/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(!!Cookies.get('token'));
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  useEffect(() => {
    checkUserAuth();
  }, []);

  const checkUserAuth = async () => {
    const token = Cookies.get('token');
    if (!token) {
      setIsAuthenticated(false);
      setUser(null);
      setIsLoadingAuth(false);
      return;
    }

    try {
      // Check if we saved the user data in local storage during login
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      } else {
        // Fallback for demo purposes
        setUser({ name: "Demo User", email: "demo@example.com" });
      }
      setIsAuthenticated(true);
    } catch (error) {
      console.error('User auth check failed:', error);
      Cookies.remove('token');
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const login = (tokens, userData, mustChangePassword = false) => {
    if (tokens.access) Cookies.set('token', tokens.access, { expires: 7 }); // Access cookie expires in 7 days
    if (tokens.refresh) Cookies.set('refresh_token', tokens.refresh, { expires: 30 }); // Refresh cookie expires in 30 days
    
    if (userData) {
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData)); // Optional: Store user locally so it persists across reloads immediately
      
      // Save role in cookies as requested
      if (userData.role) {
        Cookies.set('role', userData.role, { expires: 7 });
      }
    }
    
    setIsAuthenticated(true);
    
    // Redirect based on whether they need to change their password
    if (mustChangePassword) {
      toast.error("Please change your password", { icon: '⚠️', duration: 3000 });
      setTimeout(() => {
        window.location.href = '/settings';
      }, 1500);
    } else {
      window.location.href = '/';
    }
  };

  const logout = () => {
    // Clear every single cookie dynamically
    Object.keys(Cookies.get()).forEach(cookieName => {
      Cookies.remove(cookieName);
    });
    
    // Clear all local storage as well
    localStorage.clear();
    
    setUser(null);
    setIsAuthenticated(false);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated, 
      isLoadingAuth,
      login,
      logout,
      checkUserAuth
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
