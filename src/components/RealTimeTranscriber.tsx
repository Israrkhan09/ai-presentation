import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Activity,
  Brain,
  Gauge,
  TrendingUp
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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

interface RealTimeTranscriberProps {
  sessionId: number | null;
  currentSlide: number;
  onTranscription: (data: TranscriptionData) => void;
  onKeywordsDetected: (keywords: string[]) => void;
  onVoiceCommand: (command: string) => void;
  isActive: boolean;
}

const RealTimeTranscriber: React.FC<RealTimeTranscriberProps> = ({
  sessionId,
  currentSlide,
  onTranscription,
  onKeywordsDetected,
  onVoiceCommand,
  isActive
}) => {
  const { toast } = useToast();
  const [isRecording, setIsRecording] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [currentText, setCurrentText] = useState('');
  const [audioLevel, setAudioLevel] = useState(0);
  const [transcriptions, setTranscriptions] = useState<TranscriptionData[]>([]);
  const [totalWords, setTotalWords] = useState(0);
  const [avgConfidence, setAvgConfidence] = useState(0);
  const [currentPace, setCurrentPace] = useState(0);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const microphoneRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const animationRef = useRef<number | null>(null);

  // Voice command patterns
  const voiceCommands = {
    navigation: [
      { pattern: /next\s+slide/i, command: 'next' },
      { pattern: /previous\s+slide/i, command: 'previous' },
      { pattern: /go\s+to\s+slide\s+(\d+)/i, command: 'goto' },
      { pattern: /first\s+slide/i, command: 'first' },
      { pattern: /last\s+slide/i, command: 'last' }
    ],
    control: [
      { pattern: /start\s+recording/i, command: 'start_recording' },
      { pattern: /stop\s+recording/i, command: 'stop_recording' },
      { pattern: /pause\s+presentation/i, command: 'pause' },
      { pattern: /resume\s+presentation/i, command: 'resume' }
    ],
    generation: [
      { pattern: /generate\s+quiz/i, command: 'generate_quiz' },
      { pattern: /create\s+summary/i, command: 'create_summary' },
      { pattern: /download\s+notes/i, command: 'download_notes' },
      { pattern: /show\s+keywords/i, command: 'show_keywords' }
    ]
  };

  // Initialize speech recognition and audio analysis
  useEffect(() => {
    if (!isActive) return;

    initializeSpeechRecognition();
    initializeAudioAnalysis();

    return () => {
      cleanup();
    };
  }, [isActive]);

  const initializeSpeechRecognition = () => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const recognition = new (window as any).webkitSpeechRecognition();
      
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      recognition.maxAlternatives = 3;

      recognition.onstart = () => {
        setIsListening(true);
        console.log('Speech recognition started');
      };

      recognition.onend = () => {
        setIsListening(false);
        console.log('Speech recognition ended');
        
        // Auto-restart if still recording
        if (isRecording && isActive) {
          setTimeout(() => {
            try {
              recognition.start();
            } catch (error) {
              console.error('Error restarting recognition:', error);
            }
          }, 100);
        }
      };

      recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          const confidence = event.results[i][0].confidence;

          if (event.results[i].isFinal) {
            finalTranscript += transcript;
            processTranscription(transcript, confidence);
          } else {
            interimTranscript += transcript;
          }
        }

        setCurrentText(finalTranscript + interimTranscript);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        
        if (event.error === 'not-allowed') {
          toast({
            title: "Microphone Access Denied",
            description: "Please allow microphone access for transcription features.",
            variant: "destructive",
          });
        } else if (event.error === 'network') {
          toast({
            title: "Network Error",
            description: "Speech recognition requires an internet connection.",
            variant: "destructive",
          });
        }
      };

      recognitionRef.current = recognition;
    } else {
      toast({
        title: "Speech Recognition Not Supported",
        description: "Your browser doesn't support speech recognition.",
        variant: "destructive",
      });
    }
  };

  const initializeAudioAnalysis = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      const microphone = audioContext.createMediaStreamSource(stream);
      
      analyser.fftSize = 256;
      microphone.connect(analyser);
      
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      microphoneRef.current = microphone;
      
      startAudioLevelMonitoring();
    } catch (error) {
      console.error('Error initializing audio analysis:', error);
    }
  };

  const startAudioLevelMonitoring = () => {
    if (!analyserRef.current) return;

    const analyser = analyserRef.current;
    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    const updateAudioLevel = () => {
      analyser.getByteFrequencyData(dataArray);
      const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
      const normalizedLevel = Math.min(100, (average / 255) * 100);
      
      setAudioLevel(normalizedLevel);
      
      if (isRecording) {
        animationRef.current = requestAnimationFrame(updateAudioLevel);
      }
    };

    updateAudioLevel();
  };

  const processTranscription = useCallback(async (text: string, confidence: number) => {
    const transcriptionData: TranscriptionData = {
      id: `${Date.now()}-${Math.random()}`,
      text: text.trim(),
      timestamp: new Date(),
      confidence,
      keywords: extractKeywords(text),
      emotion: analyzeEmotion(text),
      speakingPace: calculateSpeakingPace(text),
      slideNumber: currentSlide
    };

    // Update local state
    setTranscriptions(prev => [...prev, transcriptionData]);
    setTotalWords(prev => prev + text.split(/\s+/).length);
    setAvgConfidence(prev => {
      const total = transcriptions.length + 1;
      return ((prev * (total - 1)) + confidence) / total;
    });
    setCurrentPace(transcriptionData.speakingPace);

    // Send to parent components
    onTranscription(transcriptionData);
    onKeywordsDetected(transcriptionData.keywords);

    // Check for voice commands
    checkVoiceCommands(text);

    // Store in database
    if (sessionId) {
      try {
        const { error } = await window.ezsite.apis.tableCreate('16752', {
          session_id: sessionId,
          slide_number: currentSlide,
          transcript_text: text,
          timestamp: new Date().toISOString(),
          confidence_score: confidence,
          keywords_detected: JSON.stringify(transcriptionData.keywords),
          emotion_tone: transcriptionData.emotion,
          speaking_pace: transcriptionData.speakingPace
        });

        if (error) {
          console.error('Error saving transcription:', error);
        }
      } catch (error) {
        console.error('Database error:', error);
      }
    }
  }, [sessionId, currentSlide, transcriptions.length, onTranscription, onKeywordsDetected]);

  const extractKeywords = (text: string): string[] => {
    const stopWords = new Set([
      'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 
      'from', 'up', 'about', 'into', 'through', 'during', 'before', 'after', 'above', 
      'below', 'under', 'between', 'among', 'within', 'without', 'toward', 'towards',
      'a', 'an', 'as', 'are', 'was', 'were', 'been', 'be', 'have', 'has', 'had', 
      'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can',
      'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they',
      'my', 'your', 'his', 'her', 'its', 'our', 'their', 'me', 'him', 'us', 'them'
    ]);

    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => 
        word.length > 3 && 
        !stopWords.has(word) && 
        !/^\d+$/.test(word)
      );

    // Count word frequency
    const wordCount = words.reduce((acc, word) => {
      acc[word] = (acc[word] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Sort by frequency and return top keywords
    return Object.entries(wordCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([word]) => word);
  };

  const analyzeEmotion = (text: string): string => {
    const emotionKeywords = {
      positive: ['great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'good', 'best', 'love', 'happy', 'excited'],
      negative: ['bad', 'terrible', 'awful', 'worst', 'hate', 'sad', 'angry', 'frustrated', 'difficult', 'problem'],
      neutral: ['okay', 'fine', 'normal', 'standard', 'regular', 'usual', 'typical']
    };

    const words = text.toLowerCase().split(/\s+/);
    const scores = {
      positive: 0,
      negative: 0,
      neutral: 0
    };

    words.forEach(word => {
      Object.entries(emotionKeywords).forEach(([emotion, keywords]) => {
        if (keywords.includes(word)) {
          scores[emotion as keyof typeof scores]++;
        }
      });
    });

    const maxScore = Math.max(...Object.values(scores));
    if (maxScore === 0) return 'neutral';

    return Object.entries(scores).find(([, score]) => score === maxScore)?.[0] || 'neutral';
  };

  const calculateSpeakingPace = (text: string): number => {
    const wordCount = text.split(/\s+/).length;
    const timeWindow = 10; // seconds
    return Math.round((wordCount / timeWindow) * 60);
  };

  const checkVoiceCommands = (text: string) => {
    const allCommands = [
      ...voiceCommands.navigation,
      ...voiceCommands.control,
      ...voiceCommands.generation
    ];

    for (const { pattern, command } of allCommands) {
      const match = text.match(pattern);
      if (match) {
        console.log('Voice command detected:', command);
        
        let commandData = command;
        if (command === 'goto' && match[1]) {
          commandData = `goto_${match[1]}`;
        }
        
        onVoiceCommand(commandData);
        
        toast({
          title: "Voice Command Detected",
          description: `Executing: ${command.replace('_', ' ')}`,
        });
        
        break;
      }
    }
  };

  const startRecording = () => {
    if (recognitionRef.current && !isRecording) {
      try {
        recognitionRef.current.start();
        setIsRecording(true);
        startAudioLevelMonitoring();
        
        toast({
          title: "Recording Started",
          description: "Real-time transcription and analysis active.",
        });
      } catch (error) {
        console.error('Error starting recording:', error);
        toast({
          title: "Recording Error",
          description: "Failed to start speech recognition.",
          variant: "destructive",
        });
      }
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
      setIsListening(false);
      
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      
      toast({
        title: "Recording Stopped",
        description: "Transcription data has been saved.",
      });
    }
  };

  const cleanup = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  };

  const getEmotionColor = (emotion: string): string => {
    switch (emotion) {
      case 'positive': return 'text-green-600';
      case 'negative': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getPaceColor = (pace: number): string => {
    if (pace < 120) return 'text-orange-600'; // Too slow
    if (pace > 180) return 'text-red-600'; // Too fast
    return 'text-green-600'; // Good pace
  };

  return (
    <div className="w-full space-y-4">
      {/* Control Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Real-Time Transcription
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Button
              onClick={isRecording ? stopRecording : startRecording}
              variant={isRecording ? "destructive" : "default"}
              className="flex items-center gap-2"
              disabled={!isActive}
            >
              {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              {isRecording ? 'Stop Recording' : 'Start Recording'}
            </Button>

            {isRecording && (
              <>
                <div className="flex items-center gap-2">
                  {isListening ? (
                    <Volume2 className="h-4 w-4 text-green-500" />
                  ) : (
                    <VolumeX className="h-4 w-4 text-gray-400" />
                  )}
                  <div className={`w-2 h-2 rounded-full ${isListening ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                </div>

                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  <Progress value={audioLevel} className="w-20" />
                  <span className="text-xs">{Math.round(audioLevel)}%</span>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Analytics Panel */}
      {isRecording && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Gauge className="h-4 w-4" />
                <span className="text-sm font-medium">Speaking Pace</span>
              </div>
              <div className={`text-2xl font-bold ${getPaceColor(currentPace)}`}>
                {currentPace} WPM
              </div>
              <p className="text-xs text-gray-500">
                Optimal: 120-180 WPM
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                <span className="text-sm font-medium">Confidence</span>
              </div>
              <div className="text-2xl font-bold">
                {Math.round(avgConfidence * 100)}%
              </div>
              <p className="text-xs text-gray-500">
                Recognition accuracy
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Brain className="h-4 w-4" />
                <span className="text-sm font-medium">Total Words</span>
              </div>
              <div className="text-2xl font-bold">
                {totalWords}
              </div>
              <p className="text-xs text-gray-500">
                Words transcribed
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Live Transcription */}
      <Card>
        <CardHeader>
          <CardTitle>Live Transcription</CardTitle>
        </CardHeader>
        <CardContent>
          {currentText && (
            <div className="mb-4 p-3 bg-blue-50 rounded-lg border">
              <p className="text-sm text-blue-800 font-medium">Current Speech:</p>
              <p className="text-blue-900">{currentText}</p>
            </div>
          )}

          <ScrollArea className="h-48 w-full border rounded-lg p-4">
            {transcriptions.length === 0 ? (
              <p className="text-gray-500 text-center">
                {isRecording ? 'Listening for speech...' : 'Start recording to see transcription'}
              </p>
            ) : (
              <div className="space-y-3">
                {transcriptions.slice(-10).map((transcription) => (
                  <div key={transcription.id} className="border-b pb-2">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" size="sm">
                        Slide {transcription.slideNumber}
                      </Badge>
                      <Badge variant="secondary" size="sm">
                        {Math.round(transcription.confidence * 100)}%
                      </Badge>
                      <Badge variant="outline" size="sm" className={getEmotionColor(transcription.emotion)}>
                        {transcription.emotion}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {transcription.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-800 mb-1">{transcription.text}</p>
                    
                    {transcription.keywords.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {transcription.keywords.map((keyword, i) => (
                          <Badge key={i} variant="secondary" size="sm">
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Voice Commands Reference */}
      <Card>
        <CardHeader>
          <CardTitle>Available Voice Commands</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">Navigation</h4>
              <ul className="space-y-1 text-gray-600">
                <li>"Next slide"</li>
                <li>"Previous slide"</li>
                <li>"Go to slide [number]"</li>
                <li>"First slide"</li>
                <li>"Last slide"</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Control</h4>
              <ul className="space-y-1 text-gray-600">
                <li>"Start recording"</li>
                <li>"Stop recording"</li>
                <li>"Pause presentation"</li>
                <li>"Resume presentation"</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Generation</h4>
              <ul className="space-y-1 text-gray-600">
                <li>"Generate quiz"</li>
                <li>"Create summary"</li>
                <li>"Download notes"</li>
                <li>"Show keywords"</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RealTimeTranscriber;
