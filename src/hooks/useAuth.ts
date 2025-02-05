import { useState, useEffect } from 'react';
import { mockDb } from '../lib/mockData';
import { IUser } from '../patterns/interfaces';

export function useAuth() {
  const [user, setUser] = useState<IUser | null>(null);

  useEffect(() => {
    // Simulate getting the user from localStorage
    const savedUser = localStorage.getItem('mockUser');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const signIn = (email: string) => {
    const user = mockDb.getUsers().find(u => u.email === email);
    if (user) {
      setUser(user);
      localStorage.setItem('mockUser', JSON.stringify(user));
    }
  };

  const signOut = () => {
    setUser(null);
    localStorage.removeItem('mockUser');
  };

  return { user, signIn, signOut };
}