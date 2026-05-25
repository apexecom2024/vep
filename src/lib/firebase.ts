/// <reference types="vite/client" />
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { getFirestore, doc, setDoc, collection, serverTimestamp, getDoc } from 'firebase/firestore';
import { getDatabase, ref, push, set, get, child, serverTimestamp as rtdbTimestamp } from 'firebase/database';
import { getStorage } from 'firebase/storage';
import { User, UserProfile } from '../types';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  databaseURL: "https://gala-69e93-default-rtdb.europe-west1.firebasedatabase.app/",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
//@ts-ignore
export const db = getFirestore(app);
export const rtdb = getDatabase(app);
export const storage = getStorage(app);

const provider = new GoogleAuthProvider();
// Shared Workspace Scopes
const WORKSPACE_SCOPES = [
  'https://www.googleapis.com/auth/drive',
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/documents',
  'https://www.googleapis.com/auth/gmail.modify',
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/presentations',
  'https://www.googleapis.com/auth/tasks',
  'https://www.googleapis.com/auth/contacts',
  'https://www.googleapis.com/auth/forms.body'
];

WORKSPACE_SCOPES.forEach(scope => provider.addScope(scope));

let cachedAccessToken: string | null = null;
let isSigningIn = false;

export const initAuth = (
  onAuthSuccess: (user: User, token: string) => void,
  onAuthFailure: () => void
) => {
  return onAuthStateChanged(auth, async (fbUser) => {
    if (fbUser) {
      if (cachedAccessToken) {
        onAuthSuccess(mapFirebaseUser(fbUser, cachedAccessToken), cachedAccessToken);
      } else if (!isSigningIn) {
        onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      onAuthFailure();
    }
  });
};

export const signIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Failed to get access token');
    }

    cachedAccessToken = credential.accessToken;
    const user = mapFirebaseUser(result.user, cachedAccessToken);
    
    // Sync user to firestore
    await setDoc(doc(db, 'users', user.uid), {
      userId: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      lastActive: serverTimestamp()
    }, { merge: true });

    return { user, accessToken: cachedAccessToken };
  } catch (error) {
    console.error('Sign in error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const logout = async () => {
  await auth.signOut();
  cachedAccessToken = null;
};

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

const mapFirebaseUser = (user: FirebaseUser, token?: string): User => ({
  uid: user.uid,
  email: user.email,
  displayName: user.displayName,
  photoURL: user.photoURL,
  accessToken: token
});

export const saveUserProfile = async (userId: string, profile: UserProfile) => {
  const path = `users/${userId}/config/profile`;
  try {
    await set(ref(rtdb, path), {
      ...profile,
      updatedAt: rtdbTimestamp()
    });
  } catch (error) {
    console.error('RTDB Save Profile Error:', error);
    throw error;
  }
};

export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  const path = `users/${userId}/config/profile`;
  try {
    const snapshot = await get(ref(rtdb, path));
    if (snapshot.exists()) {
      return snapshot.val() as UserProfile;
    }
    return null;
  } catch (error) {
    console.error('RTDB Get Profile Error:', error);
    throw error;
  }
};

export const createConversation = async (userId: string, type: 'voice' | 'video' | 'text', summary: string) => {
  const conversationsRef = ref(rtdb, `users/${userId}/conversations`);
  const newConversationRef = push(conversationsRef);
  const conversationId = newConversationRef.key;
  
  if (!conversationId) throw new Error('Failed to generate conversation ID');
  
  const createdAt = Date.now();
  await set(newConversationRef, {
    userId,
    conversationId,
    type,
    summary,
    createdAt,
    updatedAt: createdAt
  });
  return conversationId;
};

export const saveConversationMessage = async (userId: string, conversationId: string, transcript: string, agentResponse: string) => {
  const messageRef = doc(collection(db, `users/${userId}/conversations/${conversationId}/messages`));
  await setDoc(messageRef, {
    transcript,
    agentResponse,
    createdAt: serverTimestamp()
  });
};
