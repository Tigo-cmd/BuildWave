import React from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useState } from "react";
import { Menu, X, MessageCircle } from "lucide-react";

interface HeaderProps {
  onTrackProject: () => void;
  onGetStarted: () => void;
}


export const Header = ({ onTrackProject, onGetStarted }: HeaderProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();


  // WhatsApp configuration
  const whatsappNumber = "2347016162040";
  const whatsappMessage = "Hi BuildWave, I need help with a project.";
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    whatsappMessage
  )}`;

  return (
    <motion.header 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-purple-100"
    >
      <nav className="container mx-auto px-4 py-4 flex items-center justify-between">
        <a href="/" className="flex items-center gap-2">
          <img 
          src="/logomain.png" 
          alt="BuildWave logo" 
          className="h-10 md:h-14 w-auto object-contain"
        />
        </a>
        <div className="hidden md:flex items-center gap-8">
          <a href="/#services" className="text-gray-700 hover:text-purple-600 transition-colors font-medium">
            Services
          </a>
          <a href="/topics" className="text-gray-700 hover:text-purple-600 transition-colors font-medium">
            Browse Topics
          </a>
          <a href="/#testimonials" className="text-gray-700 hover:text-purple-600 transition-colors font-medium">
            Testimonials
          </a>
          <Button 
            variant="outline" 
            onClick={onTrackProject}
            className="border-purple-300 text-purple-700 hover:bg-purple-50"
          >
            Track Project
          </Button>
          {/* <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Chat on WhatsApp"
            className="fixed bottom-6 right-4 z-50 md:bottom-8 md:right-8 bg-white rounded-full shadow-lg p-3 flex items-center justify-center text-green-600 hover:bg-green-50 transition-colors"
          >
            <MessageCircle className="h-6 w-6" />
          </a> */}
        </div>
        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>

       {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-[72px] left-0 right-0 border-t border-border bg-white/80 backdrop-blur-lg">
          <div className="container px-4 py-4 space-y-3">
            <a 
              href="/#services" 
              className="block py-2 text-sm font-medium text-gray-700 hover:text-purple-600"
              onClick={() => setMobileMenuOpen(false)}
            >
              Services
            </a>
            <a 
              href="/#testimonials" 
              className="block py-2 text-sm font-medium text-gray-700 hover:text-purple-600"
              onClick={() => setMobileMenuOpen(false)}
            >
              Testimonials
            </a>
            <a 
              href="/topics" 
              className="block py-2 text-sm font-medium text-gray-700 hover:text-purple-600"
              onClick={() => setMobileMenuOpen(false)}
            >
              Browse Topics
            </a>
            <Button 
              variant="outline" 
              onClick={() => {
                onTrackProject();
                setMobileMenuOpen(false);
              }}
              className="w-full border-purple-300 text-purple-700 hover:bg-purple-50"
            >
              Track Project
            </Button>
            {/* <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Chat on WhatsApp"
              className="fixed bottom-6 right-4 z-50 md:bottom-8 md:right-8 bg-white rounded-full shadow-lg p-3 flex items-center justify-center text-green-600 hover:bg-green-50 transition-colors"
            >
              <MessageCircle className="h-6 w-6" />
            </a> */}
          </div>
        </div>
      )}
      </nav>
    </motion.header>
  );
};

// export default Header;