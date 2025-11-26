import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import OrgProfileDetail from "./pages/OrgProfileDetail";
import PPTViewer from "./pages/PPTViewer";
import Admin from "./pages/Admin";
import OrgSubmit from "./pages/OrgSubmit";
import AuthPage from "./pages/AuthPage";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import NotFound from "./pages/NotFound";
import Search from "./pages/Search";

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* ANVESHAN New Platform Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/search" element={<Search />} />
            <Route path="/org-profile/:id" element={<OrgProfileDetail />} />
            <Route path="/ppt/:id" element={<PPTViewer />} />
            <Route path="/org-submit" element={<OrgSubmit />} />

            {/* Legacy Routes (keeping for backward compatibility) */}
            <Route path="/home" element={<Home />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}
