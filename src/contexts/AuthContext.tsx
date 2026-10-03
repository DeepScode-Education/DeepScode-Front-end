

// // ─────────────────────────────────────────────────────────────
// //  AuthContext  –  replaces Supabase auth
// //  Drop-in for useAuth() calls in Login, Signup, Dashboard
// // ─────────────────────────────────────────────────────────────
// import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
// import {
//   authApi,
//   getToken,
//   setToken,
//   removeToken,
//   AuthUser,
// } from "@/integrations/supabase/client";

// interface AuthContextValue {
//   user: AuthUser | null;
//   loading: boolean;
//   signOut: () => void;
//   signIn: (token: string) => Promise<void>;
// }

// const AuthContext = createContext<AuthContextValue>({
//   user: null,
//   loading: true,
//   signOut: () => {},
//   signIn: async () => {},
// });

// export const AuthProvider = ({ children }: { children: ReactNode }) => {
//   const [user, setUser] = useState<AuthUser | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [authToken, setAuthToken] = useState<string | null>(() => getToken());

//   useEffect(() => {
//     let isMounted = true;

//     const loadUser = async () => {
//       if (!authToken) {
//         if (isMounted) {
//           setUser(null);
//           setLoading(false);
//         }
//         return;
//       }

//       setLoading(true);
//       try {
//         const u = await authApi.me();
//         if (isMounted) {
//           setUser(u);
//         }
//       } catch {
//         if (isMounted) {
//           removeToken();
//           setAuthToken(null);
//           setUser(null);
//         }
//       } finally {
//         if (isMounted) {
//           setLoading(false);
//         }
//       }
//     };

//     loadUser();

//     return () => {
//       isMounted = false;
//     };
//   }, [authToken]);

//   useEffect(() => {
//     const handleStorage = (event: StorageEvent) => {
//       if (event.key === "token") {
//         setAuthToken(event.newValue);
//       }
//     };

//     window.addEventListener("storage", handleStorage);
//     return () => window.removeEventListener("storage", handleStorage);
//   }, []);

//   const signOut = () => {
//     removeToken();
//     setAuthToken(null);
//     setUser(null);
//   };

//   const signIn = async (token: string) => {
//     setToken(token);
//     setAuthToken(token);
//   };

//   return (
//     <AuthContext.Provider value={{ user, loading, signOut, signIn }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export const useAuth = () => useContext(AuthContext);

// export const useAuthActions = () => {
//   const { signIn } = useContext(AuthContext);
//   return { signIn };
// };




// ─────────────────────────────────────────────────────────────
//  AuthContext  –  JWT-based auth (no Supabase)
//  Provides: user, loading, signIn, signOut
//  Admin check is purely based on role from backend — no hardcoded emails
// ─────────────────────────────────────────────────────────────
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from "react";
import {
  authApi,
  getToken,
  setToken,
  removeToken,
  AuthUser,
} from "@/integrations/client";

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  signOut: () => void;
  signIn: (token: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  signOut: () => {},
  signIn: async () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch user profile from backend and set in state
  const fetchAndSetUser = useCallback(async (): Promise<AuthUser | null> => {
    const token = getToken();
    if (!token) {
      setUser(null);
      setLoading(false);
      return null;
    }

    try {
      const u = await authApi.me();

      setUser(u);
      return u;
    } catch {
      removeToken();
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // On mount — restore session from localStorage token
  useEffect(() => {
    fetchAndSetUser();
  }, [fetchAndSetUser]);

  // Cross-tab sync — if token changes in another tab, sync here
  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key === "token") {
        if (event.newValue) {
          fetchAndSetUser();
        } else {
          setUser(null);
          setLoading(false);
        }
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [fetchAndSetUser]);

  const signIn = useCallback(async (token: string): Promise<void> => {
    // 1. Persist token immediately
    setToken(token);
    setLoading(true);

    // 2. Fetch real user profile so role is accurate before redirect
    try {
      const u = await authApi.me();
      setUser(u);
    } catch {
      // If profile fetch fails, token is invalid — clean up
      removeToken();
      setUser(null);
      throw new Error("Failed to fetch user profile after login.");
    } finally {
      setLoading(false);
    }
  }, []);

  const signOut = useCallback(() => {
    removeToken();
    setUser(null);
    setLoading(false);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, signOut, signIn }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export const useAuthActions = () => {
  const { signIn } = useContext(AuthContext);
  return { signIn };
};