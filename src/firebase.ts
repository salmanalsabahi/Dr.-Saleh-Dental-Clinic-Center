import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updatePassword,
  updateEmail,
  updateProfile
} from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export { sendPasswordResetEmail } from 'firebase/auth';
export const saveUserToFirestore = async (user: any, additionalData: any = {}, role: string = 'user') => {
  if (!user) return;
  const userRef = doc(db, 'users', user.uid);
  const userSnap = await getDoc(userRef);
  
  const userData: any = {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName || additionalData.displayName || '',
    photoURL: user.photoURL || '',
    phone: additionalData.phone || '',
    updatedAt: new Date().toISOString(),
    role: user.email === 'openclaw@emtiazsky.com' ? 'admin' : (additionalData.role || role)
  };

  if (!userSnap.exists()) {
    await setDoc(userRef, {
      ...userData,
      createdAt: new Date().toISOString()
    });
  } else {
    // Preserve existing role, but force admin if this specific user
    const existingData = userSnap.data();
    
    // Always force admin for the designated email
    if (user.email === 'openclaw@emtiazsky.com') {
        userData.role = 'admin';
    } 
    
    await setDoc(userRef, userData, { merge: true });
  }
};

export const findUserByPhone = async (phone: string) => {
  const { collection, query, where, getDocs } = await import('firebase/firestore');
  const q = query(collection(db, 'users'), where('phone', '==', phone));
  const querySnapshot = await getDocs(q);
  if (!querySnapshot.empty) {
    return querySnapshot.docs[0].data();
  }
  return null;
};

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    await saveUserToFirestore(result.user);
    return result.user;
  } catch (error) {
    console.error("Error signing in with Google", error);
    throw error;
  }
};

export const logOut = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error signing out", error);
    throw error;
  }
};
