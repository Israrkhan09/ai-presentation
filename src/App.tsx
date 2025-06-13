import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { UserProvider } from '@/contexts/UserContext';

// Pages
import HomePage from '@/pages/HomePage';
import Login from '@/pages/Login';
import Registration from '@/pages/Registration';
import NotFound from '@/pages/NotFound';
import PresentationDashboard from '@/components/PresentationDashboard';
import SmartPresentationPage from '@/pages/SmartPresentationPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <UserProvider>
        <TooltipProvider>
          <Router>
            <div className="min-h-screen bg-background">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Registration />} />
                <Route path="/dashboard" element={<PresentationDashboard />} />
                <Route path="/smart-presentation" element={<SmartPresentationPage />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
              <Toaster />
            </div>
          </Router>
        </TooltipProvider>
      </UserProvider>
    </QueryClientProvider>
  );
}

export default App;
