import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { LoyaltyProvider } from "@/contexts/LoyaltyContext";
import Navbar from "@/components/Navbar";
import Index from "./pages/Index";
import ShopDetail from "./pages/ShopDetail";
import BlogFeed from "./pages/BlogFeed";
import CanteenNews from "./pages/CanteenNews";
import BlogPostDetail from "./pages/BlogPostDetail";
import Login from "./pages/Login";
import ShopAdminDashboard from "./pages/ShopAdminDashboard";
import PostManagement from "./pages/PostManagement";
import CommentManagement from "./pages/CommentManagement";
import SuperAdminDashboard from "./pages/SuperAdminDashboard";
import Offers from "./pages/Offers";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <LoyaltyProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Navbar />
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/shop/:id" element={<ShopDetail />} />
                <Route path="/blog" element={<BlogFeed />} />
                <Route path="/blog/:id" element={<BlogPostDetail />} />
                <Route path="/canteen/:id/news" element={<CanteenNews />} />
                <Route path="/login" element={<Login />} />
                <Route path="/offers" element={<Offers />} />
                <Route path="/dashboard" element={<ShopAdminDashboard />} />
                <Route path="/dashboard/posts" element={<PostManagement />} />
                <Route path="/dashboard/comments" element={<CommentManagement />} />
                <Route path="/admin" element={<SuperAdminDashboard />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </LoyaltyProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
