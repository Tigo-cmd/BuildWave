import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Upload, Send, CheckCircle, Clock, FileText, User, Trash2, Download, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { AnimatedLoader } from "@/components/AnimatedLoader";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  getProject,
  updateProject,
  getUser,
  createTimeline,
  getProjectTimeline,
  deleteProject,
} from "@/integrations/firebase/firebaseService";
import { storage } from "@/integrations/firebase/config";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { sendProjectStatusUpdateEmail } from "@/lib/emailService";
import { createNotification } from "@/integrations/firebase/notificationsService";

interface TimelineEvent {
  id: string;
  activity_text: string;
  actor_id: string | null;
  actor_type: "student" | "admin" | "system";
  createdAt?: any;
}

interface Student {
  name: string;
  email: string;
  phone: string;
  school: string;
  education_level: string;
  course_of_study: string;
}

interface Project {
  id: string;
  title: string;
  description?: string;
  user_id: string;
  status: string;
  progress: number;
  assigned_to?: string;
  deadline?: string;
  createdAt?: any;
  discipline?: string;
  academic_level?: string;
  budget_estimate?: number;
  phone?: string;
  needs_topic?: boolean;
  deliverables?: { id: string; name: string; url: string; uploadedAt?: string }[];
  files?: { name: string; url: string; uploadedAt?: string }[];
  studentFiles?: { name: string; url: string; uploadedAt?: string }[];
}

const AdminProjectDetail = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [project, setProject] = useState<Project | null>(null);
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [status, setStatus] = useState("");
  const [progressValue, setProgressValue] = useState(0);
  const [progressNote, setProgressNote] = useState("");
  const [assignedToInput, setAssignedToInput] = useState("");
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);

  // Deliverable File Upload State
  const [deliverableFile, setDeliverableFile] = useState<File | null>(null);
  const [deliverableName, setDeliverableName] = useState("");
  const [uploadingDeliverable, setUploadingDeliverable] = useState(false);

  const fetchProjectData = async () => {
    try {
      setLoading(true);
      if (!projectId) throw new Error("Project ID not found");

      const projectData = await getProject(projectId);
      if (!projectData) throw new Error("Project not found");

      let studentInfo: Student | null = null;
      if ((projectData as any).user_id) {
        const studentData = await getUser((projectData as any).user_id);
        if (studentData) {
          studentInfo = {
            name: (studentData as any).full_name || "Unknown",
            email: (studentData as any).email || "N/A",
            phone: (studentData as any).phone || "N/A",
            school: (studentData as any).school || "N/A",
            education_level: (studentData as any).education_level || "N/A",
            course_of_study: (studentData as any).course_of_study || "N/A",
          };
        }
      }

      const timelineData = await getProjectTimeline(projectId);

      setProject(projectData as Project);
      setStudent(studentInfo);
      setTimeline(timelineData as TimelineEvent[]);
      setStatus((projectData as any).status || "pending");
      setProgressValue((projectData as any).progress || 0);
      setAssignedToInput((projectData as any).assigned_to || "");
    } catch (err: any) {
      console.error("Fetch project error:", err);
      toast({
        title: "Error",
        description: err.message || "Could not load project details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) fetchProjectData();
  }, [projectId]);

  const handleStatusUpdate = async () => {
    if (!project) return;
    try {
      await updateProject(project.id, {
        status,
        progress: progressValue,
        assigned_to: assignedToInput,
      });

      // Send status notification email to student
      if (student?.email) {
        sendProjectStatusUpdateEmail(
          student.email,
          student.name,
          project.id,
          project.title,
          status,
          `Status updated to ${status} (${progressValue}% complete).`
        ).catch((e) => console.error(e));
      }

      // Add in-app notification
      if (project.user_id) {
        createNotification({
          user_id: project.user_id,
          project_id: project.id,
          title: `Project Status Updated: ${status}`,
          message: `Your project progress is now at ${progressValue}%.`,
          type: "status_update",
        }).catch((e) => console.error(e));
      }

      toast({ title: "Success", description: `Project status updated to ${status}` });
      setProject({ ...project, status, progress: progressValue, assigned_to: assignedToInput });
    } catch (err: any) {
      console.error("Status update error:", err);
      toast({ title: "Error", description: "Failed to update project: " + err.message, variant: "destructive" });
    }
  };

  const handleProgressUpdate = async () => {
    if (!progressNote.trim()) {
      toast({ title: "Error", description: "Please enter a message or progress note", variant: "destructive" });
      return;
    }
    if (!project) return;

    try {
      const entryId = await createTimeline(project.id, progressNote, "admin", "admin");

      // Notify student
      if (project.user_id) {
        createNotification({
          user_id: project.user_id,
          project_id: project.id,
          title: `New Tutor Response on ${project.id}`,
          message: progressNote,
          type: "message",
        }).catch((e) => console.error(e));
      }

      toast({ title: "Success", description: "Progress note / response added" });

      setTimeline([
        {
          id: entryId,
          activity_text: progressNote,
          actor_id: "admin",
          actor_type: "admin",
          createdAt: { seconds: Math.floor(Date.now() / 1000) },
        },
        ...timeline,
      ]);
      setProgressNote("");
    } catch (err: any) {
      console.error("Progress update error:", err);
      toast({ title: "Error", description: "Failed to add progress note: " + err.message, variant: "destructive" });
    }
  };

  const handleUploadDeliverable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deliverableFile || !project) {
      toast({ title: "File required", description: "Please select a file to upload.", variant: "destructive" });
      return;
    }

    setUploadingDeliverable(true);

    try {
      const fileName = deliverableName.trim() || deliverableFile.name;
      let downloadUrl = "";
      try {
        const storageRef = ref(storage, `projects/${project.id}/deliverables/${Date.now()}_${deliverableFile.name}`);
        await uploadBytes(storageRef, deliverableFile);
        downloadUrl = await getDownloadURL(storageRef);
      } catch (storageErr) {
        console.warn("Storage upload failed, falling back to Data URL:", storageErr);
        downloadUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(deliverableFile);
        });
      }

      const newDeliverable = {
        id: `del_${Date.now()}`,
        name: fileName,
        url: downloadUrl,
        uploadedAt: new Date().toISOString(),
      };

      const updatedDeliverables = [...(project.deliverables || []), newDeliverable];

      await updateProject(project.id, { deliverables: updatedDeliverables });

      // Create timeline entry
      await createTimeline(project.id, `Uploaded Deliverable: ${fileName}`, "admin", "admin");

      // Send notification to student
      if (project.user_id) {
        createNotification({
          user_id: project.user_id,
          project_id: project.id,
          title: `New Deliverable Uploaded`,
          message: `Deliverable document "${fileName}" is now available for download.`,
          type: "deliverable",
        }).catch((e) => console.error(e));
      }

      toast({ title: "✅ Deliverable Uploaded", description: `${fileName} is available on student dashboard.` });

      setProject({ ...project, deliverables: updatedDeliverables });
      setDeliverableFile(null);
      setDeliverableName("");
    } catch (err: any) {
      console.error("Deliverable upload error:", err);
      toast({ title: "Upload Failed", description: err.message, variant: "destructive" });
    } finally {
      setUploadingDeliverable(false);
    }
  };

  const handleDeleteProject = async () => {
    if (!projectId) return;

    setDeleting(true);
    try {
      await deleteProject(projectId);
      toast({ title: "✅ Success", description: "Project deleted successfully" });
      setTimeout(() => navigate("/admin"), 500);
    } catch (err: any) {
      console.error("Delete project error:", err);
      toast({ title: "❌ Error", description: "Failed to delete project: " + err.message, variant: "destructive" });
    } finally {
      setDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "In Progress":
        return "bg-primary/10 text-primary border-primary/20";
      case "Review":
        return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      case "Pending":
        return "bg-muted text-muted-foreground border-border";
      default:
        return "";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <AnimatedLoader message="Loading admin project control workspace..." />
      </div>
    );
  }

  if (!project) return <div className="p-4 text-red-500 text-center">Project not found</div>;

  return (
    <>
      <Helmet>
        <title>Project {projectId} - Admin - BuildWave</title>
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b bg-card">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                  <Link to="/admin">
                    <ArrowLeft className="h-5 w-5" />
                  </Link>
                </Button>
                <div>
                  <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-bold">{project.title}</h1>
                    <Badge className={getStatusColor(project.status)}>{project.status}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground font-mono">Project ID: {project.id}</p>
                </div>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setShowDeleteDialog(true)}
                disabled={deleting}
                className="gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Delete Project
              </Button>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Project Details */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Project Details & Budget</CardTitle>
                <Button
                  size="sm"
                  onClick={async () => {
                    if (!project) return;
                    try {
                      await updateProject(project.id, {
                        title: project.title,
                        description: project.description,
                        discipline: project.discipline,
                        budget_estimate: Number(project.budget_estimate || 0),
                        deadline: project.deadline,
                      });
                      toast({ title: "Saved!", description: "Project details updated successfully." });
                    } catch (err: any) {
                      toast({ title: "Error", description: err.message, variant: "destructive" });
                    }
                  }}
                  className="btn-hero"
                >
                  Save Details
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Project Title</Label>
                  <Input
                    value={project.title}
                    onChange={(e) => setProject({ ...project, title: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Description Brief</Label>
                  <Textarea
                    rows={4}
                    value={project.description || ""}
                    onChange={(e) => setProject({ ...project, description: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Discipline</Label>
                    <Input
                      value={project.discipline || ""}
                      onChange={(e) => setProject({ ...project, discipline: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Budget Estimate (₦)</Label>
                    <Input
                      type="number"
                      value={project.budget_estimate || 0}
                      onChange={(e) => setProject({ ...project, budget_estimate: Number(e.target.value) })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Deadline Date</Label>
                    <Input
                      type="text"
                      placeholder="e.g. 2026-09-30"
                      value={project.deadline || ""}
                      onChange={(e) => setProject({ ...project, deadline: e.target.value })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Deliverables & Upload Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5 text-primary" />
                  Deliverables & Instructions Upload
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <form onSubmit={handleUploadDeliverable} className="space-y-4 border p-4 rounded-lg bg-muted/20">
                  <div className="space-y-2">
                    <Label htmlFor="del-name">Deliverable Title / Description</Label>
                    <Input
                      id="del-name"
                      placeholder="e.g., Final Thesis Document (PDF), Source Code (ZIP)"
                      value={deliverableName}
                      onChange={(e) => setDeliverableName(e.target.value)}
                      disabled={uploadingDeliverable}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="del-file">Choose File / Document</Label>
                    <Input
                      id="del-file"
                      type="file"
                      onChange={(e) => setDeliverableFile(e.target.files?.[0] || null)}
                      disabled={uploadingDeliverable}
                    />
                  </div>

                  <Button type="submit" className="w-full btn-hero gap-2" disabled={uploadingDeliverable}>
                    <Upload className="h-4 w-4" />
                    {uploadingDeliverable ? "Uploading Deliverable..." : "Upload Deliverable to Student Dashboard"}
                  </Button>
                </form>

                <div>
                  <h4 className="font-semibold text-sm mb-3">Published Deliverables:</h4>
                  {project.deliverables?.length ? (
                    <div className="space-y-2">
                      {project.deliverables.map((item, idx) => (
                        <div key={item.id || idx} className="flex items-center justify-between p-3 border rounded-lg bg-card">
                          <div className="flex items-center gap-3">
                            <FileText className="h-5 w-5 text-primary" />
                            <div>
                              <p className="font-medium text-sm">{item.name}</p>
                              <p className="text-xs text-muted-foreground">{item.uploadedAt ? new Date(item.uploadedAt).toLocaleDateString() : "Uploaded"}</p>
                            </div>
                          </div>
                          <Button size="sm" variant="outline" onClick={() => window.open(item.url, "_blank")}>
                            <Download className="h-4 w-4 mr-1" />
                            View/Download
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground italic">No deliverables published yet.</p>
                  )}
                </div>

                {/* Files Uploaded by Student */}
                {(project.files?.length || project.studentFiles?.length) ? (
                  <div>
                    <Separator className="my-4" />
                    <h4 className="font-semibold text-sm mb-3 text-indigo-600 dark:text-indigo-400">Files Uploaded by Student:</h4>
                    <div className="space-y-2">
                      {[...(project.files || []), ...(project.studentFiles || [])].map((sf, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 border rounded-lg bg-indigo-50/50 dark:bg-indigo-950/20">
                          <div className="flex items-center gap-3">
                            <FileText className="h-5 w-5 text-indigo-600" />
                            <span className="font-medium text-sm">{sf.name}</span>
                          </div>
                          <Button size="sm" variant="outline" onClick={() => window.open(sf.url, "_blank")}>
                            <Download className="h-4 w-4 mr-1" />
                            Download Student File
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Project Activity & Student Messages</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {timeline.length > 0 ? (
                    timeline.map((event, index) => (
                      <div key={event.id || index} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className="rounded-full border-2 border-border bg-background p-2">
                            {event.actor_type === "admin" ? (
                              <User className="h-4 w-4 text-blue-500" />
                            ) : (
                              <CheckCircle className="h-4 w-4 text-emerald-500" />
                            )}
                          </div>
                          {index < timeline.length - 1 && <div className="w-0.5 flex-1 bg-border mt-2" />}
                        </div>
                        <div className="flex-1 pb-6">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <p className="font-medium whitespace-pre-wrap">{event.activity_text}</p>
                              <p className="text-xs text-muted-foreground capitalize">by {event.actor_type}</p>
                            </div>
                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                              {event.createdAt?.seconds
                                ? new Date(event.createdAt.seconds * 1000).toLocaleString()
                                : "Recently"}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-muted-foreground py-8">No timeline events recorded</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Student Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Student Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-muted-foreground">Name</Label>
                  <p className="mt-1 font-medium">{student?.name || "Unknown"}</p>
                </div>
                <Separator />
                <div>
                  <Label className="text-muted-foreground">Email</Label>
                  <p className="mt-1 text-sm">{student?.email || "N/A"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Phone</Label>
                  <p className="mt-1 text-sm">{student?.phone || "N/A"}</p>
                </div>
                <Separator />
                <div>
                  <Label className="text-muted-foreground">School</Label>
                  <p className="mt-1 text-sm">{student?.school || "N/A"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Education Level</Label>
                  <p className="mt-1 text-sm">{student?.education_level || "N/A"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Course</Label>
                  <p className="mt-1 text-sm">{student?.course_of_study || "N/A"}</p>
                </div>
              </CardContent>
            </Card>

            {/* Update Status & Tutor Assignment */}
            <Card>
              <CardHeader>
                <CardTitle>Status & Tutor Assignment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Project Status</Label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="In Progress">In Progress</SelectItem>
                      <SelectItem value="Review">Review</SelectItem>
                      <SelectItem value="Completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Assigned Tutor / Supervisor</Label>
                  <Input
                    placeholder="e.g. Engr. Michael / Admin"
                    value={assignedToInput}
                    onChange={(e) => setAssignedToInput(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Progress ({progressValue}%)</Label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={progressValue}
                    onChange={(e) => setProgressValue(Number(e.target.value))}
                  />
                  <Progress value={progressValue} />
                </div>
                <Button onClick={handleStatusUpdate} className="w-full btn-hero">
                  Save Status & Assignment
                </Button>
              </CardContent>
            </Card>

            {/* Add Progress Note / Response to Student */}
            <Card>
              <CardHeader>
                <CardTitle>Respond to Student / Add Note</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Enter response or progress update note for the student..."
                  value={progressNote}
                  onChange={(e) => setProgressNote(e.target.value)}
                  rows={4}
                />
                <Button onClick={handleProgressUpdate} className="w-full">
                  <Send className="h-4 w-4 mr-2" />
                  Send Response Note
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Project</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this project? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteProject}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </>
  );
};

export default AdminProjectDetail;
