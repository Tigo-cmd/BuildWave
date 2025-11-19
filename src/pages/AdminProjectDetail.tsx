import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Upload, Send, CheckCircle, Clock, FileText, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

interface Deliverable {
  id: string;
  name: string;
  uploadedAt: string;
  url: string;
}

interface TimelineEvent {
  date: string;
  actor: string;
  text: string;
  type: string;
}

interface Student {
  name: string;
  email: string;
  phone: string;
  school: string;
  level: string;
  course: string;
}

interface Project {
  id: string;
  title: string;
  student: Student;
  status: string;
  progress: number;
  assignedTo?: string;
  deadline?: string;
  createdAt: string;
  discipline?: string;
  description?: string;
  budget?: string;
  timeline: TimelineEvent[];
  deliverables: Deliverable[];
}

const AdminProjectDetail = () => {
  const { projectId } = useParams();
  const { toast } = useToast();

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [progressValue, setProgressValue] = useState(0);
  const [progressNote, setProgressNote] = useState("");
  const [notificationMessage, setNotificationMessage] = useState("");

  const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const token = localStorage.getItem("buildwave_token");
        const res = await fetch(`${API_BASE}/api/projects/${projectId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch project");
        const data = await res.json();

        // Build student object from backend response
        const student: Student = {
          name: data.project?.studentName || data.project.contact?.email || "Unknown",
          email: data.project.contact?.email || "N/A",
          phone: data.project.contact?.phone || "N/A",
          school: data.project.school || "N/A",
          level: data.project.level || "N/A",
          course: data.project.discipline || "N/A",
        };

        const projectData: Project = {
          ...data.project,
          student,
          timeline: data.project.timeline || [],
          deliverables: data.project.deliverables || [],
        };

        setProject(projectData);
        setStatus(projectData.status);
        setProgressValue(projectData.progress || 0);
      } catch (err) {
        console.error("Fetch project error:", err);
        toast({
          title: "Error",
          description: "Could not load project details",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [projectId, toast]);

  const handleStatusUpdate = async () => {
    if (!project) return;
    try {
      const token = localStorage.getItem("buildwave_token");
      const res = await fetch(`${API_BASE}/api/projects/${project.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status, progress: progressValue }),
      });
      if (!res.ok) throw new Error("Failed to update project");

      toast({ title: "Status Updated", description: `Project status changed to ${status}` });
      setProject({ ...project, status, progress: progressValue });
    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: "Failed to update project", variant: "destructive" });
    }
  };

  const handleProgressUpdate = async () => {
    if (!progressNote.trim()) {
      toast({ title: "Error", description: "Please enter a progress note", variant: "destructive" });
      return;
    }
    if (!project) return;

    try {
      const token = localStorage.getItem("buildwave_token");
      const res = await fetch(`${API_BASE}/api/projects/${project.id}/progress-request`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message: progressNote }),
      });
      if (!res.ok) throw new Error("Failed to add progress note");

      toast({ title: "Progress Updated", description: "Progress note added successfully" });
      setProject({
        ...project,
        timeline: [
          ...project.timeline,
          { date: new Date().toISOString(), actor: "admin", text: progressNote, type: "progress" },
        ],
      });
      setProgressNote("");
    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: "Failed to add progress note", variant: "destructive" });
    }
  };

  const handleSendNotification = () => {
    if (!notificationMessage.trim()) {
      toast({ title: "Error", description: "Please enter a message", variant: "destructive" });
      return;
    }
    // Implement notification API call if needed
    toast({ title: "Notification Sent", description: "Student has been notified" });
    setNotificationMessage("");
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case "Completed": return "bg-green-500/10 text-green-500 border-green-500/20";
      case "In Progress": return "bg-primary/10 text-primary border-primary/20";
      case "Review": return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      case "Pending": return "bg-muted text-muted-foreground border-border";
      default: return "";
    }
  };

  const getTimelineIcon = (type: string) => {
    switch(type) {
      case "progress": return <CheckCircle className="h-5 w-5 text-primary" />;
      case "request": return <Clock className="h-5 w-5 text-amber-500" />;
      default: return <FileText className="h-5 w-5 text-muted-foreground" />;
    }
  };

  if (loading) return <div className="p-4">Loading project...</div>;
  if (!project) return <div className="p-4 text-red-500">Project not found</div>;

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
                  <p className="text-sm text-muted-foreground">Project ID: {project.id}</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Project Details */}
            <Card>
              <CardHeader>
                <CardTitle>Project Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-muted-foreground">Description</Label>
                  <p className="mt-1">{project.description}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Discipline</Label>
                    <p className="mt-1 font-medium">{project.discipline}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Budget</Label>
                    <p className="mt-1 font-medium">{project.budget}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Created</Label>
                    <p className="mt-1 font-medium">{project.createdAt}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Deadline</Label>
                    <p className="mt-1 font-medium text-amber-500">{project.deadline}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Project Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {project.timeline.map((event, index) => (
                    <div key={index} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="rounded-full border-2 border-border bg-background p-2">
                          {getTimelineIcon(event.type)}
                        </div>
                        {index < project.timeline.length - 1 && (
                          <div className="w-0.5 flex-1 bg-border mt-2" />
                        )}
                      </div>
                      <div className="flex-1 pb-6">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="font-medium">{event.text}</p>
                            <p className="text-sm text-muted-foreground">by {event.actor}</p>
                          </div>
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {new Date(event.date).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Deliverables */}
            <Card>
              <CardHeader>
                <CardTitle>Deliverables</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {project.deliverables.map((file) => (
                    <div key={file.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium">{file.name}</p>
                          <p className="text-xs text-muted-foreground">Uploaded {file.uploadedAt}</p>
                        </div>
                      </div>
                      <Button size="sm" variant="ghost" asChild>
                        <a href={file.url} target="_blank" rel="noopener noreferrer">Download</a>
                      </Button>
                    </div>
                  ))}
                  <Button className="w-full" variant="outline">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload New Deliverable
                  </Button>
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
                  <p className="mt-1 font-medium">{project.student.name}</p>
                </div>
                <Separator />
                <div>
                  <Label className="text-muted-foreground">Email</Label>
                  <p className="mt-1 text-sm">{project.student.email}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Phone</Label>
                  <p className="mt-1 text-sm">{project.student.phone}</p>
                </div>
                <Separator />
                <div>
                  <Label className="text-muted-foreground">School</Label>
                  <p className="mt-1 text-sm">{project.student.school}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Level</Label>
                  <p className="mt-1 text-sm">{project.student.level}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Course</Label>
                  <p className="mt-1 text-sm">{project.student.course}</p>
                </div>
              </CardContent>
            </Card>

            {/* Update Status */}
            <Card>
              <CardHeader>
                <CardTitle>Update Status</CardTitle>
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
                <Button onClick={handleStatusUpdate} className="w-full">
                  Save Changes
                </Button>
              </CardContent>
            </Card>

            {/* Add Progress Note */}
            <Card>
              <CardHeader>
                <CardTitle>Add Progress Note</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Enter progress update for the student..."
                  value={progressNote}
                  onChange={(e) => setProgressNote(e.target.value)}
                  rows={4}
                />
                <Button onClick={handleProgressUpdate} className="w-full">
                  <Send className="h-4 w-4 mr-2" />
                  Add Note
                </Button>
              </CardContent>
            </Card>

            {/* Send Notification */}
            <Card>
              <CardHeader>
                <CardTitle>Send Notification</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Notify student via email & WhatsApp..."
                  value={notificationMessage}
                  onChange={(e) => setNotificationMessage(e.target.value)}
                  rows={3}
                />
                <Button onClick={handleSendNotification} className="w-full" variant="outline">
                  <Send className="h-4 w-4 mr-2" />
                  Send Notification
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminProjectDetail;
