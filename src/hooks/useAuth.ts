import { useState, useEffect } from 'react';
import { onAuthChanged, loginWithEmail, registerWithEmail, logoutUser } from '../firebase';

export function useAuth() {
  const [firebaseUser, setFirebaseUser] = useState<any | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthChanged((user) => setFirebaseUser(user));
    return () => unsubscribe();
  }, []);

  return { firebaseUser, loginWithEmail, registerWithEmail, logoutUser };
}
