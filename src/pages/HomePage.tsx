import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/store/authStore';
import {
  Presentation,
  Mic,
  Brain,
  Zap,
  ArrowRight,
  Users,
  BarChart3,
  Shield } from
'lucide-react';

const HomePage = () => {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const features = [
  {
    icon: <Mic className="h-6 w-6" data-id="060ho5ueb" data-path="src/pages/HomePage.tsx" />,
    title: "Voice-Controlled Presentations",
    description: "Navigate through slides using natural voice commands. No more clicking - just speak and present."
  },
  {
    icon: <Brain className="h-6 w-6" data-id="2y80qd2pw" data-path="src/pages/HomePage.tsx" />,
    title: "AI-Powered Insights",
    description: "Automatically generate summaries, speaker notes, and knowledge assessments from your presentations."
  },
  {
    icon: <Zap className="h-6 w-6" data-id="bs1uavtm8" data-path="src/pages/HomePage.tsx" />,
    title: "Real-Time Processing",
    description: "Experience lightning-fast speech recognition and slide navigation with sub-500ms response times."
  },
  {
    icon: <Users className="h-6 w-6" data-id="7mpnn6m8r" data-path="src/pages/HomePage.tsx" />,
    title: "Enhanced Engagement",
    description: "Keep your audience engaged with seamless, hands-free presentation delivery."
  },
  {
    icon: <BarChart3 className="h-6 w-6" data-id="q2wlzxe32" data-path="src/pages/HomePage.tsx" />,
    title: "Smart Analytics",
    description: "Track presentation performance and get insights into audience engagement patterns."
  },
  {
    icon: <Shield className="h-6 w-6" data-id="v37z9fust" data-path="src/pages/HomePage.tsx" />,
    title: "Secure & Private",
    description: "Your voice profiles and presentations are encrypted and securely stored."
  }];


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100" data-id="8534hibfv" data-path="src/pages/HomePage.tsx">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b" data-id="j5l0vavgv" data-path="src/pages/HomePage.tsx">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" data-id="byhkfo5vn" data-path="src/pages/HomePage.tsx">
          <div className="flex justify-between items-center h-16" data-id="awx9nt3n3" data-path="src/pages/HomePage.tsx">
            <div className="flex items-center gap-3" data-id="312uurmm5" data-path="src/pages/HomePage.tsx">
              <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center" data-id="r99i9f6df" data-path="src/pages/HomePage.tsx">
                <Presentation className="h-4 w-4 text-primary-foreground" data-id="o8d0g6awx" data-path="src/pages/HomePage.tsx" />
              </div>
              <span className="text-xl font-bold" data-id="l1sporvpw" data-path="src/pages/HomePage.tsx">AI Presentation Assistant</span>
            </div>
            
            <div className="flex items-center gap-3" data-id="bx8wq85hn" data-path="src/pages/HomePage.tsx">
              <Button variant="ghost" onClick={() => navigate('/login')} data-id="vo9ez7dgl" data-path="src/pages/HomePage.tsx">
                Sign In
              </Button>
              <Button onClick={() => navigate('/register')} data-id="w6s7389yg" data-path="src/pages/HomePage.tsx">
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-20 pb-16" data-id="mygise3pe" data-path="src/pages/HomePage.tsx">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center" data-id="kxhhcu1j4" data-path="src/pages/HomePage.tsx">
          <Badge variant="secondary" className="mb-6" data-id="k9adyapjk" data-path="src/pages/HomePage.tsx">
            🚀 Revolutionary AI Technology
          </Badge>
          
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent" data-id="ueqtyp6aw" data-path="src/pages/HomePage.tsx">
            Transform Your Presentations with AI
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto" data-id="9n4938zwi" data-path="src/pages/HomePage.tsx">
            Experience the future of presentations with voice-controlled navigation, 
            real-time AI insights, and automated content generation. 
            Deliver presentations that captivate and engage like never before.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center" data-id="t66ejgb1h" data-path="src/pages/HomePage.tsx">
            <Button size="lg" onClick={() => navigate('/register')} className="text-lg px-8" data-id="4povdi4aq" data-path="src/pages/HomePage.tsx">
              Start Free Trial
              <ArrowRight className="ml-2 h-5 w-5" data-id="uxbh7lshj" data-path="src/pages/HomePage.tsx" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate('/login')} className="text-lg px-8" data-id="7xiq3rezj" data-path="src/pages/HomePage.tsx">
              Watch Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16" data-id="viof702il" data-path="src/pages/HomePage.tsx">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" data-id="2gg1fv0h2" data-path="src/pages/HomePage.tsx">
          <div className="text-center mb-16" data-id="wir3xuj35" data-path="src/pages/HomePage.tsx">
            <h2 className="text-3xl font-bold mb-4" data-id="0424bqf5a" data-path="src/pages/HomePage.tsx">Intelligent Features for Modern Presenters</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto" data-id="wr6g929p1" data-path="src/pages/HomePage.tsx">
              Leverage cutting-edge AI technology to enhance every aspect of your presentation experience
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8" data-id="ffw6vcrjl" data-path="src/pages/HomePage.tsx">
            {features.map((feature, index) =>
            <Card key={index} className="h-full hover:shadow-lg transition-shadow" data-id="q360nkh6k" data-path="src/pages/HomePage.tsx">
                <CardHeader data-id="tdjone63i" data-path="src/pages/HomePage.tsx">
                  <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary mb-4" data-id="hcrn96of9" data-path="src/pages/HomePage.tsx">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl" data-id="h2049que0" data-path="src/pages/HomePage.tsx">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent data-id="ce63nczqq" data-path="src/pages/HomePage.tsx">
                  <CardDescription className="text-base" data-id="0zumfmfk6" data-path="src/pages/HomePage.tsx">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-indigo-600" data-id="8sf1e5i06" data-path="src/pages/HomePage.tsx">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center" data-id="8zky6zei2" data-path="src/pages/HomePage.tsx">
          <h2 className="text-3xl font-bold text-white mb-4" data-id="mnck56ia8" data-path="src/pages/HomePage.tsx">
            Ready to Revolutionize Your Presentations?
          </h2>
          <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto" data-id="cdmwcr5fr" data-path="src/pages/HomePage.tsx">
            Join thousands of presenters who have already transformed their 
            presentation experience with our AI-powered platform.
          </p>
          <Button
            size="lg"
            variant="secondary"
            onClick={() => navigate('/register')}
            className="text-lg px-8" data-id="goba7grrc" data-path="src/pages/HomePage.tsx">

            Get Started for Free
            <ArrowRight className="ml-2 h-5 w-5" data-id="41b4n3l50" data-path="src/pages/HomePage.tsx" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t py-8" data-id="gkc0aw8aa" data-path="src/pages/HomePage.tsx">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center" data-id="upl1synf9" data-path="src/pages/HomePage.tsx">
          <div className="flex items-center justify-center gap-3 mb-4" data-id="xdorzsgcl" data-path="src/pages/HomePage.tsx">
            <div className="h-6 w-6 bg-primary rounded flex items-center justify-center" data-id="mpciuw0lj" data-path="src/pages/HomePage.tsx">
              <Presentation className="h-3 w-3 text-primary-foreground" data-id="sr78hdwbn" data-path="src/pages/HomePage.tsx" />
            </div>
            <span className="font-semibold" data-id="olfbekdtd" data-path="src/pages/HomePage.tsx">AI Presentation Assistant</span>
          </div>
          <p className="text-muted-foreground" data-id="o0em2zmmp" data-path="src/pages/HomePage.tsx">
            © 2024 AI Presentation Assistant. All rights reserved.
          </p>
        </div>
      </footer>
    </div>);

};

export default HomePage;