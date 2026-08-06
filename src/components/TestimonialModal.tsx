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
import { Textarea } from "@/components/ui/textarea";
import { Star, Upload, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { addDoc, collection, Timestamp } from "firebase/firestore";
import { db } from "@/integrations/firebase/config";
import { useAuth } from "@/hooks/useAuth";

interface TestimonialModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const TestimonialModal = ({ open, onOpenChange }: TestimonialModalProps) => {
  const { toast } = useToast();
  const { user } = useAuth();

  const [name, setName] = useState(user?.name || "");
  const [location, setLocation] = useState("");
  const [role, setRole] = useState("Undergraduate Student");
  const [rating, setRating] = useState(5);
  const [message, setMessage] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      toast({
        title: "Review Required",
        description: "Please share your experience in the review message field.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      // Create data URL fallback if local file uploaded
      await addDoc(collection(db, "testimonials"), {
        userId: user?.id || "anonymous",
        name: name || user?.name || "Verified Student",
        location: location || "Nigeria",
        role: role || "Student",
        rating: Number(rating),
        content: message,
        photoUrl: photoUrl || "",
        status: "pending", // Pending admin approval
        featured: false,
        createdAt: Timestamp.now(),
      });

      toast({
        title: "🎉 Testimonial Submitted!",
        description: "Thank you for your review! Your testimonial has been submitted for admin approval.",
      });

      setMessage("");
      onOpenChange(false);
    } catch (err: any) {
      console.error("Testimonial submission error:", err);
      toast({
        title: "Submission Error",
        description: err.message || "Failed to submit testimonial. Try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoUrl(reader.result as string);
        toast({
          title: "Photo Attached",
          description: file.name,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold gradient-text">
            Share Your BuildWave Experience
          </DialogTitle>
          <DialogDescription>
            Your testimonial helps prospective students trust BuildWave with their final year projects.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="t-name">Your Full Name</Label>
              <Input
                id="t-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Chidimma O."
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="t-location">Institution / School</Label>
              <Input
                id="t-location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. MOUAU, Umudike"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="t-role">Academic Role</Label>
              <Input
                id="t-role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g. MSc Computer Engineering"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Rating (1 to 5 Stars)</Label>
              <div className="flex items-center gap-1.5 pt-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setRating(star)}
                    className="p-1 transition-transform hover:scale-110 focus:outline-none"
                  >
                    <Star
                      className={`w-6 h-6 ${
                        star <= rating
                          ? "fill-amber-400 text-amber-400"
                          : "text-gray-300 dark:text-gray-600"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="t-message">Your Testimonial & Review</Label>
            <Textarea
              id="t-message"
              rows={3}
              placeholder="Tell us how BuildWave helped you complete your project, supervisor feedback, or grade achieved..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label>Profile Picture / Photo (Optional)</Label>
            <div className="flex items-center gap-3">
              <Input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="cursor-pointer text-xs"
              />
              {photoUrl && (
                <img
                  src={photoUrl}
                  alt="Preview"
                  className="w-10 h-10 rounded-full object-cover border border-purple-300"
                />
              )}
            </div>
          </div>

          <Button
            type="submit"
            className="w-full btn-hero mt-2"
            disabled={submitting}
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting...
              </>
            ) : (
              "Submit Testimonial"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
