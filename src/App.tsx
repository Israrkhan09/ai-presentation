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
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <QueryClientProvider client={queryClient} data-id="343rabfah" data-path="src/App.tsx">
      <TooltipProvider data-id="44h8t5bb4" data-path="src/App.tsx">
        <Router data-id="b9f4a9qiq" data-path="src/App.tsx">
          <div className="App" data-id="qnuf7ydbh" data-path="src/App.tsx">
            <Routes data-id="05p94a475" data-path="src/App.tsx">
              {/* Auth Routes */}
              <Route path="/login" element={
              isAuthenticated ? <Navigate to="/dashboard" replace data-id="c9waofpga" data-path="src/App.tsx" /> : <LoginPage data-id="j6lsprfrm" data-path="src/App.tsx" />
              } data-id="xpim3hzi5" data-path="src/App.tsx" />
              <Route path="/register" element={
              isAuthenticated ? <Navigate to="/dashboard" replace data-id="oez738wyw" data-path="src/App.tsx" /> : <RegisterPage data-id="c4ymty3ns" data-path="src/App.tsx" />
              } data-id="ge4i4x8sm" data-path="src/App.tsx" />
              
              {/* Protected Routes */}
              <Route path="/voice-setup" element={
              <AuthGuard data-id="4ag58m74m" data-path="src/App.tsx">
                  <VoiceSetupPage data-id="4hdvqh46u" data-path="src/App.tsx" />
                </AuthGuard>
              } data-id="64bzfgwdx" data-path="src/App.tsx" />
              <Route path="/dashboard" element={
              <AuthGuard data-id="yonftys3n" data-path="src/App.tsx">
                  <DashboardPage data-id="slqndm48d" data-path="src/App.tsx" />
                </AuthGuard>
              } data-id="vaqs62i61" data-path="src/App.tsx" />
              <Route path="/present/:id" element={
              <AuthGuard data-id="j2gpzjze4" data-path="src/App.tsx">
                  <PresentationPage data-id="t9g5m5bqq" data-path="src/App.tsx" />
                </AuthGuard>
              } data-id="lzmno8q7o" data-path="src/App.tsx" />
              
              {/* Default redirect */}
              <Route path="/" element={
              <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace data-id="o62xpcbk3" data-path="src/App.tsx" />
              } data-id="408uph5oc" data-path="src/App.tsx" />
              <Route path="*" element={
              <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace data-id="8q70f34rn" data-path="src/App.tsx" />
              } data-id="cd4qmxbup" data-path="src/App.tsx" />
            </Routes>
            <Toaster data-id="9yb1dthni" data-path="src/App.tsx" />
          </div>
        </Router>
      </TooltipProvider>
    </QueryClientProvider>);

}

export default App;