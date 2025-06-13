import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Upload, 
  Presentation, 
  LogOut, 
  Settings, 
  FileText,
  Mic,
  User,
  Home,
  Play
} from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { useToast } from '@/hooks/use-toast';
import FileUploader from '@/components/FileUploader';
import PresentationList from '@/components/PresentationList';
import PersonalizedDashboard from '@/components/PersonalizedDashboard';
import EnhancedVoiceViewer from '@/components/EnhancedVoiceViewer';

interface Presentation {
  id: number;
  user_id: number;
  title: string;
  filename: string;
  file_id: number;
  total_pages: number;
  description: string;
  tags: string;
  is_active: boolean;
}

const PresentationDashboard: React.FC = () => {
  const [presentations, setPresentations] = useState<Presentation[]>([]);
  const [selectedPresentation, setSelectedPresentation] = useState<Presentation | null>(null);
  const [currentView, setCurrentView] = useState<'dashboard' | 'upload' | 'presentations' | 'viewer'>('dashboard');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const { user, logout } = useUser();
  const { toast } = useToast();

  useEffect(() => {
    loadPresentations();
  }, []);

  const loadPresentations = async () => {
    if (!user?.ID) return;
    
    setIsLoading(true);
    try {
      const response = await window.ezsite.apis.tablePage('16721', {
        PageNo: 1,
        PageSize: 50,
        OrderByField: 'id',
        IsAsc: false,
        Filters: [
          {
            name: 'user_id',
            op: 'Equal',
            value: user.ID
          }
        ]
      });

      if (response.error) {
        throw new Error(response.error);
      }

      setPresentations(response.data?.List || []);
    } catch (error) {
      console.error('Error loading presentations:', error);
      setError(error instanceof Error ? error.message : 'Failed to load presentations');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUploaded = async (fileData: any) => {
    if (!user?.ID) return;

    try {
      const response = await window.ezsite.apis.tableCreate('16721', {
        user_id: user.ID,
        title: fileData.title || fileData.filename,
        filename: fileData.filename,
        file_id: fileData.fileId,
        total_pages: fileData.totalPages || 0,
        description: fileData.description || '',
        tags: fileData.tags || '',
        is_active: true
      });

      if (response.error) {
        throw new Error(response.error);
      }

      toast({
        title: "Presentation Uploaded!",
        description: `${fileData.filename} has been successfully uploaded and processed.`,
      });

      loadPresentations();
      setCurrentView('presentations');
    } catch (error) {
      console.error('Error saving presentation:', error);
      toast({
        title: "Upload Error",
        description: error instanceof Error ? error.message : 'Failed to save presentation',
        variant: "destructive"
      });
    }
  };

  const handlePresentationSelect = (presentation: Presentation) => {
    setSelectedPresentation(presentation);
    setCurrentView('viewer');
  };

  const handleLogout = async () => {
    try {
      await window.ezsite.apis.logout();
      logout();
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      });
    } catch (error) {
      console.error('Logout error:', error);
      logout(); // Force logout even if API call fails
    }
  };

  const navigation = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'upload', label: 'Upload', icon: Upload },
    { id: 'presentations', label: 'My Presentations', icon: FileText }
  ];

  const renderNavigation = () => (
    <div className="bg-white border-b shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo & Navigation */}
          <div className="flex items-center space-x-8">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mr-3">
                <Presentation className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                AI Presenter
              </span>
            </div>
            
            <nav className="hidden md:flex space-x-4">
              {navigation.map(item => (
                <button
                  key={item.id}
                  onClick={() => setCurrentView(item.id as any)}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    currentView === item.id
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <item.icon className="h-4 w-4 mr-2" />
                  {item.label}
                </button>
              ))}
            </nav>
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-blue-600" />
              </div>
              <span className="text-sm font-medium text-gray-700">
                {user?.Name || user?.Email?.split('@')[0] || 'User'}
              </span>
            </div>
            
            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    if (currentView === 'viewer' && selectedPresentation) {
      return (
        <EnhancedVoiceViewer
          presentation={selectedPresentation}
          onEndSession={() => setCurrentView('presentations')}
        />
      );
    }

    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        {currentView === 'dashboard' && (
          <PersonalizedDashboard
            onUploadClick={() => setCurrentView('upload')}
            onStartSession={() => setCurrentView('presentations')}
            presentations={presentations}
          />
        )}

        {currentView === 'upload' && (
          <div className="space-y-6">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Upload Presentation</h1>
              <p className="text-gray-600">
                Upload your PDF presentation to start creating voice-controlled sessions
              </p>
            </div>
            <FileUploader onFileUploaded={handleFileUploaded} />
          </div>
        )}

        {currentView === 'presentations' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">My Presentations</h1>
                <p className="text-gray-600 mt-2">
                  Manage and start voice-controlled presentation sessions
                </p>
              </div>
              <Button
                onClick={() => setCurrentView('upload')}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload New
              </Button>
            </div>
            
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-600 mt-2">Loading presentations...</p>
              </div>
            ) : (
              <PresentationList
                presentations={presentations}
                onPresentationSelect={handlePresentationSelect}
                onRefresh={loadPresentations}
              />
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {renderNavigation()}
      {renderContent()}
    </div>
  );
};

export default PresentationDashboard;