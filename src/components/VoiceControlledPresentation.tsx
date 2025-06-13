import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  Square,
  Mic,
  Volume2,
  FileText,
  Users,
  Timer
} from 'lucide-react';
import SessionManager from './SessionManager';
import AIContentProcessor from './AIContentProcessor';
import DownloadManager from './DownloadManager';
import { useToast } from '@/hooks/use-toast';

interface Presentation {
  id: number;
  title: string;
  filename: string;
  total_pages: number;
  description: string;
}

interface VoiceControlledPresentationProps {
  presentation: Presentation;
  onClose: () => void;
}

const VoiceControlledPresentation: React.FC<VoiceControlledPresentationProps> = ({
  presentation,
  onClose
}) => {
  const [currentSlide, setCurrentSlide] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [sessionActive, setSessionActive] = useState(false);
  const [sessionData, setSessionData] = useState<any>(null);
  const [processedContent, setProcessedContent] = useState<any>(null);
  const [showDownloads, setShowDownloads] = useState(false);
  const [presentationMode, setPresentationMode] = useState<'setup' | 'presenting' | 'processing' | 'complete'>('setup');

  const { toast } = useToast();

  // Handle voice commands from SessionManager
  const handleVoiceCommand = (command: string) => {
    switch (command) {
      case 'NEXT_SLIDE':
        nextSlide();
        break;
      case 'PREV_SLIDE':
        previousSlide();
        break;
      case 'FIRST_SLIDE':
        setCurrentSlide(1);
        break;
      case 'LAST_SLIDE':
        setCurrentSlide(presentation.total_pages);
        break;
      case 'PAUSE':
        setIsPlaying(false);
        break;
      case 'RESUME':
        setIsPlaying(true);
        break;
      case 'END_SESSION':
        endPresentation();
        break;
      default:
        console.log('Unknown command:', command);
    }
  };

  // Navigation functions
  const nextSlide = () => {
    if (currentSlide < presentation.total_pages) {
      setCurrentSlide(prev => prev + 1);
    }
  };

  const previousSlide = () => {
    if (currentSlide > 1) {
      setCurrentSlide(prev => prev - 1);
    }
  };

  // Presentation control
  const startPresentation = () => {
    setIsPlaying(true);
    setSessionActive(true);
    setPresentationMode('presenting');
    toast({
      title: "Presentation Started",
      description: "Voice commands are now active. Speak clearly for best recognition."
    });
  };

  const pausePresentation = () => {
    setIsPlaying(false);
  };

  const resumePresentation = () => {
    setIsPlaying(true);
  };

  const endPresentation = () => {
    setIsPlaying(false);
    setSessionActive(false);
    setPresentationMode('processing');
  };

  // Handle session end from SessionManager
  const handleSessionEnd = (data: any) => {
    setSessionData(data);
    setPresentationMode('processing');
    toast({
      title: "Session Ended",
      description: "Processing presentation content with AI analysis..."
    });
  };

  // Handle AI processing completion
  const handleProcessingComplete = (content: any) => {
    setProcessedContent(content);
    setPresentationMode('complete');
    setShowDownloads(true);
    toast({
      title: "AI Processing Complete",
      description: "Summary and quiz materials are ready for download."
    });
  };

  // Handle downloads
  const handleDownload = (type: 'summary' | 'quiz') => {
    toast({
      title: `${type === 'summary' ? 'Summary' : 'Quiz'} Download`,
      description: `Your ${type} is being prepared for download.`
    });
  };

  // Calculate progress
  const slideProgress = (currentSlide / presentation.total_pages) * 100;

  return (
    <div className="min-h-screen bg-background p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{presentation.title}</h1>
          <p className="text-muted-foreground">{presentation.description}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={sessionActive ? "default" : "secondary"}>
            {sessionActive ? "Live Session" : "Ready"}
          </Badge>
          <Button onClick={onClose} variant="outline">
            Close Presentation
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Presentation Area */}
        <div className="lg:col-span-2 space-y-4">
          {/* Slide Display */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Slide {currentSlide} of {presentation.total_pages}
                </CardTitle>
                <Badge variant="outline">
                  {Math.round(slideProgress)}% Complete
                </Badge>
              </div>
              <Progress value={slideProgress} className="w-full" />
            </CardHeader>
            <CardContent>
              {/* Mock slide display */}
              <div className="aspect-video bg-muted rounded-lg flex items-center justify-center border-2 border-dashed">
                <div className="text-center space-y-2">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground" />
                  <h3 className="text-xl font-semibold">Slide {currentSlide}</h3>
                  <p className="text-muted-foreground">{presentation.title}</p>
                  <p className="text-sm text-muted-foreground">
                    Voice-controlled presentation content would be displayed here
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Presentation Controls */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Volume2 className="h-5 w-5" />
                Voice-Controlled Navigation
              </CardTitle>
              <CardDescription>
                Use voice commands or manual controls to navigate
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center gap-4 mb-4">
                <Button
                  onClick={previousSlide}
                  disabled={currentSlide === 1}
                  size="lg"
                  variant="outline"
                >
                  <SkipBack className="h-4 w-4" />
                </Button>

                {!sessionActive ? (
                  <Button onClick={startPresentation} size="lg" className="px-8">
                    <Play className="h-4 w-4 mr-2" />
                    Start Session
                  </Button>
                ) : !isPlaying ? (
                  <Button onClick={resumePresentation} size="lg" className="px-8">
                    <Play className="h-4 w-4 mr-2" />
                    Resume
                  </Button>
                ) : (
                  <Button onClick={pausePresentation} size="lg" variant="secondary" className="px-8">
                    <Pause className="h-4 w-4 mr-2" />
                    Pause
                  </Button>
                )}

                <Button
                  onClick={nextSlide}
                  disabled={currentSlide === presentation.total_pages}
                  size="lg"
                  variant="outline"
                >
                  <SkipForward className="h-4 w-4" />
                </Button>
              </div>

              {sessionActive && (
                <div className="text-center">
                  <Button onClick={endPresentation} variant="destructive">
                    <Square className="h-4 w-4 mr-2" />
                    End Session
                  </Button>
                </div>
              )}

              <Separator className="my-4" />

              <div className="space-y-2">
                <h4 className="font-medium">Voice Commands:</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>"Next slide" - Move forward</div>
                  <div>"Previous slide" - Move back</div>
                  <div>"First slide" - Go to start</div>
                  <div>"Last slide" - Go to end</div>
                  <div>"Pause presentation" - Pause</div>
                  <div>"End session" - Stop session</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Side Panel */}
        <div className="space-y-4">
          {/* Session Manager */}
          {presentationMode === 'setup' || presentationMode === 'presenting' ? (
            <SessionManager
              presentationId={presentation.id}
              presentationTitle={presentation.title}
              onSessionEnd={handleSessionEnd}
              onVoiceCommand={handleVoiceCommand}
            />
          ) : null}

          {/* AI Content Processor */}
          {presentationMode === 'processing' && sessionData && (
            <AIContentProcessor
              sessionData={sessionData}
              onProcessingComplete={handleProcessingComplete}
              onDownload={handleDownload}
            />
          )}

          {/* Download Manager */}
          {presentationMode === 'complete' && showDownloads && sessionData && processedContent && (
            <DownloadManager
              sessionData={sessionData}
              processedContent={processedContent}
            />
          )}

          {/* Presentation Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Presentation Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Total Slides:</span>
                <Badge variant="outline">{presentation.total_pages}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Current Slide:</span>
                <Badge>{currentSlide}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Progress:</span>
                <Badge variant="outline">{Math.round(slideProgress)}%</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Status:</span>
                <Badge variant={isPlaying ? "default" : "secondary"}>
                  {isPlaying ? "Playing" : "Paused"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Tips */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Mic className="h-4 w-4" />
                Voice Control Tips
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>• Speak clearly and pause between commands</p>
              <p>• Use natural language for navigation</p>
              <p>• Voice recognition works best in quiet environments</p>
              <p>• Manual controls are always available as backup</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default VoiceControlledPresentation;