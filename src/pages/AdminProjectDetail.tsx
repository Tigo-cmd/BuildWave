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
import { useToast } from "@/components/ui/use-toast";
import { getProject, updateProject, getUser, createTimeline, getProjectTimeline } from "@/integrations/firebase/firebaseService";

interface Deliverable {
  id: string;
  name: string;
  file_url: string;
  file_size?: number;
  created_at?: string;
}

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
}

const AdminProjectDetail = () => {
  const { projectId } = useParams();
  const { toast } = useToast();

  const [project, setProject] = useState<Project | null>(null);
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [progressValue, setProgressValue] = useState(0);
  const [progressNote, setProgressNote] = useState("");
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoading(true);
        if (!projectId) throw new Error("Project ID not found");

        // Fetch project details
        const projectData = await getProject(projectId);
        if (!projectData) throw new Error("Project not found");

        // Fetch student details
        const studentData = await getUser((projectData as any).user_id);
        
        const studentInfo: Student = {
          name: (studentData as any)?.full_name || "Unknown",
          email: (studentData as any)?.email || "N/A",
          phone: (studentData as any)?.phone || "N/A",
          school: (studentData as any)?.school || "N/A",
          education_level: (studentData as any)?.education_level || "N/A",
          course_of_study: (studentData as any)?.course_of_study || "N/A",
        };

        // Fetch timeline
        const timelineData = await getProjectTimeline(projectId);

        setProject(projectData as Project);
        setStudent(studentInfo);
        setTimeline(timelineData as TimelineEvent[]);
        setStatus((projectData as any).status);
        setProgressValue((projectData as any).progress || 0);
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

    fetchProject();
  }, [projectId, toast]);

  const handleStatusUpdate = async () => {
    if (!project) return;
    try {
      await updateProject(project.id, { status, progress: progressValue });
      toast({ title: "Success", description: `Project status changed to ${status}` });
      setProject({ ...project, status, progress: progressValue });
    } catch (err: any) {
      console.error("Status update error:", err);
      toast({ title: "Error", description: "Failed to update project: " + err.message, variant: "destructive" });
    }
  };

  const handleProgressUpdate = async () => {
    if (!progressNote.trim()) {
      toast({ title: "Error", description: "Please enter a progress note", variant: "destructive" });
      return;
    }
    if (!project) return;

    try {
      const entryId = await createTimeline(project.id, progressNote, "admin-user-id", "admin");
      
      toast({ title: "Success", description: "Progress note added successfully" });
      
      setTimeline([
        {
          id: entryId,
          activity_text: progressNote,
          actor_id: "admin-user-id",
          actor_type: "admin",
          createdAt: new Date(),
        },
        ...timeline,
      ]);
      setProgressNote("");
    } catch (err: any) {
      console.error("Progress update error:", err);
      toast({ title: "Error", description: "Failed to add progress note: " + err.message, variant: "destructive" });
    }
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
                  <p className="mt-1">{project.description || "No description"}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Discipline</Label>
                    <p className="mt-1 font-medium">{project.discipline || "N/A"}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Budget</Label>
                    <p className="mt-1 font-medium">₦{project.budget_estimate?.toLocaleString() || "0"}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Created</Label>
                    <p className="mt-1 font-medium">
                      {(project.createdAt as any)?.seconds
                        ? new Date((project.createdAt as any).seconds * 1000).toLocaleDateString()
                        : "N/A"}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Deadline</Label>
                    <p className="mt-1 font-medium text-amber-500">
                      {typeof project.deadline === 'string' && project.deadline
                        ? project.deadline
                        : (project.deadline as any)?.seconds
                        ? new Date((project.deadline as any).seconds * 1000).toLocaleDateString()
                        : "N/A"}
                    </p>
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
                  {timeline.length > 0 ? (
                    timeline.map((event, index) => (
                      <div key={event.id || index} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className="rounded-full border-2 border-border bg-background p-2">
                            {event.actor_type === "admin" ? (
                              <User className="h-4 w-4 text-blue-500" />
                            ) : (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            )}
                          </div>
                          {index < timeline.length - 1 && (
                            <div className="w-0.5 flex-1 bg-border mt-2" />
                          )}
                        </div>
                        <div className="flex-1 pb-6">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <p className="font-medium">{event.activity_text}</p>
                              <p className="text-sm text-muted-foreground">by {event.actor_type}</p>
                            </div>
                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                              {event.createdAt
                                ? new Date(event.createdAt.seconds * 1000).toLocaleDateString()
                                : "N/A"}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-muted-foreground py-8">No timeline events yet</p>
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
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminProjectDetail;
