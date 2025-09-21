import React, { useState, useEffect } from 'react';
import { 
    onAuthStateChanged,
    signInWithPopup,
    GoogleAuthProvider,
    FacebookAuthProvider,
    signOut
} from 'firebase/auth';
import { auth } from '../services/auth';
import { AuthContext } from './AuthContext';

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      if (user) {
        // User is signed in. We store the essential info.
        const { uid, displayName, email, photoURL } = user;
        setCurrentUser({ uid, displayName, email, photoURL });
      } else {
        // User is signed out.
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return unsubscribe; // Cleanup subscription on unmount
  }, []);

  const signInWithGoogle = async () => {
    try {
        const provider = new GoogleAuthProvider();
        await signInWithPopup(auth, provider);
    } catch (error) {
        console.error('Google sign-in error:', error);
        throw error;
    }
  };

  const signInWithFacebook = async () => {
      try {
          const provider = new FacebookAuthProvider();
          await signInWithPopup(auth, provider);
      } catch (error) {
          console.error('Facebook sign-in error:', error);
          throw error;
      }
  };

  const logout = async () => {
      try {
          await signOut(auth);
      } catch (error) {
          console.error('Logout error:', error);
          throw error;
      }
  };

  const value = { 
    currentUser,
    loading,
    signInWithGoogle,
    signInWithFacebook,
    logout
  };

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}
