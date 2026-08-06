import React, { useState, useEffect } from "react";
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
import { Loader2, UserCheck, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "@/integrations/firebase/config";
import { useFirebaseAuth } from "@/integrations/firebase/useFirebaseAuth";

interface AccountSettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProfileUpdated?: () => void;
}

export const AccountSettingsModal = ({
  open,
  onOpenChange,
  onProfileUpdated,
}: AccountSettingsModalProps) => {
  const { toast } = useToast();
  const { user: authUser } = useFirebaseAuth();

  const [fullName, setFullName] = useState("");
  const [school, setSchool] = useState("");
  const [academicLevel, setAcademicLevel] = useState("Undergraduate");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (authUser && open) {
      loadUserProfile();
    }
  }, [authUser, open]);

  const loadUserProfile = async () => {
    if (!authUser) return;
    setLoading(true);
    try {
      const userRef = doc(db, "users", authUser.uid);
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        const data = snap.data();
        setFullName(data.full_name || data.name || authUser.displayName || "");
        setSchool(data.school || "");
        setAcademicLevel(data.academic_level || "Undergraduate");
        setPhone(data.phone || "");
      } else {
        setFullName(authUser.displayName || "");
      }
    } catch (err) {
      console.error("Error loading user profile:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authUser) return;

    setSaving(true);
    try {
      const userRef = doc(db, "users", authUser.uid);
      await updateDoc(userRef, {
        full_name: fullName,
        name: fullName,
        school: school,
        academic_level: academicLevel,
        phone: phone,
        updatedAt: new Date(),
      });

      toast({
        title: "Account Settings Saved",
        description: "Your profile information has been updated successfully.",
      });

      if (onProfileUpdated) onProfileUpdated();
      onOpenChange(false);
    } catch (err: any) {
      console.error("Profile update error:", err);
      toast({
        title: "Update Failed",
        description: err.message || "Failed to update profile settings.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-purple-600" /> Account & Profile Settings
          </DialogTitle>
          <DialogDescription>
            Update your academic institution, contact details, and account profile.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="py-8 flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
            <p className="text-sm text-muted-foreground">Loading profile settings...</p>
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="s-email">Email Address</Label>
              <Input
                id="s-email"
                value={authUser?.email || ""}
                disabled
                className="bg-gray-100 dark:bg-gray-800 text-muted-foreground"
              />
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Shield className="w-3 h-3 text-green-600" /> Verified buildwave account email
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="s-fullname">Full Name</Label>
              <Input
                id="s-fullname"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="s-school">University / Institution</Label>
              <Input
                id="s-school"
                value={school}
                onChange={(e) => setSchool(e.target.value)}
                placeholder="e.g. University of Lagos / MOUAU"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="s-level">Academic Level</Label>
                <Input
                  id="s-level"
                  value={academicLevel}
                  onChange={(e) => setAcademicLevel(e.target.value)}
                  placeholder="e.g. Final Year BSc / MSc"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="s-phone">Phone Number / WhatsApp</Label>
                <Input
                  id="s-phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+234..."
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full btn-hero mt-3"
              disabled={saving}
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving Changes...
                </>
              ) : (
                "Save Profile Settings"
              )}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};
