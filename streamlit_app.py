import React, { useState, useEffect } from 'react';
import { AuthScreen } from './AuthScreen';
import { MainApp } from './MainApp';
import { auth } from './firebase';
import { onAuthStateChanged, User, signOut } from 'firebase/auth';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out', error);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#F0F4F8]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#007AFF]"></div>
      </div>
    );
  }

  if (!user) {
    return <AuthScreen onLogin={() => {}} />;
  }

  return <MainApp onLogout={handleLogout} user={user} />;
}
