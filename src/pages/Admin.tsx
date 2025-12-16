import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useNavigate } from "react-router-dom";
import { Search, Filter, Download, Eye, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { getProjects, deleteProject } from "@/integrations/firebase/firebaseService";
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
  level: string;
  discipline: string;
  status: string;
  progress: number;
  assignedTo?: string | null;
  deadline?: string;
  lastUpdated?: string;
}

const Admin = () => {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [levelFilter, setLevelFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        // Fetch all projects at once
        const allProjects = await getProjects();
        console.log("Fetched projects:", allProjects);

        // Map Firebase response to Project interface
        const projectsData: Project[] = allProjects.map((p: any) => ({
          id: p.id,
          title: p.title || "Untitled",
          student: p.student_name || "Unknown",
          level: p.academic_level || "N/A",
          discipline: p.discipline || "N/A",
          status: p.status?.charAt(0).toUpperCase() + p.status?.slice(1) || "Pending",
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
        }));

        console.log("Mapped projects:", projectsData);
        setProjects(projectsData);
      } catch (err: any) {
        console.error("Fetch projects error:", err);
        toast({
          title: "Error",
          description: "Failed to load projects: " + (err.message || "Unknown error"),
          variant: "destructive",
        });
        setProjects([]); // Set empty array on error
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [toast]);

  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.student.toLowerCase().includes(searchQuery.toLowerCase());
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
      // Remove from local state
      setProjects(projects.filter(p => p.id !== projectId));
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

  if (loading) return <div className="p-4">Loading projects...</div>;

  return (
    <>
      <Helmet>
        <title>Admin Dashboard - BuildWave</title>
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b bg-card">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold gradient-text">BuildWave Admin</h1>
                <p className="text-sm text-muted-foreground">Manage projects, users, and testimonials</p>
              </div>
              <div className="flex gap-2">
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
                    placeholder="Search by project ID, title, or student name..."
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
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Projects Table */}
          <Card>
            <CardHeader>
              <CardTitle>Projects ({filteredProjects.length})</CardTitle>
            </CardHeader>
            <CardContent>
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
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProjects.map((project) => (
                    <TableRow key={project.id}>
                      <TableCell className="font-mono text-sm">{project.id}</TableCell>
                      <TableCell className="font-medium">{project.title}</TableCell>
                      <TableCell>{project.student}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{project.level}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(project.status)}>{project.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={project.progress} className="w-20" />
                          <span className="text-xs text-muted-foreground">{project.progress}%</span>
                        </div>
                      </TableCell>
                      <TableCell>{project.assignedTo || "-"}</TableCell>
                      <TableCell className="text-sm">{project.deadline}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
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
      </div>
    </>
  );
};

export default Admin;
