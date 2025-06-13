import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Upload,
  Play,
  Mic,
  FileText,
  BarChart3,
  Clock,
  Users,
  Sparkles,
  Volume2,
  ChevronRight } from
'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { motion } from 'motion/react';

interface PersonalizedDashboardProps {
  onUploadClick: () => void;
  onStartSession: () => void;
  presentations: any[];
}

const PersonalizedDashboard: React.FC<PersonalizedDashboardProps> = ({
  onUploadClick,
  onStartSession,
  presentations
}) => {
  const { user } = useUser();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getUserInitials = () => {
    if (user?.Name) {
      return user.Name.split(' ').map((n) => n[0]).join('').toUpperCase();
    }
    if (user?.Email) {
      return user.Email.substring(0, 2).toUpperCase();
    }
    return 'U';
  };

  const recentPresentations = presentations.slice(0, 3);
  const totalPresentations = presentations.length;
  const totalSlides = presentations.reduce((acc, p) => acc + (p.total_pages || 0), 0);

  const quickActions = [
  {
    title: 'Upload New Presentation',
    description: 'Add PDF files to start voice-controlled presentations',
    icon: Upload,
    action: onUploadClick,
    gradient: 'from-blue-500 to-blue-600',
    badge: 'Quick Start'
  },
  {
    title: 'Start Live Session',
    description: 'Begin voice-controlled presentation immediately',
    icon: Play,
    action: onStartSession,
    gradient: 'from-green-500 to-green-600',
    badge: 'Go Live'
  }];


  const features = [
  {
    icon: Mic,
    title: 'Voice Control',
    description: 'Navigate slides with voice commands',
    color: 'text-blue-600'
  },
  {
    icon: Sparkles,
    title: 'AI Keywords',
    description: 'Real-time keyword highlighting',
    color: 'text-purple-600'
  },
  {
    icon: FileText,
    title: 'Smart Notes',
    description: 'Auto-generated speaker notes',
    color: 'text-green-600'
  },
  {
    icon: BarChart3,
    title: 'AI Summaries',
    description: 'Generate presentation summaries',
    color: 'text-orange-600'
  }];


  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 rounded-xl p-6 text-white">

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16 border-2 border-white/20">
              <AvatarFallback className="bg-white/20 text-white text-lg font-bold">
                {getUserInitials()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold mb-1">
                {getGreeting()}, {user?.Name || user?.Email?.split('@')[0] || 'User'}!
              </h1>
              <p className="text-blue-100">
                Ready to create amazing voice-powered presentations?
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 mb-2">
              <Volume2 className="h-4 w-4" />
              <Badge variant="secondary" className="bg-white/20 text-white border-0">
                Voice Ready
              </Badge>
            </div>
            <p className="text-sm text-blue-100">
              {currentTime.toLocaleTimeString()}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}>

          <Card className="border-0 shadow-md bg-gradient-to-br from-blue-50 to-blue-100">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">Total Presentations</p>
                  <p className="text-2xl font-bold text-blue-900">{totalPresentations}</p>
                </div>
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}>

          <Card className="border-0 shadow-md bg-gradient-to-br from-green-50 to-green-100">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">Total Slides</p>
                  <p className="text-2xl font-bold text-green-900">{totalSlides}</p>
                </div>
                <BarChart3 className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}>

          <Card className="border-0 shadow-md bg-gradient-to-br from-purple-50 to-purple-100">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600">Voice Sessions</p>
                  <p className="text-2xl font-bold text-purple-900">
                    {Math.floor(totalSlides / 10) || 0}
                  </p>
                </div>
                <Mic className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}>

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-600" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {quickActions.map((action, index) =>
              <motion.div
                key={index}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}>

                  <Card
                  className={`cursor-pointer border-0 bg-gradient-to-r ${action.gradient} text-white hover:shadow-lg transition-all duration-200`}
                  onClick={action.action}>

                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <action.icon className="h-6 w-6" />
                        <Badge variant="secondary" className="bg-white/20 text-white border-0">
                          {action.badge}
                        </Badge>
                      </div>
                      <h3 className="font-semibold mb-1">{action.title}</h3>
                      <p className="text-sm opacity-90">{action.description}</p>
                      <ChevronRight className="h-4 w-4 mt-2 opacity-70" />
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Features Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}>

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Platform Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {features.map((feature, index) =>
              <div key={index} className="text-center p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                  <feature.icon className={`h-8 w-8 mx-auto mb-2 ${feature.color}`} />
                  <h4 className="font-semibold text-sm mb-1">{feature.title}</h4>
                  <p className="text-xs text-gray-600">{feature.description}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Recent Presentations */}
      {recentPresentations.length > 0 &&
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}>

          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-600" />
                Recent Presentations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentPresentations.map((presentation, index) =>
              <div key={presentation.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <FileText className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-sm">{presentation.title}</h4>
                        <p className="text-xs text-gray-600">
                          {presentation.total_pages} slides • {presentation.filename}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {presentation.is_active ? 'Active' : 'Draft'}
                    </Badge>
                  </div>
              )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      }
    </div>);

};

export default PersonalizedDashboard;