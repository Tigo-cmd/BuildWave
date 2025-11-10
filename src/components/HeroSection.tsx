import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, Star } from 'lucide-react';

interface HeroSectionProps {
  onGetStarted: () => void;
  onBrowseTopics: () => void;
}
const headlines = [
  "We Build Your Project, You Focus on Your Degree.",
  "From Research to Real Results We Handle It All.",
  "Stress-Free Academic Projects for Every Student Level.",
  "Need a Topic? Get Tailored Project Ideas Fast.",
  "Your Academic Project Partner from Start to Finish.",
  "Turn Your Research Idea Into a Working Reality.",
  "Expertly Built Projects That Earn You Top Grades.",
  "We Handle the Work, You Enjoy the Success.",
  "Where Research Meets Real Implementation.",
  "Project Done Right Without the Stress.",
  "From Topic Selection to Final Defense Covered.",
  "Smart Research, Real Results, On Time.",
  "Let Us Build, So You Can Graduate With Confidence.",
  "Professional Project Execution for Serious Students.",
  "No Guesswork. Just Clear Academic Success.",
  "Innovation for Your Degree Journey.",
  "Academic Excellence, Built for You.",
  "Ideas Engineered Into Results.",
  "Your Shortcut to a Successful Final Year Project.",
  "You Dream It, We Build It.",
  "Fast + Reliable Academic Project Support.",
  "Complex Project? We Make It Simple.",
  "Real Implementation. Real Papers. Real Success.",
  "Graduate Without the Stress.",
  "Stop Struggling Start Finishing Your Project.",
  "We Do the Technical Work, You Focus on Your Degree.",
  "The Smart Way to Complete Your Final Project.",
  "Ready-to-Defend Quality, Built by Experts.",
  "Professional Projects That Impress Examiners."
];

export const HeroSection = ({
  onGetStarted,
  onBrowseTopics
}: HeroSectionProps) => {
  const [currentHeadline, setCurrentHeadline] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentHeadline((prev) => (prev + 1) % headlines.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="pt-32 pb-20 px-4">
      <div className="container mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Visual Area */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.10 }}
            className="relative"
          >
            <div className="grid grid-cols-2 gap-4">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="relative rounded-2xl overflow-hidden shadow-2xl"
              >
                <img alt="AI and Machine Learning project visualization" className="w-full h-64 object-cover" src="https://images.unsplash.com/photo-1650278795309-26295c74cf2b" />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                  <span className="text-white font-semibold text-sm">AI & ML</span>
                </div>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                className="relative rounded-2xl overflow-hidden shadow-2xl mt-8"
              >
                <img alt="IoT and Embedded Systems hardware" className="w-full h-64 object-cover" src="https://images.unsplash.com/photo-1621136739750-9d2d7befd1cc" />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                  <span className="text-white font-semibold text-sm">IoT & Embedded</span>
                </div>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                className="relative rounded-2xl overflow-hidden shadow-2xl col-span-2"
              >
                <img alt="Research paper writing and academic documentation" className="w-full h-48 object-cover" src="https://images.unsplash.com/photo-1536704427498-861d93dd5525" />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                  <span className="text-white font-semibold text-sm">Research Writing</span>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Right: Copy & CTAs */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-8"
          >
            <div className="space-y-4">
              <AnimatePresence mode="wait">
                <motion.h1
                  key={currentHeadline}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                  className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight"
                >
                  {headlines[currentHeadline]}
                </motion.h1>
              </AnimatePresence>

              <p className="text-xl text-gray-600 leading-relaxed">
                BuildWave helps undergraduates, masters, PhD students and anyone complete projects from topic selection to full implementation. Need to bring your project and ideas to life? You're in the right place.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                onClick={onGetStarted}
                className="gradient-primary text-white text-lg px-8 py-6 shadow-xl hover:shadow-2xl transition-all"
              >
                Get Started
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })}
                className="border-2 border-purple-300 text-purple-700 hover:bg-purple-50 text-lg px-8 py-6"
              >
                Browse Services
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="pt-8 border-t border-purple-100">
              <div className="flex items-center gap-2 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
                <span className="text-gray-600 ml-2">4.9/5 from 200+ students</span>
              </div>
              <p className="text-sm text-gray-500 italic">
                "BuildWave delivered my Masters project ahead of schedule. Highly recommended!" - Chidinma Oti Msc, Bsc, MOUAU
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

// export default HeroSection;