import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  Brain,
  FileText,
  Mic,
  BarChart3,
  Download,
  Upload,
  Play,
  Settings,
  ArrowLeft,
  CheckCircle } from
'lucide-react';
import { useToast } from '@/hooks/use-toast';
import SmartPresentationViewer from '@/components/SmartPresentationViewer';
import RealTimeTranscriber from '@/components/RealTimeTranscriber';
import EnhancedQuizGenerator from '@/components/EnhancedQuizGenerator';
import PDFSummaryGenerator from '@/components/PDFSummaryGenerator';
import FileUploader from '@/components/FileUploader';

interface TranscriptionData {
  id: string;
  text: string;
  timestamp: Date;
  confidence: number;
  keywords: string[];
  emotion: string;
  speakingPace: number;
  slideNumber: number;
}

const SmartPresentationPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState('presentation');
  const [presentationId, setPresentationId] = useState<number | null>(null);
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(1);
  const [sessionDuration, setSessionDuration] = useState(0);
  const [transcriptionData, setTranscriptionData] = useState<TranscriptionData[]>([]);
  const [allKeywords, setAllKeywords] = useState<string[]>([]);
  const [presentations, setPresentations] = useState<any[]>([]);

  // Load available presentations
  useEffect(() => {
    loadPresentations();
  }, []);

  const loadPresentations = async () => {
    try {
      const { data, error } = await window.ezsite.apis.tablePage('16750', {
        PageNo: 1,
        PageSize: 10,
        Filters: [
        { name: 'is_active', op: 'Equal', value: true }],

        OrderByField: 'ID',
        IsAsc: false
      });

      if (error) throw error;

      if (data?.List) {
        setPresentations(data.List.map((p: any) => ({
          ...p,
          id: p.ID,
          keywords: JSON.parse(p.keywords || '[]')
        })));
      }
    } catch (error) {
      console.error('Error loading presentations:', error);
    }
  };

  const handleFileUpload = async (file: File, title: string, description: string) => {
    try {
      // Upload file
      const { data: fileId, error: uploadError } = await window.ezsite.apis.upload({
        filename: file.name,
        file: file
      });

      if (uploadError) throw uploadError;

      // Create presentation record
      const { data: presentationData, error: createError } = await window.ezsite.apis.tableCreate('16750', {
        user_id: 1, // Get from auth context
        title: title,
        description: description,
        file_id: fileId,
        slide_count: 10, // Default, would be extracted from file
        keywords: JSON.stringify([]),
        ai_summary: '',
        is_active: true
      });

      if (createError) throw createError;

      setPresentationId(presentationData);
      await loadPresentations();

      toast({
        title: "Presentation Uploaded",
        description: "Ready to start smart presentation session."
      });

      setActiveTab('presentation');
    } catch (error) {
      console.error('Error uploading presentation:', error);
      toast({
        title: "Upload Failed",
        description: "Failed to upload presentation file.",
        variant: "destructive"
      });
    }
  };

  const handleSessionStart = (newSessionId: number) => {
    setSessionId(newSessionId);
    setIsSessionActive(true);
    setSessionDuration(0);
    setTranscriptionData([]);
    setAllKeywords([]);

    toast({
      title: "Smart Session Started",
      description: "All AI features are now active."
    });
  };

  const handleSessionEnd = (sessionData: any) => {
    setIsSessionActive(false);

    toast({
      title: "Session Completed",
      description: "Summary and quiz materials have been generated."
    });

    // Switch to analytics tab
    setActiveTab('analytics');
  };

  const handleTranscription = (data: TranscriptionData) => {
    setTranscriptionData((prev) => [...prev, data]);

    // Update current slide if needed
    if (data.slideNumber !== currentSlide) {
      setCurrentSlide(data.slideNumber);
    }
  };

  const handleKeywordsDetected = (keywords: string[]) => {
    setAllKeywords((prev) => {
      const newKeywords = keywords.filter((kw) => !prev.includes(kw));
      return [...prev, ...newKeywords];
    });
  };

  const handleVoiceCommand = (command: string) => {
    console.log('Voice command received:', command);

    switch (command) {
      case 'next':
        setCurrentSlide((prev) => prev + 1);
        break;
      case 'previous':
        setCurrentSlide((prev) => Math.max(1, prev - 1));
        break;
      case 'generate_quiz':
        setActiveTab('quiz');
        break;
      case 'create_summary':
        setActiveTab('summary');
        break;
      default:
        console.log('Unknown voice command:', command);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <Card className="bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  onClick={() => navigate('/dashboard')}
                  variant="outline"
                  size="sm">

                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
                <div>
                  <CardTitle className="flex items-center gap-2 text-2xl">
                    <Brain className="h-6 w-6 text-blue-600" />
                    Smart Presentation System
                  </CardTitle>
                  <p className="text-gray-600 mt-1">
                    AI-powered presentation with real-time analysis and automated content generation
                  </p>
                </div>
              </div>
              
              {isSessionActive &&
              <div className="flex items-center gap-4">
                  <Badge variant="outline" className="bg-green-50 text-green-700">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Session Active
                  </Badge>
                  <div className="text-right">
                    <div className="text-sm text-gray-600">Session Duration</div>
                    <div className="font-mono text-lg">
                      {Math.floor(sessionDuration / 60)}:{(sessionDuration % 60).toString().padStart(2, '0')}
                    </div>
                  </div>
                </div>
              }
            </div>
          </CardHeader>
        </Card>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <Card className="bg-white/80 backdrop-blur-sm">
            <CardContent className="pt-6">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="upload" className="flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  Upload
                </TabsTrigger>
                <TabsTrigger value="presentation" className="flex items-center gap-2">
                  <Play className="h-4 w-4" />
                  Present
                </TabsTrigger>
                <TabsTrigger value="transcription" className="flex items-center gap-2">
                  <Mic className="h-4 w-4" />
                  Transcription
                </TabsTrigger>
                <TabsTrigger value="quiz" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Quiz
                </TabsTrigger>
                <TabsTrigger value="summary" className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Summary
                </TabsTrigger>
              </TabsList>
            </CardContent>
          </Card>

          {/* Upload Tab */}
          <TabsContent value="upload" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Upload New Presentation</CardTitle>
                </CardHeader>
                <CardContent>
                  <FileUploader
                    acceptedTypes={['.pdf', '.pptx', '.ppt']}
                    maxSize={50}
                    onUpload={handleFileUpload} />

                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Available Presentations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {presentations.length === 0 ?
                    <p className="text-gray-500 text-center py-8">
                        No presentations uploaded yet. Upload your first presentation to get started.
                      </p> :

                    presentations.map((presentation) =>
                    <div key={presentation.id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-medium">{presentation.title}</h3>
                              <p className="text-sm text-gray-600">{presentation.description}</p>
                              <div className="flex items-center gap-2 mt-2">
                                <Badge variant="outline">
                                  {presentation.slide_count} slides
                                </Badge>
                                {presentation.keywords.length > 0 &&
                            <Badge variant="secondary">
                                    {presentation.keywords.length} keywords
                                  </Badge>
                            }
                              </div>
                            </div>
                            <Button
                          onClick={() => {
                            setPresentationId(presentation.id);
                            setActiveTab('presentation');
                          }}
                          size="sm">

                              Select
                            </Button>
                          </div>
                        </div>
                    )
                    }
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Presentation Tab */}
          <TabsContent value="presentation" className="space-y-6">
            {presentationId ?
            <SmartPresentationViewer
              presentationId={presentationId}
              onSessionEnd={handleSessionEnd} /> :


            <Card className="bg-white/80 backdrop-blur-sm">
                <CardContent className="text-center py-12">
                  <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500">
                    Please upload and select a presentation to begin.
                  </p>
                  <Button
                  onClick={() => setActiveTab('upload')}
                  className="mt-4">

                    Upload Presentation
                  </Button>
                </CardContent>
              </Card>
            }
          </TabsContent>

          {/* Transcription Tab */}
          <TabsContent value="transcription" className="space-y-6">
            <RealTimeTranscriber
              sessionId={sessionId}
              currentSlide={currentSlide}
              onTranscription={handleTranscription}
              onKeywordsDetected={handleKeywordsDetected}
              onVoiceCommand={handleVoiceCommand}
              isActive={isSessionActive} />

          </TabsContent>

          {/* Quiz Tab */}
          <TabsContent value="quiz" className="space-y-6">
            <EnhancedQuizGenerator
              sessionId={sessionId}
              transcriptionData={transcriptionData}
              keywords={allKeywords}
              onQuizGenerated={(quiz) => {
                toast({
                  title: "Quiz Generated",
                  description: `${quiz.quiz_type} quiz with ${quiz.total_questions} questions created.`
                });
              }} />

          </TabsContent>

          {/* Summary Tab */}
          <TabsContent value="summary" className="space-y-6">
            <PDFSummaryGenerator
              sessionId={sessionId}
              transcriptionData={transcriptionData}
              keywords={allKeywords}
              sessionDuration={sessionDuration}
              currentSlide={currentSlide}
              onSummaryGenerated={(summary) => {
                toast({
                  title: "Summary Generated",
                  description: "Comprehensive presentation summary is ready."
                });
              }} />

          </TabsContent>
        </Tabs>

        {/* Session Statistics */}
        {isSessionActive &&
        <Card className="bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Live Session Statistics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">{currentSlide}</div>
                  <p className="text-sm text-gray-600">Current Slide</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{transcriptionData.length}</div>
                  <p className="text-sm text-gray-600">Speech Segments</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{allKeywords.length}</div>
                  <p className="text-sm text-gray-600">Keywords Detected</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    {transcriptionData.reduce((sum, t) => sum + t.text.split(/\s+/).length, 0)}
                  </div>
                  <p className="text-sm text-gray-600">Words Spoken</p>
                </div>
              </div>
              
              {allKeywords.length > 0 &&
            <div className="mt-4">
                  <p className="text-sm font-medium mb-2">Recent Keywords:</p>
                  <div className="flex flex-wrap gap-2">
                    {allKeywords.slice(-10).map((keyword, index) =>
                <Badge key={index} variant="secondary">
                        {keyword}
                      </Badge>
                )}
                  </div>
                </div>
            }
            </CardContent>
          </Card>
        }
      </div>
    </div>);

};

export default SmartPresentationPage;