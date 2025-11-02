import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Eye, Users, MessageSquare, LayoutDashboard } from 'lucide-react';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [filterLevel, setFilterLevel] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');

  useEffect(() => {
    const storedProjects = localStorage.getItem('buildwave_projects');
    if (storedProjects) {
      setProjects(JSON.parse(storedProjects));
    }
  }, []);

  const filteredProjects = projects.filter(project => {
    const matchesLevel = filterLevel === 'All' || project.level === filterLevel;
    const matchesStatus = filterStatus === 'All' || project.status === filterStatus;
    return matchesLevel && matchesStatus;
  });

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
        <title>Admin Dashboard - BuildWave</title>
        <meta name="description" content="Manage projects, users, and testimonials in the BuildWave admin panel." />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50">
        <div className="bg-white border-b border-purple-100 mb-8">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gradient">BuildWave Admin</h1>
              <div className="flex gap-2">
                <Button
                  variant={window.location.pathname === '/admin' ? 'default' : 'outline'}
                  onClick={() => navigate('/admin')}
                  className={window.location.pathname === '/admin' ? 'gradient-primary text-white' : ''}
                >
                  <LayoutDashboard className="w-4 h-4 mr-2" />
                  Projects
                </Button>
                <Button
                  variant={window.location.pathname === '/admin/testimonials' ? 'default' : 'outline'}
                  onClick={() => navigate('/admin/testimonials')}
                  className={window.location.pathname === '/admin/testimonials' ? 'gradient-primary text-white' : ''}
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Testimonials
                </Button>
                <Button
                  variant={window.location.pathname === '/admin/users' ? 'default' : 'outline'}
                  onClick={() => navigate('/admin/users')}
                  className={window.location.pathname === '/admin/users' ? 'gradient-primary text-white' : ''}
                >
                  <Users className="w-4 h-4 mr-2" />
                  Users
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="flex gap-2">
              <span className="text-gray-700 font-medium self-center">Level:</span>
              {['All', 'Undergraduate', 'Masters', 'PhD'].map(level => (
                <Button
                  key={level}
                  variant={filterLevel === level ? 'default' : 'outline'}
                  onClick={() => setFilterLevel(level)}
                  size="sm"
                  className={filterLevel === level ? 'gradient-primary text-white' : ''}
                >
                  {level}
                </Button>
              ))}
            </div>
            <div className="flex gap-2">
              <span className="text-gray-700 font-medium self-center">Status:</span>
              {['All', 'Pending Review', 'In Progress', 'Completed', 'On Hold'].map(status => (
                <Button
                  key={status}
                  variant={filterStatus === status ? 'default' : 'outline'}
                  onClick={() => setFilterStatus(status)}
                  size="sm"
                  className={filterStatus === status ? 'gradient-primary text-white' : ''}
                >
                  {status}
                </Button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-card">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Project ID</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Title</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Level</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Progress</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredProjects.map((project, index) => (
                    <motion.tr
                      key={project.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-purple-50 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm font-mono font-semibold text-gray-900">
                        {project.id}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {project.title || 'Untitled Project'}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                          {project.level}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                          {project.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-[100px]">
                            <div
                              className="gradient-primary h-2 rounded-full"
                              style={{ width: `${project.progress || 0}%` }}
                            />
                          </div>
                          <span className="text-gray-900 font-medium">{project.progress || 0}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <Button
                          size="sm"
                          onClick={() => navigate(`/admin/projects/${project.id}`)}
                          className="gradient-primary text-white"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;