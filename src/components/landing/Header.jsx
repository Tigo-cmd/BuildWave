import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Rocket } from 'lucide-react';

const Header = ({ onGetStarted }) => {
  const navigate = useNavigate();

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
          <a href="#services" className="text-gray-700 hover:text-purple-600 transition-colors font-medium">
            Services
          </a>
          <a href="#how-it-works" className="text-gray-700 hover:text-purple-600 transition-colors font-medium">
            How It Works
          </a>
          <a href="#testimonials" className="text-gray-700 hover:text-purple-600 transition-colors font-medium">
            Testimonials
          </a>
          <Button 
            variant="outline" 
            onClick={() => navigate('/track')}
            className="border-purple-300 text-purple-700 hover:bg-purple-50"
          >
            Track Project
          </Button>
          <Button onClick={onGetStarted} className="gradient-primary text-white">
            Get Started
          </Button>
        </div>

        <div className="md:hidden">
          <Button onClick={onGetStarted} size="sm" className="gradient-primary text-white">
            Get Started
          </Button>
        </div>
      </nav>
    </motion.header>
  );
};

export default Header;