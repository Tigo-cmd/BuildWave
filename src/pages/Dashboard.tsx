import { Footer } from "@/components/Footer";
import { TrackProjectModal } from "@/components/TrackProjectModal";
import { ProjectRequestModal } from "@/components/ProjectRequestModal";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, FileText, Clock, LogOut } from "lucide-react";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";

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
  const [trackModalOpen, setTrackModalOpen] = useState(false);
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("buildwave_user");
    const storedProjects = localStorage.getItem("buildwave_projects");

    if (storedUser) setUser(JSON.parse(storedUser));
    if (storedProjects) setProjects(JSON.parse(storedProjects));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("buildwave_user");
    navigate("/");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "In Progress":
        return "bg-primary text-white";
      case "Under Review":
      case "Pending Review":
        return "bg-yellow-100 text-yellow-700";
      case "Completed":
        return "bg-green-100 text-green-700";
      case "On Hold":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

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
              <Button
                onClick={() => setProjectModalOpen(true)}
                className="btn-hero"
              >
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
            {projects.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl p-12 text-center shadow-lg"
              >
                <h2 className="text-2xl font-bold mb-4">
                  No Projects Yet
                </h2>
                <p className="text-muted-foreground mb-6">
                  Start your academic journey by submitting your first project
                </p>
                <Button
                  onClick={() => setProjectModalOpen(true)}
                  className="btn-hero"
                >
                  <Plus className="mr-2 h-5 w-5" />
                  Submit Your First Project
                </Button>
              </motion.div>
            ) : (
              projects.map((project, index) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card
                    className="card-hover cursor-pointer"
                    onClick={() => navigate(`/projects/${project.id}`)}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-xl mb-1">
                            {project.title || "Untitled Project"}
                          </CardTitle>
                          <CardDescription className="flex items-center gap-2">
                            <span className="font-mono text-xs">
                              {project.id}
                            </span>
                            <span>•</span>
                            <Badge variant="outline">{project.level}</Badge>
                            {project.discipline && (
                              <>
                                <span>•</span>
                                <Badge variant="outline">
                                  {project.discipline}
                                </Badge>
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
                            <span className="text-muted-foreground">
                              Progress
                            </span>
                            <span className="font-medium">
                              {project.progress || 0}%
                            </span>
                          </div>
                          <Progress
                            value={project.progress || 0}
                            className="h-2"
                          />
                        </div>
                        <div className="flex items-center justify-between pt-2 border-t">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            <span>
                              Updated {project.lastUpdate || "recently"}
                            </span>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                navigate(`/projects/${project.id}`)
                              }
                            >
                              <FileText className="mr-2 h-4 w-4" />
                              View Details
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
          </div>
        </main>

        <Footer onTrackProject={() => setTrackModalOpen(true)} />
        <TrackProjectModal
          open={trackModalOpen}
          onOpenChange={setTrackModalOpen}
        />
        <ProjectRequestModal
          open={projectModalOpen}
          onOpenChange={setProjectModalOpen}
        />
      </div>
    </>
  );
};

export default Dashboard;
