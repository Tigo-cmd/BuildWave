// import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { TrackProjectModal } from "@/components/TrackProjectModal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useState } from "react";
import { useParams } from "react-router-dom";
import { Download, User, Clock, MessageSquare } from "lucide-react";
import { Helmet } from "react-helmet-async";

const TrackProject = () => {
  const [trackModalOpen, setTrackModalOpen] = useState(false);
  const { projectId } = useParams();

  // Mock project data
  const project = {
    id: projectId || "BW-2025-0042",
    title: "IoT Water Tank Controller",
    status: "In Progress",
    progress: 65,
    assignedTo: { name: "Chinelo Obi", role: "Senior Engineer" },
    timeline: [
      { time: "2025-10-15 10:00", actor: "student", text: "Project submitted" },
      { time: "2025-10-15 14:30", actor: "admin", text: "Assigned to development team" },
      { time: "2025-10-16 09:00", actor: "admin", text: "Requirements review completed" },
      { time: "2025-10-18 16:00", actor: "admin", text: "Hardware components ordered" },
      { time: "2025-10-20 11:00", actor: "admin", text: "Prototype development started" },
    ],
    deliverables: [
      { id: "d1", name: "Project Proposal.pdf", url: "#" },
      { id: "d2", name: "Component List.xlsx", url: "#" },
    ],
  };

  return (
    <>
      <Helmet>
        <title>Track Project {project.id} - BuildWave</title>
        <meta name="description" content={`Track progress for ${project.title}`} />
      </Helmet>
      
      <div className="min-h-screen flex flex-col">
        {/* <Header onTrackProject={() => setTrackModalOpen(true)} /> */}
        
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
                      Project ID: {project.id}
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

            {/* Assigned Staff */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Assigned Team</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-gradient-primary flex items-center justify-center">
                    <User className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="font-semibold">{project.assignedTo.name}</p>
                    <p className="text-sm text-muted-foreground">{project.assignedTo.role}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Project Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {project.timeline.map((event, index) => (
                    <div key={index} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className={`h-3 w-3 rounded-full ${
                          event.actor === "admin" ? "bg-primary" : "bg-muted"
                        }`} />
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
                  {project.deliverables.map((file) => (
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
                      <Button variant="outline" size="sm">
                        Download
                      </Button>
                    </div>
                  ))}
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
