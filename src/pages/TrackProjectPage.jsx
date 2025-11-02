import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { ArrowLeft, Search, Chrome } from 'lucide-react';

const TrackProjectPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [projectId, setProjectId] = useState('');
  const [email, setEmail] = useState('');

  const handleGoogleAuth = () => {
    toast({
      title: "🚧 Google OAuth Integration",
      description: "This feature isn't implemented yet—but don't worry! You can request it in your next prompt! 🚀"
    });
    navigate('/dashboard');
  };

  const handleTrack = (e) => {
    e.preventDefault();
    
    const projects = JSON.parse(localStorage.getItem('buildwave_projects') || '[]');
    const project = projects.find(p => p.id === projectId);
    
    if (project) {
      navigate(`/projects/${projectId}`);
    } else {
      toast({
        title: "Project Not Found",
        description: "Please check your Project ID and try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <>
      <Helmet>
        <title>Track Your Project - BuildWave</title>
        <meta name="description" content="Track your academic project progress in real-time with BuildWave. View status updates, deliverables, and communicate with your team." />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Button
            variant="outline"
            onClick={() => navigate('/')}
            className="mb-8"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-8 shadow-xl"
          >
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Track Your Project
              </h1>
              <p className="text-gray-600">
                Monitor your project progress in real-time
              </p>
            </div>

            <div className="space-y-6">
              <Button
                onClick={handleGoogleAuth}
                className="w-full gradient-primary text-white py-6 text-lg"
              >
                <Chrome className="w-5 h-5 mr-2" />
                Sign in with Google
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or track with Project ID</span>
                </div>
              </div>

              <form onSubmit={handleTrack} className="space-y-4">
                <div>
                  <Label htmlFor="projectId">Project ID</Label>
                  <input
                    id="projectId"
                    type="text"
                    required
                    value={projectId}
                    onChange={(e) => setProjectId(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="BW-2025-0001"
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="your.email@university.edu"
                  />
                </div>

                <Button type="submit" className="w-full gradient-primary text-white py-6 text-lg">
                  <Search className="w-5 h-5 mr-2" />
                  Track Project
                </Button>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default TrackProjectPage;