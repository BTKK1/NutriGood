import { createContext, useContext, useState, useEffect } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { auth, createUserDocument, getUserDocument, initializeFirestoreCollections } from '@/lib/firebase';
import { dataSyncService } from '@/lib/services/dataSync';
import type { User } from '@shared/schema';
import { onAuthStateChanged } from 'firebase/auth';

interface AuthContextType {
  firebaseUser: FirebaseUser | null;
  user: User | null;
  loading: boolean;
  isNewUser: boolean;
  firestoreError: boolean;
}

const AuthContext = createContext<AuthContextType>({
  firebaseUser: null,
  user: null,
  loading: true,
  isNewUser: false,
  firestoreError: false,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isNewUser, setIsNewUser] = useState(false);
  const [firestoreError, setFirestoreError] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setFirebaseUser(firebaseUser);
      setLoading(true);

      try {
        if (firebaseUser) {
          // Fetch user data from Firestore
          const userData = await getUserDocument(firebaseUser.uid);

          if (userData) {
            // Existing user
            setUser(userData as User);
            setIsNewUser(false);
            
            // Initialize Firestore collections to avoid permission errors
            await initializeFirestoreCollections(firebaseUser.uid);

            // Only restore data for users who have completed onboarding
            if (userData.onboardingComplete) {
              const hasFirestoreData = await dataSyncService.hasFirestoreData(firebaseUser.uid);
              if (hasFirestoreData) {
                await dataSyncService.restoreFromFirestore(firebaseUser.uid);
                dataSyncService.updateLastSyncTime(firebaseUser.uid);
                console.log('✅ Restored data from Firestore for UID:', firebaseUser.uid);
              }
            }
          } else {
            // Create new user document in Firestore
            const newUser: User = {
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              displayName: firebaseUser.displayName || 'New User',
              photoURL: firebaseUser.photoURL || '',
              settings: {
                liveActivity: false
              },
              onboardingComplete: false,
              referralCode: `REF${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
              referrals: 0,
              premiumUntil: null
            };

            const success = await createUserDocument(firebaseUser.uid, newUser);
            if (success) {
              setUser(newUser);
              setIsNewUser(true);
              console.log('✅ New user document created for UID:', firebaseUser.uid);
              
              // Initialize Firestore collections for new users
              await initializeFirestoreCollections(firebaseUser.uid);
            } else {
              throw new Error('Failed to create user document');
            }
          }
        } else {
          setUser(null);
          setIsNewUser(false);
        }
      } catch (error) {
        console.error('Error in auth state change:', error);
        setFirestoreError(true);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const value = {
    firebaseUser,
    user,
    loading,
    isNewUser,
    firestoreError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);