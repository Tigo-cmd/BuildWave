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
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Calendar } from "lucide-react";

interface ProjectRequestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prefilledService?: string;
}

const API_BASE = "http://localhost:5000";

export const ProjectRequestModal = ({
  open,
  onOpenChange,
  prefilledService,
}: ProjectRequestModalProps) => {
  const [needTopic, setNeedTopic] = useState(false);
  const [haveProject, setHaveProject] = useState(false);
  const [contactMethod, setContactMethod] = useState<"email" | "whatsapp">(
    "email"
  );
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("buildwave_token");
      const form = e.target as HTMLFormElement;

      // Gather form values
      const title = (form.elements.namedItem("title") as HTMLInputElement).value;
      const level = (form.elements.namedItem("level") as HTMLSelectElement).value;
      const discipline = (form.elements.namedItem("discipline") as HTMLInputElement).value;
      const description = (form.elements.namedItem("description") as HTMLTextAreaElement).value;
      const phone = (form.elements.namedItem("phone") as HTMLInputElement).value;
      const deadline = (form.elements.namedItem("deadline") as HTMLInputElement).value;
      const budget = (form.elements.namedItem("budget") as HTMLInputElement).value;
      const fileInput = form.elements.namedItem("file") as HTMLInputElement;

      // Create project with JSON first
      const res = await fetch(`${API_BASE}/api/projects`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          project_title: title,
          academic_level: level,
          discipline,
          description,
          phone,
          needTopic,
          haveProject,
          contactMethod,
          deadline,
          budget,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit project");

      const projectId = data.projectId;

      // If files were selected, upload them
      if (fileInput?.files?.length) {
        const formData = new FormData();
        for (let i = 0; i < fileInput.files.length; i++) {
          formData.append("file", fileInput.files[i]);
        }

        const uploadRes = await fetch(`${API_BASE}/api/projects/${projectId}/deliverable`, {
          method: "POST",
          body: formData,
        });

        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) throw new Error(uploadData.error || "File upload failed");
      }

      toast({
        title: "✅ Project Submitted Successfully!",
        description: `Your project ID is ${projectId}`,
      });

      // Reset form and modal state
      form.reset();
      setNeedTopic(false);
      setHaveProject(false);
      setContactMethod("email");
      onOpenChange(false);
    } catch (err: any) {
      toast({
        title: "❌ Submission Failed",
        description: err.message,
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
            Fill in the details below and we’ll get started on your project.
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
              defaultValue={prefilledService}
            />
          </div>

          {/* Topic Options */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="needTopic"
                checked={needTopic}
                onCheckedChange={(checked) => {
                  setNeedTopic(checked as boolean);
                  if (checked) setHaveProject(false);
                }}
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
                  setHaveProject(checked as boolean);
                  if (checked) setNeedTopic(false);
                }}
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
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-primary"
                required
              >
                <option value="">Select level</option>
                <option value="undergraduate">Undergraduate</option>
                <option value="masters">Masters</option>
                <option value="phd">PhD</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="discipline">Discipline</Label>
              <Input id="discipline" name="discipline" placeholder="e.g., Computer Science" required />
            </div>
          </div>

          {/* Brief Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Brief Description</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Describe what you need help with..."
              rows={4}
              required
            />
          </div>

          {/* Deadline & Budget */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="deadline">Deadline</Label>
              <div className="relative">
                <Input id="deadline" name="deadline" type="date" required />
                <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="budget">Budget Estimate (Optional)</Label>
              <Input id="budget" name="budget" type="text" placeholder="₦100,000 - ₦200,000" />
            </div>
          </div>

          {/* File Upload */}
          <div className="space-y-2">
            <Label htmlFor="file">Upload Documents (Optional)</Label>
            <Input id="file" name="file" type="file" multiple className="cursor-pointer" />
            <p className="text-xs text-muted-foreground">
              Upload project briefs, requirements, or any relevant documents
            </p>
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number (Optional)</Label>
            <Input id="phone" name="phone" type="tel" placeholder="+234 XXX XXX XXXX" />
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
                <RadioGroupItem value="email" id="email" />
                <Label htmlFor="email" className="font-normal">
                  Email
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="whatsapp" id="whatsapp" />
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
