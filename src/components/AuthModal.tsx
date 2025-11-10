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

const API_BASE = "http://localhost:5000";

export const AuthModal = ({ open, onOpenChange }) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [step, setStep] = useState("auth"); // "auth" | "onboarding" | "signin"
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [hasProject, setHasProject] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  // STEP 1 — handle signup input validation and move to onboarding
  const handleEmailSignUp = async () => {
    if (!email || !fullName || !password || !confirmPassword) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (password !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      return;
    }

    setPasswordError("");
    setStep("onboarding");
  };

  // STEP 2 — complete onboarding (send signup + profile to backend)
  const handleOnboardingSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData(e.target);

      const payload = {
        name: fullName,
        email,
        password,
        school: formData.get("school"),
        course: formData.get("course"),
        level: formData.get("level"),
        phone: formData.get("phone"),
        location: formData.get("location"),
        hasProject,
      };

      // Call your backend signup endpoint
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Registration failed");
      }

      // Save token & user locally
      localStorage.setItem("buildwave_token", data.token);
      localStorage.setItem("buildwave_user", JSON.stringify(data.user));

      toast({
        title: "🎉 Account Created!",
        description: "Welcome to BuildWave.",
      });

      onOpenChange(false);
      navigate("/dashboard");
    } catch (err) {
      console.error("Registration error:", err);
      toast({
        title: "Registration failed",
        description: err.message || "Could not complete registration.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // STEP 3 — sign in existing users
  const handleSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Sign in failed");
      }

      localStorage.setItem("buildwave_token", data.token);
      localStorage.setItem("buildwave_user", JSON.stringify(data.user));

      toast({
        title: "Welcome back!",
        description: `Hi ${data.user?.name || "there"} 👋`,
      });

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
                  onCheckedChange={(checked) => setHasProject(checked)}
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
