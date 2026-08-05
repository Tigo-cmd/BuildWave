import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  User as FirebaseUser,
} from "firebase/auth";
import { auth } from "@/integrations/firebase/config";
import { getUser, getUserRole, createUser, createUserRole } from "@/integrations/firebase/firebaseService";
import { toast } from "sonner";

export interface AppUser {
  id: string;
  email: string;
  name: string;
  role: string;
  phone?: string;
  school?: string;
  level?: string;
  photoUrl?: string;
}

interface AuthContextType {
  user: AppUser | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  isAdmin: boolean;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setFirebaseUser(currentUser);

      if (currentUser) {
        try {
          // Fetch additional profile data & role from Firestore
          const [dbUser, roleData] = await Promise.all([
            getUser(currentUser.uid),
            getUserRole(currentUser.uid),
          ]);

          const role = (roleData as any)?.role || (dbUser as any)?.role || "student";
          const appUser: AppUser = {
            id: currentUser.uid,
            email: currentUser.email || "",
            name: (dbUser as any)?.full_name || currentUser.displayName || "User",
            role: role,
            phone: (dbUser as any)?.phone || "",
            school: (dbUser as any)?.school || "",
            level: (dbUser as any)?.education_level || "",
            photoUrl: currentUser.photoURL || (dbUser as any)?.photoUrl || "",
          };

          setUser(appUser);
          localStorage.setItem("buildwave_uid", currentUser.uid);
          localStorage.setItem("buildwave_user", JSON.stringify(appUser));
          localStorage.setItem("user", JSON.stringify(appUser));
        } catch (err) {
          console.error("Error building auth profile:", err);
          // Fallback minimal profile
          const appUser: AppUser = {
            id: currentUser.uid,
            email: currentUser.email || "",
            name: currentUser.displayName || "User",
            role: "student",
          };
          setUser(appUser);
        }
      } else {
        setUser(null);
        localStorage.removeItem("buildwave_uid");
        localStorage.removeItem("buildwave_user");
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signUp = async (name: string, email: string, password: string) => {
    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);
      await createUser(res.user.uid, {
        full_name: name,
        email: email,
        education_level: "undergraduate",
      });
      await createUserRole(res.user.uid, "student");
      toast.success("Account created successfully!");
    } catch (err: any) {
      // Generic error to prevent user enumeration
      const safeMessage = getSafeAuthError(err.code);
      toast.error(safeMessage);
      throw new Error(safeMessage);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success("Logged in successfully!");
    } catch (err: any) {
      // Generic error to prevent user enumeration
      const safeMessage = getSafeAuthError(err.code);
      toast.error(safeMessage);
      throw new Error(safeMessage);
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      localStorage.clear();
      setUser(null);
      toast.success("Signed out successfully");
    } catch (err: any) {
      toast.error(err.message || "Sign out failed");
    }
  };

  const isAdmin = user?.role === "admin";

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        loading,
        isAdmin,
        signUp,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};

/**
 * Maps Firebase auth error codes to safe, non-enumerable messages.
 * Never reveals whether an email exists in the system.
 */
function getSafeAuthError(code: string): string {
  switch (code) {
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential":
    case "auth/invalid-email":
      return "Invalid email or password. Please check your credentials.";
    case "auth/user-disabled":
      return "This account has been disabled. Contact support.";
    case "auth/too-many-requests":
      return "Too many attempts. Please try again later.";
    case "auth/email-already-in-use":
      return "An account with this email already exists. Try signing in.";
    case "auth/weak-password":
      return "Password is too weak. Use at least 8 characters with mixed case, numbers, and symbols.";
    case "auth/network-request-failed":
      return "Network error. Check your internet connection.";
    default:
      return "Authentication failed. Please try again.";
  }
}
