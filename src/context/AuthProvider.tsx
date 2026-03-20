import { useState, useEffect, ReactNode } from 'react';
import { 
    onAuthStateChanged,
    signInWithPopup,
    GoogleAuthProvider,
    FacebookAuthProvider,
    signOut,
    User as FirebaseUser
} from 'firebase/auth';
import { auth } from '../services/auth';
import { AuthContext, User, AuthContextType } from './AuthContext';

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user: FirebaseUser | null) => {
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

  const signInWithGoogle = async (): Promise<void> => {
    try {
        const provider = new GoogleAuthProvider();
        await signInWithPopup(auth, provider);
    } catch (error) {
        console.error('Google sign-in error:', error);
        throw error;
    }
  };

  const signInWithFacebook = async (): Promise<void> => {
      try {
          const provider = new FacebookAuthProvider();
          await signInWithPopup(auth, provider);
      } catch (error) {
          console.error('Facebook sign-in error:', error);
          throw error;
      }
  };

  const logout = async (): Promise<void> => {
      try {
          await signOut(auth);
      } catch (error) {
          console.error('Logout error:', error);
          throw error;
      }
  };

  const value: AuthContextType = { 
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
