import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { HeroSection } from "@/components/HeroSection";
import { ServicesSection } from "@/components/ServicesSection";
import { TestimonialsSection } from "@/components/TestimonialsSection";
import { HowItWorksSection } from "@/components/HowItWorksSection";
import { CaseStudiesSection } from "@/components/CaseStudiesSection";
import { AuthModal } from "@/components/AuthModal";
import { TrackProjectModal } from "@/components/TrackProjectModal";
import { ProjectRequestModal } from "@/components/ProjectRequestModal";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";

const Index = () => {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [trackModalOpen, setTrackModalOpen] = useState(false);
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<string>("");
  const navigate = useNavigate();

  const handleBrowseTopics = () => {
    navigate("/topics");
  };

  const handleRequestService = (serviceId: string) => {
    setSelectedService(serviceId);
    setProjectModalOpen(true);
  };

  return (
    <>
      <Helmet>
        <title>BuildWave - Project Services for Students | Nigeria</title>
        <meta 
          name="description" 
          content="Professional project services for undergraduate, masters, and PhD students. AI/ML, IoT, research writing, and more. Get expert help from topic selection to implementation." 
        />
        <link rel="canonical" href="https://buildwave.ng/" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "BuildWave",
            "url": "https://buildwave.ng",
            "logo": "https://buildwave.ng/logo.png",
            "contactPoint": {
              "@type": "ContactPoint",
              "telephone": "+234-801-234-5678",
              "contactType": "Customer Service",
              "email": "info@buildwave.ng"
            },
            "sameAs": [
              "https://twitter.com/buildwave",
              "https://linkedin.com/company/buildwave"
            ]
          })}
        </script>
      </Helmet>

      <div className="min-h-screen flex flex-col">
        <Header onTrackProject={() => setTrackModalOpen(true)} />
        
        <main className="flex-1">
          <HeroSection 
            onGetStarted={() => setAuthModalOpen(true)}
            onBrowseTopics={handleBrowseTopics}
          />
          
          <HowItWorksSection />
          
          <ServicesSection onRequestService={handleRequestService} />
          
          <CaseStudiesSection />
          
          <TestimonialsSection />
        </main>

        <Footer onTrackProject={() => setTrackModalOpen(true)} />

        <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
        <TrackProjectModal open={trackModalOpen} onOpenChange={setTrackModalOpen} />
        <ProjectRequestModal 
          open={projectModalOpen} 
          onOpenChange={setProjectModalOpen}
          prefilledService={selectedService}
        />
      </div>
    </>
  );
};

export default Index;
