import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Download, User, Clock, MessageSquare, ArrowLeft, Home, Send, Upload, FileText } from "lucide-react";
import { Helmet } from "react-helmet-async";
import { useToast } from "@/components/ui/use-toast";
import { AnimatedLoader } from "@/components/AnimatedLoader";
import { useAuth } from "@/hooks/useAuth";
import { getProject, getProjectTimeline, createTimeline, updateProject } from "@/integrations/firebase/firebaseService";
import { storage } from "@/integrations/firebase/config";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { createNotification } from "@/integrations/firebase/notificationsService";

const TrackProject = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const [project, setProject] = useState<any>(null);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Messaging Modal State
  const [messageModalOpen, setMessageModalOpen] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [submittingMessage, setSubmittingMessage] = useState(false);

  const fetchProjectData = async () => {
    try {
      setLoading(true);
      if (!projectId) throw new Error("Project ID not found");

      const projectData = await getProject(projectId);
      if (!projectData) throw new Error("Project not found");

      const timelineData = await getProjectTimeline(projectId);

      setProject(projectData);
      setTimeline(timelineData);
    } catch (err: any) {
      console.error("Error loading project:", err.message);
      setError(err.message);

      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) fetchProjectData();
  }, [projectId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() && !selectedFile) {
      toast({
        title: "Input required",
        description: "Please enter a message or attach a file.",
        variant: "destructive",
      });
      return;
    }

    setSubmittingMessage(true);

    try {
      let fileAttachment: { name: string; url: string } | null = null;

      if (selectedFile && projectId) {
        try {
          const storageRef = ref(storage, `projects/${projectId}/student_files/${Date.now()}_${selectedFile.name}`);
          await uploadBytes(storageRef, selectedFile);
          const downloadUrl = await getDownloadURL(storageRef);
          fileAttachment = { name: selectedFile.name, url: downloadUrl };
        } catch (storageErr) {
          console.warn("Storage upload failed, falling back to Data URL:", storageErr);
          const dataUrl = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(selectedFile);
          });
          fileAttachment = { name: selectedFile.name, url: dataUrl };
        }

        // Save to project studentFiles list
        const existingStudentFiles = project.studentFiles || [];
        await updateProject(projectId, {
          studentFiles: [...existingStudentFiles, { ...fileAttachment, uploadedAt: new Date().toISOString() }],
        });
      }

      const fullActivityText = fileAttachment
        ? `${messageText}\n📎 Attachment: [${fileAttachment.name}](${fileAttachment.url})`
        : messageText;

      const timelineId = await createTimeline(projectId!, fullActivityText, user?.id || null, "student");

      // Notify admin
      await createNotification({
        user_id: "admin",
        project_id: projectId,
        title: `Message from Student on ${projectId}`,
        message: messageText || "Uploaded a file attachment",
        type: "message",
      });

      toast({
        title: "Message Sent!",
        description: "Your progress query has been delivered to your tutor.",
      });

      // Update local state
      setTimeline([
        {
          id: timelineId,
          activity_text: fullActivityText,
          actor_id: user?.id || null,
          actor_type: "student",
          createdAt: { seconds: Math.floor(Date.now() / 1000) },
        },
        ...timeline,
      ]);

      setMessageText("");
      setSelectedFile(null);
      setMessageModalOpen(false);
    } catch (err: any) {
      console.error("Send message error:", err);
      toast({
        title: "Failed to send message",
        description: err.message || "An error occurred while sending your request.",
        variant: "destructive",
      });
    } finally {
      setSubmittingMessage(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <AnimatedLoader message="Retrieving your project tracking data..." />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 text-center">
        <h2 className="text-xl font-bold text-red-500 mb-2">Project Not Found</h2>
        <p className="text-muted-foreground mb-6">{error || "Could not find a project matching this tracking ID."}</p>
        <div className="flex gap-4">
          <Button onClick={() => navigate("/dashboard")} variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
          <Button onClick={() => navigate("/")} className="btn-hero">
            <Home className="mr-2 h-4 w-4" />
            Home Page
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{`Track Project ${projectId} - BuildWave`}</title>
        <meta name="description" content={`Track progress for ${project.title}`} />
      </Helmet>

      <div className="min-h-screen flex flex-col bg-background">
        {/* Navigation Header */}
        <header className="border-b bg-card shadow-sm sticky top-0 z-40">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={() => navigate("/dashboard")} className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Button>
              <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="gap-2">
                <Home className="h-4 w-4" />
                Home Page
              </Button>
            </div>
            <div>
              <span className="font-bold text-lg gradient-text">BuildWave</span>
            </div>
          </div>
        </header>

        <main className="flex-1 container px-4 py-8 max-w-4xl mx-auto space-y-6">
          {/* Project Summary Header */}
          <Card className="border-primary/20 shadow-md">
            <CardHeader>
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <CardTitle className="text-2xl font-bold">{project.title}</CardTitle>
                    <Badge className="bg-primary">{project.status?.toUpperCase() || "PENDING"}</Badge>
                  </div>
                  <p className="text-muted-foreground font-mono text-sm">
                    Project ID: <span className="text-primary font-semibold">{projectId}</span>
                  </p>
                </div>
                <Button className="btn-hero gap-2" onClick={() => setMessageModalOpen(true)}>
                  <MessageSquare className="h-4 w-4" />
                  Request Progress / Message Tutor
                </Button>
              </div>
            </CardHeader>

            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground font-medium">Overall Project Completion</span>
                  <span className="font-bold text-primary">{project.progress || 0}%</span>
                </div>
                <Progress value={project.progress || 0} className="h-3" />
              </div>
            </CardContent>
          </Card>

          {/* Assigned Team */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Assigned Tutor / Specialist
              </CardTitle>
            </CardHeader>
            <CardContent>
              {project.assigned_to || project.assignedTo ? (
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white font-bold text-lg">
                    {(project.assigned_to || project.assignedTo?.name || "A")[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-base">
                      {typeof project.assigned_to === "string" ? project.assigned_to : project.assignedTo?.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Academic Specialist & Project Supervisor
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground text-sm italic">
                  An academic specialist is currently reviewing your project guidelines and will be assigned shortly.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Timeline & Conversation */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Project Activity & Messages
              </CardTitle>
              <Button variant="outline" size="sm" onClick={() => setMessageModalOpen(true)}>
                Send Message
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {timeline.length > 0 ? (
                  timeline.map((event: any, index: number) => (
                    <div key={event.id || index} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div
                          className={`h-4 w-4 rounded-full flex items-center justify-center ${
                            event.actor_type === "admin"
                              ? "bg-primary text-primary-foreground"
                              : event.actor_type === "student"
                              ? "bg-emerald-500 text-white"
                              : "bg-muted"
                          }`}
                        />
                        {index < timeline.length - 1 && <div className="w-0.5 flex-1 bg-border my-1" />}
                      </div>

                      <div className="flex-1 pb-4 border-b border-border/50 last:border-0">
                        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                          <span className="font-semibold text-foreground capitalize">
                            {event.actor_type === "admin" ? "Tutor / Admin" : event.actor_type === "student" ? "You" : "System Update"}
                          </span>
                          <span>
                            {event.createdAt?.seconds
                              ? new Date(event.createdAt.seconds * 1000).toLocaleString()
                              : "Recently"}
                          </span>
                        </div>
                        <div className="text-sm whitespace-pre-wrap leading-relaxed text-foreground bg-muted/30 p-3 rounded-lg border">
                          {event.activity_text}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    No activity recorded yet. Click "Request Progress" above to message your assigned tutor.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Admin Deliverables */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Download className="h-5 w-5 text-primary" />
                Completed Deliverables & Files
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {project.deliverables?.length > 0 ? (
                  project.deliverables.map((file: any, idx: number) => (
                    <div
                      key={file.id || idx}
                      className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded bg-primary/10 flex items-center justify-center">
                          <FileText className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{file.name}</p>
                          <p className="text-xs text-muted-foreground">Deliverable document</p>
                        </div>
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        asChild
                      >
                        <a href={file.url || file.file_url} target="_blank" rel="noopener noreferrer">
                          <Download className="h-4 w-4" />
                          Download
                        </a>
                      </Button>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-sm italic text-center py-4">
                    Deliverable files (code, final reports, presentation slides) will be posted here as work progresses.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </main>

        {/* Message / Progress Modal */}
        <Dialog open={messageModalOpen} onOpenChange={setMessageModalOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold gradient-text">
                Request Progress & Message Tutor
              </DialogTitle>
              <DialogDescription>
                Send a message or upload additional documents directly to your project supervisor.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSendMessage} className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="msg-text">Message / Progress Inquiry</Label>
                <Textarea
                  id="msg-text"
                  placeholder="Ask for an update, provide feedback, or state any specific requirements..."
                  rows={4}
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  disabled={submittingMessage}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="msg-file">Attach Document / Picture (Optional)</Label>
                <Input
                  id="msg-file"
                  type="file"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  disabled={submittingMessage}
                />
                <p className="text-xs text-muted-foreground">
                  Upload project revisions, data files, or instructions.
                </p>
              </div>

              <Button type="submit" className="w-full btn-hero gap-2" disabled={submittingMessage}>
                {submittingMessage ? (
                  "Sending..."
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Send Message
                  </>
                )}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
};

export default TrackProject;
