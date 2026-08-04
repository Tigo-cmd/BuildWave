import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Save, Plus, Trash2, Layout, Layers, Star, HelpCircle } from "lucide-react";
import { toast } from "sonner";
import {
  getCMSSection,
  updateCMSSection,
  CMSData,
  defaultCMSData,
  HeroContent,
  ServiceItem,
  CaseStudyItem,
  HowItWorksStep,
} from "@/integrations/firebase/cmsService";

const AdminContent = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [cmsData, setCmsData] = useState<CMSData>(defaultCMSData);

  useEffect(() => {
    loadAllCMSContent();
  }, []);

  const loadAllCMSContent = async () => {
    setLoading(true);
    try {
      const [hero, services, caseStudies, howItWorks, reviewsHeading] = await Promise.all([
        getCMSSection("hero"),
        getCMSSection("services"),
        getCMSSection("caseStudies"),
        getCMSSection("howItWorks"),
        getCMSSection("reviewsHeading"),
      ]);

      setCmsData({
        hero,
        services,
        caseStudies,
        howItWorks,
        reviewsHeading,
      });
    } catch (err) {
      console.error("Error loading CMS content:", err);
      toast.error("Failed to load CMS content");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSection = async <K extends keyof CMSData>(section: K, data: CMSData[K]) => {
    try {
      setLoading(true);
      await updateCMSSection(section, data);
      setCmsData((prev) => ({ ...prev, [section]: data }));
      toast.success(`${section.toUpperCase()} content updated successfully!`);
    } catch (err: any) {
      toast.error(`Failed to update ${section}: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Helpers for Services
  const addService = () => {
    const newItem: ServiceItem = {
      id: `service-${Date.now()}`,
      title: "New Service",
      description: "Service description...",
      badge: "Category",
      deliverables: ["Deliverable 1", "Deliverable 2"],
    };
    setCmsData((prev) => ({ ...prev, services: [...prev.services, newItem] }));
  };

  const updateServiceItem = (index: number, field: keyof ServiceItem, value: any) => {
    const newServices = [...cmsData.services];
    newServices[index] = { ...newServices[index], [field]: value };
    setCmsData((prev) => ({ ...prev, services: newServices }));
  };

  const deleteServiceItem = (index: number) => {
    const newServices = cmsData.services.filter((_, i) => i !== index);
    setCmsData((prev) => ({ ...prev, services: newServices }));
  };

  // Helpers for Case Studies
  const addCaseStudy = () => {
    const newItem: CaseStudyItem = {
      id: `cs-${Date.now()}`,
      title: "New Case Study Project",
      student: "Student Name",
      institution: "University Name",
      discipline: "Engineering",
      grade: "A (First Class)",
      quote: "Student testimonial quote...",
      tags: ["React", "Python"],
    };
    setCmsData((prev) => ({ ...prev, caseStudies: [...prev.caseStudies, newItem] }));
  };

  const updateCaseStudyItem = (index: number, field: keyof CaseStudyItem, value: any) => {
    const newCS = [...cmsData.caseStudies];
    newCS[index] = { ...newCS[index], [field]: value };
    setCmsData((prev) => ({ ...prev, caseStudies: newCS }));
  };

  const deleteCaseStudyItem = (index: number) => {
    const newCS = cmsData.caseStudies.filter((_, i) => i !== index);
    setCmsData((prev) => ({ ...prev, caseStudies: newCS }));
  };

  return (
    <>
      <Helmet>
        <title>Landing Page CMS - Admin Panel</title>
      </Helmet>

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <Button
                variant="ghost"
                onClick={() => navigate("/admin")}
                className="mb-2 pl-0 text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
              </Button>
              <h1 className="text-3xl font-bold gradient-text">Landing Page Content Manager</h1>
              <p className="text-muted-foreground">
                Edit and publish dynamic content for all landing page sections in real-time.
              </p>
            </div>
          </div>

          <Tabs defaultValue="hero" className="w-full space-y-6">
            <TabsList className="grid grid-cols-2 md:grid-cols-5 gap-2 bg-white dark:bg-gray-800 p-2 rounded-xl shadow-sm">
              <TabsTrigger value="hero" className="flex items-center gap-2">
                <Layout className="w-4 h-4" /> Hero
              </TabsTrigger>
              <TabsTrigger value="services" className="flex items-center gap-2">
                <Layers className="w-4 h-4" /> Services
              </TabsTrigger>
              <TabsTrigger value="caseStudies" className="flex items-center gap-2">
                <Star className="w-4 h-4" /> Case Studies
              </TabsTrigger>
              <TabsTrigger value="howItWorks" className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4" /> How It Works
              </TabsTrigger>
              <TabsTrigger value="reviews" className="flex items-center gap-2">
                <Star className="w-4 h-4" /> Reviews Header
              </TabsTrigger>
            </TabsList>

            {/* TAB: HERO */}
            <TabsContent value="hero">
              <Card>
                <CardHeader>
                  <CardTitle>Hero Section Content</CardTitle>
                  <CardDescription>Customize main headline, badge, description and stats.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Badge Text</Label>
                    <Input
                      value={cmsData.hero.badgeText}
                      onChange={(e) =>
                        setCmsData({
                          ...cmsData,
                          hero: { ...cmsData.hero, badgeText: e.target.value },
                        })
                      }
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Title Prefix</Label>
                      <Input
                        value={cmsData.hero.titlePrefix}
                        onChange={(e) =>
                          setCmsData({
                            ...cmsData,
                            hero: { ...cmsData.hero, titlePrefix: e.target.value },
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Gradient Title Portion</Label>
                      <Input
                        value={cmsData.hero.titleGradient}
                        onChange={(e) =>
                          setCmsData({
                            ...cmsData,
                            hero: { ...cmsData.hero, titleGradient: e.target.value },
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Title Suffix</Label>
                      <Input
                        value={cmsData.hero.titleSuffix}
                        onChange={(e) =>
                          setCmsData({
                            ...cmsData,
                            hero: { ...cmsData.hero, titleSuffix: e.target.value },
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      rows={3}
                      value={cmsData.hero.description}
                      onChange={(e) =>
                        setCmsData({
                          ...cmsData,
                          hero: { ...cmsData.hero, description: e.target.value },
                        })
                      }
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>CTA Primary Button Text</Label>
                      <Input
                        value={cmsData.hero.ctaPrimaryText}
                        onChange={(e) =>
                          setCmsData({
                            ...cmsData,
                            hero: { ...cmsData.hero, ctaPrimaryText: e.target.value },
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>CTA Secondary Button Text</Label>
                      <Input
                        value={cmsData.hero.ctaSecondaryText}
                        onChange={(e) =>
                          setCmsData({
                            ...cmsData,
                            hero: { ...cmsData.hero, ctaSecondaryText: e.target.value },
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
                    <div className="space-y-2">
                      <Label>Stat 1 Value & Label</Label>
                      <Input
                        placeholder="500+"
                        value={cmsData.hero.stat1Value}
                        onChange={(e) =>
                          setCmsData({
                            ...cmsData,
                            hero: { ...cmsData.hero, stat1Value: e.target.value },
                          })
                        }
                      />
                      <Input
                        placeholder="Projects Completed"
                        value={cmsData.hero.stat1Label}
                        onChange={(e) =>
                          setCmsData({
                            ...cmsData,
                            hero: { ...cmsData.hero, stat1Label: e.target.value },
                          })
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Stat 2 Value & Label</Label>
                      <Input
                        placeholder="98.4%"
                        value={cmsData.hero.stat2Value}
                        onChange={(e) =>
                          setCmsData({
                            ...cmsData,
                            hero: { ...cmsData.hero, stat2Value: e.target.value },
                          })
                        }
                      />
                      <Input
                        placeholder="Success Rate"
                        value={cmsData.hero.stat2Label}
                        onChange={(e) =>
                          setCmsData({
                            ...cmsData,
                            hero: { ...cmsData.hero, stat2Label: e.target.value },
                          })
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Stat 3 Value & Label</Label>
                      <Input
                        placeholder="4.9/5"
                        value={cmsData.hero.stat3Value}
                        onChange={(e) =>
                          setCmsData({
                            ...cmsData,
                            hero: { ...cmsData.hero, stat3Value: e.target.value },
                          })
                        }
                      />
                      <Input
                        placeholder="Student Rating"
                        value={cmsData.hero.stat3Label}
                        onChange={(e) =>
                          setCmsData({
                            ...cmsData,
                            hero: { ...cmsData.hero, stat3Label: e.target.value },
                          })
                        }
                      />
                    </div>
                  </div>

                  <Button
                    onClick={() => handleSaveSection("hero", cmsData.hero)}
                    disabled={loading}
                    className="btn-hero"
                  >
                    <Save className="w-4 h-4 mr-2" /> Save Hero Section
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* TAB: SERVICES */}
            <TabsContent value="services">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Services Offered</CardTitle>
                    <CardDescription>Manage the service cards displayed on the homepage.</CardDescription>
                  </div>
                  <Button onClick={addService} variant="outline" size="sm">
                    <Plus className="w-4 h-4 mr-1" /> Add Service
                  </Button>
                </CardHeader>
                <CardContent className="space-y-6">
                  {cmsData.services.map((item, index) => (
                    <div key={item.id} className="p-4 border rounded-xl space-y-3 bg-white dark:bg-gray-800">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-sm text-primary">Service #{index + 1}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteServiceItem(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Service Title</Label>
                          <Input
                            value={item.title}
                            onChange={(e) => updateServiceItem(index, "title", e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Category Badge</Label>
                          <Input
                            value={item.badge}
                            onChange={(e) => updateServiceItem(index, "badge", e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea
                          rows={2}
                          value={item.description}
                          onChange={(e) => updateServiceItem(index, "description", e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Deliverables (comma separated)</Label>
                        <Input
                          value={item.deliverables.join(", ")}
                          onChange={(e) =>
                            updateServiceItem(
                              index,
                              "deliverables",
                              e.target.value.split(",").map((s) => s.trim())
                            )
                          }
                        />
                      </div>
                    </div>
                  ))}

                  <Button
                    onClick={() => handleSaveSection("services", cmsData.services)}
                    disabled={loading}
                    className="btn-hero"
                  >
                    <Save className="w-4 h-4 mr-2" /> Save Services Section
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* TAB: CASE STUDIES */}
            <TabsContent value="caseStudies">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Case Studies & Success Stories</CardTitle>
                    <CardDescription>Highlight student achievements, grades and quotes.</CardDescription>
                  </div>
                  <Button onClick={addCaseStudy} variant="outline" size="sm">
                    <Plus className="w-4 h-4 mr-1" /> Add Case Study
                  </Button>
                </CardHeader>
                <CardContent className="space-y-6">
                  {cmsData.caseStudies.map((item, index) => (
                    <div key={item.id} className="p-4 border rounded-xl space-y-3 bg-white dark:bg-gray-800">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-sm text-primary">Case Study #{index + 1}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteCaseStudyItem(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="space-y-2">
                        <Label>Project Title</Label>
                        <Input
                          value={item.title}
                          onChange={(e) => updateCaseStudyItem(index, "title", e.target.value)}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                        <div className="space-y-1">
                          <Label>Student Name</Label>
                          <Input
                            value={item.student}
                            onChange={(e) => updateCaseStudyItem(index, "student", e.target.value)}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label>Institution</Label>
                          <Input
                            value={item.institution}
                            onChange={(e) => updateCaseStudyItem(index, "institution", e.target.value)}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label>Discipline</Label>
                          <Input
                            value={item.discipline}
                            onChange={(e) => updateCaseStudyItem(index, "discipline", e.target.value)}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label>Grade Achieved</Label>
                          <Input
                            value={item.grade}
                            onChange={(e) => updateCaseStudyItem(index, "grade", e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Quote / Review</Label>
                        <Textarea
                          rows={2}
                          value={item.quote}
                          onChange={(e) => updateCaseStudyItem(index, "quote", e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Tech Tags (comma separated)</Label>
                        <Input
                          value={item.tags.join(", ")}
                          onChange={(e) =>
                            updateCaseStudyItem(
                              index,
                              "tags",
                              e.target.value.split(",").map((s) => s.trim())
                            )
                          }
                        />
                      </div>
                    </div>
                  ))}

                  <Button
                    onClick={() => handleSaveSection("caseStudies", cmsData.caseStudies)}
                    disabled={loading}
                    className="btn-hero"
                  >
                    <Save className="w-4 h-4 mr-2" /> Save Case Studies
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* TAB: HOW IT WORKS */}
            <TabsContent value="howItWorks">
              <Card>
                <CardHeader>
                  <CardTitle>How It Works Steps</CardTitle>
                  <CardDescription>Update the step-by-step process for students.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {cmsData.howItWorks.map((step, index) => (
                    <div key={index} className="p-4 border rounded-xl space-y-3 bg-white dark:bg-gray-800">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="space-y-2">
                          <Label>Step No.</Label>
                          <Input
                            value={step.step}
                            onChange={(e) => {
                              const newSteps = [...cmsData.howItWorks];
                              newSteps[index].step = e.target.value;
                              setCmsData({ ...cmsData, howItWorks: newSteps });
                            }}
                          />
                        </div>
                        <div className="md:col-span-3 space-y-2">
                          <Label>Title</Label>
                          <Input
                            value={step.title}
                            onChange={(e) => {
                              const newSteps = [...cmsData.howItWorks];
                              newSteps[index].title = e.target.value;
                              setCmsData({ ...cmsData, howItWorks: newSteps });
                            }}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea
                          rows={2}
                          value={step.description}
                          onChange={(e) => {
                            const newSteps = [...cmsData.howItWorks];
                            newSteps[index].description = e.target.value;
                            setCmsData({ ...cmsData, howItWorks: newSteps });
                          }}
                        />
                      </div>
                    </div>
                  ))}

                  <Button
                    onClick={() => handleSaveSection("howItWorks", cmsData.howItWorks)}
                    disabled={loading}
                    className="btn-hero"
                  >
                    <Save className="w-4 h-4 mr-2" /> Save How It Works
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* TAB: REVIEWS HEADING */}
            <TabsContent value="reviews">
              <Card>
                <CardHeader>
                  <CardTitle>Reviews Section Headers</CardTitle>
                  <CardDescription>Edit title and sub-heading for the Testimonials & Reviews section.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Badge Text</Label>
                    <Input
                      value={cmsData.reviewsHeading.badge}
                      onChange={(e) =>
                        setCmsData({
                          ...cmsData,
                          reviewsHeading: { ...cmsData.reviewsHeading, badge: e.target.value },
                        })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Section Title</Label>
                    <Input
                      value={cmsData.reviewsHeading.title}
                      onChange={(e) =>
                        setCmsData({
                          ...cmsData,
                          reviewsHeading: { ...cmsData.reviewsHeading, title: e.target.value },
                        })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Subtitle</Label>
                    <Textarea
                      rows={2}
                      value={cmsData.reviewsHeading.subtitle}
                      onChange={(e) =>
                        setCmsData({
                          ...cmsData,
                          reviewsHeading: { ...cmsData.reviewsHeading, subtitle: e.target.value },
                        })
                      }
                    />
                  </div>

                  <Button
                    onClick={() => handleSaveSection("reviewsHeading", cmsData.reviewsHeading)}
                    disabled={loading}
                    className="btn-hero"
                  >
                    <Save className="w-4 h-4 mr-2" /> Save Reviews Heading
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
};

export default AdminContent;
