import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import {
  getFirestore,
  collection,
  onSnapshot,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy
} from "firebase/firestore";

// Configuración real de Koin App
const firebaseConfig = {
  apiKey: "AIzaSyCeHv-wdckGTNgRPgvitMNQeUYXATz5kBw",
  authDomain: "koin-pro.firebaseapp.com",
  projectId: "koin-pro",
  storageBucket: "koin-pro.firebasestorage.app",
  messagingSenderId: "358296539087",
  appId: "1:358296539087:web:a6e3b1847ce2d64ad0ccba"
};

// Initialize App
const app = firebase.initializeApp(firebaseConfig);

// Export instances
export const db = getFirestore(app as any);
export const auth = firebase.auth();
export const googleProvider = new firebase.auth.GoogleAuthProvider();

// Auth Helpers
export const loginWithGoogle = () => auth.signInWithPopup(googleProvider);
export const logout = () => auth.signOut();

export interface User {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
}

export const onAuthStateChanged = (authInstance: any, callback: (user: User | null) => void) => {
  return authInstance.onAuthStateChanged(callback);
};

// --- Firestore Helpers (User Scoped) ---

export const subscribeToCollection = (collectionName: string, callback: (data: any[]) => void) => {
  const currentUser = auth.currentUser;
  if (!currentUser) return () => { }; // No user, no data

  const q = query(collection(db, "users", currentUser.uid, collectionName));
  return onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(data);
  });
};

export const addData = async (collectionName: string, data: any) => {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error("No authenticated user");
  return await addDoc(collection(db, "users", currentUser.uid, collectionName), data);
};

export const updateData = async (collectionName: string, id: string, data: any) => {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error("No authenticated user");
  return await updateDoc(doc(db, "users", currentUser.uid, collectionName, id), data);
};

export const deleteData = async (collectionName: string, id: string) => {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error("No authenticated user");
  return await deleteDoc(doc(db, "users", currentUser.uid, collectionName, id));
};
