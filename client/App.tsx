import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Home from "./pages/Home";
import Features from "./pages/Features";
import NGODashboard from "./pages/NGODashboard";
import OrgProfileDetail from "./pages/OrgProfileDetail";
import PPTViewer from "./pages/PPTViewer";
import Shortlist from "./pages/Shortlist";
import Admin from "./pages/Admin";
import OrgSubmit from "./pages/OrgSubmit";
import AuthPage from "./pages/AuthPage";
import AuthCallback from "./pages/AuthCallback";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import NotFound from "./pages/NotFound";
import Search from "./pages/Search";
import About, { AboutPlaceholder } from "./pages/About";
import TextMaker from "./pages/TextMaker";
import TextMakerDashboard from "./pages/TextMakerDashboard";
import Contact from "./pages/Contact";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsAndConditions from "./pages/TermsAndConditions";
import SubmitOrganization from "./pages/SubmitOrganization";
import ProfileSettings from "./pages/ProfileSettings";
import RoleIntentOnboarding from "./pages/RoleIntentOnboarding";
import RoleEntry from "./pages/RoleEntry";
import RequireOnboarding from "./components/RequireOnboarding";

// TextMaker modules
import TextExtractor from "@/components/textmaker/modules/TextExtractor";
import PowerPointGenerator from "@/components/textmaker/modules/PowerPointGenerator";
import ResearchPaperGenerator from "@/components/textmaker/modules/ResearchPaperGenerator";

const queryClient = new QueryClient();

export default function App() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>

              <Routes>
                {/* Drivya.AI New Platform Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/features" element={<Features />} />
                <Route path="/about" element={<About />} />

                {/* Auth Routes */}
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/auth/callback" element={<AuthCallback />} />

                {/* Role-specific entry points */}
                <Route path="/start/:role" element={<RoleEntry />} />

                {/* Onboarding - mandatory role + intent selection */}
                <Route path="/onboarding" element={<RoleIntentOnboarding />} />

                {/* Public Browse Routes - no login required */}
                <Route path="/search" element={<Search />} />
                <Route path="/organization/:id" element={<OrgProfileDetail />} />
                <Route path="/org-profile/:id" element={<OrgProfileDetail />} />

                {/* Protected Routes - require onboarding/auth */}
                <Route path="/dashboard" element={<RequireOnboarding><NGODashboard /></RequireOnboarding>} />
                <Route path="/shortlist" element={<RequireOnboarding><Shortlist /></RequireOnboarding>} />

                {/* Org submit routes - auth handled by page or role entry */}
                <Route path="/org-submit" element={<OrgSubmit />} />
                <Route path="/submit-organization" element={<SubmitOrganization />} />

                {/* Other Public Routes */}
                <Route path="/contact" element={<Contact />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
                <Route path="/profile" element={<ProfileSettings />} />
                <Route path="/org-edit/:id" element={<OrgSubmit />} />
                <Route path="/ppt/:id" element={<PPTViewer />} />
                <Route path="/textmaker" element={<TextMaker />} />

                {/* TextMaker / AI Tools Routes */}
                <Route path="/tools" element={<TextMakerDashboard />} />
                <Route path="/tools/text-extraction" element={<TextExtractor />} />
                <Route path="/tools/powerpoint" element={<PowerPointGenerator />} />
                <Route path="/tools/research-paper" element={<ResearchPaperGenerator />} />
                <Route path="/tools/bi-dashboard" element={<div className="p-6"><h1 className="text-2xl font-bold">Power BI Dashboard - Coming Soon</h1></div>} />

                {/* Legacy Routes (keeping for backward compatibility) */}
                <Route path="/home" element={<Home />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/login" element={<AuthPage />} />
                <Route path="/signup" element={<AuthPage />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

