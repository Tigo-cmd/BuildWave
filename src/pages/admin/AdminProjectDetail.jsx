import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { ArrowLeft, Upload, Save } from 'lucide-react';

const AdminProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [project, setProject] = useState(null);
  const [status, setStatus] = useState('');
  const [progress, setProgress] = useState(0);
  const [note, setNote] = useState('');

  useEffect(() => {
    const projects = JSON.parse(localStorage.getItem('buildwave_projects') || '[]');
    const foundProject = projects.find(p => p.id === id);
    
    if (foundProject) {
      setProject(foundProject);
      setStatus(foundProject.status);
      setProgress(foundProject.progress || 0);
    }
  }, [id]);

  const handleUpdateStatus = (e) => {
    e.preventDefault();
    
    const projects = JSON.parse(localStorage.getItem('buildwave_projects') || '[]');
    const updatedProjects = projects.map(p => {
      if (p.id === id) {
        return {
          ...p,
          status,
          progress,
          timeline: [
            ...(p.timeline || []),
            {
              time: new Date().toISOString(),
              actor: 'admin',
              text: note || `Status updated to ${status}`
            }
          ]
        };
      }
      return p;
    });
    
    localStorage.setItem('buildwave_projects', JSON.stringify(updatedProjects));
    
    toast({
      title: "✅ Project Updated",
      description: "Project status and progress have been updated successfully."
    });
    
    setNote('');
  };

  const handleUploadDeliverable = () => {
    toast({
      title: "🚧 File Upload",
      description: "This feature isn't implemented yet—but don't worry! You can request it in your next prompt! 🚀"
    });
  };

  if (!project) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50 flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Admin - {project.title || 'Project'} - BuildWave</title>
        <meta name="description" content="Manage project details, update status, and upload deliverables." />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50">
        <div className="container mx-auto px-4 py-8">
          <Button
            variant="outline"
            onClick={() => navigate('/admin')}
            className="mb-8"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Projects
          </Button>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl p-8 shadow-lg"
              >
                <h1 className="text-3xl font-bold text-gray-900 mb-6">
                  {project.title || 'Untitled Project'}
                </h1>

                <div className="grid md:grid-cols-2 gap-4 mb-6">
                  <div className="bg-gradient-card rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Project ID</p>
                    <p className="text-lg font-mono font-semibold text-gray-900">{project.id}</p>
                  </div>
                  <div className="bg-gradient-card rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Level</p>
                    <p className="text-lg font-semibold text-gray-900">{project.level}</p>
                  </div>
                  <div className="bg-gradient-card rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Discipline</p>
                    <p className="text-lg font-semibold text-gray-900">{project.discipline}</p>
                  </div>
                  <div className="bg-gradient-card rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Deadline</p>
                    <p className="text-lg font-semibold text-gray-900">{project.deadline || 'TBD'}</p>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Description</h2>
                  <p className="text-gray-700 leading-relaxed">{project.description}</p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-2xl p-8 shadow-lg"
              >
                <h2 className="text-xl font-bold text-gray-900 mb-4">Upload Deliverable</h2>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-purple-400 transition-colors cursor-pointer">
                  <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600 mb-2">Click to upload or drag and drop</p>
                  <p className="text-sm text-gray-400">PDF, DOC, ZIP up to 50MB</p>
                  <Button
                    onClick={handleUploadDeliverable}
                    className="mt-4 gradient-primary text-white"
                  >
                    Select File
                  </Button>
                </div>
              </motion.div>
            </div>

            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-2xl p-6 shadow-lg"
              >
                <h2 className="text-xl font-bold text-gray-900 mb-4">Update Status</h2>
                <form onSubmit={handleUpdateStatus} className="space-y-4">
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <select
                      id="status"
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="Pending Review">Pending Review</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                      <option value="On Hold">On Hold</option>
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="progress">Progress: {progress}%</Label>
                    <input
                      id="progress"
                      type="range"
                      min="0"
                      max="100"
                      value={progress}
                      onChange={(e) => setProgress(Number(e.target.value))}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <Label htmlFor="note">Progress Note</Label>
                    <textarea
                      id="note"
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Add a note about this update..."
                    />
                  </div>

                  <Button type="submit" className="w-full gradient-primary text-white">
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
                </form>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminProjectDetail;