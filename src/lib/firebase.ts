import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, collection, serverTimestamp } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { User } from '../types';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
//@ts-ignore
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId || '(default)');

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

const mapFirebaseUser = (user: FirebaseUser, token?: string): User => ({
  uid: user.uid,
  email: user.email,
  displayName: user.displayName,
  photoURL: user.photoURL,
  accessToken: token
});

export const createConversation = async (userId: string, type: 'voice' | 'video' | 'text', summary: string) => {
  const conversationRef = doc(collection(db, `users/${userId}/conversations`));
  const createdAt = serverTimestamp();
  await setDoc(conversationRef, {
    userId,
    conversationId: conversationRef.id,
    type,
    summary,
    createdAt,
    updatedAt: createdAt
  });
  return conversationRef.id;
};
