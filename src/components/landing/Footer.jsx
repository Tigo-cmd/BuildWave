import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Rocket, Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Instagram } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Footer = ({ onGetStarted }) => {
  const navigate = useNavigate();

  return (
    <footer className="bg-gray-900 text-white pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          {/* Brand & Newsletter */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <a href="/" className="flex items-center gap-2">
                <img 
                  src="/logomain.png" 
                  alt="BuildWave logo" 
                  className="h-16 w-auto object-contain"
                />
              </a>
            </div>
            <p className="text-gray-400">
              Empowering students to achieve academic excellence through expert project support.
            </p>
            <div className="space-y-2">
              <p className="font-semibold">Subscribe to our newsletter</p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Your email"
                  className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                  aria-label="Email for newsletter"
                />
                <Button size="sm" className="gradient-primary text-white">
                  Subscribe
                </Button>
              </div>
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-bold text-lg mb-4">Services</h3>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#services" className="hover:text-purple-400 transition-colors">AI & Machine Learning</a></li>
              <li><a href="#services" className="hover:text-purple-400 transition-colors">IoT & Embedded Systems</a></li>
              <li><a href="#services" className="hover:text-purple-400 transition-colors">Research & Thesis</a></li>
              <li><a href="#services" className="hover:text-purple-400 transition-colors">Web Development</a></li>
              <li><a href="#services" className="hover:text-purple-400 transition-colors">Data Science</a></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-bold text-lg mb-4">Company</h3>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-purple-400 transition-colors">About Us</a></li>
              <li><a href="#how-it-works" className="hover:text-purple-400 transition-colors">How It Works</a></li>
              <li><a href="#testimonials" className="hover:text-purple-400 transition-colors">Testimonials</a></li>
              <li>
                <button onClick={() => navigate('/topics')} className="hover:text-purple-400 transition-colors">
                  Browse Topics
                </button>
              </li>
              <li>
                <button onClick={onGetStarted} className="hover:text-purple-400 transition-colors">
                  Get Started
                </button>
              </li>
            </ul>
          </div>

          {/* Support & Contact */}
          <div>
            <h3 className="font-bold text-lg mb-4">Support & Contact</h3>
            <ul className="space-y-3 text-gray-400">
              <li className="flex items-start gap-2">
                <Mail className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <a href="mailto:buildwaveco@gmail.com" className="hover:text-purple-400 transition-colors">
                  buildwaveco@gmail.com
                </a>
              </li>
              <li className="flex items-start gap-2">
                <Phone className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <a href="tel:+2347016162040" className="hover:text-purple-400 transition-colors">
                  +2347016162040
                </a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <span>Abia, Nigeria</span>
              </li>
              <li>
                <Button 
                  onClick={() => navigate('/track')}
                  variant="outline"
                  className="w-full border-purple-400 text-purple-400 hover:bg-purple-400 hover:text-white mt-2"
                >
                  Track Project
                </Button>
              </li>
            </ul>
          </div>
        </div>

        {/* Social & Legal */}
        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex gap-4">
              <a href="https://web.facebook.com/profile.php?id=61582502833594" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-purple-600 transition-colors" aria-label="Facebook">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-purple-600 transition-colors" aria-label="Twitter">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-purple-600 transition-colors" aria-label="LinkedIn">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-purple-600 transition-colors" aria-label="Instagram">
                <Instagram className="w-5 h-5" />
              </a>
            </div>

            <div className="flex flex-wrap gap-4 text-sm text-gray-400">
              <a href="#" className="hover:text-purple-400 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-purple-400 transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-purple-400 transition-colors">Cookie Policy</a>
            </div>

            <p className="text-sm text-gray-400">
              © 2025 BuildWave. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;