import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { getProject, getUser } from "@/integrations/firebase/firebaseService";

interface TrackProjectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const TrackProjectModal = ({ open, onOpenChange }: TrackProjectModalProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [projectId, setProjectId] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Fetch project from Firestore
      const project = await getProject(projectId);

      if (!project) {
        toast({
          title: "❌ Project Not Found",
          description: "Invalid Project ID. Please check and try again.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Get project creator's user document to verify email
      const projectCreator = await getUser((project as any).userId);

      if (!projectCreator) {
        toast({
          title: "❌ Project Creator Not Found",
          description: "Unable to verify project ownership.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Verify email matches project creator's email
      const creatorEmail = (projectCreator as any).email || "";
      if (creatorEmail.toLowerCase() !== email.toLowerCase()) {
        toast({
          title: "❌ Email Mismatch",
          description: "The email doesn't match the project creator's email.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Success — navigate
      toast({
        title: "✅ Project Found",
        description: "Loading your project…",
      });

      onOpenChange(false);

      setTimeout(() => {
        navigate(`/track/${projectId}`, { state: { project } });
      }, 500);

    } catch (error: any) {
      console.error("Track project error:", error);
      toast({
        title: "❌ Error",
        description: error.message || "Unable to track project. Try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold">Track Your Project</DialogTitle>
          <DialogDescription>
            Enter your Project ID and email to view progress
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleTrack} className="space-y-4 py-4">
          {/* Project ID */}
          <div className="space-y-2">
            <Label htmlFor="projectId">Project ID</Label>
            <Input
              id="projectId"
              name="projectId"
              placeholder="Enter your project ID"
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              required
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground">
              Check your project confirmation email for the ID
            </p>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground">
              Use the email associated with this project
            </p>
          </div>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full btn-hero"
            disabled={loading}
          >
            {loading ? "Tracking..." : "Track Project"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
