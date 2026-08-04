import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
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
  signInWithGoogle: () => Promise<void>;
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
      toast.error(err.message || "Registration failed");
      throw err;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success("Logged in successfully!");
    } catch (err: any) {
      toast.error(err.message || "Login failed");
      throw err;
    }
  };

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const res = await signInWithPopup(auth, provider);
      
      // Ensure user record & role exist in Firestore
      const dbUser = await getUser(res.user.uid);
      if (!dbUser) {
        await createUser(res.user.uid, {
          full_name: res.user.displayName || "Google User",
          email: res.user.email || "",
          photoUrl: res.user.photoURL || "",
        });
        await createUserRole(res.user.uid, "student");
      }
      toast.success("Signed in with Google successfully!");
    } catch (err: any) {
      console.error("Google auth error:", err);
      toast.error(err.message || "Google Sign-In failed");
      throw err;
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
        signInWithGoogle,
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

