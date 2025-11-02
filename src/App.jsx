import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LandingPage from '@/pages/LandingPage';
import TopicsPage from '@/pages/TopicsPage';
import TrackProjectPage from '@/pages/TrackProjectPage';
import StudentDashboard from '@/pages/StudentDashboard';
import ProjectDetailPage from '@/pages/ProjectDetailPage';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminProjectDetail from '@/pages/admin/AdminProjectDetail';
import AdminTestimonials from '@/pages/admin/AdminTestimonials';
import AdminUsers from '@/pages/admin/AdminUsers';

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/topics" element={<TopicsPage />} />
      <Route path="/track" element={<TrackProjectPage />} />
      <Route path="/dashboard" element={<StudentDashboard />} />
      <Route path="/projects/:id" element={<ProjectDetailPage />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/admin/projects/:id" element={<AdminProjectDetail />} />
      <Route path="/admin/testimonials" element={<AdminTestimonials />} />
      <Route path="/admin/users" element={<AdminUsers />} />
    </Routes>
  );
}

export default App;