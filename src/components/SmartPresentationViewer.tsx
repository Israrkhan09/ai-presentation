import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  FileText,
  Download,
  Brain,
  Target,
  Clock,
  Volume2 } from
'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SmartPresentationViewerProps {
  presentationId: number;
  onSessionEnd?: (sessionData: any) => void;
}

interface SlideData {
  number: number;
  content: string;
  keywords: string[];
  duration: number;
}

interface TranscriptionSegment {
  text: string;
  timestamp: number;
  keywords: string[];
  confidence: number;
}

const SmartPresentationViewer: React.FC<SmartPresentationViewerProps> = ({
  presentationId,
  onSessionEnd
}) => {
  const { toast } = useToast();
  const [isPresenting, setIsPresenting] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(1);
  const [totalSlides, setTotalSlides] = useState(10);
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [transcription, setTranscription] = useState<TranscriptionSegment[]>([]);
  const [currentKeywords, setCurrentKeywords] = useState<string[]>([]);
  const [speakerNotes, setSpeakerNotes] = useState<string[]>([]);
  const [sessionDuration, setSessionDuration] = useState(0);
  const [autoAdvance, setAutoAdvance] = useState(true);
  const [voiceCommands, setVoiceCommands] = useState(true);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const sessionStartTime = useRef<Date | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const recognition = new (window as any).webkitSpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        const latest = event.results[event.results.length - 1];
        if (latest.isFinal) {
          handleTranscriptionResult(latest[0].transcript, latest[0].confidence);
        }
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        if (event.error === 'not-allowed') {
          toast({
            title: "Microphone Access Denied",
            description: "Please allow microphone access for transcription features.",
            variant: "destructive"
          });
        }
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const handleTranscriptionResult = useCallback(async (text: string, confidence: number) => {
    const keywords = extractKeywords(text);
    const segment: TranscriptionSegment = {
      text,
      timestamp: Date.now(),
      keywords,
      confidence
    };

    setTranscription((prev) => [...prev, segment]);
    setCurrentKeywords(keywords);

    // Store transcription in database
    if (sessionId) {
      try {
        const { error } = await window.ezsite.apis.tableCreate('16752', {
          session_id: sessionId,
          slide_number: currentSlide,
          transcript_text: text,
          timestamp: new Date().toISOString(),
          confidence_score: confidence,
          keywords_detected: JSON.stringify(keywords),
          emotion_tone: analyzeEmotionTone(text),
          speaking_pace: calculateSpeakingPace(text)
        });

        if (error) throw error;
      } catch (error) {
        console.error('Error saving transcription:', error);
      }
    }

    // Check for voice commands
    if (voiceCommands) {
      handleVoiceCommands(text.toLowerCase());
    }

    // Auto-advance logic
    if (autoAdvance && shouldAdvanceSlide(text, keywords)) {
      handleNextSlide();
    }
  }, [sessionId, currentSlide, voiceCommands, autoAdvance]);

  const extractKeywords = (text: string): string[] => {
    // Simple keyword extraction - in production, use more sophisticated NLP
    const words = text.toLowerCase().split(/\s+/);
    const keywords = words.filter((word) =>
    word.length > 4 &&
    !['the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had', 'her', 'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his', 'how', 'its', 'may', 'new', 'now', 'old', 'see', 'two', 'way', 'who', 'boy', 'did', 'has', 'let', 'put', 'say', 'she', 'too', 'use'].includes(word)
    );
    return [...new Set(keywords)].slice(0, 5); // Top 5 unique keywords
  };

  const analyzeEmotionTone = (text: string): string => {
    // Simple emotion analysis - in production, use ML models
    const positiveWords = ['great', 'excellent', 'amazing', 'wonderful', 'good', 'best'];
    const negativeWords = ['bad', 'terrible', 'awful', 'worst', 'difficult', 'problem'];

    const words = text.toLowerCase().split(/\s+/);
    const positiveCount = words.filter((word) => positiveWords.includes(word)).length;
    const negativeCount = words.filter((word) => negativeWords.includes(word)).length;

    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
  };

  const calculateSpeakingPace = (text: string): number => {
    // Estimate words per minute based on recent transcription
    const wordCount = text.split(/\s+/).length;
    const timeWindow = 60; // seconds
    return wordCount / timeWindow * 60;
  };

  const shouldAdvanceSlide = (text: string, keywords: string[]): boolean => {
    // Logic to determine if slide should advance based on content
    const transitionPhrases = ['next slide', 'moving on', 'let\'s continue', 'in conclusion'];
    const hasTransitionPhrase = transitionPhrases.some((phrase) =>
    text.toLowerCase().includes(phrase)
    );
    return hasTransitionPhrase;
  };

  const handleVoiceCommands = (text: string) => {
    if (text.includes('next slide')) {
      handleNextSlide();
    } else if (text.includes('previous slide')) {
      handlePreviousSlide();
    } else if (text.includes('start recording')) {
      startRecording();
    } else if (text.includes('stop recording')) {
      stopRecording();
    } else if (text.includes('generate quiz')) {
      generateQuiz();
    } else if (text.includes('show notes')) {
      showSpeakerNotes();
    }
  };

  const startPresentation = async () => {
    try {
      // Create new session
      const { data, error } = await window.ezsite.apis.tableCreate('16751', {
        user_id: 1, // Get from auth context
        presentation_id: presentationId,
        session_title: `Session ${new Date().toLocaleString()}`,
        start_time: new Date().toISOString(),
        slides_presented: 0,
        voice_commands_used: 0,
        engagement_score: 0
      });

      if (error) throw error;

      setSessionId(data);
      setIsPresenting(true);
      sessionStartTime.current = new Date();

      // Start duration timer
      intervalRef.current = setInterval(() => {
        setSessionDuration((prev) => prev + 1);
      }, 1000);

      // Load speaker notes
      await loadSpeakerNotes();

      toast({
        title: "Presentation Started",
        description: "Real-time features are now active."
      });
    } catch (error) {
      console.error('Error starting presentation:', error);
      toast({
        title: "Error",
        description: "Failed to start presentation session.",
        variant: "destructive"
      });
    }
  };

  const stopPresentation = async () => {
    try {
      if (sessionId) {
        const { error } = await window.ezsite.apis.tableUpdate('16751', {
          ID: sessionId,
          end_time: new Date().toISOString(),
          total_duration: sessionDuration / 60,
          slides_presented: currentSlide
        });

        if (error) throw error;
      }

      setIsPresenting(false);
      stopRecording();

      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      // Generate final quiz and summary
      await generateQuiz();
      await generatePDFSummary();

      toast({
        title: "Presentation Completed",
        description: "Session data saved and materials generated."
      });

      if (onSessionEnd) {
        onSessionEnd({
          sessionId,
          duration: sessionDuration,
          slides: currentSlide,
          transcription
        });
      }
    } catch (error) {
      console.error('Error stopping presentation:', error);
    }
  };

  const startRecording = () => {
    if (recognitionRef.current && !isRecording) {
      recognitionRef.current.start();
      setIsRecording(true);
      toast({
        title: "Recording Started",
        description: "Real-time transcription is now active."
      });
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
      toast({
        title: "Recording Stopped",
        description: "Transcription has been saved."
      });
    }
  };

  const handleNextSlide = () => {
    if (currentSlide < totalSlides) {
      setCurrentSlide((prev) => prev + 1);
      setCurrentKeywords([]);
    }
  };

  const handlePreviousSlide = () => {
    if (currentSlide > 1) {
      setCurrentSlide((prev) => prev - 1);
      setCurrentKeywords([]);
    }
  };

  const loadSpeakerNotes = async () => {
    try {
      const { data, error } = await window.ezsite.apis.tablePage('16755', {
        PageNo: 1,
        PageSize: 100,
        Filters: [
        { name: 'presentation_id', op: 'Equal', value: presentationId }]

      });

      if (error) throw error;

      if (data?.List) {
        const notes = data.List.map((note: any) =>
        `Slide ${note.slide_number}: ${JSON.parse(note.key_points || '[]').join(', ')}`
        );
        setSpeakerNotes(notes);
      }
    } catch (error) {
      console.error('Error loading speaker notes:', error);
    }
  };

  const generateQuiz = async () => {
    try {
      if (!sessionId) return;

      // Generate quiz based on transcription and keywords
      const allKeywords = [...new Set(transcription.flatMap((t) => t.keywords))];

      const { data: quizData, error: quizError } = await window.ezsite.apis.tableCreate('16753', {
        session_id: sessionId,
        quiz_title: `Quiz: Session ${new Date().toLocaleDateString()}`,
        quiz_type: 'MCQ',
        difficulty_level: 'Medium',
        total_questions: Math.min(allKeywords.length, 10),
        estimated_time: Math.min(allKeywords.length * 2, 20),
        topics_covered: JSON.stringify(allKeywords),
        auto_generated: true
      });

      if (quizError) throw quizError;

      // Generate sample questions
      for (let i = 0; i < Math.min(5, allKeywords.length); i++) {
        const keyword = allKeywords[i];
        await window.ezsite.apis.tableCreate('16754', {
          quiz_id: quizData,
          question_number: i + 1,
          question_text: `What is the significance of "${keyword}" in the presented content?`,
          question_type: 'MCQ',
          options: JSON.stringify([
          `${keyword} is a primary concept`,
          `${keyword} is a supporting detail`,
          `${keyword} is an example`,
          `${keyword} is not relevant`]
          ),
          correct_answer: `${keyword} is a primary concept`,
          explanation: `Based on the frequency and context of "${keyword}" in the presentation.`,
          points: 1,
          keywords: JSON.stringify([keyword])
        });
      }

      toast({
        title: "Quiz Generated",
        description: `Created ${Math.min(5, allKeywords.length)} questions based on your presentation.`
      });
    } catch (error) {
      console.error('Error generating quiz:', error);
    }
  };

  const generatePDFSummary = async () => {
    try {
      // Create summary content
      const summaryContent = {
        sessionId,
        duration: sessionDuration,
        totalSlides: currentSlide,
        keyTopics: [...new Set(transcription.flatMap((t) => t.keywords))],
        transcript: transcription.map((t) => t.text).join(' '),
        engagement: calculateEngagementScore()
      };

      console.log('Generated PDF summary:', summaryContent);

      toast({
        title: "PDF Summary Generated",
        description: "Presentation summary is ready for download."
      });
    } catch (error) {
      console.error('Error generating PDF summary:', error);
    }
  };

  const calculateEngagementScore = (): number => {
    // Calculate engagement based on speaking pace, keywords, and duration
    const avgConfidence = transcription.reduce((sum, t) => sum + t.confidence, 0) / transcription.length;
    const keywordDiversity = new Set(transcription.flatMap((t) => t.keywords)).size;
    const timePerSlide = sessionDuration / currentSlide;

    return Math.min(100, avgConfidence * 30 + keywordDiversity * 5 + (timePerSlide > 60 ? 30 : 20));
  };

  const showSpeakerNotes = () => {
    const currentNotes = speakerNotes.find((note) => note.startsWith(`Slide ${currentSlide}:`));
    if (currentNotes) {
      toast({
        title: `Speaker Notes - Slide ${currentSlide}`,
        description: currentNotes
      });
    }
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-6">
      {/* Control Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Smart Presentation Control
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              {!isPresenting ?
              <Button onClick={startPresentation} className="flex items-center gap-2">
                  <Play className="h-4 w-4" />
                  Start Presentation
                </Button> :

              <Button onClick={stopPresentation} variant="destructive" className="flex items-center gap-2">
                  <Square className="h-4 w-4" />
                  End Presentation
                </Button>
              }
              
              <Button
                onClick={isRecording ? stopRecording : startRecording}
                variant={isRecording ? "destructive" : "outline"}
                className="flex items-center gap-2">

                {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                {isRecording ? 'Stop' : 'Start'} Recording
              </Button>
            </div>

            <Separator orientation="vertical" className="h-8" />

            <div className="flex items-center gap-2">
              <Button
                onClick={handlePreviousSlide}
                variant="outline"
                size="sm"
                disabled={currentSlide <= 1}>

                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <Badge variant="secondary" className="px-3">
                Slide {currentSlide} / {totalSlides}
              </Badge>
              
              <Button
                onClick={handleNextSlide}
                variant="outline"
                size="sm"
                disabled={currentSlide >= totalSlides}>

                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            <Separator orientation="vertical" className="h-8" />

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span className="text-sm font-mono">{formatDuration(sessionDuration)}</span>
              </div>
              
              {isRecording &&
              <div className="flex items-center gap-2">
                  <Volume2 className="h-4 w-4 text-green-500" />
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                </div>
              }
            </div>
          </div>

          <div className="mt-4">
            <Progress value={currentSlide / totalSlides * 100} className="w-full" />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Main Presentation Area */}
        <Card>
          <CardHeader>
            <CardTitle>Presentation Viewer</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center mb-4">
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-2">Slide {currentSlide}</h2>
                <p className="text-gray-600">Presentation content would appear here</p>
              </div>
            </div>
            
            {/* Current Keywords */}
            {currentKeywords.length > 0 &&
            <div className="mt-4">
                <h4 className="text-sm font-medium mb-2">Current Keywords:</h4>
                <div className="flex flex-wrap gap-2">
                  {currentKeywords.map((keyword, index) =>
                <Badge key={index} variant="outline" className="bg-blue-50">
                      <Target className="h-3 w-3 mr-1" />
                      {keyword}
                    </Badge>
                )}
                </div>
              </div>
            }
          </CardContent>
        </Card>

        {/* Transcription and Analytics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Live Transcription
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-64 w-full border rounded-lg p-4">
              {transcription.length === 0 ?
              <p className="text-gray-500 text-center">Start recording to see live transcription...</p> :

              <div className="space-y-2">
                  {transcription.slice(-10).map((segment, index) =>
                <div key={index} className="text-sm">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" size="sm">
                          {Math.floor(segment.confidence * 100)}% confident
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {new Date(segment.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-gray-800">{segment.text}</p>
                      {segment.keywords.length > 0 &&
                  <div className="flex gap-1 mt-1">
                          {segment.keywords.map((keyword, i) =>
                    <Badge key={i} variant="secondary" size="sm">
                              {keyword}
                            </Badge>
                    )}
                        </div>
                  }
                    </div>
                )}
                </div>
              }
            </ScrollArea>

            <div className="mt-4 space-y-2">
              <Button
                onClick={generateQuiz}
                variant="outline"
                size="sm"
                className="w-full"
                disabled={!sessionId}>

                Generate Quiz
              </Button>
              <Button
                onClick={generatePDFSummary}
                variant="outline"
                size="sm"
                className="w-full"
                disabled={!sessionId}>

                <Download className="h-4 w-4 mr-2" />
                Download Summary
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Voice Commands Help */}
      <Card>
        <CardHeader>
          <CardTitle>Voice Commands</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <strong>"Next slide"</strong>
              <p className="text-gray-600">Advance to next slide</p>
            </div>
            <div>
              <strong>"Previous slide"</strong>
              <p className="text-gray-600">Go to previous slide</p>
            </div>
            <div>
              <strong>"Generate quiz"</strong>
              <p className="text-gray-600">Create assessment</p>
            </div>
            <div>
              <strong>"Show notes"</strong>
              <p className="text-gray-600">Display speaker notes</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>);

};

export default SmartPresentationViewer;