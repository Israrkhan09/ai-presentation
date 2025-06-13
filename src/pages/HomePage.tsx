import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Brain, 
  Mic, 
  FileText, 
  BarChart3, 
  Volume2, 
  Zap,
  ArrowRight,
  UserPlus,
  LogIn,
  CheckCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Mic className="h-8 w-8 text-blue-600" />,
      title: "Real-Time Speech Recognition",
      description: "Advanced AI listens and transcribes your speech with high accuracy, providing real-time feedback."
    },
    {
      icon: <Brain className="h-8 w-8 text-purple-600" />,
      title: "AI Content Analysis",
      description: "Intelligent analysis of your presentation content with keyword extraction and topic insights."
    },
    {
      icon: <Volume2 className="h-8 w-8 text-green-600" />,
      title: "Voice-Controlled Navigation",
      description: "Control your presentation hands-free with natural voice commands and gestures."
    },
    {
      icon: <BarChart3 className="h-8 w-8 text-orange-600" />,
      title: "Auto-Generated Quizzes",
      description: "Automatically create MCQs and theory questions based on your presentation content."
    },
    {
      icon: <FileText className="h-8 w-8 text-red-600" />,
      title: "PDF Export & Notes",
      description: "Export your presentation data, transcripts, and speaker notes as professional PDFs."
    },
    {
      icon: <Zap className="h-8 w-8 text-yellow-600" />,
      title: "Personalized Experience",
      description: "Custom voice profiles and personalized dashboards tailored to your presentation style."
    }
  ];

  const goToRegister = () => {
    navigate('/register');
  };

  const goToLogin = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-800">AI Presenter</h1>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={goToLogin} className="flex items-center gap-2">
                <LogIn className="h-4 w-4" />
                Login
              </Button>
              <Button onClick={goToRegister} className="flex items-center gap-2">
                <UserPlus className="h-4 w-4" />
                Register
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <Badge variant="secondary" className="mb-4 text-lg px-4 py-2">
            🚀 Next-Generation Presentations
          </Badge>
          
          <h1 className="text-6xl font-bold text-gray-800 mb-6 leading-tight">
            AI-Powered
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              {" "}Presentations
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Transform your presentations with advanced AI technology. Real-time speech recognition, 
            intelligent content analysis, and voice-controlled navigation make presenting effortless and engaging.
          </p>
          
          <div className="flex items-center justify-center gap-4">
            <Button 
              size="lg" 
              onClick={goToRegister}
              className="flex items-center gap-2 text-lg px-8 py-4"
            >
              Get Started Free
              <ArrowRight className="h-5 w-5" />
            </Button>
            
            <Button 
              variant="outline" 
              size="lg"
              onClick={goToLogin}
              className="flex items-center gap-2 text-lg px-8 py-4"
            >
              <LogIn className="h-5 w-5" />
              Sign In
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-white/50">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              Powerful Features for Modern Presenters
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our AI-powered platform provides everything you need to create, deliver, 
              and analyze presentations like never before.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="h-full hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    {feature.icon}
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600">
              Get started in just a few simple steps
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-4xl mx-auto">
            {/* Step 1 */}
            <Card className="relative">
              <div className="absolute -top-4 -left-4 bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">
                1
              </div>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="h-6 w-6 text-blue-600" />
                  Registration + Voice Enrollment
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Fill out personal information</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Record voice sample for personalization</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Complete registration process</span>
                </div>
                <div className="bg-green-50 border border-green-200 rounded p-3 mt-4">
                  <p className="text-green-800 text-sm font-medium">
                    ✨ "You are successfully registered!"
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Step 2 */}
            <Card className="relative">
              <div className="absolute -top-4 -left-4 bg-purple-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">
                2
              </div>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LogIn className="h-6 w-6 text-purple-600" />
                  Login & Personalized Dashboard
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Login with your credentials</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Access personalized dashboard</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Upload presentations or start new session</span>
                </div>
                <div className="bg-purple-50 border border-purple-200 rounded p-3 mt-4">
                  <p className="text-purple-800 text-sm font-medium">
                    👋 "Welcome, [Your Name]"
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4">
            Ready to Transform Your Presentations?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of presenters who have already discovered the power of AI-assisted presentations.
          </p>
          
          <div className="flex items-center justify-center gap-4">
            <Button 
              size="lg" 
              variant="secondary"
              onClick={goToRegister}
              className="flex items-center gap-2 text-lg px-8 py-4"
            >
              Start Your Free Trial
              <ArrowRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12 px-4">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Brain className="h-6 w-6" />
            <span className="text-xl font-bold">AI Presenter</span>
          </div>
          <p className="text-gray-400">
            © 2024 AI Presenter. Empowering presentations with artificial intelligence.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
