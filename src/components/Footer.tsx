import React from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Mail,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface FooterProps {
  onGetStarted?: () => void;
  onTrackProject?: () => void;
}

export const Footer = ({ onGetStarted, onTrackProject }: FooterProps) => {
  const navigate = useNavigate();

  // WhatsApp link (use international number without + or spaces)
  const whatsappNumber = "2347016162040";
  const whatsappMessage = "Hi BuildWave, I need help with a project.";
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    whatsappMessage
  )}`;

  return (
    <footer className="bg-gray-900 text-white pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          {/* Brand & Newsletter */}
          <div className="space-y-4">
            <Link to="/#" className="flex items-center gap-2">
              <img
                src="/logomain.png"
                alt="BuildWave logo"
                className="h-16 w-auto object-contain"
              />
            </Link>
            <p className="text-gray-400">
              Empowering students to achieve academic excellence through expert
              project support.
            </p>

            {/* Newsletter */}
            <div className="space-y-2">
              <p className="font-semibold">Subscribe to our newsletter</p>
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder="Your email"
                  className="flex-1 bg-gray-800 border-gray-700 text-white focus:ring-2 focus:ring-purple-500"
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
              {[
                "AI & Machine Learning",
                "IoT & Embedded Systems",
                "Research & Thesis",
                "Web Development",
                "Data Science",
              ].map((service) => (
                <li key={service}>
                  <a
                    href="/#services"
                    className="hover:text-purple-400 transition-colors"
                  >
                    {service}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-bold text-lg mb-4">Company</h3>
            <ul className="space-y-2 text-gray-400">
              <li>
                <a
                  href="/#about-us"
                  className="hover:text-purple-400 transition-colors"
                >
                  About Us
                </a>
              </li>
              <li>
                <a
                  href="/#how-it-works"
                  className="hover:text-purple-400 transition-colors"
                >
                  How It Works
                </a>
              </li>
              <li>
                <a
                  href="/#testimonials"
                  className="hover:text-purple-400 transition-colors"
                >
                  Testimonials
                </a>
              </li>
              <li>
                <button
                  onClick={() => navigate("/topics")}
                  className="hover:text-purple-400 transition-colors"
                >
                  Browse Topics
                </button>
              </li>
              <li>
                <button
                  onClick={onGetStarted}
                  className="hover:text-purple-400 transition-colors"
                >
                  Get Started
                </button>
              </li>
            </ul>
          </div>

          {/* Contact & Support */}
          <div>
            <h3 className="font-bold text-lg mb-4">Contact & Support</h3>
            <ul className="space-y-3 text-gray-400">
              <li className="flex items-center gap-2">
                <Mail className="w-5 h-5 flex-shrink-0" />
                <a
                  href="mailto:buildwaveco@gmail.com"
                  className="hover:text-purple-400 transition-colors"
                >
                  buildwaveco@gmail.com
                </a>
              </li>

              {/* Modified phone / WhatsApp */}
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 flex-shrink-0" />
                <div className="flex items-center gap-3">
                  {/* keep tel for direct calls */}
                  <a
                    href="tel:+2347016162040"
                    className="hover:text-purple-400 transition-colors"
                  >
                    +2347016162040
                  </a>

                  {/* WhatsApp chat with prefilled message */}
                  <a
                    href={whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-400 hover:text-green-300 transition-colors text-sm"
                    aria-label="Chat on WhatsApp"
                  >
                    Chat on WhatsApp
                  </a>
                </div>
              </li>

              <li className="flex items-start gap-2">
                <MapPin className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>Abia, Nigeria</span>
              </li>
            </ul>

            <Button
              onClick={onTrackProject || (() => navigate("/track"))}
              variant="outline"
              className="w-full border-purple-400 text-purple-400 hover:bg-purple-400 hover:text-white mt-4"
            >
              Track Project
            </Button>
          </div>
        </div>

        {/* Social & Legal */}
        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            {/* Social Links */}
            <div className="flex gap-4">
              <a
                href="https://web.facebook.com/profile.php?id=61582502833594"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-purple-600 transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-purple-600 transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-purple-600 transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-purple-600 transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
            </div>

            {/* Legal Links */}
            <div className="flex flex-wrap gap-4 text-sm text-gray-400">
              <Link
                to="/privacy"
                className="hover:text-purple-400 transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                to="/terms"
                className="hover:text-purple-400 transition-colors"
              >
                Terms of Service
              </Link>
              <Link
                to="/cookies"
                className="hover:text-purple-400 transition-colors"
              >
                Cookie Policy
              </Link>
            </div>

            <p className="text-sm text-gray-400">
              © {new Date().getFullYear()} BuildWave. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
