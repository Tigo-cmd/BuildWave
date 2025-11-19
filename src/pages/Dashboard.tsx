import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";

import { Footer } from "@/components/Footer";
import { TrackProjectModal } from "@/components/TrackProjectModal";
import { ProjectRequestModal } from "@/components/ProjectRequestModal";

import {
  Card,
  CardHeader,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

import { Plus, FileText, Clock, LogOut } from "lucide-react";

const API_BASE = "http://localhost:5000";

interface Project {
  id: string;
  title: string;
  status: string;
  progress: number;
  level: string;
  discipline?: string;
  lastUpdate?: string;
}

interface User {
  name: string;
  school?: string;
}

const Dashboard = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState<User | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [trackModalOpen, setTrackModalOpen] = useState(false);
  const [projectModalOpen, setProjectModalOpen] = useState(false);

  // -------------------------------------
  // Fetch dashboard data from backend
  // -------------------------------------
  const fetchDashboard = async () => {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("buildwave_token");
      if (!token) throw new Error("User not authenticated");

      const res = await fetch(`${API_BASE}/api/projects`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to load dashboard");

      setUser(data.user || null);
      setProjects(data.projects || []);
    } catch (err: any) {
      console.error("Dashboard fetch error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  // -------------------------------------
  // Logout
  // -------------------------------------
  const handleLogout = () => {
    localStorage.removeItem("buildwave_token");
    navigate("/");
  };

  // -------------------------------------
  // Badge color
  // -------------------------------------
  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      "In Progress": "bg-primary text-white",
      "Under Review": "bg-yellow-100 text-yellow-700",
      "Pending Review": "bg-yellow-100 text-yellow-700",
      "Completed": "bg-green-100 text-green-700",
      "On Hold": "bg-red-100 text-red-700",
    };
    return colors[status] || "bg-gray-100 text-gray-700";
  };

  // -------------------------------------
  // Project Card
  // -------------------------------------
  const ProjectCard = ({ project, index }: { project: Project; index: number }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card
        className="card-hover cursor-pointer"
        onClick={() => navigate(`/track/${project.id}`)}
      >
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-xl mb-1">
                {project.title || "Untitled Project"}
              </CardTitle>
              <CardDescription className="flex items-center gap-2">
                <span className="font-mono text-xs">{project.id}</span>
                <span>•</span>
                <Badge variant="outline">{project.level}</Badge>
                {project.discipline && (
                  <>
                    <span>•</span>
                    <Badge variant="outline">{project.discipline}</Badge>
                  </>
                )}
              </CardDescription>
            </div>
            <Badge className={getStatusColor(project.status)}>
              {project.status}
            </Badge>
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium">{project.progress || 0}%</span>
              </div>
              <Progress value={project.progress || 0} className="h-2" />
            </div>

            <div className="flex items-center justify-between pt-2 border-t">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>Updated {project.lastUpdate || "recently"}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/track/${project.id}`)}
              >
                <FileText className="mr-2 h-4 w-4" />
                View Details
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  // -------------------------------------
  // Empty State
  // -------------------------------------
  const EmptyProjects = () => (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl p-12 text-center shadow-lg"
    >
      <h2 className="text-2xl font-bold mb-4">No Projects Yet</h2>
      <p className="text-muted-foreground mb-6">
        Start your academic journey by submitting your first project
      </p>
      <Button className="btn-hero" onClick={() => setProjectModalOpen(true)}>
        <Plus className="mr-2 h-5 w-5" />
        Submit Your First Project
      </Button>
    </motion.div>
  );

  // -------------------------------------
  // Render
  // -------------------------------------
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>My Dashboard - BuildWave</title>
        <meta
          name="description"
          content="Manage your academic projects, track progress, and communicate with your BuildWave team."
        />
      </Helmet>

      <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50">
        <main className="flex-1 container px-4 py-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold">
                Welcome back, {user?.name || "Student"}!
              </h1>
              {user?.school && (
                <p className="text-muted-foreground mt-1">{user.school}</p>
              )}
            </div>

            <div className="flex gap-2">
              <Button className="btn-hero" onClick={() => setProjectModalOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                New Project
              </Button>
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>

          {/* Projects Section */}
          <div className="grid gap-6 mb-8">
            {projects.length === 0
              ? <EmptyProjects />
              : projects.map((p, i) => <ProjectCard key={p.id} project={p} index={i} />)}
          </div>
        </main>

        {/* Modals */}
        <Footer onTrackProject={() => setTrackModalOpen(true)} />
        <TrackProjectModal open={trackModalOpen} onOpenChange={setTrackModalOpen} />
        <ProjectRequestModal open={projectModalOpen} onOpenChange={setProjectModalOpen} />
      </div>
    </>
  );
};

export default Dashboard;
