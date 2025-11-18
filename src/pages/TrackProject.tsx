import { Footer } from "@/components/Footer";
import { TrackProjectModal } from "@/components/TrackProjectModal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Download, User, Clock, MessageSquare } from "lucide-react";
import { Helmet } from "react-helmet-async";
import { useToast } from "@/components/ui/use-toast";


const API_BASE =  "http://localhost:5000";

const TrackProject = () => {
  const [trackModalOpen, setTrackModalOpen] = useState(false);
  const { projectId } = useParams();
  const { toast } = useToast();

  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("buildwave_token");

        const res = await fetch(`${API_BASE}/api/projects/${projectId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "Failed to load project");

        setProject(data.project);
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

    if (projectId) fetchProject();
  }, [projectId]);

  // Loading UI
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading project...</p>
      </div>
    );
  }

  // Error UI
  if (error || !project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500">{error || "Project not found"}</p>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{`Track Project ${project.projectId} - BuildWave`}</title>
        <meta name="description" content={`Track progress for ${project.title}`} />
      </Helmet>

      <div className="min-h-screen flex flex-col">
        <main className="flex-1 container px-4 py-8">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Project Header */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <CardTitle className="text-2xl">{project.title}</CardTitle>
                      <Badge className="bg-primary">{project.status}</Badge>
                    </div>
                    <p className="text-muted-foreground font-mono text-sm">
                      Project ID: {projectId}
                    </p>
                  </div>
                  <Button className="btn-accent">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Request Progress
                  </Button>
                </div>
              </CardHeader>

              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Overall Progress</span>
                    <span className="font-medium">{project.progress}%</span>
                  </div>
                  <Progress value={project.progress} className="h-3" />
                </div>
              </CardContent>
            </Card>

            {/* Assigned Team */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Assigned Team</CardTitle>
              </CardHeader>
              <CardContent>
                {project.assignedTo ? (
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-gradient-primary flex items-center justify-center">
                      <User className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <div>
                      <p className="font-semibold">{project.assignedTo.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {project.assignedTo.role}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">
                    No team assigned yet.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Project Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {project.timeline?.map((event: any, index: number) => (
                    <div key={index} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div
                          className={`h-3 w-3 rounded-full ${
                            event.actor === "admin" ? "bg-primary" : "bg-muted"
                          }`}
                        />
                        {index < project.timeline.length - 1 && (
                          <div className="w-0.5 h-12 bg-border" />
                        )}
                      </div>

                      <div className="flex-1 pb-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                          <Clock className="h-3 w-3" />
                          <span>{event.time}</span>
                        </div>
                        <p className="text-sm">{event.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Deliverables */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Deliverables</CardTitle>
              </CardHeader>

              <CardContent>
                <div className="space-y-3">
                  {project.deliverables?.length > 0 ? (
                    project.deliverables.map((file: any) => (
                      <div
                        key={file.id}
                        className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded bg-primary/10 flex items-center justify-center">
                            <Download className="h-5 w-5 text-primary" />
                          </div>
                          <span className="font-medium text-sm">{file.name}</span>
                        </div>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(file.url, "_blank")}
                        >
                          Download
                        </Button>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground text-sm">
                      No deliverables uploaded yet.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>

        <Footer onTrackProject={() => setTrackModalOpen(true)} />
        <TrackProjectModal open={trackModalOpen} onOpenChange={setTrackModalOpen} />
      </div>
    </>
  );
};

export default TrackProject;
