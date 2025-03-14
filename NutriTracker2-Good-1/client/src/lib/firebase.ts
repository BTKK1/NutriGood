import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  getDocs, 
  query, 
  limit,
  CollectionReference,
  DocumentData
} from 'firebase/firestore';
import { getAuth, GoogleAuthProvider, signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';

// Create a configuration that will work with either environment variable prefix
const getConfigValue = (viteKey: string, plainKey: string): string => {
  const viteValue = import.meta.env[viteKey];
  const plainValue = import.meta.env[plainKey];

  // Log which value we're using
  const value = viteValue || plainValue;

  // Only log this information during development, not in production
  if (import.meta.env.DEV) {
    if (viteValue && plainValue) {
      console.log(`Firebase using ${viteKey}: ${viteValue.substring(0, 3)}...`);
    } else if (viteValue) {
      console.log(`Firebase using ${viteKey}: ${viteValue.substring(0, 3)}...`);
    } else if (plainValue) {
      console.log(`Firebase using ${plainKey}: ${plainValue.substring(0, 3)}...`);
    } else {
      console.warn(`⚠️ Missing Firebase config: ${viteKey} and ${plainKey}`);
    }
  }

  if (!value) {
    throw new Error(`Missing required Firebase config value for ${viteKey} or ${plainKey}`);
  }
  return value;
};

const firebaseConfig = {
  apiKey: getConfigValue('VITE_FIREBASE_API_KEY', 'FIREBASE_API_KEY'),
  authDomain: getConfigValue('VITE_FIREBASE_AUTH_DOMAIN', 'FIREBASE_AUTH_DOMAIN'),
  projectId: getConfigValue('VITE_FIREBASE_PROJECT_ID', 'FIREBASE_PROJECT_ID'),
  storageBucket: getConfigValue('VITE_FIREBASE_STORAGE_BUCKET', 'FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: getConfigValue('VITE_FIREBASE_MESSAGING_SENDER_ID', 'FIREBASE_MESSAGING_SENDER_ID'),
  appId: getConfigValue('VITE_FIREBASE_APP_ID', 'FIREBASE_APP_ID')
};

console.log('🔥 Initializing Firebase with config:', {
  hasApiKey: !!firebaseConfig.apiKey,
  hasAuthDomain: !!firebaseConfig.authDomain,
  hasProjectId: !!firebaseConfig.projectId,
  hasStorageBucket: !!firebaseConfig.storageBucket,
  hasMessagingSenderId: !!firebaseConfig.messagingSenderId,
  hasAppId: !!firebaseConfig.appId
});

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

export async function checkFirebaseConnectivity(): Promise<boolean> {
  try {
    await getDoc(doc(db, 'connectivity_test', 'test'));
    return true;
  } catch (error) {
    console.error('Firebase connectivity check failed:', error);
    return false;
  }
}

// User document operations
export async function createUserDocument(userId: string, userData: any) {
  try {
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, {
      ...userData,
      createdAt: new Date().toISOString(),
      onboardingComplete: false
    }, { merge: true });
    console.log('✅ User document created successfully for UID:', userId);
    return true;
  } catch (error) {
    console.error('Error creating user document:', error);
    return false;
  }
}

export async function updateUserDocument(userId: string, data: any) {
  try {
    const userRef = doc(db, 'users', userId);

    // First check if the document exists
    const docSnap = await getDoc(userRef);

    if (docSnap.exists()) {
      // Document exists, use updateDoc
      console.log('Updating existing Firestore document for user:', userId);
      await updateDoc(userRef, {
        ...data,
        updatedAt: new Date().toISOString()
      });
    } else {
      // Document doesn't exist, use setDoc instead
      console.log('Creating new Firestore document for user:', userId);
      await setDoc(userRef, {
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }, { merge: true });
    }

    console.log('✅ User document updated successfully for UID:', userId);
    return true;
  } catch (error) {
    console.error('Error updating user document:', error);
    console.error('Error details:', JSON.stringify(error));
    return false;
  }
}

export async function getUserDocument(userId: string) {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    return userDoc.exists() ? userDoc.data() : null;
  } catch (error) {
    console.error('Error getting user document:', error);
    return null;
  }
}

// Authentication operations
export async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error('Error signing in with Google:', error);
    return null;
  }
}

export async function signInWithEmail(email: string, password: string) {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result.user;
  } catch (error) {
    console.error('Error signing in with email:', error);
    throw error;
  }
}

export async function signUpWithEmail(email: string, password: string) {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    return result.user;
  } catch (error) {
    console.error('Error signing up with email:', error);
    throw error;
  }
}

let connectivityInterval: number | null = null;

export function startConnectivityMonitoring(): void {
  if (connectivityInterval) return;

  connectivityInterval = window.setInterval(async () => {
    const isConnected = await checkFirebaseConnectivity();
    if (!isConnected) {
      console.warn('Firebase connectivity lost');
    }
  }, 30000) as unknown as number;
}

/**
 * Initialize Firestore collections to avoid 'failed-precondition' errors
 * @param userId The user ID to initialize collections for
 */
export async function initializeFirestoreCollections(userId: string): Promise<void> {
  try {
    console.log('Initializing Firestore collections for user:', userId);
    
    // List of collections to initialize
    const collections = [
      'food_logs',
      'activity_logs',
      'user_settings',
      'saved_foods',
      'meal_plans'
    ];
    
    for (const collectionName of collections) {
      try {
        // Check if collection exists by attempting to get first document
        const q = query(collection(db, collectionName), limit(1));
        await getDocs(q);
        console.log(`Collection ${collectionName} already exists`);
      } catch (error) {
        console.warn(`Error checking collection ${collectionName}:`, error);
        
        // Create a placeholder document to initialize the collection
        try {
          const placeholderRef = doc(db, collectionName, `__init_${userId}`);
          await setDoc(placeholderRef, {
            userId,
            type: 'initialization',
            timestamp: new Date().toISOString(),
            description: `Initialization document for ${collectionName}`
          });
          console.log(`Created initialization document for collection ${collectionName}`);
        } catch (initError) {
          console.error(`Failed to initialize collection ${collectionName}:`, initError);
        }
      }
    }
    
    console.log('✅ Firestore collections initialized successfully');
  } catch (error) {
    console.error('Error initializing Firestore collections:', error);
  }
}