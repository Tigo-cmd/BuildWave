import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { ArrowLeft, Check, X, Star, Eye, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import {
  getAllTestimonials,
  approveTestimonial,
  rejectTestimonial,
  featureTestimonial,
} from "@/integrations/firebase/firebaseService";

// Types
type Testimonial = {
  id: string;
  name: string;
  email?: string;
  school: string;
  course: string;
  photo_url?: string;
  rating: number;
  review: string;
  user_id?: string | null;
  status: "pending" | "approved" | "rejected";
  is_featured: boolean;
  createdAt?: any;
};

const AdminTestimonials = () => {
  const { toast } = useToast();
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("pending");

  // Fetch testimonials
  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        setLoading(true);
        const data = await getAllTestimonials();
        setTestimonials(data as Testimonial[]);
      } catch (err: any) {
        console.error("Error fetching testimonials:", err);
        toast({
          title: "Error",
          description: "Failed to load testimonials",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTestimonials();
  }, [toast]);

  const handleApprove = async (id: string) => {
    try {
      await approveTestimonial(id);
      setTestimonials((prev) =>
        prev.map((t) =>
          t.id === id ? { ...t, status: "approved" as const } : t
        )
      );
      toast({
        title: "Success",
        description: "Testimonial approved",
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  const handleReject = async (id: string) => {
    const reason = prompt("Enter rejection reason:");
    if (!reason) return;

    try {
      await rejectTestimonial(id);
      setTestimonials((prev) =>
        prev.map((t) =>
          t.id === id ? { ...t, status: "rejected" as const } : t
        )
      );
      toast({
        title: "Success",
        description: "Testimonial rejected",
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  const handleToggleFeatured = async (id: string) => {
    try {
      const testimonial = testimonials.find((t) => t.id === id);
      if (!testimonial) return;

      await featureTestimonial(id, !testimonial.is_featured);
      setTestimonials((prev) =>
        prev.map((t) =>
          t.id === id ? { ...t, is_featured: !t.is_featured } : t
        )
      );
      toast({
        title: "Success",
        description: testimonial.is_featured
          ? "Removed from featured"
          : "Added to featured",
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    }
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

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p>Loading testimonials...</p>
        </div>
      </div>
    );
  }

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
                  {testimonials.filter(t => t.is_featured).length}
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
                            <AvatarImage src={testimonial.photo_url} alt={testimonial.name} />
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
                          {testimonial.is_featured && (
                            <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20">
                              Featured
                            </Badge>
                          )}
                          {testimonial.user_id && (
                            <Button size="sm" variant="ghost" asChild>
                              <Link to={`/dashboard`}>
                                <Eye className="h-3 w-3 mr-1" />
                                View User
                              </Link>
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm">{testimonial.review}</p>
                      
                      <div className="flex flex-col gap-2 text-xs text-muted-foreground">
                        <div>
                          Submitted: {testimonial.createdAt 
                            ? new Date(testimonial.createdAt.seconds * 1000).toLocaleString()
                            : "N/A"
                          }
                        </div>
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
                          {testimonial.is_featured ? "Remove from Featured" : "Mark as Featured"}
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
