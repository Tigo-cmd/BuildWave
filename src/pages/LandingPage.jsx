import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import Header from '@/components/landing/Header';
import HeroSection from '@/components/landing/HeroSection';
import ServicesSection from '@/components/landing/ServicesSection';
import HowItWorks from '@/components/landing/HowItWorks';
import CaseStudies from '@/components/landing/CaseStudies';
import TestimonialsSection from '@/components/landing/TestimonialsSection';
import Footer from '@/components/landing/Footer';
import RegistrationModal from '@/components/modals/RegistrationModal';
import ProjectRequestModal from '@/components/modals/ProjectRequestModal';

const LandingPage = () => {
  const [isRegModalOpen, setIsRegModalOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);

  const handleServiceRequest = (service) => {
    setSelectedService(service);
    setIsProjectModalOpen(true);
  };

  return (
    <>
      <Helmet>
        <title>BuildWave - Project Services for Students | UG, MSc, PhD</title>
        <meta name="description" content="BuildWave helps undergraduate, masters, and PhD students complete academic projects from topic selection to full implementation. Get expert help with AI/ML, IoT, research, and more." />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "BuildWave",
            "url": "https://buildwave.com",
            "logo": "https://buildwave.com/logo.png",
            "contactPoint": {
              "@type": "ContactPoint",
              "telephone": "+234-XXX-XXX-XXXX",
              "contactType": "Customer Service",
              "email": "support@buildwave.com"
            },
            "sameAs": [
              "https://twitter.com/buildwave",
              "https://linkedin.com/company/buildwave"
            ]
          })}
        </script>
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50">
        <Header onGetStarted={() => setIsRegModalOpen(true)} />
        
        <main>
          <HeroSection onGetStarted={() => setIsRegModalOpen(true)} />
          <HowItWorks />
          <ServicesSection onServiceRequest={handleServiceRequest} />
          <CaseStudies />
          <TestimonialsSection />
        </main>

        <Footer onGetStarted={() => setIsRegModalOpen(true)} />

        <RegistrationModal 
          isOpen={isRegModalOpen} 
          onClose={() => setIsRegModalOpen(false)}
          onSuccess={() => {
            setIsRegModalOpen(false);
            setIsProjectModalOpen(true);
          }}
        />

        <ProjectRequestModal
          isOpen={isProjectModalOpen}
          onClose={() => {
            setIsProjectModalOpen(false);
            setSelectedService(null);
          }}
          prefilledService={selectedService}
        />
      </div>
    </>
  );
};

export default LandingPage;