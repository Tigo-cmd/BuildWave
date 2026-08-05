import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useNavigate } from "react-router-dom";
import { Search, Filter, Download, Eye, Edit, Trash2, Plus, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { AnimatedLoader } from "@/components/AnimatedLoader";
import { getProjects, deleteProject, createProject, getAllUsers, updateProject } from "@/integrations/firebase/firebaseService";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Project {
  id: string;
  title: string;
  student: string;
  studentEmail?: string;
  level: string;
  discipline: string;
  status: string;
  progress: number;
  assignedTo?: string | null;
  deadline?: string;
  lastUpdated?: string;
  user_id?: string;
}

const Admin = () => {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [projects, setProjects] = useState<Project[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [levelFilter, setLevelFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Create Project Modal State
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newProjectTitle, setNewProjectTitle] = useState("");
  const [newProjectUser, setNewProjectUser] = useState("");
  const [newProjectDiscipline, setNewProjectDiscipline] = useState("");
  const [newProjectLevel, setNewProjectLevel] = useState("undergraduate");
  const [newProjectAssignedTo, setNewProjectAssignedTo] = useState("");
  const [newProjectDesc, setNewProjectDesc] = useState("");
  const [newProjectDeadline, setNewProjectDeadline] = useState("");
  const [creatingProject, setCreatingProject] = useState(false);

  const fetchProjectsAndUsers = async () => {
    try {
      setLoading(true);
      const [allProjects, allUsers] = await Promise.all([
        getProjects(),
        getAllUsers().catch(() => []),
      ]);

      setUsersList(allUsers);
      const usersMap = new Map(allUsers.map((u: any) => [u.id, u]));

      const projectsData: Project[] = allProjects.map((p: any) => {
        const u = usersMap.get(p.user_id);
        const studentName = u?.full_name || p.student_name || p.student || "Unknown Student";
        const studentEmail = u?.email || "";

        return {
          id: p.id,
          title: p.title || "Untitled",
          student: studentName,
          studentEmail: studentEmail,
          level: p.academic_level || p.level || "N/A",
          discipline: p.discipline || p.category || "N/A",
          status: p.status ? p.status.charAt(0).toUpperCase() + p.status.slice(1) : "Pending",
          progress: p.progress || 0,
          assignedTo: p.assigned_to || null,
          deadline: p.deadline?.seconds
            ? new Date(p.deadline.seconds * 1000).toLocaleDateString()
            : p.deadline
            ? new Date(p.deadline).toLocaleDateString()
            : "N/A",
          lastUpdated: p.updatedAt?.seconds
            ? new Date(p.updatedAt.seconds * 1000).toLocaleDateString()
            : p.updatedAt
            ? new Date(p.updatedAt).toLocaleDateString()
            : "N/A",
          user_id: p.user_id,
        };
      });

      setProjects(projectsData);
    } catch (err: any) {
      console.error("Fetch projects error:", err);
      toast({
        title: "Error",
        description: "Failed to load projects: " + (err.message || "Unknown error"),
        variant: "destructive",
      });
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectsAndUsers();
  }, [toast]);

  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.student.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (project.assignedTo && project.assignedTo.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesLevel = levelFilter === "all" || project.level?.toLowerCase() === levelFilter.toLowerCase();
    const matchesStatus = statusFilter === "all" || project.status?.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesLevel && matchesStatus;
  });

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

  const handleLogout = async () => {
    await signOut();
    navigate("/admin/login");
  };

  const handleDeleteProject = async (projectId: string) => {
    setDeleting(true);
    try {
      await deleteProject(projectId);
      toast({
        title: "✅ Success",
        description: "Project deleted successfully",
      });
      setProjects(projects.filter((p) => p.id !== projectId));
    } catch (err: any) {
      console.error("Delete project error:", err);
      toast({
        title: "❌ Error",
        description: "Failed to delete project: " + err.message,
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
      setDeleteConfirm(null);
    }
  };

  const handleCreateProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectTitle.trim() || !newProjectUser) {
      toast({
        title: "Missing Fields",
        description: "Please enter a project title and select a student.",
        variant: "destructive",
      });
      return;
    }

    setCreatingProject(true);
    try {
      const createdId = await createProject({
        userId: newProjectUser,
        title: newProjectTitle,
        category: newProjectDiscipline,
        description: newProjectDesc,
        status: "pending",
        level: newProjectLevel,
        assigned_to: newProjectAssignedTo || null,
        deadline: newProjectDeadline ? new Date(newProjectDeadline) : null,
      });

      toast({
        title: "✅ Project Created",
        description: `Project ${createdId} created and assigned successfully.`,
      });

      setCreateModalOpen(false);
      setNewProjectTitle("");
      setNewProjectDesc("");
      setNewProjectAssignedTo("");
      fetchProjectsAndUsers();
    } catch (err: any) {
      toast({
        title: "Failed to create project",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setCreatingProject(false);
    }
  };

  const handleExportPDF = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast({ title: "Export Error", description: "Pop-up blocked. Please allow pop-ups to export PDF.", variant: "destructive" });
      return;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>BuildWave - Projects Report (${new Date().toLocaleDateString()})</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; color: #1e293b; }
            h1 { color: #4f46e5; border-bottom: 2px solid #6366f1; padding-bottom: 8px; }
            p.meta { color: #64748b; font-size: 14px; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th { background: #4f46e5; color: white; padding: 10px; text-align: left; font-size: 12px; }
            td { padding: 10px; border-bottom: 1px solid #e2e8f0; font-size: 12px; }
            tr:nth-child(even) { background: #f8fafc; }
            .badge { padding: 4px 8px; border-radius: 4px; font-weight: bold; font-size: 11px; }
          </style>
        </head>
        <body>
          <h1>BuildWave Academic Projects Report</h1>
          <p class="meta">Generated on: ${new Date().toLocaleString()} | Total Projects Listed: ${filteredProjects.length}</p>
          <table>
            <thead>
              <tr>
                <th>Project ID</th>
                <th>Title</th>
                <th>Student</th>
                <th>Discipline</th>
                <th>Status</th>
                <th>Progress</th>
                <th>Assigned To</th>
                <th>Deadline</th>
              </tr>
            </thead>
            <tbody>
              ${filteredProjects
                .map(
                  (p) => `
                <tr>
                  <td><strong>${p.id}</strong></td>
                  <td>${p.title}</td>
                  <td>${p.student}</td>
                  <td>${p.discipline}</td>
                  <td><span class="badge">${p.status}</span></td>
                  <td>${p.progress}%</td>
                  <td>${p.assignedTo || "Unassigned"}</td>
                  <td>${p.deadline}</td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <AnimatedLoader message="Loading BuildWave admin dashboard..." />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Admin Dashboard - BuildWave</title>
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b bg-card sticky top-0 z-30">
          <div className="container mx-auto px-4 py-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold gradient-text">BuildWave Admin Portal</h1>
                <p className="text-sm text-muted-foreground">Manage academic projects, users, and testimonials</p>
              </div>
              <div className="flex gap-2 flex-wrap">
                <Button className="btn-hero gap-1.5" onClick={() => setCreateModalOpen(true)}>
                  <Plus className="h-4 w-4" />
                  New Project
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/admin/content">Site Content (CMS)</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/admin/testimonials">Testimonials</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/admin/users">Users</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/">Back to Site</Link>
                </Button>
                <Button variant="destructive" onClick={handleLogout}>
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Projects</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{projects.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">In Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">
                  {projects.filter((p) => p.status?.toLowerCase() === "in_progress" || p.status === "In Progress").length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Pending Review</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-amber-500">
                  {projects.filter((p) => p.status?.toLowerCase() === "review" || p.status === "Review").length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-500">
                  {projects.filter((p) => p.status?.toLowerCase() === "completed" || p.status === "Completed").length}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters & Search */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by project ID, title, student name, or tutor..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={levelFilter} onValueChange={setLevelFilter}>
                  <SelectTrigger className="w-full md:w-48">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    <SelectItem value="Undergraduate">Undergraduate</SelectItem>
                    <SelectItem value="Masters">Masters</SelectItem>
                    <SelectItem value="PhD">PhD</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full md:w-48">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="review">Review</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" onClick={handleExportPDF} className="gap-2">
                  <Download className="h-4 w-4" />
                  Export PDF
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Projects Table */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Projects ({filteredProjects.length})</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Project ID</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead>Level</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Assigned To</TableHead>
                    <TableHead>Deadline</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProjects.map((project) => (
                    <TableRow key={project.id}>
                      <TableCell className="font-mono text-sm font-semibold">{project.id}</TableCell>
                      <TableCell className="font-medium max-w-[200px] truncate">{project.title}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm">{project.student}</p>
                          {project.studentEmail && <p className="text-xs text-muted-foreground">{project.studentEmail}</p>}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{project.level}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(project.status)}>{project.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={project.progress} className="w-16" />
                          <span className="text-xs text-muted-foreground">{project.progress}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {project.assignedTo ? (
                          <div className="flex items-center gap-1.5 text-xs text-indigo-600 font-medium dark:text-indigo-400">
                            <UserCheck className="h-3.5 w-3.5" />
                            {project.assignedTo}
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground italic">Unassigned</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm">{project.deadline}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="ghost" asChild>
                            <Link to={`/admin/projects/${project.id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-500 hover:text-red-600 hover:bg-red-50"
                            onClick={() => setDeleteConfirm(project.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}

                  {filteredProjects.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                        No projects found matching your criteria.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Delete Project Dialog */}
        <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Project</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this project? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteConfirm) {
                  handleDeleteProject(deleteConfirm);
                }
              }}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogContent>
        </AlertDialog>

        {/* Admin Create Project Modal */}
        <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold gradient-text">Create New Project (Admin)</DialogTitle>
              <DialogDescription>
                Add a new project for a student and assign an academic specialist directly.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleCreateProjectSubmit} className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="stud-select">Select Student</Label>
                <select
                  id="stud-select"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={newProjectUser}
                  onChange={(e) => setNewProjectUser(e.target.value)}
                  required
                >
                  <option value="">-- Choose Student --</option>
                  {usersList.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.full_name || u.name || "Student"} ({u.email || u.id})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="p-title">Project Title</Label>
                <Input
                  id="p-title"
                  placeholder="e.g. Design of AI Microgrid Controller"
                  value={newProjectTitle}
                  onChange={(e) => setNewProjectTitle(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="p-disc">Discipline / Category</Label>
                  <Input
                    id="p-disc"
                    placeholder="Electrical Engineering"
                    value={newProjectDiscipline}
                    onChange={(e) => setNewProjectDiscipline(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="p-lvl">Academic Level</Label>
                  <select
                    id="p-lvl"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={newProjectLevel}
                    onChange={(e) => setNewProjectLevel(e.target.value)}
                  >
                    <option value="undergraduate">Undergraduate</option>
                    <option value="masters">Masters</option>
                    <option value="phd">PhD</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="p-assign">Assign Tutor / Specialist</Label>
                  <Input
                    id="p-assign"
                    placeholder="Engr. Adebayo"
                    value={newProjectAssignedTo}
                    onChange={(e) => setNewProjectAssignedTo(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="p-date">Deadline Date</Label>
                  <Input
                    id="p-date"
                    type="date"
                    value={newProjectDeadline}
                    onChange={(e) => setNewProjectDeadline(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="p-desc">Project Brief & Instructions</Label>
                <Textarea
                  id="p-desc"
                  rows={3}
                  placeholder="Initial project guidelines and expectations..."
                  value={newProjectDesc}
                  onChange={(e) => setNewProjectDesc(e.target.value)}
                />
              </div>

              <Button type="submit" className="w-full btn-hero" disabled={creatingProject}>
                {creatingProject ? "Creating Project..." : "Create & Assign Project"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
};

export default Admin;
