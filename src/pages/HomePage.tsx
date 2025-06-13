import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Brain,
  Mic,
  FileText,
  Download,
  Zap,
  Target,
  TrendingUp,
  CheckCircle,
  ArrowRight,
  Play,
  BarChart3 } from
'lucide-react';
import { useNavigate } from 'react-router-dom';

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  const features = [
  {
    icon: <Mic className="h-8 w-8 text-blue-600" />,
    title: "Real-time Transcription",
    description: "Advanced speech-to-text with keyword detection and emotion analysis",
    benefits: ["99% accuracy", "Live keyword highlighting", "Emotion tone detection"]
  },
  {
    icon: <Brain className="h-8 w-8 text-purple-600" />,
    title: "Smart Slide Control",
    description: "Automatic slide advancement based on content context and voice commands",
    benefits: ["Context-aware navigation", "Voice commands", "Hands-free operation"]
  },
  {
    icon: <FileText className="h-8 w-8 text-green-600" />,
    title: "AI Quiz Generation",
    description: "Automatically create MCQ and theory-based assessments from your content",
    benefits: ["Multiple question types", "Difficulty adaptation", "Instant feedback"]
  },
  {
    icon: <Download className="h-8 w-8 text-orange-600" />,
    title: "PDF Documentation",
    description: "Generate comprehensive lecture summaries with analytics and insights",
    benefits: ["Automated summaries", "Performance analytics", "Downloadable reports"]
  }];


  const benefits = [
  {
    icon: <Target className="h-6 w-6 text-blue-500" />,
    title: "Maximized Knowledge Retention",
    description: "AI-powered content analysis ensures key concepts are reinforced through dynamic highlighting and automated assessments."
  },
  {
    icon: <Zap className="h-6 w-6 text-yellow-500" />,
    title: "Minimal Manual Intervention",
    description: "Voice-activated controls and automatic slide advancement let you focus entirely on your presentation content."
  },
  {
    icon: <TrendingUp className="h-6 w-6 text-green-500" />,
    title: "Real-time Analytics",
    description: "Live engagement metrics, speaking pace analysis, and audience interaction insights improve your presentation skills."
  },
  {
    icon: <CheckCircle className="h-6 w-6 text-purple-500" />,
    title: "Automated Documentation",
    description: "Every session generates comprehensive materials including transcripts, summaries, and assessment tools."
  }];


  const stats = [
  { value: "95%", label: "Knowledge Retention Increase", icon: <Brain className="h-5 w-5" /> },
  { value: "80%", label: "Time Saved on Documentation", icon: <FileText className="h-5 w-5" /> },
  { value: "100%", label: "Hands-free Operation", icon: <Mic className="h-5 w-5" /> },
  { value: "50+", label: "Voice Commands Supported", icon: <Play className="h-5 w-5" /> }];


  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-800 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-7xl mx-auto px-6 py-20">
          <div className="text-center space-y-8">
            <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
              <Zap className="h-3 w-3 mr-1" />
              Next-Generation Presentation Technology
            </Badge>
            
            <h1 className="text-5xl md:text-7xl font-bold leading-tight">
              Smart Presentations
              <span className="block bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                Powered by AI
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
              Transform your presentations with real-time transcription, automatic slide control, 
              AI-generated assessments, and comprehensive analytics. The future of seamless presenting is here.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                onClick={() => navigate('/smart-presentation')}
                size="lg"
                className="bg-white text-blue-600 hover:bg-blue-50 text-lg px-8 py-4 h-auto">

                <Play className="h-5 w-5 mr-2" />
                Start Smart Presentation
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
              
              <Button
                onClick={() => navigate('/register')}
                variant="outline"
                size="lg"
                className="border-white text-white hover:bg-white hover:text-blue-600 text-lg px-8 py-4 h-auto">

                Get Started Free
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) =>
            <div key={index} className="text-center">
                <div className="flex justify-center items-center gap-2 mb-2">
                  <div className="text-blue-600">{stat.icon}</div>
                  <div className="text-3xl md:text-4xl font-bold text-gray-900">{stat.value}</div>
                </div>
                <p className="text-gray-600 text-sm md:text-base">{stat.label}</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Revolutionary Features
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Experience the most advanced presentation technology with AI-powered features 
              designed to maximize engagement and knowledge retention.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) =>
            <Card key={index} className="group hover:shadow-xl transition-all duration-300 border-0 bg-white">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 rounded-xl bg-gray-50 group-hover:bg-blue-50 transition-colors">
                      {feature.icon}
                    </div>
                    <CardTitle className="text-2xl">{feature.title}</CardTitle>
                  </div>
                  <p className="text-gray-600 text-lg">{feature.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {feature.benefits.map((benefit, i) =>
                  <div key={i} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-gray-700">{benefit}</span>
                      </div>
                  )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Why Choose Smart Presentations?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our AI-powered platform transforms the way you present, ensuring maximum impact 
              with minimal effort through cutting-edge automation and analytics.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {benefits.map((benefit, index) =>
            <div key={index} className="flex gap-6">
                <div className="flex-shrink-0 p-3 rounded-xl bg-gray-50">
                  {benefit.icon}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {benefit.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {benefit.description}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-700 text-white">
        <div className="max-w-4xl mx-auto text-center px-6">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Revolutionize Your Presentations?
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Join thousands of professionals who've transformed their presentation experience 
            with our AI-powered platform. Start your journey today.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => navigate('/smart-presentation')}
              size="lg"
              className="bg-white text-blue-600 hover:bg-blue-50 text-lg px-8 py-4 h-auto">

              <Brain className="h-5 w-5 mr-2" />
              Try Smart Presentation
            </Button>
            
            <Button
              onClick={() => navigate('/dashboard')}
              variant="outline"
              size="lg"
              className="border-white text-white hover:bg-white hover:text-blue-600 text-lg px-8 py-4 h-auto">

              <BarChart3 className="h-5 w-5 mr-2" />
              View Dashboard
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <Brain className="h-8 w-8 text-blue-400" />
                <span className="text-xl font-bold text-white">Smart Presentations</span>
              </div>
              <p className="text-gray-400 mb-4">
                Revolutionizing presentations with AI-powered features for maximum engagement 
                and knowledge retention.
              </p>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-4">Features</h3>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white transition-colors">Real-time Transcription</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Smart Controls</a></li>
                <li><a href="#" className="hover:text-white transition-colors">AI Quiz Generation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">PDF Documentation</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-4">Platform</h3>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white transition-colors">Dashboard</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Analytics</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Settings</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Support</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <p className="text-gray-400">
              © 2024 Smart Presentations. All rights reserved. Powered by advanced AI technology.
            </p>
          </div>
        </div>
      </footer>
    </div>);

};

export default HomePage;