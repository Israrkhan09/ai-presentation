import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import AuthGuard from '@/components/AuthGuard';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import VoiceSetupPage from '@/pages/VoiceSetupPage';
import DashboardPage from '@/pages/DashboardPage';
import PresentationPage from '@/pages/PresentationPage';
import { useAuthStore } from '@/store/authStore';

const queryClient = new QueryClient();

function App() {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Router>
          <div className="App">
            <Routes>
              {/* Auth Routes */}
              <Route path="/login" element={
                isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />
              } />
              <Route path="/register" element={
                isAuthenticated ? <Navigate to="/dashboard" replace /> : <RegisterPage />
              } />
              
              {/* Protected Routes */}
              <Route path="/voice-setup" element={
                <AuthGuard>
                  <VoiceSetupPage />
                </AuthGuard>
              } />
              <Route path="/dashboard" element={
                <AuthGuard>
                  <DashboardPage />
                </AuthGuard>
              } />
              <Route path="/present/:id" element={
                <AuthGuard>
                  <PresentationPage />
                </AuthGuard>
              } />
              
              {/* Default redirect */}
              <Route path="/" element={
                <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />
              } />
              <Route path="*" element={
                <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />
              } />
            </Routes>
            <Toaster />
          </div>
        </Router>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;