import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/store/authStore';
import { usePresentationStore } from '@/store/presentationStore';
import { toast } from '@/hooks/use-toast';
import { 
  Upload, 
  Presentation, 
  User, 
  Settings, 
  LogOut, 
  Play, 
  FileText,
  Clock,
  BarChart3,
  Mic
} from 'lucide-react';

const DashboardPage = () => {
  const [isUploading, setIsUploading] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { presentations, addPresentation } = usePresentationStore();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || file.type !== 'application/pdf') {
      toast({
        title: "Invalid File Type",
        description: "Please upload a PDF file",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    
    try {
      // Simulate file upload and processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const fileUrl = URL.createObjectURL(file);
      const newPresentation = {
        title: file.name.replace('.pdf', ''),
        fileName: file.name,
        fileUrl,
        totalPages: Math.floor(Math.random() * 50) + 10, // Mock page count
      };
      
      addPresentation(newPresentation);
      
      toast({
        title: "Upload Successful",
        description: `${file.name} has been uploaded and processed`,
      });
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: "Failed to upload the presentation",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const startPresentation = (presentation: any) => {
    navigate(`/present/${presentation.id}`);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
                <Presentation className="h-4 w-4 text-primary-foreground" />
              </div>
              <h1 className="text-xl font-semibold">AI Presentation Assistant</h1>
            </div>
            
            <div className="flex items-center gap-3">
              <Badge variant={user?.voiceProfileId ? "default" : "secondary"}>
                <Mic className="h-3 w-3 mr-1" />
                {user?.voiceProfileId ? 'Voice Enabled' : 'Voice Setup Needed'}
              </Badge>
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-2">Welcome back, {user?.name}!</h2>
          <p className="text-muted-foreground">
            Ready to deliver your next intelligent presentation?
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Presentations</p>
                  <p className="text-2xl font-bold">{presentations.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Play className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Presentations Given</p>
                  <p className="text-2xl font-bold">
                    {presentations.filter(p => p.lastPresented).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <BarChart3 className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Voice Commands</p>
                  <p className="text-2xl font-bold">
                    {user?.voiceProfileId ? 'Active' : 'Inactive'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Clock className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Hours</p>
                  <p className="text-2xl font-bold">
                    {Math.floor(Math.random() * 50) + 10}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Upload Section */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Upload New Presentation</CardTitle>
              <CardDescription>
                Upload a PDF to create an AI-enhanced presentation experience
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-4" />
                <p className="text-sm text-muted-foreground mb-4">
                  Drag and drop your PDF here, or click to browse
                </p>
                <Input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileUpload}
                  disabled={isUploading}
                  className="hidden"
                  id="file-upload"
                />
                <Button
                  onClick={() => document.getElementById('file-upload')?.click()}
                  disabled={isUploading}
                >
                  {isUploading ? 'Uploading...' : 'Select PDF File'}
                </Button>
              </div>
              
              {!user?.voiceProfileId && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <strong>Tip:</strong> Set up your voice profile for hands-free control!
                  </p>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="mt-2"
                    onClick={() => navigate('/voice-setup')}
                  >
                    Setup Voice Profile
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Presentations */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Your Presentations</CardTitle>
              <CardDescription>
                Manage and present your uploaded presentations
              </CardDescription>
            </CardHeader>
            <CardContent>
              {presentations.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No presentations uploaded yet</p>
                  <p className="text-sm text-muted-foreground">
                    Upload your first PDF to get started
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {presentations.map((presentation) => (
                    <div
                      key={presentation.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1">
                        <h4 className="font-medium">{presentation.title}</h4>
                        <div className="flex items-center gap-4 mt-1">
                          <p className="text-sm text-muted-foreground">
                            {presentation.totalPages} pages
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Uploaded {presentation.createdAt.toLocaleDateString()}
                          </p>
                          {presentation.lastPresented && (
                            <Badge variant="secondary">Recently Presented</Badge>
                          )}
                        </div>
                      </div>
                      <Button 
                        onClick={() => startPresentation(presentation)}
                        size="sm"
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Present
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;