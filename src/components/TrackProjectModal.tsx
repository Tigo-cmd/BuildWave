import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

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
      const res = await fetch(`http://localhost:5000/api/projects/${projectId}?email=${email}`);
      const data = await res.json();

      if (!res.ok) {
        toast({
          title: "❌ Project Not Found",
          description: data.error || "Invalid Project ID or Email.",
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
        navigate(`/track/${projectId}`, { state: { project: data } });
      }, 500);

    } catch (error) {
      toast({
        title: "❌ Network Error",
        description: "Unable to reach server. Try again later.",
        variant: "destructive",
      });
    }

    setLoading(false);
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
              placeholder="BW-2025-0001"
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              required
              pattern="BW-\d{4}-\d{4}"
              title="Format: BW-YYYY-NNNN"
            />
            <p className="text-xs text-muted-foreground">
              Format: BW-2025-0001 (check your confirmation email)
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
            />
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
