import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import { Chrome } from "lucide-react";

const API_BASE = "http://localhost:5000";
const GOOGLE_CLIENT_ID = "465973726255-i20kuirv8cmma03jbk9t9pepfusc88ab.apps.googleusercontent.com";

const RegistrationModal = ({ isOpen, onClose, onSuccess }) => {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    school: "",
    location: "",
    course: "",
    level: "",
    hasProject: false,
    needsTopic: false,
  });

  // Initialize Google Identity Services once when the component mounts or modal opens
  useEffect(() => {
    if (!isOpen) return;

    if (typeof window !== "undefined" && window.google && GOOGLE_CLIENT_ID) {
      try {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: async (response) => {
            // response.credential is the id_token
            const id_token = response?.credential;
            if (!id_token) {
              toast({
                title: "Google sign-in failed",
                description: "No credential returned from Google.",
              });
              return;
            }

            setLoading(true);
            try {
              const res = await fetch(`${API_BASE}/auth/google`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id_token }),
              });
              const data = await res.json();
              if (!res.ok) {
                throw new Error(data?.error || "Google sign-in failed");
              }

              // Save app JWT and prefill form
              localStorage.setItem("buildwave_token", data.token);
              localStorage.setItem("buildwave_user", JSON.stringify(data.user || {}));

              setFormData((prev) => ({
                ...prev,
                name: data.user?.name || prev.name,
                email: data.user?.email || prev.email,
              }));

              setStep(2);
              toast({
                title: "Signed in with Google",
                description: `Welcome, ${data.user?.name || "student"}!`,
              });
            } catch (err) {
              console.error("Google sign-in error:", err);
              toast({
                title: "Sign-in error",
                description: err.message || "Unable to sign in with Google",
              });
            } finally {
              setLoading(false);
            }
          },
          // Auto-select off for explicit chooser behaviour; you can change options here.
          auto_select: false,
        });
      } catch (err) {
        console.warn("GSI init warning:", err);
      }
    } else if (isOpen && !window.google) {
      // GSI script not present
      toast({
        title: "Google SDK not loaded",
        description: "Add <script src=\"https://accounts.google.com/gsi/client\" async defer></script> to your index.html.",
      });
    } else if (isOpen && !GOOGLE_CLIENT_ID) {
      toast({
        title: "Missing Google Client ID",
        description: "Please set NEXT_PUBLIC_GOOGLE_CLIENT_ID in your environment.",
      });
    }
    // we only want to initialize when modal opens
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Trigger the Google account chooser / One Tap
  const handleGoogleAuth = () => {
    if (!window.google) {
      toast({
        title: "Google SDK not available",
        description: "Ensure the GSI script is included in the page.",
      });
      return;
    }
    // Prompt shows the account chooser and triggers the callback configured above
    try {
      window.google.accounts.id.prompt();
    } catch (err) {
      console.error("GSI prompt error:", err);
      toast({
        title: "Google prompt failed",
        description: "Try again or sign up with email.",
      });
    }
  };

  // Email & name quick "Continue" - move to step 2 (onboarding)
  const handleContinueWithEmail = (e) => {
    e.preventDefault();
    // Basic client-side validation
    if (!formData.email || !formData.name) {
      toast({
        title: "Missing fields",
        description: "Please provide your full name and a valid email to continue.",
      });
      return;
    }

    // For email flow we still need an app JWT to call /auth/me.
    // If no token exists, fallback: create a temporary local user object (guest flow) and continue.
    const token = localStorage.getItem("buildwave_token");
    if (!token) {
      // Guest flow (frontend-only) — we store a local user until user authenticates properly
      const guest = {
        id: `guest_${Date.now()}`,
        name: formData.name,
        email: formData.email,
        role: "guest",
      };
      localStorage.setItem("buildwave_user", JSON.stringify(guest));
      toast({
        title: "Continuing as guest",
        description: "You can complete onboarding now — verify with Google later to save your account.",
      });
    }

    setStep(2);
  };

  // Final onboarding submit — PUT /auth/me (requires app JWT)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("buildwave_token");
      const payload = {
        name: formData.name,
        school: formData.school,
        location: formData.location,
        course: formData.course,
        level: formData.level,
        hasProject: !!formData.hasProject,
        needsTopic: !!formData.needsTopic,
        phone: formData.phone || undefined,
      };

      if (!token) {
        // If no app JWT, we perform a local save and continue as guest
        const guest = JSON.parse(localStorage.getItem("buildwave_user") || "{}");
        const merged = { ...guest, ...payload, id: guest.id || `guest_${Date.now()}` };
        localStorage.setItem("buildwave_user", JSON.stringify(merged));
        toast({
          title: "Profile saved locally",
          description: "You can sign in with Google later to persist your profile.",
        });
        onSuccess && onSuccess();
        setLoading(false);
        return;
      }

      const res = await fetch(`${API_BASE}/auth/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "Onboarding failed");
      }

      // store returned server user object
      localStorage.setItem("buildwave_user", JSON.stringify(data.user || {}));

      toast({
        title: "✨ Welcome to BuildWave!",
        description: "Your profile is complete.",
      });

      onSuccess && onSuccess();
    } catch (err) {
      console.error("Onboarding error:", err);
      toast({
        title: "Onboarding error",
        description: err.message || "Could not complete registration.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gradient">
            {step === 1 ? "Get Started with BuildWave" : "Complete Your Profile"}
          </DialogTitle>
        </DialogHeader>

        {step === 1 ? (
          <div className="space-y-4 py-4">
            <Button
              onClick={handleGoogleAuth}
              className="w-full gradient-primary text-white py-6 text-lg flex items-center justify-center"
              disabled={loading}
            >
              <Chrome className="w-5 h-5 mr-2" />
              {loading ? "Signing in..." : "Continue with Google"}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or sign up with email</span>
              </div>
            </div>

            <form onSubmit={handleContinueWithEmail} className="space-y-4">
              <div>
                <Label htmlFor="email">Email Address</Label>
                <input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="your.email@university.edu"
                />
              </div>

              <div>
                <Label htmlFor="name">Full Name</Label>
                <input
                  id="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="John Doe"
                />
              </div>

              <Button type="submit" className="w-full gradient-primary text-white">
                Continue
              </Button>
            </form>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div>
              <Label htmlFor="school">School/University</Label>
              <input
                id="school"
                type="text"
                required
                value={formData.school}
                onChange={(e) => setFormData((prev) => ({ ...prev, school: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="University of Lagos"
              />
            </div>

            <div>
              <Label htmlFor="location">Location</Label>
              <input
                id="location"
                type="text"
                required
                value={formData.location}
                onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Lagos, Nigeria"
              />
            </div>

            <div>
              <Label htmlFor="course">Course of Study</Label>
              <input
                id="course"
                type="text"
                required
                value={formData.course}
                onChange={(e) => setFormData((prev) => ({ ...prev, course: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Computer Science"
              />
            </div>

            <div>
              <Label htmlFor="level">Education Level</Label>
              <select
                id="level"
                required
                value={formData.level}
                onChange={(e) => setFormData((prev) => ({ ...prev, level: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Select level</option>
                <option value="Undergraduate">Undergraduate</option>
                <option value="Masters">Masters</option>
                <option value="PhD">PhD</option>
              </select>
            </div>

            <div>
              <Label htmlFor="phone">Phone (optional)</Label>
              <input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="+2348012345678"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="hasProject"
                  checked={formData.hasProject}
                  onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, hasProject: checked }))}
                />
                <Label htmlFor="hasProject" className="cursor-pointer">
                  I already have a project
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="needsTopic"
                  checked={formData.needsTopic}
                  onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, needsTopic: checked }))}
                />
                <Label htmlFor="needsTopic" className="cursor-pointer">
                  I need a topic
                </Label>
              </div>
            </div>

            <Button type="submit" className="w-full gradient-primary text-white" disabled={loading}>
              {loading ? "Saving..." : "Complete Registration"}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default RegistrationModal;
