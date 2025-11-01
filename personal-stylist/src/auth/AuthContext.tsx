// src/auth/AuthContext.tsx
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { firebaseApp } from "../lib/firebase";

// runtime imports
import {
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut as fbSignOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";

// type-only import
import type { User as FirebaseUser } from "firebase/auth";

type AuthUser = FirebaseUser | null;

export type AuthCtx = {
  user: AuthUser;
  loading: boolean;
    isLoading: boolean; 
  // canonical names
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;

  // aliases (so code that calls loginWithEmail still compiles)
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  registerWithEmail: (email: string, password: string) => Promise<void>;
};

const Ctx = createContext<AuthCtx | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth(firebaseApp);
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return unsub;
  }, []);

  // canonical fns
  const signInWithGoogle = async () => {
    const auth = getAuth(firebaseApp);
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const signOut = async () => {
    const auth = getAuth(firebaseApp);
    await fbSignOut(auth);
  };

  const signUpWithEmail = async (email: string, password: string) => {
    const auth = getAuth(firebaseApp);
    await createUserWithEmailAndPassword(auth, email, password);
  };

  const signInWithEmail = async (email: string, password: string) => {
    const auth = getAuth(firebaseApp);
    await signInWithEmailAndPassword(auth, email, password);
  };

  const resetPassword = async (email: string) => {
    const auth = getAuth(firebaseApp);
    await sendPasswordResetEmail(auth, email);
  };

  // aliases
  const loginWithGoogle = signInWithGoogle;
  const loginWithEmail = signInWithEmail;
  const registerWithEmail = signUpWithEmail;

  const value: AuthCtx = useMemo(
    () => ({
      user,
      loading,
      isLoading: loading,  
      signInWithGoogle,
      signOut,
      signUpWithEmail,
      signInWithEmail,
      resetPassword,
      loginWithGoogle,
      loginWithEmail,
      registerWithEmail,
    }),
    [user, loading]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
