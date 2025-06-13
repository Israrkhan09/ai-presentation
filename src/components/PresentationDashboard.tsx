import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Presentation, 
  Upload, 
  Mic, 
  FileText, 
  Play, 
  Download,
  Settings,
  BarChart3,
  Users,
  Clock,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { useToast } from '@/hooks/use-toast';
import FileUploader from '@/components/FileUploader';
import PresentationList from '@/components/PresentationList';
import VoiceControlledViewer from '@/components/VoiceControlledViewer';

interface PresentationData {
  ID: number;
  title: string;
  filename: string;
  file_id: number;
  total_pages: number;
  description: string;
  tags: string;
  is_active: boolean;
  CreateTime: string;
}

const PresentationDashboard: React.FC = () => {
  const { user } = useUser();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('upload');
  const [selectedPresentation, setSelectedPresentation] = useState<PresentationData | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isViewing, setIsViewing] = useState(false);

  // Check if speech recognition is supported
  const isSpeechSupported = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;

  const handleUploadComplete = (presentation: PresentationData) => {
    console.log('Upload completed:', presentation);
    setRefreshTrigger(prev => prev + 1);
    setActiveTab('presentations');
    toast({
      title: "Success!",
      description: "Your presentation is ready for voice control.",
    });
  };

  const handleSelectPresentation = (presentation: PresentationData) => {
    console.log('Selected presentation:', presentation);
    setSelectedPresentation(presentation);
  };

  const handleStartPresentation = (presentation: PresentationData) => {
    if (!isSpeechSupported) {
      toast({
        title: "Voice Control Not Available",
        description: "Your browser doesn't support voice recognition. You can still view the presentation manually.",
        variant: "destructive"
      });
    }
    
    setSelectedPresentation(presentation);
    setIsViewing(true);
  };

  const handleCloseViewer = () => {
    setIsViewing(false);
    setSelectedPresentation(null);
  };

  const handleExportPresentation = async (presentation: PresentationData) => {
    try {
      // Create export data
      const exportData = {
        title: presentation.title,
        filename: presentation.filename,
        description: presentation.description,
        tags: presentation.tags,
        exportDate: new Date().toISOString(),
        totalPages: presentation.total_pages
      };

      // Create and download JSON file
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
        type: 'application/json' 
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${presentation.title}_export.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Export Successful",
        description: "Presentation metadata exported successfully.",
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export Failed",
        description: "Failed to export presentation.",
        variant: "destructive"
      });
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please log in to access the presentation dashboard.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Show viewer when a presentation is being viewed
  if (isViewing && selectedPresentation) {
    return (
      <div className="h-screen bg-gray-50 p-4">
        <VoiceControlledViewer 
          presentation={selectedPresentation}
          onClose={handleCloseViewer}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          AI Presentation Studio
        </h1>
        <p className="text-gray-600">
          Upload, manage, and present with voice control
        </p>
        
        {/* Voice Support Alert */}
        {!isSpeechSupported && (
          <Alert className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Voice recognition is not supported in your browser. 
              Consider using Chrome, Edge, or Safari for the best experience.
            </AlertDescription>
          </Alert>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Presentations</p>
                <p className="text-2xl font-bold text-gray-900">0</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Mic className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Voice Control</p>
                <p className="text-2xl font-bold text-gray-900">
                  {isSpeechSupported ? 'Ready' : 'N/A'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Last Activity</p>
                <p className="text-2xl font-bold text-gray-900">Today</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <BarChart3 className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Success Rate</p>
                <p className="text-2xl font-bold text-gray-900">100%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="upload" className="flex items-center">
            <Upload className="w-4 h-4 mr-2" />
            Upload
          </TabsTrigger>
          <TabsTrigger value="presentations" className="flex items-center">
            <FileText className="w-4 h-4 mr-2" />
            Presentations
          </TabsTrigger>
          <TabsTrigger value="voice" className="flex items-center">
            <Mic className="w-4 h-4 mr-2" />
            Voice Control
          </TabsTrigger>
          <TabsTrigger value="export" className="flex items-center">
            <Download className="w-4 h-4 mr-2" />
            Export
          </TabsTrigger>
        </TabsList>

        {/* Upload Tab */}
        <TabsContent value="upload" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">Upload New Presentation</h2>
              <FileUploader 
                onUploadComplete={handleUploadComplete}
                userId={user.ID}
              />
            </div>
            
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Upload Instructions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                    <div>
                      <p className="font-medium">Drag & Drop PDF</p>
                      <p className="text-sm text-gray-600">Simply drag your PDF file into the upload area</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                    <div>
                      <p className="font-medium">Add Details</p>
                      <p className="text-sm text-gray-600">Provide title, description, and tags</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                    <div>
                      <p className="font-medium">Voice Ready</p>
                      <p className="text-sm text-gray-600">Start presenting with voice commands</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Supported Features</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    <Badge variant="secondary" className="justify-center">
                      <Mic className="w-3 h-3 mr-1" />
                      Voice Control
                    </Badge>
                    <Badge variant="secondary" className="justify-center">
                      <Play className="w-3 h-3 mr-1" />
                      Auto-Advance
                    </Badge>
                    <Badge variant="secondary" className="justify-center">
                      <FileText className="w-3 h-3 mr-1" />
                      Speaker Notes
                    </Badge>
                    <Badge variant="secondary" className="justify-center">
                      <Download className="w-3 h-3 mr-1" />
                      Export Data
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Presentations Tab */}
        <TabsContent value="presentations" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <PresentationList 
                userId={user.ID}
                onSelectPresentation={handleSelectPresentation}
                refreshTrigger={refreshTrigger}
              />
            </div>
            
            <div className="space-y-4">
              {selectedPresentation ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Selected Presentation</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h3 className="font-semibold">{selectedPresentation.title}</h3>
                      <p className="text-sm text-gray-600">{selectedPresentation.filename}</p>
                    </div>
                    
                    {selectedPresentation.description && (
                      <div>
                        <p className="text-sm font-medium">Description:</p>
                        <p className="text-sm text-gray-600">{selectedPresentation.description}</p>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Button 
                        onClick={() => handleStartPresentation(selectedPresentation)}
                        className="w-full"
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Start Presentation
                      </Button>
                      
                      <Button 
                        onClick={() => handleExportPresentation(selectedPresentation)}
                        variant="outline" 
                        className="w-full"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Export Data
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="p-6 text-center">
                    <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">
                      Select a presentation to view details
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Voice Control Tab */}
        <TabsContent value="voice" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Voice Commands Guide</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium">Navigation Commands</h4>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <Badge variant="outline">"Next slide"</Badge>
                      <Badge variant="outline">"Previous slide"</Badge>
                      <Badge variant="outline">"First slide"</Badge>
                      <Badge variant="outline">"Last slide"</Badge>
                      <Badge variant="outline">"Slide 5"</Badge>
                      <Badge variant="outline">"Go to slide 3"</Badge>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium">Presentation Control</h4>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <Badge variant="outline">"Start presentation"</Badge>
                      <Badge variant="outline">"Stop presentation"</Badge>
                      <Badge variant="outline">"Pause"</Badge>
                      <Badge variant="outline">"Resume"</Badge>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium">Visual Commands</h4>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <Badge variant="outline">"Highlight point"</Badge>
                      <Badge variant="outline">"Zoom in"</Badge>
                      <Badge variant="outline">"Zoom out"</Badge>
                      <Badge variant="outline">"Fullscreen"</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Voice Control Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Browser Support</span>
                  <Badge variant={isSpeechSupported ? "default" : "destructive"}>
                    {isSpeechSupported ? "Supported" : "Not Supported"}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span>Microphone Access</span>
                  <Badge variant="secondary">Ready</Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span>Language Support</span>
                  <Badge variant="default">English (US)</Badge>
                </div>

                {!isSpeechSupported && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      For voice control, please use Chrome, Edge, or Safari browser.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Export Tab */}
        <TabsContent value="export" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Export Options</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Presentation Metadata</h4>
                    <p className="text-sm text-gray-600 mb-3">
                      Export presentation details, settings, and statistics as JSON
                    </p>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      disabled={!selectedPresentation}
                      onClick={() => selectedPresentation && handleExportPresentation(selectedPresentation)}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Export JSON
                    </Button>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Voice Commands Log</h4>
                    <p className="text-sm text-gray-600 mb-3">
                      Export voice command history and usage statistics
                    </p>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      disabled
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Export Log (Coming Soon)
                    </Button>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Presentation Report</h4>
                    <p className="text-sm text-gray-600 mb-3">
                      Generate a comprehensive presentation report
                    </p>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      disabled
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Generate Report (Coming Soon)
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Export Instructions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Select Presentation</p>
                    <p className="text-sm text-gray-600">Choose a presentation from the presentations tab</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Choose Export Type</p>
                    <p className="text-sm text-gray-600">Select the type of data you want to export</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Download File</p>
                    <p className="text-sm text-gray-600">The file will be downloaded to your device</p>
                  </div>
                </div>

                {!selectedPresentation && (
                  <Alert className="mt-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Please select a presentation first to enable export options.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PresentationDashboard;