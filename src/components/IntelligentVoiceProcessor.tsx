
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Mic, 
  MicOff, 
  Brain, 
  MessageCircle, 
  Target, 
  Zap,
  Volume2,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react';
import { nlpProcessor } from '@/lib/nlp-processor';
import { useToast } from '@/hooks/use-toast';

interface VoiceCommand {
  id: string;
  timestamp: Date;
  transcription: string;
  intent: string;
  confidence: number;
  executed: boolean;
  response: string;
}

interface IntelligentVoiceProcessorProps {
  onCommand?: (command: VoiceCommand) => void;
  className?: string;
}

const IntelligentVoiceProcessor: React.FC<IntelligentVoiceProcessorProps> = ({
  onCommand,
  className = ''
}) => {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [commands, setCommands] = useState<VoiceCommand[]>([]);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
  const [confidence, setConfidence] = useState(0);
  const [conversationContext, setConversationContext] = useState({
    previousQueries: [] as string[],
    currentTopic: '',
    userIntent: '',
    confidence: 0
  });

  const { toast } = useToast();
  const conversationRef = useRef<string[]>([]);

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const speechRecognition = new (window as any).webkitSpeechRecognition();
      speechRecognition.continuous = true;
      speechRecognition.interimResults = true;
      speechRecognition.lang = 'en-US';

      speechRecognition.onstart = () => {
        console.log('🎤 Voice recognition started');
        setIsListening(true);
      };

      speechRecognition.onresult = async (event: SpeechRecognitionEvent) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          const confidence = event.results[i][0].confidence;

          if (event.results[i].isFinal) {
            finalTranscript += transcript;
            setConfidence(confidence);
          } else {
            interimTranscript += transcript;
          }
        }

        setCurrentTranscript(finalTranscript || interimTranscript);

        // Process final transcript
        if (finalTranscript) {
          await processVoiceCommand(finalTranscript, confidence);
        }
      };

      speechRecognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        
        toast({
          title: "Voice Recognition Error",
          description: `Error: ${event.error}. Please try again.`,
          variant: "destructive"
        });
      };

      speechRecognition.onend = () => {
        console.log('🎤 Voice recognition ended');
        setIsListening(false);
      };

      setRecognition(speechRecognition);
    } else {
      toast({
        title: "Voice Recognition Not Supported",
        description: "Your browser doesn't support voice recognition.",
        variant: "destructive"
      });
    }
  }, [toast]);

  // Process voice command with NLP
  const processVoiceCommand = useCallback(async (transcript: string, confidence: number) => {
    if (!transcript.trim()) return;

    setIsProcessing(true);

    try {
      console.log('🧠 Processing voice command:', transcript);

      // Update conversation context
      conversationRef.current = [...conversationRef.current.slice(-4), transcript];
      const context = {
        previousQueries: conversationRef.current,
        currentTopic: conversationRef.current[conversationRef.current.length - 1] || '',
        userIntent: '',
        confidence
      };

      // Analyze intent using NLP
      const intentAnalysis = await nlpProcessor.analyzeIntent(transcript, context);

      // Create command object
      const command: VoiceCommand = {
        id: Date.now().toString(),
        timestamp: new Date(),
        transcription: transcript,
        intent: intentAnalysis.intent,
        confidence: intentAnalysis.confidence,
        executed: false,
        response: intentAnalysis.response
      };

      // Update state
      setCommands(prev => [command, ...prev.slice(0, 9)]); // Keep last 10 commands
      setConversationContext(context);

      // Execute command if confidence is high enough
      if (intentAnalysis.confidence > 0.7) {
        command.executed = true;
        await executeCommand(command);
      }

      // Callback
      onCommand?.(command);

      // Speak response
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(intentAnalysis.response);
        utterance.rate = 0.8;
        utterance.pitch = 1;
        window.speechSynthesis.speak(utterance);
      }

      setCurrentTranscript('');

      toast({
        title: "Command Processed",
        description: `Intent: ${intentAnalysis.intent} (${(intentAnalysis.confidence * 100).toFixed(0)}% confidence)`,
      });

    } catch (error) {
      console.error('Error processing voice command:', error);
      toast({
        title: "Processing Error",
        description: "Failed to process voice command. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  }, [onCommand, toast]);

  // Execute specific commands
  const executeCommand = async (command: VoiceCommand) => {
    console.log('⚡ Executing command:', command.intent);

    switch (command.intent) {
      case 'navigate_next':
        // Trigger next slide navigation
        window.dispatchEvent(new CustomEvent('voice-command', { 
          detail: { action: 'next-slide' } 
        }));
        break;
        
      case 'navigate_back':
        // Trigger previous slide navigation
        window.dispatchEvent(new CustomEvent('voice-command', { 
          detail: { action: 'prev-slide' } 
        }));
        break;
        
      case 'navigate_to_slide':
        const slideNumber = command.transcription.match(/\b(\d+)\b/)?.[1];
        if (slideNumber) {
          window.dispatchEvent(new CustomEvent('voice-command', { 
            detail: { action: 'goto-slide', slideNumber: parseInt(slideNumber) } 
          }));
        }
        break;
        
      case 'start_presentation':
        window.dispatchEvent(new CustomEvent('voice-command', { 
          detail: { action: 'start-presentation' } 
        }));
        break;
        
      case 'stop_presentation':
        window.dispatchEvent(new CustomEvent('voice-command', { 
          detail: { action: 'stop-presentation' } 
        }));
        break;
        
      case 'toggle_fullscreen':
        window.dispatchEvent(new CustomEvent('voice-command', { 
          detail: { action: 'toggle-fullscreen' } 
        }));
        break;
        
      case 'generate_summary':
        window.dispatchEvent(new CustomEvent('voice-command', { 
          detail: { action: 'generate-summary' } 
        }));
        break;
        
      case 'generate_quiz':
        window.dispatchEvent(new CustomEvent('voice-command', { 
          detail: { action: 'generate-quiz' } 
        }));
        break;
        
      default:
        console.log('Unknown command intent:', command.intent);
    }
  };

  // Start/stop listening
  const toggleListening = useCallback(() => {
    if (!recognition) {
      toast({
        title: "Voice Recognition Unavailable",
        description: "Speech recognition is not supported in your browser.",
        variant: "destructive"
      });
      return;
    }

    if (isListening) {
      recognition.stop();
    } else {
      recognition.start();
    }
  }, [recognition, isListening, toast]);

  // Clear conversation history
  const clearHistory = () => {
    setCommands([]);
    conversationRef.current = [];
    setConversationContext({
      previousQueries: [],
      currentTopic: '',
      userIntent: '',
      confidence: 0
    });
    setCurrentTranscript('');
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'bg-green-500';
    if (confidence >= 0.6) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getIntentBadgeColor = (intent: string) => {
    const colors: Record<string, string> = {
      'navigate_next': 'bg-blue-100 text-blue-800',
      'navigate_back': 'bg-blue-100 text-blue-800',
      'navigate_to_slide': 'bg-blue-100 text-blue-800',
      'start_presentation': 'bg-green-100 text-green-800',
      'stop_presentation': 'bg-red-100 text-red-800',
      'generate_summary': 'bg-purple-100 text-purple-800',
      'generate_quiz': 'bg-orange-100 text-orange-800',
      'unknown': 'bg-gray-100 text-gray-800'
    };
    return colors[intent] || 'bg-gray-100 text-gray-800';
  };

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-purple-600" />
          Intelligent Voice Processor
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Voice Control */}
        <div className="flex items-center gap-4">
          <Button
            onClick={toggleListening}
            disabled={!recognition}
            variant={isListening ? "destructive" : "default"}
            className="flex items-center gap-2"
          >
            {isListening ? (
              <>
                <MicOff className="h-4 w-4" />
                Stop Listening
              </>
            ) : (
              <>
                <Mic className="h-4 w-4" />
                Start Listening
              </>
            )}
          </Button>

          <Button
            onClick={clearHistory}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Clear History
          </Button>

          {isListening && (
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-red-600">Listening...</span>
            </div>
          )}
        </div>

        {/* Current Transcript */}
        {(currentTranscript || isProcessing) && (
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Volume2 className="h-5 w-5 text-blue-600 mt-1 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-medium text-blue-800 mb-1">Current Input</p>
                  {isProcessing ? (
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 animate-spin" />
                      <span className="text-sm">Processing with AI...</span>
                    </div>
                  ) : (
                    <p className="text-blue-700">{currentTranscript}</p>
                  )}
                  {confidence > 0 && (
                    <div className="mt-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-blue-600">Confidence:</span>
                        <div className="flex-1 max-w-32">
                          <Progress 
                            value={confidence * 100} 
                            className="h-2"
                          />
                        </div>
                        <span className="text-xs font-medium text-blue-800">
                          {(confidence * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Command History */}
        <div>
          <h3 className="font-medium mb-3 flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            Voice Command History
          </h3>
          
          {commands.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Mic className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No voice commands yet. Start speaking to see your commands here.</p>
            </div>
          ) : (
            <ScrollArea className="h-96">
              <div className="space-y-3">
                {commands.map((command) => (
                  <Card key={command.id} className="p-4">
                    <div className="space-y-3">
                      {/* Command Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <Badge className={getIntentBadgeColor(command.intent)}>
                            {command.intent.replace('_', ' ')}
                          </Badge>
                          <div className="flex items-center gap-1">
                            <div className={`w-2 h-2 rounded-full ${getConfidenceColor(command.confidence)}`}></div>
                            <span className="text-xs text-gray-500">
                              {(command.confidence * 100).toFixed(0)}%
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {command.executed && (
                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                              <Target className="h-3 w-3 mr-1" />
                              Executed
                            </Badge>
                          )}
                          <span className="text-xs text-gray-500">
                            {command.timestamp.toLocaleTimeString()}
                          </span>
                        </div>
                      </div>

                      {/* Transcription */}
                      <div>
                        <p className="font-medium text-sm text-gray-600 mb-1">You said:</p>
                        <p className="text-gray-800 bg-gray-50 p-2 rounded text-sm">
                          "{command.transcription}"
                        </p>
                      </div>

                      {/* AI Response */}
                      <div>
                        <p className="font-medium text-sm text-gray-600 mb-1">AI Response:</p>
                        <p className="text-gray-700 text-sm italic">
                          {command.response}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>

        {/* Conversation Context */}
        {conversationContext.previousQueries.length > 0 && (
          <Card className="bg-gray-50">
            <CardHeader>
              <CardTitle className="text-sm">Conversation Context</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <span className="text-xs font-medium text-gray-600">Current Topic: </span>
                <span className="text-xs">{conversationContext.currentTopic || 'None'}</span>
              </div>
              <div>
                <span className="text-xs font-medium text-gray-600">Recent Queries: </span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {conversationContext.previousQueries.slice(-3).map((query, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {query.slice(0, 20)}...
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
};

export default IntelligentVoiceProcessor;
