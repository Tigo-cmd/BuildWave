import { useState } from "react";
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

// Mock data
const mockProject = {
  id: "BW-2025-0042",
  title: "IoT Water Tank Controller",
  student: {
    name: "Amaka Okoye",
    email: "amaka.okoye@unilag.edu.ng",
    phone: "+234 812 345 6789",
    school: "University of Lagos",
    level: "Undergraduate",
    course: "Electrical Engineering"
  },
  status: "In Progress",
  progress: 45,
  assignedTo: "Chinelo",
  deadline: "2025-11-15",
  createdAt: "2025-09-01",
  discipline: "Electrical Engineering",
  description: "Design and implement an IoT-based water tank level controller using ESP32, ultrasonic sensors, and mobile app interface for real-time monitoring and automated control.",
  budget: "₦150,000",
  timeline: [
    { date: "2025-09-01T10:00:00Z", actor: "student", text: "Project submitted", type: "system" },
    { date: "2025-09-02T12:00:00Z", actor: "admin", text: "Project assigned to Chinelo", type: "system" },
    { date: "2025-09-05T14:30:00Z", actor: "Chinelo", text: "Initial consultation completed. Hardware specifications finalized.", type: "progress" },
    { date: "2025-09-12T11:00:00Z", actor: "Chinelo", text: "Circuit design completed and approved", type: "progress" },
    { date: "2025-09-20T16:00:00Z", actor: "student", text: "Requested progress update", type: "request" }
  ],
  deliverables: [
    { id: "d1", name: "Project_Proposal.pdf", uploadedAt: "2025-09-05", url: "#" },
    { id: "d2", name: "Circuit_Diagram.pdf", uploadedAt: "2025-09-12", url: "#" },
    { id: "d3", name: "Hardware_BOM.xlsx", uploadedAt: "2025-09-12", url: "#" }
  ]
};

const AdminProjectDetail = () => {
  const { projectId } = useParams();
  const { toast } = useToast();
  const [status, setStatus] = useState(mockProject.status);
  const [progressValue, setProgressValue] = useState(mockProject.progress);
  const [progressNote, setProgressNote] = useState("");
  const [notificationMessage, setNotificationMessage] = useState("");

  const handleStatusUpdate = () => {
    toast({
      title: "Status Updated",
      description: `Project status changed to ${status}`,
    });
  };

  const handleProgressUpdate = () => {
    if (!progressNote.trim()) {
      toast({
        title: "Error",
        description: "Please enter a progress note",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Progress Updated",
      description: "Progress note added successfully",
    });
    setProgressNote("");
  };

  const handleSendNotification = () => {
    if (!notificationMessage.trim()) {
      toast({
        title: "Error",
        description: "Please enter a message",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Notification Sent",
      description: "Student has been notified via email and WhatsApp",
    });
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
                    <h1 className="text-2xl font-bold">{mockProject.title}</h1>
                    <Badge className={getStatusColor(mockProject.status)}>
                      {mockProject.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">Project ID: {mockProject.id}</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Project Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Project Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-muted-foreground">Description</Label>
                    <p className="mt-1">{mockProject.description}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-muted-foreground">Discipline</Label>
                      <p className="mt-1 font-medium">{mockProject.discipline}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Budget</Label>
                      <p className="mt-1 font-medium">{mockProject.budget}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Created</Label>
                      <p className="mt-1 font-medium">{mockProject.createdAt}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Deadline</Label>
                      <p className="mt-1 font-medium text-amber-500">{mockProject.deadline}</p>
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
                    {mockProject.timeline.map((event, index) => (
                      <div key={index} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className="rounded-full border-2 border-border bg-background p-2">
                            {getTimelineIcon(event.type)}
                          </div>
                          {index < mockProject.timeline.length - 1 && (
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
                    {mockProject.deliverables.map((file) => (
                      <div key={file.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-primary" />
                          <div>
                            <p className="font-medium">{file.name}</p>
                            <p className="text-xs text-muted-foreground">Uploaded {file.uploadedAt}</p>
                          </div>
                        </div>
                        <Button size="sm" variant="ghost">Download</Button>
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
                    <p className="mt-1 font-medium">{mockProject.student.name}</p>
                  </div>
                  <Separator />
                  <div>
                    <Label className="text-muted-foreground">Email</Label>
                    <p className="mt-1 text-sm">{mockProject.student.email}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Phone</Label>
                    <p className="mt-1 text-sm">{mockProject.student.phone}</p>
                  </div>
                  <Separator />
                  <div>
                    <Label className="text-muted-foreground">School</Label>
                    <p className="mt-1 text-sm">{mockProject.student.school}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Level</Label>
                    <p className="mt-1 text-sm">{mockProject.student.level}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Course</Label>
                    <p className="mt-1 text-sm">{mockProject.student.course}</p>
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
      </div>
    </>
  );
};

export default AdminProjectDetail;
