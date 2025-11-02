import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { ArrowLeft, Download, Send, AlertCircle } from 'lucide-react';

const ProjectDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [project, setProject] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const projects = JSON.parse(localStorage.getItem('buildwave_projects') || '[]');
    const foundProject = projects.find(p => p.id === id);
    
    if (foundProject) {
      setProject({
        ...foundProject,
        timeline: foundProject.timeline || [
          { time: new Date().toISOString(), actor: 'student', text: 'Project submitted' }
        ],
        deliverables: foundProject.deliverables || [],
        assignedTo: foundProject.assignedTo || { name: 'Pending Assignment' }
      });
    }
  }, [id]);

  const handleRequestProgress = () => {
    toast({
      title: "✅ Progress Request Sent",
      description: "Your team will update you shortly via email."
    });
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    toast({
      title: "✅ Message Sent",
      description: "Your message has been sent to the team."
    });
    setMessage('');
  };

  if (!project) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Project Not Found</h2>
          <Button onClick={() => navigate('/dashboard')} className="gradient-primary text-white">
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{project.title || 'Project Details'} - BuildWave</title>
        <meta name="description" content={`Track progress and manage your ${project.title} project with BuildWave.`} />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50">
        <div className="container mx-auto px-4 py-8">
          <Button
            variant="outline"
            onClick={() => navigate('/dashboard')}
            className="mb-8"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl p-8 shadow-lg"
              >
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                      {project.title || 'Untitled Project'}
                    </h1>
                    <p className="text-gray-600">
                      Project ID: <span className="font-mono font-semibold">{project.id}</span>
                    </p>
                  </div>
                  <Button onClick={handleRequestProgress} className="gradient-primary text-white">
                    Request Progress
                  </Button>
                </div>

                <div className="grid md:grid-cols-2 gap-4 mb-6">
                  <div className="bg-gradient-card rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Status</p>
                    <p className="text-lg font-semibold text-gray-900">{project.status}</p>
                  </div>
                  <div className="bg-gradient-card rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Progress</p>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="gradient-primary h-2 rounded-full"
                          style={{ width: `${project.progress || 0}%` }}
                        />
                      </div>
                      <span className="text-lg font-semibold text-gray-900">{project.progress || 0}%</span>
                    </div>
                  </div>
                  <div className="bg-gradient-card rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Assigned To</p>
                    <p className="text-lg font-semibold text-gray-900">{project.assignedTo.name}</p>
                  </div>
                  <div className="bg-gradient-card rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Deadline</p>
                    <p className="text-lg font-semibold text-gray-900">{project.deadline || 'TBD'}</p>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Project Description</h2>
                  <p className="text-gray-700 leading-relaxed">{project.description}</p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-2xl p-8 shadow-lg"
              >
                <h2 className="text-xl font-bold text-gray-900 mb-4">Timeline & Activity</h2>
                <div className="space-y-4">
                  {project.timeline.map((event, index) => (
                    <div key={index} className="flex gap-4">
                      <div className="w-2 h-2 bg-purple-600 rounded-full mt-2" />
                      <div className="flex-1">
                        <p className="text-sm text-gray-500">
                          {new Date(event.time).toLocaleDateString()} at {new Date(event.time).toLocaleTimeString()}
                        </p>
                        <p className="text-gray-900">{event.text}</p>
                      </div>
                    </div>
                  ))}
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
                <h2 className="text-xl font-bold text-gray-900 mb-4">Deliverables</h2>
                {project.deliverables.length === 0 ? (
                  <p className="text-gray-600 text-center py-8">No deliverables yet</p>
                ) : (
                  <div className="space-y-3">
                    {project.deliverables.map((file) => (
                      <div key={file.id} className="flex items-center justify-between p-3 bg-gradient-card rounded-lg">
                        <span className="text-gray-900 font-medium">{file.name}</span>
                        <Button size="sm" variant="outline">
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-2xl p-6 shadow-lg"
              >
                <h2 className="text-xl font-bold text-gray-900 mb-4">Send Message</h2>
                <form onSubmit={handleSendMessage} className="space-y-4">
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Type your message to the team..."
                    required
                  />
                  <Button type="submit" className="w-full gradient-primary text-white">
                    <Send className="w-4 h-4 mr-2" />
                    Send Message
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

export default ProjectDetailPage;