import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import TrackProject from "./pages/TrackProject";
import Topics from "./pages/Topics";
import Admin from "./pages/Admin";
import AdminLogin from "./pages/AdminLogin";
import AdminProjectDetail from "./pages/AdminProjectDetail";
import AdminTestimonials from "./pages/AdminTestimonials";
import AdminUsers from "./pages/AdminUsers";
import AdminContent from "./pages/AdminContent";
import NotFound from "./pages/NotFound";
import { ProtectedAdminRoute } from '@/components/ProtectedAdminRoute';
import { AuthProvider } from "@/hooks/useAuth";
import WhatsappChat from "@/components/Whatsappchat";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <HelmetProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <WhatsappChat />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/track/:projectId" element={<TrackProject />} />
              <Route path="/topics" element={<Topics />} />
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin" element={
                <ProtectedAdminRoute>
                  <Admin />
                </ProtectedAdminRoute>
              } />
              <Route path="/admin/projects/:projectId" element={
                <ProtectedAdminRoute>
                  <AdminProjectDetail />
                </ProtectedAdminRoute>
              } />
              <Route path="/admin/testimonials" element={
                <ProtectedAdminRoute>
                  <AdminTestimonials />
                </ProtectedAdminRoute>
              } />
              <Route path="/admin/users" element={
                <ProtectedAdminRoute>
                  <AdminUsers />
                </ProtectedAdminRoute>
              } />
              <Route path="/admin/content" element={
                <ProtectedAdminRoute>
                  <AdminContent />
                </ProtectedAdminRoute>
              } />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </HelmetProvider>
  </QueryClientProvider>
);

export default App;

