import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LogOut, Plus, Eye } from 'lucide-react';
import ProjectRequestModal from '@/components/modals/ProjectRequestModal';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [user, setUser] = useState(null);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('buildwave_user');
    const storedProjects = localStorage.getItem('buildwave_projects');
    
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    
    if (storedProjects) {
      setProjects(JSON.parse(storedProjects));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('buildwave_user');
    navigate('/');
  };

  const getStatusColor = (status) => {
    const colors = {
      'Pending Review': 'bg-yellow-100 text-yellow-700',
      'In Progress': 'bg-blue-100 text-blue-700',
      'Completed': 'bg-green-100 text-green-700',
      'On Hold': 'bg-red-100 text-red-700'
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  return (
    <>
      <Helmet>
        <title>My Dashboard - BuildWave</title>
        <meta name="description" content="Manage your academic projects, track progress, and communicate with your BuildWave team." />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {user?.name || 'Student'}!
              </h1>
              <p className="text-gray-600 mt-1">{user?.school}</p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => setIsProjectModalOpen(true)}
                className="gradient-primary text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Project
              </Button>
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>

          <div className="grid gap-6">
            {projects.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl p-12 text-center shadow-lg"
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  No Projects Yet
                </h2>
                <p className="text-gray-600 mb-6">
                  Start your academic journey by submitting your first project request
                </p>
                <Button
                  onClick={() => setIsProjectModalOpen(true)}
                  className="gradient-primary text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Submit Your First Project
                </Button>
              </motion.div>
            ) : (
              projects.map((project, index) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-900">
                          {project.title || 'Untitled Project'}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(project.status)}`}>
                          {project.status}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-3">
                        Project ID: <span className="font-mono font-semibold">{project.id}</span>
                      </p>
                      <div className="flex flex-wrap gap-2 mb-3">
                        <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                          {project.level}
                        </span>
                        <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm">
                          {project.discipline}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="gradient-primary h-2 rounded-full transition-all"
                          style={{ width: `${project.progress || 0}%` }}
                        />
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        Progress: {project.progress || 0}%
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => navigate(`/projects/${project.id}`)}
                        className="gradient-primary text-white"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>

        <ProjectRequestModal
          isOpen={isProjectModalOpen}
          onClose={() => setIsProjectModalOpen(false)}
        />
      </div>
    </>
  );
};

export default StudentDashboard;