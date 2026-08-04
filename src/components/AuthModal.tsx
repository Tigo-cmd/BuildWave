import React, { useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { useFirebaseAuth } from "@/integrations/firebase/useFirebaseAuth";
import { createUser } from "@/integrations/firebase/firebaseService";
import { useRateLimit } from "@/hooks/useRateLimit";
import { sanitizeInput, validateEmail, validatePassword } from "@/lib/security";

export const AuthModal = ({ open, onOpenChange }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { register, login, user } = useFirebaseAuth();

  const [step, setStep] = useState("auth"); // "auth" | "onboarding" | "signin"
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [hasProject, setHasProject] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  const { allowed: loginAllowed, retryAfterSec: loginRetryAfter, attemptAction: attemptLogin, resetLimit: resetLoginLimit } = useRateLimit({
    actionKey: "user_login_attempt",
    maxAttempts: 5,
    windowMs: 300000, // 5 minutes
  });

  const { allowed: registerAllowed, retryAfterSec: registerRetryAfter, attemptAction: attemptRegister, resetLimit: resetRegisterLimit } = useRateLimit({
    actionKey: "user_register_attempt",
    maxAttempts: 3,
    windowMs: 600000, // 10 minutes
  });

  // STEP 1 — handle signup input validation and move to onboarding
  const handleEmailSignUp = async () => {
    if (!registerAllowed) {
      toast({
        title: "Rate limit reached",
        description: `Too many sign-up attempts. Please wait ${registerRetryAfter}s.`,
        variant: "destructive",
      });
      return;
    }

    const cleanEmail = sanitizeInput(email);
    const cleanName = sanitizeInput(fullName);

    if (!cleanEmail || !cleanName || !password || !confirmPassword) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (!validateEmail(cleanEmail)) {
      toast({
        title: "Invalid email",
        description: "Please provide a valid email address.",
        variant: "destructive",
      });
      return;
    }

    if (password !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }

    const passValidation = validatePassword(password);
    if (!passValidation.isValid) {
      setPasswordError(passValidation.feedback[0] || "Password does not meet security requirements");
      return;
    }

    setPasswordError("");
    setStep("onboarding");
  };

  // STEP 2 — complete onboarding (create user in Firebase)
  const handleOnboardingSubmit = async (e) => {
    e.preventDefault();

    const regAttempt = attemptRegister();
    if (!regAttempt.allowed) {
      toast({
        title: "Registration limit exceeded",
        description: `Please wait ${regAttempt.retryAfterSec}s before attempting again.`,
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData(e.target);
      const cleanEmail = sanitizeInput(email);
      const cleanName = sanitizeInput(fullName);

      // Register user with Firebase Auth
      const registeredUser = await register(cleanEmail, password);

      if (!registeredUser || !registeredUser.uid) {
        throw new Error("Failed to create user account");
      }

      resetRegisterLimit();

      // Create user profile in Firestore
      const userData = {
        name: cleanName,
        email: cleanEmail,
        school: sanitizeInput(String(formData.get("school") || "")),
        course: sanitizeInput(String(formData.get("course") || "")),
        level: sanitizeInput(String(formData.get("level") || "Undergraduate")),
        phone: sanitizeInput(String(formData.get("phone") || "")),
        location: sanitizeInput(String(formData.get("location") || "")),
        hasProject: hasProject,
        projectsCount: 0,
        completedProjects: 0,
        totalSpent: "₦0",
        joinedAt: new Date().toLocaleDateString(),
        lastActive: new Date().toLocaleDateString(),
      };

      await createUser(registeredUser.uid, userData);

      // Save to localStorage
      localStorage.setItem("buildwave_user", JSON.stringify(userData));
      localStorage.setItem("buildwave_uid", registeredUser.uid);

      toast({
        title: "🎉 Account Created!",
        description: "Welcome to BuildWave.",
      });

      // Reset form
      setEmail("");
      setFullName("");
      setPassword("");
      setConfirmPassword("");
      setStep("auth");

      onOpenChange(false);
      navigate("/dashboard");
    } catch (err) {
      console.error("Registration error:", err);

      if (err.code === "auth/email-already-in-use") {
        toast({
          title: "Email already registered",
          description: "This email is already in use. Please sign in or use a different email address.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Registration failed",
          description: err.message || "Could not complete registration.",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // STEP 3 — sign in existing users
  const handleSignIn = async (e) => {
    e.preventDefault();

    if (!loginAllowed) {
      toast({
        title: "Rate limit reached",
        description: `Too many sign-in attempts. Please try again in ${loginRetryAfter}s.`,
        variant: "destructive",
      });
      return;
    }

    const cleanEmail = sanitizeInput(email);
    if (!validateEmail(cleanEmail)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    const loginAttempt = attemptLogin();
    if (!loginAttempt.allowed) {
      toast({
        title: "Account Locked Temporarily",
        description: `Too many failed attempts. Try again in ${loginAttempt.retryAfterSec}s.`,
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Sign in with Firebase Auth
      const loggedInUser = await login(cleanEmail, password);

      if (!loggedInUser || !loggedInUser.uid) {
        throw new Error("Sign in failed");
      }

      resetLoginLimit();

      // Save to localStorage
      localStorage.setItem("buildwave_uid", loggedInUser.uid);
      localStorage.setItem("buildwave_email", loggedInUser.email || cleanEmail);

      toast({
        title: "Welcome back!",
        description: `Hi ${fullName || "there"} 👋`,
      });

      // Reset form
      setEmail("");
      setPassword("");
      setStep("auth");

      onOpenChange(false);
      navigate("/dashboard");
    } catch (err) {
      console.error("Sign-in error:", err);
      toast({
        title: "Sign-in failed",
        description: err.message || "Unable to log in.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        {step === "auth" ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl gradient-text">
                Get Started with BuildWave
              </DialogTitle>
              <DialogDescription className="sr-only">
                Sign up to start your project or track your progress
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Sign up with email
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@university.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                  {passwordError && (
                    <p className="text-sm text-red-500">{passwordError}</p>
                  )}
                </div>
                <Button
                  className="w-full btn-hero"
                  onClick={handleEmailSignUp}
                  disabled={loading}
                >
                  Continue
                </Button>
                <div className="text-center text-sm">
                  <button
                    type="button"
                    onClick={() => setStep("signin")}
                    className="text-primary hover:underline"
                  >
                    Already have an account? Sign in
                  </button>
                </div>
              </div>
            </div>
          </>
        ) : step === "signin" ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl">Sign In</DialogTitle>
              <DialogDescription>
                Enter your credentials to access your account
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSignIn} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="signin-email">Email Address</Label>
                <Input
                  id="signin-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signin-password">Password</Label>
                <Input
                  id="signin-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full btn-hero" disabled={loading}>
                {loading ? "Signing in..." : "Sign In"}
              </Button>
              <div className="text-center text-sm">
                <button
                  type="button"
                  onClick={() => setStep("auth")}
                  className="text-primary hover:underline"
                >
                  Don't have an account? Sign up
                </button>
              </div>
            </form>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl">Complete Your Profile</DialogTitle>
              <DialogDescription>
                Help us understand your needs better
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleOnboardingSubmit} className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input name="phone" id="phone" type="tel" placeholder="+234..." />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input name="location" id="location" placeholder="Lagos, Nigeria" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="school">University/Institution</Label>
                <Input name="school" id="school" placeholder="University of Lagos" required />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="course">Course of Study</Label>
                  <Input name="course" id="course" placeholder="Computer Science" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="level">Education Level</Label>
                  <select
                    name="level"
                    id="level"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    required
                  >
                    <option value="">Select level</option>
                    <option value="Undergraduate">Undergraduate</option>
                    <option value="Masters">Masters</option>
                    <option value="PhD">PhD</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="hasProject"
                  checked={hasProject}
                  onCheckedChange={(checked) => setHasProject(checked === true)}
                />
                <label
                  htmlFor="hasProject"
                  className="text-sm font-medium leading-none"
                >
                  I have a project I need help with
                </label>
              </div>

              <Button type="submit" className="w-full btn-hero" disabled={loading}>
                {loading ? "Creating account..." : "Complete Registration"}
              </Button>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
