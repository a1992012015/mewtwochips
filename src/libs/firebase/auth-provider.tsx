"use client";

import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";
import { User } from "firebase/auth";

import { Spin } from "@/components/spin";
import { firebaseAuth } from "@/libs/firebase/firebase-client";

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: false,
});

export interface AuthContextValue {
  user: User | null;
  loading: boolean;
}

export interface AuthProviderProps {
  user: User | null;
  children: ReactNode;
}

export function AuthProvider(props: AuthProviderProps) {
  const { user, children } = props;

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Install servicerWorker if supported.
    if ("serviceWorker" in navigator) {
      // Convert environment variables to URL `search` parameters
      navigator.serviceWorker
        .register(`/firebase-sw.js`, { scope: "/", updateViaCache: "none" })
        .then((reg) => {
          // Registration worked.
          console.log(`%cRegistration succeeded. Scope is ${reg.scope}`, "color: red;");
        })
        .catch((error) => {
          // Registration failed.
          console.log(`%cRegistration failed with ${error.message}`, "color: red;");
        });
    } else {
      console.log("This is unsupported");
    }
  }, []);

  useEffect(() => {
    const unsubscribe = firebaseAuth.onAuthStateChanged((u) => {
      unsubscribe();

      console.log({ server: !!user, client: !!u });

      if (!!user == !!u) {
        setLoading(false);
      } else {
        location.reload();
      }
    });
  }, [user]);

  return (
    <AuthContext.Provider value={useMemo(() => ({ user, loading }), [loading, user])}>
      {loading ? <Spin className="bg-transparent" loading={true} /> : children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const auth = useContext(AuthContext);
  if (!auth) {
    throw new Error("Missing AuthContext");
  }
  return auth;
}
