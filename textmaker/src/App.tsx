import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from '@/components/Layout';
import Dashboard from '@/pages/Dashboard';
import TextExtractor from '@/components/modules/TextExtractor';
import PowerPointGenerator from '@/components/modules/PowerPointGenerator';
import ResearchPaperGenerator from '@/components/modules/ResearchPaperGenerator';
import NotFound from '@/pages/NotFound';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/text-extraction" element={<TextExtractor />} />
            <Route path="/powerpoint" element={<PowerPointGenerator />} />
            <Route path="/research-paper" element={<ResearchPaperGenerator />} />
            <Route path="/dashboard" element={<div className="p-6"><h1 className="text-2xl font-bold">Power BI Dashboard - Coming Soon</h1></div>} />
            <Route path="/history" element={<div className="p-6"><h1 className="text-2xl font-bold">Project History - Coming Soon</h1></div>} />
            <Route path="/settings" element={<div className="p-6"><h1 className="text-2xl font-bold">Settings - Coming Soon</h1></div>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;