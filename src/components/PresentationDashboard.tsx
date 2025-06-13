import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Play, 
  Square, 
  Mic, 
  MicOff, 
  Brain, 
  FileText, 
  MessageSquare,
  Clock,
  Users,
  TrendingUp,
  AlertCircle
} from 'lucide-react';

import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import SlideViewer from './SlideViewer';
import AIProcessor from './AIProcessor';
import QuizGenerator from './QuizGenerator';
import PDFGenerator from './PDFGenerator';
import VoiceCommands from './VoiceCommands';
import SpeakerNotes from './SpeakerNotes';

const PresentationDashboard: React.FC = () => {
  // Speech recognition state
  const {
    transcript,
    isListening,
    startListening,
    stopListening,
    resetTranscript,
    confidence,
    error
  } = useSpeechRecognition();

  // Presentation state
  const [isPresenting, setIsPresenting] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [sessionDuration, setSessionDuration] = useState(0);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [highlightedKeywords, setHighlightedKeywords] = useState<string[]>([]);
  const [presentationStats, setPresentationStats] = useState({
    totalSlides: 5,
    wordsSpoken: 0,
    averageConfidence: 0,
    keyTopics: 0
  });

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPresenting && startTime) {
      interval = setInterval(() => {
        setSessionDuration(Math.floor((Date.now() - startTime.getTime()) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPresenting, startTime]);

  // Update stats based on transcript
  useEffect(() => {
    setPresentationStats(prev => ({
      ...prev,
      wordsSpoken: transcript.split(' ').filter(word => word.trim()).length,
      averageConfidence: Math.round(confidence * 100),
      keyTopics: highlightedKeywords.length
    }));
  }, [transcript, confidence, highlightedKeywords]);

  const startPresentation = () => {
    setIsPresenting(true);
    setStartTime(new Date());
    startListening();
    setSessionDuration(0);
    console.log('Presentation started');
  };

  const endPresentation = () => {
    setIsPresenting(false);
    setStartTime(null);
    stopListening();
    console.log('Presentation ended');
  };

  const handleVoiceCommand = (command: string, action: string) => {
    console.log('Voice command received:', command, action);
    
    switch (action) {
      case 'NEXT_SLIDE':
        setCurrentSlide(prev => Math.min(prev + 1, 4));
        break;
      case 'PREV_SLIDE':
        setCurrentSlide(prev => Math.max(prev - 1, 0));
        break;
      case 'GO_TO_SLIDE':
        const slideNumber = parseInt(command.match(/\d+/)?.[0] || '1') - 1;
        setCurrentSlide(Math.max(0, Math.min(slideNumber, 4)));
        break;
      case 'START_PRESENTATION':
        startPresentation();
        break;
      case 'END_PRESENTATION':
        endPresentation();
        break;
      case 'PAUSE_RECORDING':
        stopListening();
        break;
      case 'RESUME_RECORDING':
        startListening();
        break;
      case 'TOGGLE_FULLSCREEN':
        document.documentElement.requestFullscreen?.();
        break;
      default:
        console.log('Unknown command action:', action);
    }
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const slideContent = [
    "Introduction to AI-Powered Presentations - Revolutionary technology for modern presentations",
    "Real-Time Speech Recognition - Advanced natural language processing capabilities",
    "AI-Generated Content Analysis - Intelligent keyword detection and topic completion",
    "Interactive Quiz Generation - Automated MCQ and theory-based question creation",
    "Voice-Controlled Presentation - Hands-free presentation control and navigation"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            AI-Powered Presentation Assistant
          </h1>
          <p className="text-gray-600 text-lg">
            Real-Time Intelligence for Smarter Presentations
          </p>
        </div>

        {/* Control Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Presentation Control
              </div>
              <div className="flex items-center gap-4">
                <Badge variant={isPresenting ? "default" : "secondary"}>
                  {isPresenting ? "Active" : "Inactive"}
                </Badge>
                {isPresenting && (
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4" />
                    {formatDuration(sessionDuration)}
                  </div>
                )}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  onClick={isPresenting ? endPresentation : startPresentation}
                  className={isPresenting ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"}
                >
                  {isPresenting ? (
                    <>
                      <Square className="h-4 w-4 mr-2" />
                      End Presentation
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Start Presentation
                    </>
                  )}
                </Button>
                
                <Button
                  onClick={isListening ? stopListening : startListening}
                  variant="outline"
                  className={isListening ? "border-green-500 text-green-600" : ""}
                >
                  {isListening ? (
                    <>
                      <Mic className="h-4 w-4 mr-2" />
                      Recording
                    </>
                  ) : (
                    <>
                      <MicOff className="h-4 w-4 mr-2" />
                      Start Recording
                    </>
                  )}
                </Button>

                <Button
                  onClick={resetTranscript}
                  variant="outline"
                  disabled={!transcript}
                >
                  Reset
                </Button>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <MessageSquare className="h-4 w-4" />
                  {presentationStats.wordsSpoken} words
                </div>
                <div className="flex items-center gap-1">
                  <TrendingUp className="h-4 w-4" />
                  {presentationStats.averageConfidence}% confidence
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {presentationStats.keyTopics} topics
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Main Dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Slides and AI */}
          <div className="lg:col-span-2 space-y-6">
            {/* Slide Viewer */}
            <SlideViewer
              highlightedKeywords={highlightedKeywords}
              onSlideChange={setCurrentSlide}
              autoAdvance={isPresenting}
            />

            {/* AI Processor */}
            <AIProcessor
              transcript={transcript}
              onKeywordsDetected={setHighlightedKeywords}
              onSlideAdvance={() => setCurrentSlide(prev => Math.min(prev + 1, 4))}
              onTopicComplete={(topic) => console.log('Topic completed:', topic)}
            />
          </div>

          {/* Right Column - Tools */}
          <div className="space-y-6">
            {/* Speaker Notes */}
            <SpeakerNotes
              currentSlide={currentSlide}
              slideContent={slideContent}
              transcript={transcript}
              onNotesUpdate={(notes) => console.log('Notes updated:', notes)}
            />

            {/* Voice Commands */}
            <VoiceCommands
              onCommand={handleVoiceCommand}
              isListening={isListening}
            />
          </div>
        </div>

        {/* Bottom Section - Advanced Features */}
        <Tabs defaultValue="quiz" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="quiz">Quiz Generator</TabsTrigger>
            <TabsTrigger value="summary">PDF Summary</TabsTrigger>
          </TabsList>
          
          <TabsContent value="quiz">
            <QuizGenerator
              transcript={transcript}
              slideContent={slideContent}
              onQuizGenerated={(mcqs, theory) => console.log('Quiz generated:', { mcqs, theory })}
            />
          </TabsContent>
          
          <TabsContent value="summary">
            <PDFGenerator
              transcript={transcript}
              slideContent={slideContent}
              keywords={highlightedKeywords}
              sessionDuration={sessionDuration}
            />
          </TabsContent>
        </Tabs>

        {/* Live Transcript (for debugging) */}
        {transcript && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Live Transcript
                <Badge variant="outline">{confidence > 0 ? `${Math.round(confidence * 100)}% confidence` : ''}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 p-4 rounded max-h-32 overflow-y-auto">
                <p className="text-sm text-gray-700">{transcript}</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default PresentationDashboard;
