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
import { sanitizeInput, validateEmail, validatePassword, getPasswordStrength } from "@/lib/security";
import { Eye, EyeOff } from "lucide-react";
import { sendWelcomeEmail } from "@/lib/emailService";

export const AuthModal = ({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signUp, signIn } = useAuth();

  const [step, setStep] = useState<"auth" | "onboarding" | "signin">("auth");
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [hasProject, setHasProject] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
      const cleanEmail = sanitizeInput(email);
      const cleanName = sanitizeInput(fullName);

      await signUp(cleanName, cleanEmail, password);
      // Dispatch welcome email asynchronously
      sendWelcomeEmail(cleanEmail, cleanName).catch((e) => console.error(e));

      resetRegisterLimit();

      setEmail("");
      setFullName("");
      setPassword("");
      setConfirmPassword("");
      setStep("auth");

      onOpenChange(false);
      navigate("/dashboard");
    } catch (err: any) {
      console.error("Registration error");
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
      console.error("Sign-in error");
    } finally {
      setLoading(false);
    }
  };

  // Password strength indicator
  const passValidation = validatePassword(password);
  const strength = getPasswordStrength(passValidation.score);

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
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@university.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
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
                    autoComplete="name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="new-password"
                      className="pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      tabIndex={-1}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {/* Password strength meter */}
                  {password.length > 0 && (
                    <div className="space-y-1">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((level) => (
                          <div
                            key={level}
                            className={`h-1 flex-1 rounded-full transition-colors ${
                              passValidation.score >= level
                                ? passValidation.score <= 2
                                  ? "bg-red-500"
                                  : passValidation.score <= 3
                                  ? "bg-yellow-500"
                                  : "bg-green-500"
                                : "bg-gray-200 dark:bg-gray-700"
                            }`}
                          />
                        ))}
                      </div>
                      <p className={`text-xs ${strength.color}`}>
                        Strength: {strength.label}
                      </p>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <div className="relative">
                    <Input
                      id="confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      autoComplete="new-password"
                      className="pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      tabIndex={-1}
                      aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
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
                  autoComplete="email"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signin-password">Password</Label>
                <div className="relative">
                  <Input
                    id="signin-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    className="pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    tabIndex={-1}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {!loginAllowed && (
                <div className="p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-sm text-red-600 dark:text-red-400 font-medium">
                    🔒 Too many attempts. Try again in {loginRetryAfter}s.
                  </p>
                </div>
              )}

              <Button type="submit" className="w-full btn-hero" disabled={loading || !loginAllowed}>
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
