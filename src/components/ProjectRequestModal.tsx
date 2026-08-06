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
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { generateProjectBriefWithGroq } from "@/lib/groqService";
import { Sparkles, Loader2, Calendar } from "lucide-react";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { storage } from "@/integrations/firebase/config";
import { useFirebaseAuth } from "@/integrations/firebase/useFirebaseAuth";
import { createProject, updateProject } from "@/integrations/firebase/firebaseService";
import { sendProjectCreatedEmail } from "@/lib/emailService";

import { useRateLimit } from "@/hooks/useRateLimit";
import { sanitizeInput } from "@/lib/security";

interface ProjectRequestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prefilledService?: string;
}

export const ProjectRequestModal = ({
  open,
  onOpenChange,
  prefilledService,
}: ProjectRequestModalProps) => {
  const { user: firebaseUser } = useFirebaseAuth();
  const [userId, setUserId] = useState<string | null>(null);
  const [needTopic, setNeedTopic] = useState(false);
  const [haveProject, setHaveProject] = useState(false);
  const [contactMethod, setContactMethod] = useState<"email" | "whatsapp">(
    "email"
  );
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const [description, setDescription] = useState("");
  const [titleInput, setTitleInput] = useState(prefilledService || "");
  const [disciplineInput, setDisciplineInput] = useState("");
  const [levelInput, setLevelInput] = useState("undergraduate");
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  const handleAiGenerate = async () => {
    const currentTitle = titleInput || prefilledService || "";
    if (!currentTitle && !disciplineInput) {
      toast({
        title: "Topic or Discipline Required",
        description: "Please enter a project title or discipline to generate a brief with AI.",
        variant: "destructive",
      });
      return;
    }

    setIsGeneratingAi(true);
    try {
      const generatedText = await generateProjectBriefWithGroq({
        title: currentTitle,
        discipline: disciplineInput,
        level: levelInput,
        requirements: description,
      });

      setDescription(generatedText);
      toast({
        title: "✨ Groq AI Brief Generated",
        description: "Project description updated with Groq AI.",
      });
    } catch (err) {
      console.error("AI Generation error:", err);
      toast({
        title: "Generation Error",
        description: "Could not generate brief. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const { allowed, retryAfterSec, attemptAction, resetLimit } = useRateLimit({
    actionKey: "project_request_submission",
    maxAttempts: 3,
    windowMs: 600000, // 10 minutes
  });

  // Get user ID from Firebase or localStorage
  useEffect(() => {
    if (firebaseUser?.uid) {
      setUserId(firebaseUser.uid);
    } else {
      // Fallback to localStorage if Firebase auth not ready
      const storedUid = localStorage.getItem("buildwave_uid");
      if (storedUid) {
        setUserId(storedUid);
      }
    }
  }, [firebaseUser]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!allowed) {
      toast({
        title: "❌ Limit Reached",
        description: `Too many submissions. Please wait ${retryAfterSec}s before submitting again.`,
        variant: "destructive",
      });
      return;
    }

    const submissionAttempt = attemptAction();
    if (!submissionAttempt.allowed) {
      toast({
        title: "❌ Limit Reached",
        description: `Submission blocked. Try again in ${submissionAttempt.retryAfterSec}s.`,
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      if (!userId) {
        toast({
          title: "❌ Not Authenticated",
          description: "Please sign in first to submit a project.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      const form = e.target as HTMLFormElement;

      // Gather and sanitize form values
      const title = sanitizeInput((form.elements.namedItem("title") as HTMLInputElement).value);
      const level = sanitizeInput((form.elements.namedItem("level") as HTMLSelectElement).value);
      const discipline = sanitizeInput((form.elements.namedItem("discipline") as HTMLInputElement).value);
      const description = sanitizeInput((form.elements.namedItem("description") as HTMLTextAreaElement).value);
      const phone = sanitizeInput((form.elements.namedItem("phone") as HTMLInputElement).value);
      const deadline = sanitizeInput((form.elements.namedItem("deadline") as HTMLInputElement).value);
      const budget = sanitizeInput((form.elements.namedItem("budget") as HTMLInputElement).value);
      const fileInput = form.elements.namedItem("file") as HTMLInputElement;

      // Create project in Firestore
      const projectId = await createProject({
        userId: userId,
        title: title || titleInput || "Untitled Project",
        category: discipline || disciplineInput,
        description: description || "",
        status: "pending",
        deadline: deadline ? new Date(deadline) : null,
        budget,
        phone,
        level: level || levelInput,
        needTopic,
        haveProject,
        contactMethod,
      });

      // If files were selected, upload them to Cloud Storage or fallback to Data URL for Vercel
      const uploadedFilesList: { name: string; url: string; uploadedAt: string }[] = [];
      if (fileInput?.files?.length) {
        const uploadPromises = Array.from(fileInput.files).map(async (file) => {
          try {
            const storageRef = ref(storage, `projects/${projectId}/files/${file.name}`);
            await uploadBytes(storageRef, file);
            const downloadUrl = await getDownloadURL(storageRef);
            uploadedFilesList.push({
              name: file.name,
              url: downloadUrl,
              uploadedAt: new Date().toISOString(),
            });
          } catch (error) {
            console.warn(`Storage upload failed for ${file.name}, using Data URL fallback:`, error);
            const dataUrl = await new Promise<string>((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () => resolve(reader.result as string);
              reader.onerror = reject;
              reader.readAsDataURL(file);
            });
            uploadedFilesList.push({
              name: file.name,
              url: dataUrl,
              uploadedAt: new Date().toISOString(),
            });
          }
        });

        await Promise.all(uploadPromises);

        if (uploadedFilesList.length > 0) {
          await updateProject(projectId, { files: uploadedFilesList });
        }
      }

      // Send project submission email notification
      const userEmail = firebaseUser?.email || "";
      const userName = firebaseUser?.displayName || "Student";
      if (userEmail) {
        sendProjectCreatedEmail(userEmail, userName, projectId, title || titleInput || "Untitled Project", deadline).catch((e) => console.error(e));
      }

      toast({
        title: "✅ Project Submitted Successfully!",
        description: `Your project ID is ${projectId}`,
      });

      // Reset form and modal state
      form.reset();
      setDescription("");
      setTitleInput("");
      setDisciplineInput("");
      setNeedTopic(false);
      setHaveProject(false);
      setContactMethod("email");
      onOpenChange(false);
    } catch (err: any) {
      console.error("Project submission error:", err);
      toast({
        title: "❌ Submission Failed",
        description: err.message || "Unable to submit project. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold gradient-text">
            Request a Project
          </DialogTitle>
          <DialogDescription>
            Fill in the details below and we'll get started on your project.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4" encType="multipart/form-data">
          {/* Project Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Project Title (Optional)</Label>
            <Input
              id="title"
              name="title"
              placeholder="e.g., Smart Home Automation System"
              value={titleInput}
              onChange={(e) => setTitleInput(e.target.value)}
              disabled={loading}
            />
          </div>

          {/* Topic Options */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="needTopic"
                checked={needTopic}
                onCheckedChange={(checked) => {
                  setNeedTopic(checked === true);
                  if (checked) setHaveProject(false);
                }}
                disabled={loading}
              />
              <Label htmlFor="needTopic" className="font-medium">
                I need help selecting a topic
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="haveProject"
                checked={haveProject}
                onCheckedChange={(checked) => {
                  setHaveProject(checked === true);
                  if (checked) setNeedTopic(false);
                }}
                disabled={loading}
              />
              <Label htmlFor="haveProject" className="font-medium">
                I already have a project topic
              </Label>
            </div>
          </div>

          {/* Academic Level & Discipline */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="level">Academic Level</Label>
              <select
                id="level"
                name="level"
                value={levelInput}
                onChange={(e) => setLevelInput(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-primary"
                required
                disabled={loading}
              >
                <option value="undergraduate">Undergraduate</option>
                <option value="masters">Masters</option>
                <option value="phd">PhD</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="discipline">Discipline</Label>
              <Input
                id="discipline"
                name="discipline"
                placeholder="e.g., Computer Science"
                value={disciplineInput}
                onChange={(e) => setDisciplineInput(e.target.value)}
                required
                disabled={loading}
              />
            </div>
          </div>

          {/* Brief Description with AI Button */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="description">Brief Description</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 gap-1.5 text-xs text-primary border-primary/30 hover:bg-primary/10"
                onClick={handleAiGenerate}
                disabled={loading || isGeneratingAi}
              >
                {isGeneratingAi ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                )}
                {isGeneratingAi ? "Generating..." : "✨ Generate with AI"}
              </Button>
            </div>
            <Textarea
              id="description"
              name="description"
              placeholder="Describe what you need help with or generate with AI..."
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          {/* Deadline & Budget */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="deadline">Deadline</Label>
              <div className="relative">
                <Input
                  id="deadline"
                  name="deadline"
                  type="date"
                  required
                  disabled={loading}
                />
                <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="budget">Budget Estimate (Optional)</Label>
              <Input
                id="budget"
                name="budget"
                type="text"
                placeholder="₦100,000 - ₦200,000"
                disabled={loading}
              />
            </div>
          </div>

          {/* File Upload */}
          <div className="space-y-2">
            <Label htmlFor="file">Upload Documents (Optional)</Label>
            <Input
              id="file"
              name="file"
              type="file"
              multiple
              className="cursor-pointer"
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground">
              Upload project briefs, requirements, or any relevant documents
            </p>
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number (Optional)</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              placeholder="+234 XXX XXX XXXX"
              disabled={loading}
            />
          </div>

          {/* Contact Method */}
          <div className="space-y-2">
            <Label>Preferred Contact Method</Label>
            <RadioGroup
              value={contactMethod}
              onValueChange={(value) =>
                setContactMethod(value as "email" | "whatsapp")
              }
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="email" id="email" disabled={loading} />
                <Label htmlFor="email" className="font-normal">
                  Email
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="whatsapp" id="whatsapp" disabled={loading} />
                <Label htmlFor="whatsapp" className="font-normal">
                  WhatsApp
                </Label>
              </div>
            </RadioGroup>
          </div>

          <Button type="submit" className="w-full btn-hero" disabled={loading}>
            {loading ? "Submitting..." : "Submit Project Request"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
