import React, { createContext, useContext, useEffect, useState } from 'react';
import { dataService } from '../lib/dataService';
import { toast } from 'sonner';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  const initAuth = async () => {
    try {
      setLoading(true);
      const sess = await dataService.getSession();
      if (sess) {
        setUser(sess.user);
        setSession(sess.session);
        setProfile(sess.profile);
      } else {
        setUser(null);
        setSession(null);
        setProfile(null);
      }
    } catch (err) {
      console.error('Error restoring session:', err);
      setUser(null);
      setSession(null);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await dataService.signIn(email, password);
      setUser(res.user);
      setSession(res.session);
      setProfile(res.profile);
      toast.success(`Welcome back, ${res.profile?.full_name || 'User'}!`);
      return res;
    } catch (err) {
      toast.error(err.message || 'Failed to sign in');
      throw err;
    }
  };

  const signup = async (fullName, email, password) => {
    try {
      const res = await dataService.signUp(email, password, fullName);
      setUser(res.user);
      setSession(res.session);
      setProfile(res.profile);
      toast.success(`Account created successfully! Role: ${res.profile?.role}`);
      return res;
    } catch (err) {
      toast.error(err.message || 'Failed to sign up');
      throw err;
    }
  };

  const logout = async () => {
    try {
      await dataService.signOut();
      setUser(null);
      setSession(null);
      setProfile(null);
      toast.success('Signed out successfully');
    } catch (err) {
      toast.error(err.message || 'Error signing out');
    }
  };

  const refreshProfile = async () => {
    if (user?.id) {
      const p = await dataService.getUserProfile(user.id);
      if (p) setProfile(p);
    }
  };

  // Helper to switch user role directly in demo testing
  const switchRole = async (newRole) => {
    if (user?.id && profile) {
      const updated = await dataService.updateUserRole(user.id, newRole);
      setProfile(updated);
      toast.info(`Switched active role to: ${newRole.toUpperCase()}`);
    }
  };

  const role = profile?.role || 'staff';
  const isAdmin = role === 'admin';
  const isManager = role === 'manager' || role === 'admin';
  const isStaff = role === 'staff';

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        loading,
        role,
        isAdmin,
        isManager,
        isStaff,
        login,
        signup,
        logout,
        refreshProfile,
        switchRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
