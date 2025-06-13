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
  Mic,
  MicOff,
  ChevronLeft,
  ChevronRight,
  Square,
  Volume2,
  Sparkles,
  FileText,
  Download,
  RotateCcw } from
'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'motion/react';

interface Presentation {
  id: number;
  title: string;
  filename: string;
  total_pages: number;
  file_id: number;
}

interface EnhancedVoiceViewerProps {
  presentation: Presentation;
  onEndSession: () => void;
}

const EnhancedVoiceViewer: React.FC<EnhancedVoiceViewerProps> = ({ presentation, onEndSession }) => {
  const [currentSlide, setCurrentSlide] = useState(1);
  const [isListening, setIsListening] = useState(false);
  const [isPresenting, setIsPresenting] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [keywords, setKeywords] = useState<string[]>([]);
  const [speakerNotes, setSpeakerNotes] = useState('');
  const [sessionTime, setSessionTime] = useState(0);
  const [highlightedText, setHighlightedText] = useState('');
  const recognitionRef = useRef<any>(null);
  const sessionStartRef = useRef<Date | null>(null);
  const { toast } = useToast();

  // Mock slide content for demonstration
  const mockSlideContent = [
  {
    title: "Welcome to Our Presentation",
    content: "Introduction to voice-controlled presentations with AI assistance",
    keywords: ["welcome", "introduction", "voice", "AI", "presentation"]
  },
  {
    title: "Key Features",
    content: "Voice navigation, keyword highlighting, automatic speaker notes generation",
    keywords: ["features", "voice", "navigation", "keywords", "notes", "automatic"]
  },
  {
    title: "How It Works",
    content: "Speak naturally and the system will follow your presentation flow",
    keywords: ["how", "works", "speak", "naturally", "system", "flow"]
  },
  {
    title: "Benefits",
    content: "Hands-free presentation, engaging audience interaction, real-time feedback",
    keywords: ["benefits", "hands-free", "engaging", "audience", "interaction", "feedback"]
  },
  {
    title: "Thank You",
    content: "Questions and discussion time",
    keywords: ["thank", "questions", "discussion", "time"]
  }];


  const getCurrentSlideData = () => {
    const index = Math.min(currentSlide - 1, mockSlideContent.length - 1);
    return mockSlideContent[index] || mockSlideContent[0];
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPresenting) {
      interval = setInterval(() => {
        setSessionTime((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPresenting]);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        setTranscript(finalTranscript + interimTranscript);
        processVoiceCommands(finalTranscript + interimTranscript);
        detectKeywords(finalTranscript + interimTranscript);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };
    }
  }, []);

  const processVoiceCommands = (text: string) => {
    const lowerText = text.toLowerCase();

    if (lowerText.includes('next slide') || lowerText.includes('next page')) {
      nextSlide();
    } else if (lowerText.includes('previous slide') || lowerText.includes('back slide') || lowerText.includes('go back')) {
      previousSlide();
    } else if (lowerText.includes('first slide') || lowerText.includes('start over')) {
      setCurrentSlide(1);
    } else if (lowerText.includes('last slide') || lowerText.includes('final slide')) {
      setCurrentSlide(presentation.total_pages);
    }
  };

  const detectKeywords = (text: string) => {
    const slideData = getCurrentSlideData();
    const detectedKeywords = slideData.keywords.filter((keyword) =>
    text.toLowerCase().includes(keyword.toLowerCase())
    );

    if (detectedKeywords.length > 0) {
      setKeywords(detectedKeywords);
      setHighlightedText(detectedKeywords.join(', '));

      // Generate speaker notes based on current context
      generateSpeakerNotes(slideData, detectedKeywords);
    }
  };

  const generateSpeakerNotes = (slideData: any, detectedKeywords: string[]) => {
    const notes = `
Current Slide: ${slideData.title}

Key Points Mentioned:
${detectedKeywords.map((k) => `• ${k.charAt(0).toUpperCase() + k.slice(1)}`).join('\n')}

Suggested Continuation:
• Elaborate on ${detectedKeywords[0] || 'main topic'}
• Connect to audience experience
• Provide relevant examples
• Transition to next key point

Time Spent: ${Math.floor(sessionTime / 60)}:${(sessionTime % 60).toString().padStart(2, '0')}
    `.trim();

    setSpeakerNotes(notes);
  };

  const startPresentation = () => {
    setIsPresenting(true);
    sessionStartRef.current = new Date();
    startListening();
    toast({
      title: "Presentation Started!",
      description: "Voice control is now active. Speak naturally to navigate."
    });
  };

  const endPresentation = () => {
    setIsPresenting(false);
    stopListening();
    onEndSession();
    toast({
      title: "Session Ended",
      description: "Your presentation session has been completed."
    });
  };

  const startListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (error) {
        console.error('Failed to start speech recognition:', error);
        toast({
          title: "Voice Recognition Error",
          description: "Could not start voice recognition. Please check microphone permissions.",
          variant: "destructive"
        });
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const nextSlide = () => {
    if (currentSlide < presentation.total_pages) {
      setCurrentSlide((prev) => prev + 1);
      toast({
        title: "Next Slide",
        description: `Moved to slide ${currentSlide + 1}`
      });
    }
  };

  const previousSlide = () => {
    if (currentSlide > 1) {
      setCurrentSlide((prev) => prev - 1);
      toast({
        title: "Previous Slide",
        description: `Moved to slide ${currentSlide - 1}`
      });
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const generateAISummary = () => {
    const summary = `
# Presentation Summary: ${presentation.title}

## Session Details
- Duration: ${formatTime(sessionTime)}
- Total Slides: ${presentation.total_pages}
- Slides Covered: ${currentSlide}

## Key Topics Discussed
${keywords.map((k) => `• ${k.charAt(0).toUpperCase() + k.slice(1)}`).join('\n')}

## Transcript Highlights
${transcript.split('.').slice(0, 3).join('. ')}...

## Generated Insights
- Presentation flow was natural and engaging
- Key concepts were well-explained
- Audience engagement points identified
- Suggested improvements for future sessions

---
Generated by AI Voice Presentation Platform
    `.trim();

    // Create downloadable file
    const blob = new Blob([summary], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${presentation.title}_summary.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Summary Generated!",
      description: "AI-generated summary has been downloaded."
    });
  };

  const generateQuiz = () => {
    const quiz = `
# Quiz: ${presentation.title}

## Multiple Choice Questions

1. What is the main topic of this presentation?
   a) Voice control technology
   b) AI-powered presentations
   c) Slide navigation
   d) All of the above
   
   **Answer: d) All of the above**

2. Which voice command moves to the next slide?
   a) "Go forward"
   b) "Next slide"
   c) "Continue"
   d) Both a and b
   
   **Answer: b) "Next slide"**

## Theory Questions

1. Explain the benefits of voice-controlled presentations.

2. How does AI keyword detection enhance presentation delivery?

3. What role do speaker notes play in effective presentations?

## Discussion Points
- Share your experience with voice-controlled presentations
- Discuss potential improvements for the platform
- How would you implement this in your organization?

---
Generated Quiz based on session content
    `.trim();

    const blob = new Blob([quiz], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${presentation.title}_quiz.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Quiz Generated!",
      description: "AI-generated quiz has been downloaded."
    });
  };

  const slideData = getCurrentSlideData();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-screen p-4">
      {/* Main Slide Viewer */}
      <div className="lg:col-span-2 space-y-4">
        <Card className="border-0 shadow-lg h-full">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                {presentation.title}
              </CardTitle>
              <div className="flex items-center gap-2">
                {isPresenting &&
                <Badge variant="destructive" className="animate-pulse">
                    <Volume2 className="h-3 w-3 mr-1" />
                    LIVE
                  </Badge>
                }
                <Badge variant="outline">
                  {currentSlide} / {presentation.total_pages}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-1">
            {/* Slide Display Area */}
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-gradient-to-br from-blue-50 to-purple-50 p-8 rounded-lg h-96 flex flex-col justify-center items-center text-center border-2 border-dashed border-blue-200">

              <h2 className="text-2xl font-bold mb-4 text-gray-800">
                {slideData.title}
              </h2>
              <p className="text-gray-600 mb-6">
                {slideData.content}
              </p>
              {highlightedText &&
              <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-3">
                  <p className="text-sm font-medium text-yellow-800">
                    Highlighted: {highlightedText}
                  </p>
                </div>
              }
            </motion.div>

            {/* Controls */}
            <div className="flex items-center justify-between mt-6">
              <div className="flex gap-2">
                <Button
                  onClick={previousSlide}
                  disabled={currentSlide === 1}
                  variant="outline"
                  size="sm">

                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  onClick={nextSlide}
                  disabled={currentSlide === presentation.total_pages}
                  variant="outline"
                  size="sm">

                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex gap-2">
                {!isPresenting ?
                <Button onClick={startPresentation} className="bg-green-600 hover:bg-green-700">
                    <Play className="h-4 w-4 mr-2" />
                    Start Presentation
                  </Button> :

                <>
                    <Button
                    onClick={isListening ? stopListening : startListening}
                    variant={isListening ? "destructive" : "default"}>

                      {isListening ? <MicOff className="h-4 w-4 mr-2" /> : <Mic className="h-4 w-4 mr-2" />}
                      {isListening ? 'Stop Voice' : 'Start Voice'}
                    </Button>
                    <Button onClick={endPresentation} variant="outline">
                      <Square className="h-4 w-4 mr-2" />
                      End Session
                    </Button>
                  </>
                }
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Side Panel */}
      <div className="space-y-4">
        {/* Session Info */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Session Info
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm">
              <span>Duration:</span>
              <span className="font-mono">{formatTime(sessionTime)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Progress:</span>
              <span>{Math.round(currentSlide / presentation.total_pages * 100)}%</span>
            </div>
            <Progress value={currentSlide / presentation.total_pages * 100} className="h-2" />
          </CardContent>
        </Card>

        {/* Keywords */}
        {keywords.length > 0 &&
        <Card className="border-0 shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Live Keywords</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-1">
                {keywords.map((keyword, index) =>
              <Badge key={index} variant="secondary" className="text-xs">
                    {keyword}
                  </Badge>
              )}
              </div>
            </CardContent>
          </Card>
        }

        {/* Speaker Notes */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Speaker Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-32">
              <pre className="text-xs text-gray-600 whitespace-pre-wrap">
                {speakerNotes || 'Start speaking to generate notes...'}
              </pre>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Live Transcript */}
        {isListening &&
        <Card className="border-0 shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Mic className="h-4 w-4" />
                Live Transcript
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-24">
                <p className="text-xs text-gray-600">
                  {transcript || 'Listening...'}
                </p>
              </ScrollArea>
            </CardContent>
          </Card>
        }

        {/* AI Actions */}
        {isPresenting &&
        <Card className="border-0 shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">AI Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button onClick={generateAISummary} size="sm" className="w-full" variant="outline">
                <Download className="h-3 w-3 mr-2" />
                Generate Summary
              </Button>
              <Button onClick={generateQuiz} size="sm" className="w-full" variant="outline">
                <FileText className="h-3 w-3 mr-2" />
                Generate Quiz
              </Button>
            </CardContent>
          </Card>
        }
      </div>
    </div>);

};

export default EnhancedVoiceViewer;