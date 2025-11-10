import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { ArrowLeft, Check, X, Star, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

// Types
type Testimonial = {
  id: string;
  name: string;
  email: string;
  school: string;
  course: string;
  photoUrl: string;
  rating: number;
  review: string;
  projectId: string | null;
  status: "pending" | "approved" | "rejected";
  submittedAt: string;
  approvedAt?: string;
  rejectedAt?: string;
  rejectedReason?: string;
  featured: boolean;
};

// Mock data
const mockTestimonials: Testimonial[] = [
  {
    id: "t1",
    name: "Amaka Okoye",
    email: "amaka.okoye@unilag.edu.ng",
    school: "University of Lagos",
    course: "Computer Engineering (Final Year)",
    photoUrl: "/placeholder.svg",
    rating: 5,
    review: "BuildWave handled my final year project from proposal to deployment. The team was professional, responsive, and delivered beyond my expectations. My IoT system works perfectly!",
    projectId: "BW-2025-0042",
    status: "pending" as const,
    submittedAt: "2025-09-25T14:30:00Z",
    featured: false
  },
  {
    id: "t2",
    name: "Ibrahim Yusuf",
    email: "ibrahim.y@ui.edu.ng",
    school: "University of Ibadan",
    course: "Computer Science (MSc)",
    photoUrl: "/placeholder.svg",
    rating: 5,
    review: "Excellent service! They helped me with my machine learning thesis implementation. The code was clean, well-documented, and worked flawlessly. Highly recommended!",
    projectId: "BW-2025-0041",
    status: "approved" as const,
    submittedAt: "2025-09-20T10:00:00Z",
    approvedAt: "2025-09-21T09:00:00Z",
    featured: true
  },
  {
    id: "t3",
    name: "Grace Nwosu",
    email: "grace.n@covenant.edu.ng",
    school: "Covenant University",
    course: "Information Systems (PhD)",
    photoUrl: "/placeholder.svg",
    rating: 4,
    review: "Great experience working with BuildWave. They understood my research requirements and delivered quality work. Communication could be slightly faster, but overall very satisfied.",
    projectId: "BW-2025-0040",
    status: "pending" as const,
    submittedAt: "2025-09-24T16:00:00Z",
    featured: false
  },
  {
    id: "t4",
    name: "David Eze",
    email: "david.eze@spam.com",
    school: "Unknown",
    course: "N/A",
    photoUrl: "/placeholder.svg",
    rating: 5,
    review: "Amazing! Best service ever! Click here to learn more: http://spam-link.com",
    projectId: null,
    status: "rejected" as const,
    submittedAt: "2025-09-23T11:00:00Z",
    rejectedAt: "2025-09-23T12:00:00Z",
    rejectedReason: "Spam content detected",
    featured: false
  }
];

const AdminTestimonials = () => {
  const { toast } = useToast();
  const [testimonials, setTestimonials] = useState(mockTestimonials);
  const [activeTab, setActiveTab] = useState("pending");

  const handleApprove = (id: string) => {
    setTestimonials(prev => prev.map(t => 
      t.id === id 
        ? { ...t, status: "approved", approvedAt: new Date().toISOString() }
        : t
    ));
    toast({
      title: "Testimonial Approved",
      description: "The testimonial is now visible on the site",
    });
  };

  const handleReject = (id: string) => {
    const reason = prompt("Enter rejection reason:");
    if (!reason) return;

    setTestimonials(prev => prev.map(t => 
      t.id === id 
        ? { ...t, status: "rejected", rejectedAt: new Date().toISOString(), rejectedReason: reason }
        : t
    ));
    toast({
      title: "Testimonial Rejected",
      description: "The student has been notified",
    });
  };

  const handleToggleFeatured = (id: string) => {
    setTestimonials(prev => prev.map(t => 
      t.id === id ? { ...t, featured: !t.featured } : t
    ));
    toast({
      title: testimonials.find(t => t.id === id)?.featured ? "Removed from Featured" : "Marked as Featured",
      description: testimonials.find(t => t.id === id)?.featured 
        ? "Testimonial removed from featured section" 
        : "Testimonial will appear in featured section",
    });
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${
              i < rating ? "fill-amber-500 text-amber-500" : "text-muted-foreground"
            }`}
          />
        ))}
      </div>
    );
  };

  const filteredTestimonials = testimonials.filter(t => t.status === activeTab);

  return (
    <>
      <Helmet>
        <title>Testimonials Management - Admin - BuildWave</title>
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
                  <h1 className="text-2xl font-bold gradient-text">Testimonials Management</h1>
                  <p className="text-sm text-muted-foreground">Review and moderate student testimonials</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Pending Review</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-amber-500">
                  {testimonials.filter(t => t.status === "pending").length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Approved</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-500">
                  {testimonials.filter(t => t.status === "approved").length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Featured</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">
                  {testimonials.filter(t => t.featured).length}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full max-w-md grid-cols-3">
              <TabsTrigger value="pending">
                Pending ({testimonials.filter(t => t.status === "pending").length})
              </TabsTrigger>
              <TabsTrigger value="approved">
                Approved ({testimonials.filter(t => t.status === "approved").length})
              </TabsTrigger>
              <TabsTrigger value="rejected">
                Rejected ({testimonials.filter(t => t.status === "rejected").length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredTestimonials.map((testimonial) => (
                  <Card key={testimonial.id} className="card-hover">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <Avatar>
                            <AvatarImage src={testimonial.photoUrl} alt={testimonial.name} />
                            <AvatarFallback>{testimonial.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-semibold">{testimonial.name}</h3>
                            <p className="text-sm text-muted-foreground">{testimonial.school}</p>
                            <p className="text-xs text-muted-foreground">{testimonial.course}</p>
                            <div className="mt-2">{renderStars(testimonial.rating)}</div>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          {testimonial.featured && (
                            <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20">
                              Featured
                            </Badge>
                          )}
                          {testimonial.projectId && (
                            <Button size="sm" variant="ghost" asChild>
                              <Link to={`/admin/projects/${testimonial.projectId}`}>
                                <Eye className="h-3 w-3 mr-1" />
                                View Project
                              </Link>
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm">{testimonial.review}</p>
                      
                      <div className="flex flex-col gap-2 text-xs text-muted-foreground">
                        <div>Submitted: {new Date(testimonial.submittedAt).toLocaleString()}</div>
                        {testimonial.approvedAt && (
                          <div>Approved: {new Date(testimonial.approvedAt).toLocaleString()}</div>
                        )}
                        {testimonial.rejectedAt && (
                          <div className="text-destructive">
                            Rejected: {new Date(testimonial.rejectedAt).toLocaleString()}
                            {testimonial.rejectedReason && ` - ${testimonial.rejectedReason}`}
                          </div>
                        )}
                      </div>

                      {testimonial.status === "pending" && (
                        <div className="flex gap-2 pt-2">
                          <Button
                            size="sm"
                            onClick={() => handleApprove(testimonial.id)}
                            className="flex-1"
                          >
                            <Check className="h-4 w-4 mr-2" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleReject(testimonial.id)}
                            className="flex-1"
                          >
                            <X className="h-4 w-4 mr-2" />
                            Reject
                          </Button>
                        </div>
                      )}

                      {testimonial.status === "approved" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleToggleFeatured(testimonial.id)}
                          className="w-full"
                        >
                          <Star className="h-4 w-4 mr-2" />
                          {testimonial.featured ? "Remove from Featured" : "Mark as Featured"}
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}

                {filteredTestimonials.length === 0 && (
                  <div className="col-span-2 text-center py-12 text-muted-foreground">
                    No {activeTab} testimonials
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
};

export default AdminTestimonials;
