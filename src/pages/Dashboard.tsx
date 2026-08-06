import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";

import { TrackProjectModal } from "@/components/TrackProjectModal";
import { ProjectRequestModal } from "@/components/ProjectRequestModal";
import { TestimonialModal } from "@/components/TestimonialModal";
import { AccountSettingsModal } from "@/components/AccountSettingsModal";

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

import { Plus, FileText, Clock, LogOut, Home, Bell, MessageSquareQuote, Settings } from "lucide-react";
import { useFirebaseAuth } from "@/integrations/firebase/useFirebaseAuth";
import { getUserProjects, getUser } from "@/integrations/firebase/firebaseService";
import { getUserNotifications, markNotificationAsRead } from "@/integrations/firebase/notificationsService";
import { useInactivityTimer } from "@/hooks/useInactivityTimer";
import { AnimatedLoader } from "@/components/AnimatedLoader";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface Project {
  id: string;
  title: string;
  status: string;
  progress?: number;
  category?: string;
  description?: string;
  createdAt?: any;
}

interface User {
  name: string;
  school?: string;
  email?: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { user: authUser, logout } = useFirebaseAuth();

  const [user, setUser] = useState<User | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [trackModalOpen, setTrackModalOpen] = useState(false);
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [testimonialModalOpen, setTestimonialModalOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);

  // Automatic session timeout after 30 minutes of inactivity
  useInactivityTimer({
    timeoutMs: 1800000,
    enabled: Boolean(authUser),
    onTimeout: () => {
      handleLogout();
    },
  });

  useEffect(() => {
    if (!authUser && !loading) {
      navigate("/");
    }
  }, [authUser, navigate, loading]);

  const fetchDashboard = async () => {
    setLoading(true);
    setError("");

    try {
      if (!authUser) {
        throw new Error("User not authenticated");
      }

      // Fetch user profile
      const userProfile = await getUser(authUser.uid);
      if (userProfile) {
        setUser({
          name: (userProfile as any)?.full_name || (userProfile as any)?.name || authUser.displayName || "Student",
          school: (userProfile as any)?.school,
          email: (userProfile as any)?.email,
        });
      }

      // Fetch user projects & notifications
      const [userProjects, notifs] = await Promise.all([
        getUserProjects(authUser.uid),
        getUserNotifications(authUser.uid).catch(() => []),
      ]);

      setProjects(userProjects as Project[]);
      setNotifications(notifs);
    } catch (err: any) {
      console.error("Dashboard fetch error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authUser) {
      fetchDashboard();
    }
  }, [authUser]);

  const handleLogout = async () => {
    try {
      await logout();
      localStorage.removeItem("buildwave_uid");
      localStorage.removeItem("buildwave_user");
      localStorage.removeItem("buildwave_email");
      navigate("/");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const getStatusColor = (status: string) => {
    const s = status?.toLowerCase() || "";
    if (s.includes("completed")) return "bg-green-500/10 text-green-600 border-green-500/20";
    if (s.includes("progress")) return "bg-primary/10 text-primary border-primary/20";
    if (s.includes("review")) return "bg-amber-500/10 text-amber-600 border-amber-500/20";
    return "bg-muted text-muted-foreground border-border";
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleNotificationClick = async (n: any) => {
    if (!n.read) {
      await markNotificationAsRead(n.id);
      setNotifications(notifications.map((item) => (item.id === n.id ? { ...item, read: true } : item)));
    }
    if (n.project_id) {
      navigate(`/track/${n.project_id}`);
    }
  };

  const ProjectCard = ({ project, index }: { project: Project; index: number }) => {
    const formatDate = (timestamp: any) => {
      if (!timestamp) return "recently";
      try {
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        if (diffDays === 0) return "today";
        if (diffDays === 1) return "yesterday";
        if (diffDays < 7) return `${diffDays} days ago`;
        return date.toLocaleDateString();
      } catch {
        return "recently";
      }
    };

    return (
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
                  {project.category && (
                    <>
                      <span>•</span>
                      <Badge variant="outline">{project.category}</Badge>
                    </>
                  )}
                </CardDescription>
              </div>
              <Badge className={getStatusColor(project.status)}>
                {project.status || "Pending"}
              </Badge>
            </div>
          </CardHeader>

          <CardContent>
            <div className="space-y-4">
              {project.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">{project.description}</p>
              )}

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground font-medium">Overall Progress</span>
                  <span className="font-bold text-primary">{project.progress || 0}%</span>
                </div>
                <Progress value={project.progress || 0} className="h-2" />
              </div>

              <div className="flex items-center justify-between pt-2 border-t">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>Updated {formatDate(project.createdAt)}</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/track/${project.id}`);
                  }}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Track Progress
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  const EmptyProjects = () => (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border rounded-2xl p-12 text-center shadow-lg"
    >
      <h2 className="text-2xl font-bold mb-4">No Projects Submitted Yet</h2>
      <p className="text-muted-foreground mb-6">
        Start your academic journey by requesting assistance with your project or thesis.
      </p>
      <Button className="btn-hero" onClick={() => setProjectModalOpen(true)}>
        <Plus className="mr-2 h-5 w-5" />
        Request Your First Project
      </Button>
    </motion.div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <AnimatedLoader message="Loading student workspace..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 text-center">
        <p className="text-red-500 font-semibold mb-4">{error}</p>
        <Button onClick={fetchDashboard} variant="outline">
          Try Again
        </Button>
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

      <div className="min-h-screen flex flex-col bg-background">
        {/* Navigation Bar */}
        <header className="border-b bg-card sticky top-0 z-40 shadow-sm">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="gap-2">
                <Home className="h-4 w-4" />
                Home Page
              </Button>
            </div>

            <div className="flex items-center gap-3">
              {/* Notifications Popover */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-0" align="end">
                  <div className="p-3 border-b font-semibold text-sm">
                    Notifications ({unreadCount} unread)
                  </div>
                  <div className="max-h-64 overflow-y-auto divide-y">
                    {notifications.length > 0 ? (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => handleNotificationClick(n)}
                          className={`p-3 text-xs cursor-pointer hover:bg-muted/50 transition-colors ${
                            !n.read ? "bg-primary/5 font-medium" : ""
                          }`}
                        >
                          <p className="font-semibold text-foreground">{n.title}</p>
                          <p className="text-muted-foreground mt-0.5">{n.message}</p>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center text-xs text-muted-foreground">
                        No notifications yet.
                      </div>
                    )}
                  </div>
                </PopoverContent>
              </Popover>

              <Button variant="ghost" size="sm" onClick={() => setSettingsModalOpen(true)} className="gap-1.5 hidden sm:flex">
                <Settings className="h-4 w-4 text-muted-foreground" />
                Settings
              </Button>

              <Button className="btn-hero" onClick={() => setProjectModalOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                New Project
              </Button>

              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </header>

        <main className="flex-1 container px-4 py-8 max-w-5xl mx-auto">
          {/* Welcome Banner */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 p-6 rounded-2xl border shadow-sm">
            <div>
              <h1 className="text-3xl font-bold gradient-text">
                Welcome back, {user?.name || "Student"}!
              </h1>
              {user?.school && (
                <p className="text-muted-foreground mt-1 text-sm">{user.school}</p>
              )}
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setTestimonialModalOpen(true)}
                className="bg-white dark:bg-gray-800 shadow-sm border-purple-200 hover:border-purple-400"
              >
                <MessageSquareQuote className="mr-2 h-4 w-4 text-purple-600" />
                Share Testimonial
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSettingsModalOpen(true)}
                className="sm:hidden gap-1.5"
              >
                <Settings className="h-4 w-4 text-muted-foreground" />
                Settings
              </Button>
            </div>
          </div>

          {/* Projects Section */}
          <div className="grid gap-6 mb-8">
            {projects.length === 0 ? (
              <EmptyProjects />
            ) : (
              projects.map((p, i) => <ProjectCard key={p.id} project={p} index={i} />)
            )}
          </div>
        </main>

        {/* Modals */}
        <TrackProjectModal open={trackModalOpen} onOpenChange={setTrackModalOpen} />
        <ProjectRequestModal open={projectModalOpen} onOpenChange={setProjectModalOpen} />
        <TestimonialModal open={testimonialModalOpen} onOpenChange={setTestimonialModalOpen} />
        <AccountSettingsModal
          open={settingsModalOpen}
          onOpenChange={setSettingsModalOpen}
          onProfileUpdated={fetchDashboard}
        />
      </div>
    </>
  );
};

export default Dashboard;
