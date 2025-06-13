import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Mic, 
  MicOff, 
  Play, 
  Pause, 
  Square, 
  BarChart3, 
  Brain, 
  FileText, 
  Volume2,
  User,
  LogOut,
  Settings
} from 'lucide-react';

import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import SlideViewer from './SlideViewer';
import AIProcessor from './AIProcessor';
import QuizGenerator from './QuizGenerator';
import PDFGenerator from './PDFGenerator';
import VoiceCommands from './VoiceCommands';
import SpeakerNotes from './SpeakerNotes';
import { useUser } from '@/contexts/UserContext';

const PresentationDashboard = () => {
  const { user, logout } = useUser();
  const {
    isListening,
    transcript,
    confidence,
    startListening,
    stopListening,
    resetTranscript
  } = useSpeechRecognition();

  const [isPresenting, setIsPresenting] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [highlightedKeywords, setHighlightedKeywords] = useState<string[]>([]);
  const [sessionData, setSessionData] = useState({
    startTime: null as Date | null,
    duration: 0,
    wordCount: 0,
    keyPoints: [] as string[]
  });

  // Update session data
  useEffect(() => {
    if (transcript) {
      setSessionData(prev => ({
        ...prev,
        wordCount: transcript.split(' ').length
      }));
    }
  }, [transcript]);

  // Update duration timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPresenting && sessionData.startTime) {
      interval = setInterval(() => {
        setSessionData(prev => ({
          ...prev,
          duration: Math.floor((Date.now() - (prev.startTime?.getTime() || 0)) / 1000)
        }));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPresenting, sessionData.startTime]);

  const startPresentation = () => {
    setIsPresenting(true);
    setSessionData(prev => ({
      ...prev,
      startTime: new Date()
    }));
    startListening();
    console.log('Presentation started by:', user?.name);
  };

  const pausePresentation = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const stopPresentation = () => {
    setIsPresenting(false);
    stopListening();
    console.log('Presentation stopped');
  };

  const resetSession = () => {
    setIsPresenting(false);
    stopListening();
    resetTranscript();
    setSessionData({
      startTime: null,
      duration: 0,
      wordCount: 0,
      keyPoints: []
    });
    setCurrentSlide(0);
    setHighlightedKeywords([]);
    console.log('Session reset');
  };

  const handleSlideChange = (slideIndex: number) => {
    setCurrentSlide(slideIndex);
    console.log('Slide changed to:', slideIndex + 1);
  };

  const handleKeywordsHighlight = (keywords: string[]) => {
    setHighlightedKeywords(keywords);
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      {/* Header with User Info */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <User className="h-8 w-8 text-blue-600" />
                <div>
                  <h1 className="text-2xl font-bold">Welcome, {user?.name || 'User'}!</h1>
                  <p className="text-gray-600">
                    {user?.role && <Badge variant="outline" className="mr-2">{user.role}</Badge>}
                    AI-Powered Presentation Dashboard
                  </p>
                </div>
              </div>
              {user?.voiceProfileId && (
                <div className="text-right">
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Volume2 className="h-3 w-3" />
                    Voice Profile Active
                  </Badge>
                  <p className="text-xs text-gray-500 mt-1">
                    Registered: {new Date(user.registrationDate).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="flex items-center gap-1">
                <Settings className="h-4 w-4" />
                Settings
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleLogout}
                className="flex items-center gap-1"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Main Controls */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Presentation Controls</span>
            <div className="flex items-center gap-2">
              {isPresenting && (
                <Badge variant={isListening ? "default" : "secondary"} className="animate-pulse">
                  {isListening ? 'Recording' : 'Paused'} - {formatDuration(sessionData.duration)}
                </Badge>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            {!isPresenting ? (
              <Button
                onClick={startPresentation}
                className="flex items-center gap-2"
                size="lg"
              >
                <Play className="h-5 w-5" />
                Start Presentation
              </Button>
            ) : (
              <>
                <Button
                  onClick={pausePresentation}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  {isListening ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  {isListening ? 'Pause' : 'Resume'}
                </Button>
                <Button
                  onClick={stopPresentation}
                  variant="destructive"
                  className="flex items-center gap-2"
                >
                  <Square className="h-4 w-4" />
                  Stop
                </Button>
              </>
            )}

            <Button
              onClick={resetSession}
              variant="outline"
              className="flex items-center gap-2"
            >
              Reset Session
            </Button>

            {/* Session Stats */}
            <div className="flex items-center gap-4 ml-auto">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{sessionData.wordCount}</div>
                <div className="text-xs text-gray-500">Words</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{currentSlide + 1}</div>
                <div className="text-xs text-gray-500">Current Slide</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {confidence ? Math.round(confidence * 100) : 0}%
                </div>
                <div className="text-xs text-gray-500">Confidence</div>
              </div>
            </div>
          </div>

          {/* Voice Recognition Status */}
          {isPresenting && (
            <Alert className="mt-4">
              <div className="flex items-center gap-2">
                {isListening ? (
                  <Mic className="h-4 w-4 text-green-600" />
                ) : (
                  <MicOff className="h-4 w-4 text-red-600" />
                )}
                <AlertDescription>
                  {isListening 
                    ? `Listening... Confidence: ${confidence ? Math.round(confidence * 100) : 0}%`
                    : 'Speech recognition paused'
                  }
                </AlertDescription>
              </div>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Main Dashboard */}
      <Tabs defaultValue="slides" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="slides" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Slides
          </TabsTrigger>
          <TabsTrigger value="ai" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            AI Analysis
          </TabsTrigger>
          <TabsTrigger value="quiz" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Quiz
          </TabsTrigger>
          <TabsTrigger value="pdf" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Export
          </TabsTrigger>
          <TabsTrigger value="voice" className="flex items-center gap-2">
            <Volume2 className="h-4 w-4" />
            Voice Control
          </TabsTrigger>
          <TabsTrigger value="notes" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Notes
          </TabsTrigger>
        </TabsList>

        <TabsContent value="slides">
          <SlideViewer
            highlightedKeywords={highlightedKeywords}
            onSlideChange={handleSlideChange}
            autoAdvance={false}
          />
        </TabsContent>

        <TabsContent value="ai">
          <AIProcessor
            transcript={transcript}
            isProcessing={isListening}
            onKeywordsExtracted={handleKeywordsHighlight}
          />
        </TabsContent>

        <TabsContent value="quiz">
          <QuizGenerator transcript={transcript} />
        </TabsContent>

        <TabsContent value="pdf">
          <PDFGenerator
            transcript={transcript}
            sessionData={{
              ...sessionData,
              currentSlide: currentSlide + 1,
              userName: user?.name || 'Unknown User',
              userRole: user?.role || 'Presenter'
            }}
          />
        </TabsContent>

        <TabsContent value="voice">
          <VoiceCommands
            isListening={isListening}
            transcript={transcript}
          />
        </TabsContent>

        <TabsContent value="notes">
          <SpeakerNotes
            transcript={transcript}
            currentSlide={currentSlide}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PresentationDashboard;
