import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Play, 
  Pause, 
  Square, 
  ChevronLeft, 
  ChevronRight,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  ZoomIn,
  ZoomOut,
  FileText,
  MessageCircle,
  Lightbulb
} from 'lucide-react';
import { useVoiceRecognition } from '@/hooks/useVoiceRecognition';
import { useToast } from '@/hooks/use-toast';

interface Presentation {
  ID: number;
  title: string;
  filename: string;
  file_id: number;
  total_pages: number;
  description: string;
  tags: string;
}

interface VoiceControlledViewerProps {
  presentation: Presentation;
  onClose: () => void;
}

const VoiceControlledViewer: React.FC<VoiceControlledViewerProps> = ({ 
  presentation, 
  onClose 
}) => {
  const [currentSlide, setCurrentSlide] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [speakerNotes, setSpeakerNotes] = useState('');
  const [highlightedText, setHighlightedText] = useState('');
  const [presentationUrl, setPresentationUrl] = useState<string>('');
  const [totalSlides, setTotalSlides] = useState(presentation.total_pages || 1);
  const { toast } = useToast();

  // Voice recognition with command handling
  const { 
    isListening, 
    startListening, 
    stopListening, 
    transcript,
    lastCommand,
    isSupported 
  } = useVoiceRecognition(handleVoiceCommand, true);

  const viewerRef = useRef<HTMLDivElement>(null);

  // Handle voice commands with instant reactions
  function handleVoiceCommand(command: string) {
    console.log('Voice command received:', command);
    
    // Show visual feedback for command
    toast({
      title: "Voice Command",
      description: `Executing: ${command}`,
      duration: 2000
    });

    switch (command) {
      case 'next slide':
        if (currentSlide < totalSlides) {
          setCurrentSlide(prev => prev + 1);
          updateSpeakerNotes(currentSlide + 1);
        }
        break;
        
      case 'previous slide':
        if (currentSlide > 1) {
          setCurrentSlide(prev => prev - 1);
          updateSpeakerNotes(currentSlide - 1);
        }
        break;
        
      case 'first slide':
        setCurrentSlide(1);
        updateSpeakerNotes(1);
        break;
        
      case 'last slide':
        setCurrentSlide(totalSlides);
        updateSpeakerNotes(totalSlides);
        break;
        
      case 'start presentation':
        setIsPlaying(true);
        if (!isListening) {
          startListening();
        }
        break;
        
      case 'stop presentation':
        setIsPlaying(false);
        if (isListening) {
          stopListening();
        }
        break;
        
      case 'pause':
        setIsPlaying(false);
        break;
        
      case 'resume':
        setIsPlaying(true);
        break;
        
      case 'highlight point':
        setHighlightedText(transcript);
        setTimeout(() => setHighlightedText(''), 5000);
        break;
        
      case 'zoom in':
        setZoom(prev => Math.min(prev + 25, 200));
        break;
        
      case 'zoom out':
        setZoom(prev => Math.max(prev - 25, 50));
        break;
        
      case 'fullscreen':
        enterFullscreen();
        break;
        
      case 'exit fullscreen':
        exitFullscreen();
        break;
        
      default:
        // Handle slide number commands
        if (command.startsWith('go to slide ')) {
          const slideNumber = parseInt(command.replace('go to slide ', ''));
          if (slideNumber >= 1 && slideNumber <= totalSlides) {
            setCurrentSlide(slideNumber);
            updateSpeakerNotes(slideNumber);
          }
        }
        break;
    }
  }

  // Generate speaker notes based on slide content
  const updateSpeakerNotes = (slideNumber: number) => {
    const notes = [
      "Welcome to this presentation. Let's begin with our key objectives.",
      "This slide covers the main concepts we'll be discussing today.",
      "Here are the important points to remember from this section.",
      "Let's dive deeper into the details of this topic.",
      "This data shows the trends we've been observing.",
      "Moving forward, we'll explore the implications of these findings.",
      "The next section will cover our recommendations.",
      "In conclusion, these are the key takeaways from our analysis."
    ];
    
    const noteIndex = (slideNumber - 1) % notes.length;
    setSpeakerNotes(notes[noteIndex]);
  };

  // Load presentation file URL
  useEffect(() => {
    const loadPresentation = async () => {
      try {
        // In a real implementation, you would generate a URL for the uploaded file
        // For now, we'll use a placeholder
        setPresentationUrl(`/api/files/${presentation.file_id}`);
        setTotalSlides(presentation.total_pages || 10); // Default to 10 slides
        updateSpeakerNotes(1);
      } catch (error) {
        console.error('Error loading presentation:', error);
        toast({
          title: "Error",
          description: "Failed to load presentation.",
          variant: "destructive"
        });
      }
    };

    loadPresentation();
  }, [presentation]);

  // Auto-advance slides when playing
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setCurrentSlide(prev => {
        if (prev >= totalSlides) {
          setIsPlaying(false);
          return prev;
        }
        updateSpeakerNotes(prev + 1);
        return prev + 1;
      });
    }, 10000); // Auto-advance every 10 seconds

    return () => clearInterval(interval);
  }, [isPlaying, totalSlides]);

  const enterFullscreen = () => {
    if (viewerRef.current?.requestFullscreen) {
      viewerRef.current.requestFullscreen();
      setIsFullscreen(true);
    }
  };

  const exitFullscreen = () => {
    if (document.exitFullscreen) {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const togglePresentation = () => {
    if (isPlaying) {
      setIsPlaying(false);
      if (isListening) {
        stopListening();
      }
    } else {
      setIsPlaying(true);
      if (isSupported && !isListening) {
        startListening();
      }
    }
  };

  const toggleVoiceControl = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-screen">
      {/* Main Viewer */}
      <div className="lg:col-span-3">
        <Card className="h-full">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg truncate">
                {presentation.title}
              </CardTitle>
              <div className="flex items-center space-x-2">
                <Badge variant={isListening ? "default" : "secondary"}>
                  {isListening ? (
                    <>
                      <Mic className="w-3 h-3 mr-1" />
                      Listening
                    </>
                  ) : (
                    <>
                      <MicOff className="w-3 h-3 mr-1" />
                      Voice Off
                    </>
                  )}
                </Badge>
                <Badge variant={isPlaying ? "default" : "secondary"}>
                  {isPlaying ? "Playing" : "Paused"}
                </Badge>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-4">
            {/* Slide Viewer */}
            <div 
              ref={viewerRef}
              className="relative bg-gray-100 rounded-lg mb-4 flex items-center justify-center"
              style={{ 
                height: '60vh',
                transform: `scale(${zoom / 100})`,
                transformOrigin: 'center'
              }}
            >
              {/* Placeholder for PDF viewer */}
              <div className="w-full h-full flex items-center justify-center bg-white rounded border-2 border-gray-200">
                <div className="text-center">
                  <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">
                    Slide {currentSlide} of {totalSlides}
                  </h3>
                  <p className="text-gray-500">
                    {presentation.filename}
                  </p>
                  {highlightedText && (
                    <div className="mt-4 p-3 bg-yellow-100 border border-yellow-300 rounded-lg">
                      <p className="text-yellow-800 font-medium">
                        <Lightbulb className="w-4 h-4 inline mr-2" />
                        Highlighted: {highlightedText}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Button
                  onClick={togglePresentation}
                  size="sm"
                  variant={isPlaying ? "secondary" : "default"}
                >
                  {isPlaying ? (
                    <>
                      <Pause className="w-4 h-4 mr-1" />
                      Pause
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-1" />
                      Start
                    </>
                  )}
                </Button>

                <Button
                  onClick={toggleVoiceControl}
                  size="sm"
                  variant={isListening ? "default" : "outline"}
                  disabled={!isSupported}
                >
                  {isListening ? (
                    <>
                      <Mic className="w-4 h-4 mr-1" />
                      Voice On
                    </>
                  ) : (
                    <>
                      <MicOff className="w-4 h-4 mr-1" />
                      Voice Off
                    </>
                  )}
                </Button>

                <Separator orientation="vertical" className="h-6" />

                <Button
                  onClick={() => setCurrentSlide(prev => Math.max(prev - 1, 1))}
                  size="sm"
                  variant="outline"
                  disabled={currentSlide <= 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>

                <span className="text-sm font-medium px-2">
                  {currentSlide} / {totalSlides}
                </span>

                <Button
                  onClick={() => setCurrentSlide(prev => Math.min(prev + 1, totalSlides))}
                  size="sm"
                  variant="outline"
                  disabled={currentSlide >= totalSlides}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  onClick={() => setZoom(prev => Math.max(prev - 25, 50))}
                  size="sm"
                  variant="outline"
                >
                  <ZoomOut className="w-4 h-4" />
                </Button>

                <span className="text-sm px-2">{zoom}%</span>

                <Button
                  onClick={() => setZoom(prev => Math.min(prev + 25, 200))}
                  size="sm"
                  variant="outline"
                >
                  <ZoomIn className="w-4 h-4" />
                </Button>

                <Button
                  onClick={isFullscreen ? exitFullscreen : enterFullscreen}
                  size="sm"
                  variant="outline"
                >
                  {isFullscreen ? (
                    <Minimize className="w-4 h-4" />
                  ) : (
                    <Maximize className="w-4 h-4" />
                  )}
                </Button>

                <Button onClick={onClose} size="sm" variant="outline">
                  <Square className="w-4 h-4 mr-1" />
                  Close
                </Button>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-4">
              <Progress value={(currentSlide / totalSlides) * 100} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sidebar */}
      <div className="space-y-4">
        {/* Voice Commands */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Voice Commands</CardTitle>
          </CardHeader>
          <CardContent className="text-xs space-y-2">
            <div className="grid grid-cols-1 gap-1">
              <Badge variant="outline" className="justify-start text-xs py-1">
                "Next slide"
              </Badge>
              <Badge variant="outline" className="justify-start text-xs py-1">
                "Previous slide"
              </Badge>
              <Badge variant="outline" className="justify-start text-xs py-1">
                "First slide"
              </Badge>
              <Badge variant="outline" className="justify-start text-xs py-1">
                "Slide [number]"
              </Badge>
              <Badge variant="outline" className="justify-start text-xs py-1">
                "Highlight point"
              </Badge>
              <Badge variant="outline" className="justify-start text-xs py-1">
                "Zoom in/out"
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Live Transcript */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center">
              <MessageCircle className="w-4 h-4 mr-2" />
              Live Speech
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-20">
              <p className="text-xs text-gray-600">
                {transcript || "Start speaking to see transcript..."}
              </p>
            </ScrollArea>
            {lastCommand && (
              <div className="mt-2 p-2 bg-blue-50 rounded text-xs">
                <strong>Last Command:</strong> {lastCommand}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Speaker Notes */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center">
              <FileText className="w-4 h-4 mr-2" />
              Speaker Notes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-32">
              <p className="text-xs text-gray-700 leading-relaxed">
                {speakerNotes}
              </p>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VoiceControlledViewer;