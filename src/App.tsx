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
import NotFound from "./pages/NotFound";
import { ProtectedAdminRoute } from '@/components/ProtectedAdminRoute';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <HelmetProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
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
            <Route path="/admin/projects/:projectId" element={<AdminProjectDetail />} />
            <Route path="/admin/testimonials" element={<AdminTestimonials />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </HelmetProvider>
  </QueryClientProvider>
);

export default App;
