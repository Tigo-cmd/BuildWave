import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Check, X, Star, Users, MessageSquare, LayoutDashboard } from 'lucide-react';

const mockTestimonials = [
  {
    id: 1,
    name: "Blessing Adeyemi",
    school: "University of Benin",
    course: "Software Engineering",
    review: "BuildWave made my final year project stress-free. The team was professional and delivered on time!",
    rating: 5,
    status: "pending"
  },
  {
    id: 2,
    name: "Chukwudi Obi",
    school: "Nnamdi Azikiwe University",
    course: "Electrical Engineering",
    review: "Excellent service! My IoT project exceeded expectations.",
    rating: 5,
    status: "pending"
  }
];

const AdminTestimonials = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleApprove = (id) => {
    toast({
      title: "✅ Testimonial Approved",
      description: "The testimonial has been approved and will appear on the website."
    });
  };

  const handleReject = (id) => {
    toast({
      title: "❌ Testimonial Rejected",
      description: "The testimonial has been rejected."
    });
  };

  return (
    <>
      <Helmet>
        <title>Testimonials Management - BuildWave Admin</title>
        <meta name="description" content="Moderate and manage student testimonials." />
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
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Pending Testimonials</h2>

          <div className="grid gap-6">
            {mockTestimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl p-6 shadow-lg"
              >
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-3">
                      <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center text-white text-xl font-bold">
                        {testimonial.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">{testimonial.name}</h3>
                        <p className="text-sm text-gray-600">{testimonial.school}</p>
                        <p className="text-sm text-purple-600">{testimonial.course}</p>
                      </div>
                    </div>

                    <div className="flex gap-1 mb-3">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>

                    <p className="text-gray-700 leading-relaxed">
                      {testimonial.review}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleApprove(testimonial.id)}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Approve
                    </Button>
                    <Button
                      onClick={() => handleReject(testimonial.id)}
                      variant="destructive"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Reject
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminTestimonials;