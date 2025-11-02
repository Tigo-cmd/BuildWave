import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/components/ui/use-toast';
import { Upload } from 'lucide-react';

const ProjectRequestModal = ({ isOpen, onClose, prefilledService }) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    title: prefilledService?.title || '',
    needTopic: false,
    hasProject: true,
    level: prefilledService?.level || '',
    discipline: prefilledService?.discipline || '',
    description: '',
    deadline: '',
    budget: '',
    phone: '',
    contact: 'Email'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const projectId = `BW-2025-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`;
    
    const project = {
      id: projectId,
      ...formData,
      status: 'Pending Review',
      progress: 0,
      createdAt: new Date().toISOString()
    };
    
    const existingProjects = JSON.parse(localStorage.getItem('buildwave_projects') || '[]');
    existingProjects.push(project);
    localStorage.setItem('buildwave_projects', JSON.stringify(existingProjects));
    
    toast({
      title: "🎉 Project Submitted Successfully!",
      description: `Your Project ID is ${projectId}. Check your email for confirmation.`
    });
    
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gradient">
            Request a Project
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div>
            <Label htmlFor="title">Project Title (Optional)</Label>
            <input
              id="title"
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="e.g., Smart Home Automation System"
            />
          </div>

          <div className="flex gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="needTopic"
                checked={formData.needTopic}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, needTopic: checked, hasProject: !checked }))}
              />
              <Label htmlFor="needTopic" className="cursor-pointer">
                I need a topic
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="hasProject"
                checked={formData.hasProject}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, hasProject: checked, needTopic: !checked }))}
              />
              <Label htmlFor="hasProject" className="cursor-pointer">
                I already have a project
              </Label>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="level">Academic Level *</Label>
              <select
                id="level"
                required
                value={formData.level}
                onChange={(e) => setFormData(prev => ({ ...prev, level: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Select level</option>
                <option value="Undergraduate">Undergraduate</option>
                <option value="Masters">Masters</option>
                <option value="PhD">PhD</option>
              </select>
            </div>

            <div>
              <Label htmlFor="discipline">Discipline *</Label>
              <input
                id="discipline"
                type="text"
                required
                value={formData.discipline}
                onChange={(e) => setFormData(prev => ({ ...prev, discipline: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="e.g., Computer Science"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Brief Description *</Label>
            <textarea
              id="description"
              required
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Describe your project requirements..."
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="deadline">Deadline *</Label>
              <input
                id="deadline"
                type="date"
                required
                value={formData.deadline}
                onChange={(e) => setFormData(prev => ({ ...prev, deadline: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <Label htmlFor="budget">Budget Estimate (Optional)</Label>
              <input
                id="budget"
                type="text"
                value={formData.budget}
                onChange={(e) => setFormData(prev => ({ ...prev, budget: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="₦100,000 - ₦200,000"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="phone">Phone Number (Optional)</Label>
            <input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="+234 XXX XXX XXXX"
            />
          </div>

          <div>
            <Label>Preferred Contact Method</Label>
            <div className="flex gap-4 mt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="contact"
                  value="Email"
                  checked={formData.contact === 'Email'}
                  onChange={(e) => setFormData(prev => ({ ...prev, contact: e.target.value }))}
                  className="w-4 h-4 text-purple-600"
                />
                <span>Email</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="contact"
                  value="WhatsApp"
                  checked={formData.contact === 'WhatsApp'}
                  onChange={(e) => setFormData(prev => ({ ...prev, contact: e.target.value }))}
                  className="w-4 h-4 text-purple-600"
                />
                <span>WhatsApp</span>
              </label>
            </div>
          </div>

          <div>
            <Label>Upload Files (Optional)</Label>
            <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-purple-400 transition-colors cursor-pointer">
              <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm text-gray-600">Click to upload or drag and drop</p>
              <p className="text-xs text-gray-400 mt-1">PDF, DOC, DOCX up to 10MB</p>
            </div>
          </div>

          <Button type="submit" className="w-full gradient-primary text-white py-6 text-lg">
            Submit Project Request
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProjectRequestModal;