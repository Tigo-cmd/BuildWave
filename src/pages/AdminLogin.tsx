import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock, Mail } from "lucide-react";
import { toast } from "sonner";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/integrations/firebase/config";
import { getUserRole } from "@/integrations/firebase/firebaseService";

import { useRateLimit } from "@/hooks/useRateLimit";
import { sanitizeInput, validateEmail } from "@/lib/security";

const AdminLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const { allowed, retryAfterSec, attemptAction, resetLimit } = useRateLimit({
    actionKey: "admin_login_attempt",
    maxAttempts: 3,
    windowMs: 900000, // 15 minutes
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!allowed) {
      toast.error(`Too many failed attempts. Please try again in ${retryAfterSec}s.`);
      return;
    }

    const cleanEmail = sanitizeInput(email);
    if (!validateEmail(cleanEmail)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    const attempt = attemptAction();
    if (!attempt.allowed) {
      toast.error(`Too many attempts. Locked out for ${attempt.retryAfterSec} seconds.`);
      return;
    }

    setLoading(true);

    try {
      // Sign in with Firebase Auth
      const userCredential = await signInWithEmailAndPassword(auth, cleanEmail, password);
      const userId = userCredential.user.uid;

      // Check if user has admin role
      const userRole = await getUserRole(userId);
      
      if ((userRole as any)?.role === "admin") {
        resetLimit();
        // Store user data in both formats for compatibility
        const adminUser = {
          id: userId,
          email: userCredential.user.email,
          role: "admin",
          name: userCredential.user.displayName || "Admin"
        };
        
        localStorage.setItem("buildwave_uid", userId);
        localStorage.setItem("buildwave_user", JSON.stringify(adminUser));
        localStorage.setItem("user", JSON.stringify(adminUser)); // For useAuth hook compatibility
        
        toast.success("Admin login successful");
        navigate("/admin");
      } else {
        console.error("Not an admin. Role:", (userRole as any)?.role);
        toast.error("Access denied. Admin privileges required.");
      }
    } catch (err: any) {
      console.error("Login error", err);
      const errorMsg = err.code === "auth/user-not-found" 
        ? "Invalid email or password"
        : err.code === "auth/wrong-password"
        ? "Invalid email or password"
        : err.message || "Login failed";
      
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Admin Login - BuildWave</title>
      </Helmet>

      <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-3 text-center">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <Lock className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold gradient-text">
              Admin Login
            </CardTitle>
            <CardDescription>
              Enter your credentials to access the admin panel
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@buildwave.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full btn-hero"
                disabled={loading}
              >
                {loading ? "Signing in..." : "Sign In"}
              </Button>

              <div className="text-center text-sm text-muted-foreground">
                <a href="/" className="hover:text-primary transition-colors">
                  ← Back to main site
                </a>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default AdminLogin;
