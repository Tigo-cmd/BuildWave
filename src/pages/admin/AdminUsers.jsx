import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Eye, Users, MessageSquare, LayoutDashboard } from 'lucide-react';

const mockUsers = [
  {
    id: 1,
    name: "Amaka Okoye",
    email: "amaka.okoye@unilag.edu.ng",
    school: "University of Lagos",
    level: "Undergraduate",
    projects: 2
  },
  {
    id: 2,
    name: "Ibrahim Musa",
    email: "ibrahim.musa@abu.edu.ng",
    school: "Ahmadu Bello University",
    level: "Masters",
    projects: 1
  },
  {
    id: 3,
    name: "Chioma Nwosu",
    email: "chioma.nwosu@covenantuniversity.edu.ng",
    school: "Covenant University",
    level: "Undergraduate",
    projects: 1
  }
];

const AdminUsers = () => {
  const navigate = useNavigate();

  return (
    <>
      <Helmet>
        <title>Users Management - BuildWave Admin</title>
        <meta name="description" content="View and manage registered users." />
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
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Registered Users</h2>

          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-card">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Name</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Email</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">School</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Level</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Projects</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {mockUsers.map((user, index) => (
                    <motion.tr
                      key={user.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-purple-50 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                        {user.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {user.school}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                          {user.level}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {user.projects}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-purple-300 text-purple-700 hover:bg-purple-50"
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

export default AdminUsers;