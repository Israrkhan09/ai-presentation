import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Upload, 
  FileText, 
  Mic, 
  Brain, 
  TrendingUp, 
  Settings,
  Play,
  Users,
  Clock,
  Star
} from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { useToast } from '@/hooks/use-toast';
import FileUploader from '@/components/FileUploader';
import PresentationList from '@/components/PresentationList';
import PersonalizedDashboard from '@/components/PersonalizedDashboard';
import VoiceControlledPresentation from '@/components/VoiceControlledPresentation';

const PresentationDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [presentations, setPresentations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPresentation, setSelectedPresentation] = useState<any>(null);
  const [showPresenter, setShowPresenter] = useState(false);
  const [stats, setStats] = useState({
    totalPresentations: 0,
    totalSessions: 0,
    voiceCommandsUsed: 0,
    avgSessionTime: 0
  });

  const { user } = useUser();
  const { toast } = useToast();

  // Load presentations on component mount
  useEffect(() => {
    loadPresentations();
  }, []);

  const loadPresentations = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await window.ezsite.apis.tablePage('presentations', {
        PageNo: 1,
        PageSize: 50,
        OrderByField: 'id',
        IsAsc: false,
        Filters: [
          {
            name: 'user_id',
            op: 'Equal',
            value: user.ID
          },
          {
            name: 'is_active',
            op: 'Equal',
            value: true
          }
        ]
      });

      if (error) {
        console.error('Error loading presentations:', error);
        toast({
          title: "Loading Error",
          description: "Failed to load presentations. Please try again.",
          variant: "destructive"
        });
        return;
      }

      setPresentations(data?.List || []);
      setStats(prevStats => ({
        ...prevStats,
        totalPresentations: data?.VirtualCount || 0
      }));

    } catch (error) {
      console.error('Error loading presentations:', error);
      toast({
        title: "Loading Error",
        description: "Failed to load presentations. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (file: File, metadata: any) => {
    if (!user) return;

    try {
      // Upload file first
      const { data: fileId, error: uploadError } = await window.ezsite.apis.upload({
        filename: file.name,
        file: file
      });

      if (uploadError) {
        throw new Error(uploadError);
      }

      // Create presentation record
      const { error: createError } = await window.ezsite.apis.tableCreate('presentations', {
        user_id: user.ID,
        title: metadata.title || file.name.replace(/\.[^/.]+$/, ""),
        filename: file.name,
        file_id: fileId,
        total_pages: metadata.totalPages || 10, // Default or calculated
        description: metadata.description || '',
        tags: metadata.tags || '',
        is_active: true
      });

      if (createError) {
        throw new Error(createError);
      }

      toast({
        title: "Upload Successful",
        description: "Your presentation has been uploaded and is ready for voice control."
      });

      // Reload presentations
      loadPresentations();

    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload presentation. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handlePresentationSelect = (presentation: any) => {
    setSelectedPresentation(presentation);
    setShowPresenter(true);
  };

  const handlePresentationDelete = async (presentationId: number) => {
    try {
      const { error } = await window.ezsite.apis.tableUpdate('presentations', {
        ID: presentationId,
        is_active: false
      });

      if (error) {
        throw new Error(error);
      }

      toast({
        title: "Presentation Deleted",
        description: "The presentation has been removed from your library."
      });

      loadPresentations();
    } catch (error: any) {
      console.error('Delete error:', error);
      toast({
        title: "Delete Failed",
        description: error.message || "Failed to delete presentation.",
        variant: "destructive"
      });
    }
  };

  const closePresenter = () => {
    setShowPresenter(false);
    setSelectedPresentation(null);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Alert>
          <AlertDescription>
            Please log in to access the presentation dashboard.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (showPresenter && selectedPresentation) {
    return (
      <VoiceControlledPresentation
        presentation={selectedPresentation}
        onClose={closePresenter}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              AI Presentation Hub
            </h1>
            <p className="text-gray-600">
              Welcome back, {user.Name}! Ready to create amazing presentations?
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-white">
              <Brain className="h-3 w-3 mr-1" />
              AI Powered
            </Badge>
            <Badge variant="outline" className="bg-white">
              <Mic className="h-3 w-3 mr-1" />
              Voice Enabled
            </Badge>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Presentations</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalPresentations}</div>
              <p className="text-xs text-muted-foreground">
                +2 from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Voice Sessions</CardTitle>
              <Mic className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalSessions}</div>
              <p className="text-xs text-muted-foreground">
                Voice-controlled presentations
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">AI Processing</CardTitle>
              <Brain className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">95%</div>
              <p className="text-xs text-muted-foreground">
                Accuracy rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Performance</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.avgSessionTime > 0 ? `${Math.round(stats.avgSessionTime)}m` : '0m'}
              </div>
              <p className="text-xs text-muted-foreground">
                Avg session time
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="upload">Upload</TabsTrigger>
            <TabsTrigger value="presentations">My Presentations</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-4">
            <PersonalizedDashboard 
              user={user}
              presentations={presentations}
              onPresentationSelect={handlePresentationSelect}
            />
          </TabsContent>

          <TabsContent value="upload" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Upload New Presentation
                </CardTitle>
                <CardDescription>
                  Upload your PDF presentation to enable AI-powered voice control and content generation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FileUploader onUpload={handleFileUpload} />
              </CardContent>
            </Card>

            {/* Upload Tips */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Upload Tips</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="flex items-start gap-2">
                    <FileText className="h-4 w-4 text-blue-500 mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">PDF Format</p>
                      <p className="text-xs text-muted-foreground">Upload presentations in PDF format for best results</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Brain className="h-4 w-4 text-green-500 mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">AI Processing</p>
                      <p className="text-xs text-muted-foreground">Content will be analyzed for quiz generation</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Mic className="h-4 w-4 text-purple-500 mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">Voice Control</p>
                      <p className="text-xs text-muted-foreground">Navigate slides using voice commands</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Star className="h-4 w-4 text-yellow-500 mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">Best Quality</p>
                      <p className="text-xs text-muted-foreground">High-resolution files work better</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="presentations" className="space-y-4">
            <PresentationList
              presentations={presentations}
              isLoading={isLoading}
              onPresentationSelect={handlePresentationSelect}
              onPresentationDelete={handlePresentationDelete}
              onRefresh={loadPresentations}
            />
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Voice & AI Settings
                </CardTitle>
                <CardDescription>
                  Configure your voice recognition and AI preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <Brain className="h-4 w-4" />
                  <AlertDescription>
                    Voice settings and AI model preferences will be available in the next update.
                    Current settings are optimized for best performance.
                  </AlertDescription>
                </Alert>

                <div className="space-y-3">
                  <h4 className="font-medium">Current Configuration:</h4>
                  <div className="grid gap-2 text-sm">
                    <div className="flex justify-between">
                      <span>Voice Recognition:</span>
                      <Badge variant="outline">Enabled</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>AI Processing:</span>
                      <Badge variant="outline">Active</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Content Analysis:</span>
                      <Badge variant="outline">Advanced</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Quiz Generation:</span>
                      <Badge variant="outline">Enabled</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default PresentationDashboard;