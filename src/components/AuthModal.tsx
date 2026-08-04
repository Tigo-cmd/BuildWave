import React, { useState } from "react";
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
import { useAuth } from "@/hooks/useAuth";
import { createUser } from "@/integrations/firebase/firebaseService";
import { useRateLimit } from "@/hooks/useRateLimit";
import { sanitizeInput, validateEmail, validatePassword } from "@/lib/security";

export const AuthModal = ({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signUp, signIn, signInWithGoogle } = useAuth();

  const [step, setStep] = useState<"auth" | "onboarding" | "signin">("auth");
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
    windowMs: 300000,
  });

  const { allowed: registerAllowed, retryAfterSec: registerRetryAfter, attemptAction: attemptRegister, resetLimit: resetRegisterLimit } = useRateLimit({
    actionKey: "user_register_attempt",
    maxAttempts: 3,
    windowMs: 600000,
  });

  const handleGoogleAuth = async () => {
    try {
      setLoading(true);
      await signInWithGoogle();
      onOpenChange(false);
      navigate("/dashboard");
    } catch (err: any) {
      console.error("Google login error", err);
    } finally {
      setLoading(false);
    }
  };

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

  const handleOnboardingSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
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
      const formData = new FormData(e.currentTarget);
      const cleanEmail = sanitizeInput(email);
      const cleanName = sanitizeInput(fullName);

      await signUp(cleanName, cleanEmail, password);

      resetRegisterLimit();

      setEmail("");
      setFullName("");
      setPassword("");
      setConfirmPassword("");
      setStep("auth");

      onOpenChange(false);
      navigate("/dashboard");
    } catch (err: any) {
      console.error("Registration error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
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
      await signIn(cleanEmail, password);
      resetLoginLimit();

      setEmail("");
      setPassword("");
      setStep("auth");

      onOpenChange(false);
      navigate("/dashboard");
    } catch (err: any) {
      console.error("Sign-in error:", err);
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
              <DialogDescription>
                Sign up to start your project or track your progress
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <Button
                variant="outline"
                type="button"
                className="w-full flex items-center justify-center gap-2 py-5"
                onClick={handleGoogleAuth}
                disabled={loading}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                Continue with Google
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or sign up with email
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
              <Button
                variant="outline"
                type="button"
                className="w-full flex items-center justify-center gap-2 py-5"
                onClick={handleGoogleAuth}
                disabled={loading}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                Sign in with Google
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or sign in with email
                  </span>
                </div>
              </div>

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

