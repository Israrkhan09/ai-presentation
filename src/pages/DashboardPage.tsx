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
  Mic } from
'lucide-react';

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
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);

    try {
      // Simulate file upload and processing
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const fileUrl = URL.createObjectURL(file);
      const newPresentation = {
        title: file.name.replace('.pdf', ''),
        fileName: file.name,
        fileUrl,
        totalPages: Math.floor(Math.random() * 50) + 10 // Mock page count
      };

      addPresentation(newPresentation);

      toast({
        title: "Upload Successful",
        description: `${file.name} has been uploaded and processed`
      });
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: "Failed to upload the presentation",
        variant: "destructive"
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100" data-id="zp8pqpddg" data-path="src/pages/DashboardPage.tsx">
      {/* Header */}
      <header className="bg-white shadow-sm border-b" data-id="lam9b2in2" data-path="src/pages/DashboardPage.tsx">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" data-id="rcixuarfe" data-path="src/pages/DashboardPage.tsx">
          <div className="flex justify-between items-center h-16" data-id="106zdbgd0" data-path="src/pages/DashboardPage.tsx">
            <div className="flex items-center gap-3" data-id="yjci2o2iz" data-path="src/pages/DashboardPage.tsx">
              <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center" data-id="09sjaye8w" data-path="src/pages/DashboardPage.tsx">
                <Presentation className="h-4 w-4 text-primary-foreground" data-id="03vonv3d4" data-path="src/pages/DashboardPage.tsx" />
              </div>
              <h1 className="text-xl font-semibold" data-id="c41r93s5i" data-path="src/pages/DashboardPage.tsx">AI Presentation Assistant</h1>
            </div>
            
            <div className="flex items-center gap-3" data-id="dynoe2phs" data-path="src/pages/DashboardPage.tsx">
              <Badge variant={user?.voiceProfileId ? "default" : "secondary"} data-id="k0uitvko4" data-path="src/pages/DashboardPage.tsx">
                <Mic className="h-3 w-3 mr-1" data-id="vrs73z5js" data-path="src/pages/DashboardPage.tsx" />
                {user?.voiceProfileId ? 'Voice Enabled' : 'Voice Setup Needed'}
              </Badge>
              <Button variant="ghost" size="sm" data-id="nhrqet4vk" data-path="src/pages/DashboardPage.tsx">
                <Settings className="h-4 w-4" data-id="xiu4i7kw3" data-path="src/pages/DashboardPage.tsx" />
              </Button>
              <Button variant="ghost" size="sm" onClick={handleLogout} data-id="8px1k0jng" data-path="src/pages/DashboardPage.tsx">
                <LogOut className="h-4 w-4" data-id="5katku3nw" data-path="src/pages/DashboardPage.tsx" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" data-id="ij0kilg0d" data-path="src/pages/DashboardPage.tsx">
        {/* Welcome Section */}
        <div className="mb-8" data-id="1wc7fb7ue" data-path="src/pages/DashboardPage.tsx">
          <h2 className="text-2xl font-bold mb-2" data-id="sauebvpi0" data-path="src/pages/DashboardPage.tsx">Welcome back, {user?.name}!</h2>
          <p className="text-muted-foreground" data-id="1397j8nnh" data-path="src/pages/DashboardPage.tsx">
            Ready to deliver your next intelligent presentation?
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8" data-id="grl0mceyi" data-path="src/pages/DashboardPage.tsx">
          <Card data-id="b05jx2xja" data-path="src/pages/DashboardPage.tsx">
            <CardContent className="p-6" data-id="4kocqdgmv" data-path="src/pages/DashboardPage.tsx">
              <div className="flex items-center gap-3" data-id="exzbl3a61" data-path="src/pages/DashboardPage.tsx">
                <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center" data-id="rvkhnlt9n" data-path="src/pages/DashboardPage.tsx">
                  <FileText className="h-5 w-5 text-blue-600" data-id="1x2noyyml" data-path="src/pages/DashboardPage.tsx" />
                </div>
                <div data-id="45b0eumw6" data-path="src/pages/DashboardPage.tsx">
                  <p className="text-sm text-muted-foreground" data-id="owoffda0i" data-path="src/pages/DashboardPage.tsx">Total Presentations</p>
                  <p className="text-2xl font-bold" data-id="18uboc4fo" data-path="src/pages/DashboardPage.tsx">{presentations.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card data-id="y0z016ys4" data-path="src/pages/DashboardPage.tsx">
            <CardContent className="p-6" data-id="d9kn7oqc9" data-path="src/pages/DashboardPage.tsx">
              <div className="flex items-center gap-3" data-id="anslkxt2w" data-path="src/pages/DashboardPage.tsx">
                <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center" data-id="68wdzjugq" data-path="src/pages/DashboardPage.tsx">
                  <Play className="h-5 w-5 text-green-600" data-id="uomheq9w6" data-path="src/pages/DashboardPage.tsx" />
                </div>
                <div data-id="zl8dmfiwp" data-path="src/pages/DashboardPage.tsx">
                  <p className="text-sm text-muted-foreground" data-id="x6kip35go" data-path="src/pages/DashboardPage.tsx">Presentations Given</p>
                  <p className="text-2xl font-bold" data-id="057xg68mu" data-path="src/pages/DashboardPage.tsx">
                    {presentations.filter((p) => p.lastPresented).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card data-id="58khzzk6u" data-path="src/pages/DashboardPage.tsx">
            <CardContent className="p-6" data-id="gqv3hklu8" data-path="src/pages/DashboardPage.tsx">
              <div className="flex items-center gap-3" data-id="o20qvqu82" data-path="src/pages/DashboardPage.tsx">
                <div className="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center" data-id="2s3tafu8h" data-path="src/pages/DashboardPage.tsx">
                  <BarChart3 className="h-5 w-5 text-purple-600" data-id="85pq8ecvl" data-path="src/pages/DashboardPage.tsx" />
                </div>
                <div data-id="t1lxdktx7" data-path="src/pages/DashboardPage.tsx">
                  <p className="text-sm text-muted-foreground" data-id="290q7hq6x" data-path="src/pages/DashboardPage.tsx">Voice Commands</p>
                  <p className="text-2xl font-bold" data-id="ink4i9j81" data-path="src/pages/DashboardPage.tsx">
                    {user?.voiceProfileId ? 'Active' : 'Inactive'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card data-id="yncbjwcxn" data-path="src/pages/DashboardPage.tsx">
            <CardContent className="p-6" data-id="m6rkyrul9" data-path="src/pages/DashboardPage.tsx">
              <div className="flex items-center gap-3" data-id="jed2e6cq7" data-path="src/pages/DashboardPage.tsx">
                <div className="h-10 w-10 bg-orange-100 rounded-lg flex items-center justify-center" data-id="cszvihnv3" data-path="src/pages/DashboardPage.tsx">
                  <Clock className="h-5 w-5 text-orange-600" data-id="d4x0dzaau" data-path="src/pages/DashboardPage.tsx" />
                </div>
                <div data-id="oyoyl7o44" data-path="src/pages/DashboardPage.tsx">
                  <p className="text-sm text-muted-foreground" data-id="hhimwae2d" data-path="src/pages/DashboardPage.tsx">Total Hours</p>
                  <p className="text-2xl font-bold" data-id="7r25peokw" data-path="src/pages/DashboardPage.tsx">
                    {Math.floor(Math.random() * 50) + 10}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8" data-id="25vqalx2p" data-path="src/pages/DashboardPage.tsx">
          {/* Upload Section */}
          <Card className="lg:col-span-1" data-id="426fwho7s" data-path="src/pages/DashboardPage.tsx">
            <CardHeader data-id="ls4qw835u" data-path="src/pages/DashboardPage.tsx">
              <CardTitle data-id="5yx93enw6" data-path="src/pages/DashboardPage.tsx">Upload New Presentation</CardTitle>
              <CardDescription data-id="l5t1zh5sl" data-path="src/pages/DashboardPage.tsx">
                Upload a PDF to create an AI-enhanced presentation experience
              </CardDescription>
            </CardHeader>
            <CardContent data-id="ol4n16fwk" data-path="src/pages/DashboardPage.tsx">
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center" data-id="zrs4qpn3y" data-path="src/pages/DashboardPage.tsx">
                <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-4" data-id="14vumqm2t" data-path="src/pages/DashboardPage.tsx" />
                <p className="text-sm text-muted-foreground mb-4" data-id="4jpqvh9h7" data-path="src/pages/DashboardPage.tsx">
                  Drag and drop your PDF here, or click to browse
                </p>
                <Input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileUpload}
                  disabled={isUploading}
                  className="hidden"
                  id="file-upload" data-id="m3zxoargu" data-path="src/pages/DashboardPage.tsx" />

                <Button
                  onClick={() => document.getElementById('file-upload')?.click()}
                  disabled={isUploading} data-id="tzqiyojkq" data-path="src/pages/DashboardPage.tsx">

                  {isUploading ? 'Uploading...' : 'Select PDF File'}
                </Button>
              </div>
              
              {!user?.voiceProfileId &&
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg" data-id="bm77ikzhy" data-path="src/pages/DashboardPage.tsx">
                  <p className="text-sm text-yellow-800" data-id="oy8vmvg19" data-path="src/pages/DashboardPage.tsx">
                    <strong data-id="qvck2nnen" data-path="src/pages/DashboardPage.tsx">Tip:</strong> Set up your voice profile for hands-free control!
                  </p>
                  <Button
                  size="sm"
                  variant="outline"
                  className="mt-2"
                  onClick={() => navigate('/voice-setup')} data-id="rjhvuy5mp" data-path="src/pages/DashboardPage.tsx">

                    Setup Voice Profile
                  </Button>
                </div>
              }
            </CardContent>
          </Card>

          {/* Recent Presentations */}
          <Card className="lg:col-span-2" data-id="gjv577pcn" data-path="src/pages/DashboardPage.tsx">
            <CardHeader data-id="4qn7jz4he" data-path="src/pages/DashboardPage.tsx">
              <CardTitle data-id="5fq7e2ar1" data-path="src/pages/DashboardPage.tsx">Your Presentations</CardTitle>
              <CardDescription data-id="dutr87w60" data-path="src/pages/DashboardPage.tsx">
                Manage and present your uploaded presentations
              </CardDescription>
            </CardHeader>
            <CardContent data-id="yyn04w0m9" data-path="src/pages/DashboardPage.tsx">
              {presentations.length === 0 ?
              <div className="text-center py-8" data-id="ex0hcse3f" data-path="src/pages/DashboardPage.tsx">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" data-id="z0ut422uo" data-path="src/pages/DashboardPage.tsx" />
                  <p className="text-muted-foreground" data-id="d2tgdanvw" data-path="src/pages/DashboardPage.tsx">No presentations uploaded yet</p>
                  <p className="text-sm text-muted-foreground" data-id="w7i0564lq" data-path="src/pages/DashboardPage.tsx">
                    Upload your first PDF to get started
                  </p>
                </div> :

              <div className="space-y-4" data-id="lk8ta3278" data-path="src/pages/DashboardPage.tsx">
                  {presentations.map((presentation) =>
                <div
                  key={presentation.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors" data-id="ii9fhs0tr" data-path="src/pages/DashboardPage.tsx">

                      <div className="flex-1" data-id="pwbhivsrt" data-path="src/pages/DashboardPage.tsx">
                        <h4 className="font-medium" data-id="v7axjm1uk" data-path="src/pages/DashboardPage.tsx">{presentation.title}</h4>
                        <div className="flex items-center gap-4 mt-1" data-id="7q3lkks47" data-path="src/pages/DashboardPage.tsx">
                          <p className="text-sm text-muted-foreground" data-id="hpv73swok" data-path="src/pages/DashboardPage.tsx">
                            {presentation.totalPages} pages
                          </p>
                          <p className="text-sm text-muted-foreground" data-id="dlargff3h" data-path="src/pages/DashboardPage.tsx">
                            Uploaded {presentation.createdAt.toLocaleDateString()}
                          </p>
                          {presentation.lastPresented &&
                      <Badge variant="secondary" data-id="uyru8w1qk" data-path="src/pages/DashboardPage.tsx">Recently Presented</Badge>
                      }
                        </div>
                      </div>
                      <Button
                    onClick={() => startPresentation(presentation)}
                    size="sm" data-id="l6znpubap" data-path="src/pages/DashboardPage.tsx">

                        <Play className="h-4 w-4 mr-2" data-id="qh7a45to4" data-path="src/pages/DashboardPage.tsx" />
                        Present
                      </Button>
                    </div>
                )}
                </div>
              }
            </CardContent>
          </Card>
        </div>
      </div>
    </div>);

};

export default DashboardPage;