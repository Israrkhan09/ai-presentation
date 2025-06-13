import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Play,
  Pause,
  Square,
  Mic,
  MicOff,
  Clock,
  MessageCircle,
  FileText,
  Volume2,
  VolumeX } from
'lucide-react';

interface SessionData {
  presentationId: number;
  presentationTitle: string;
  startTime: Date;
  endTime?: Date;
  duration: number;
  spokenContent: string[];
  slideTransitions: number[];
  voiceCommands: string[];
  isActive: boolean;
}

interface SessionManagerProps {
  presentationId: number;
  presentationTitle: string;
  onSessionEnd: (sessionData: SessionData) => void;
  onVoiceCommand: (command: string) => void;
}

const SessionManager: React.FC<SessionManagerProps> = ({
  presentationId,
  presentationTitle,
  onSessionEnd,
  onVoiceCommand
}) => {
  const [session, setSession] = useState<SessionData>({
    presentationId,
    presentationTitle,
    startTime: new Date(),
    duration: 0,
    spokenContent: [],
    slideTransitions: [],
    voiceCommands: [],
    isActive: false
  });

  const [isRecording, setIsRecording] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(1);
  const [lastSpokenText, setLastSpokenText] = useState('');
  const [voiceEnabled, setVoiceEnabled] = useState(true);

  const intervalRef = useRef<NodeJS.Timeout>();
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();

      if (recognitionRef.current) {
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'en-US';

        recognitionRef.current.onresult = (event) => {
          let finalTranscript = '';
          let interimTranscript = '';

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcript;
            } else {
              interimTranscript += transcript;
            }
          }

          if (finalTranscript) {
            setLastSpokenText(finalTranscript);
            setSession((prev) => ({
              ...prev,
              spokenContent: [...prev.spokenContent, finalTranscript]
            }));

            // Check for voice commands
            const command = detectVoiceCommand(finalTranscript.toLowerCase());
            if (command) {
              setSession((prev) => ({
                ...prev,
                voiceCommands: [...prev.voiceCommands, command]
              }));
              onVoiceCommand(command);
            }
          }
        };

        recognitionRef.current.onerror = (event) => {
          console.error('Speech recognition error:', event.error);
        };
      }
    }
  }, [onVoiceCommand]);

  // Voice command detection
  const detectVoiceCommand = (text: string): string | null => {
    const commands = [
    { pattern: /next slide|go forward|slide forward/, command: 'NEXT_SLIDE' },
    { pattern: /previous slide|go back|slide back/, command: 'PREV_SLIDE' },
    { pattern: /first slide|go to start/, command: 'FIRST_SLIDE' },
    { pattern: /last slide|go to end/, command: 'LAST_SLIDE' },
    { pattern: /pause presentation/, command: 'PAUSE' },
    { pattern: /resume presentation/, command: 'RESUME' },
    { pattern: /end session|stop presentation/, command: 'END_SESSION' }];


    for (const cmd of commands) {
      if (cmd.pattern.test(text)) {
        return cmd.command;
      }
    }
    return null;
  };

  // Start session
  const startSession = () => {
    setSession((prev) => ({
      ...prev,
      isActive: true,
      startTime: new Date()
    }));

    // Start duration timer
    intervalRef.current = setInterval(() => {
      setSession((prev) => ({
        ...prev,
        duration: prev.duration + 1
      }));
    }, 1000);

    // Start voice recording if enabled
    if (voiceEnabled && recognitionRef.current) {
      startVoiceRecording();
    }
  };

  // End session
  const endSession = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    const finalSession = {
      ...session,
      isActive: false,
      endTime: new Date()
    };

    setSession(finalSession);
    onSessionEnd(finalSession);
  };

  // Voice recording controls
  const startVoiceRecording = () => {
    if (recognitionRef.current && voiceEnabled) {
      try {
        recognitionRef.current.start();
        setIsRecording(true);
      } catch (error) {
        console.error('Failed to start voice recognition:', error);
      }
    }
  };

  const stopVoiceRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
  };

  // Toggle voice recognition
  const toggleVoice = () => {
    setVoiceEnabled(!voiceEnabled);
    if (voiceEnabled && isRecording) {
      stopVoiceRecording();
    } else if (!voiceEnabled && session.isActive) {
      startVoiceRecording();
    }
  };

  // Record slide transition
  const recordSlideTransition = (slideNumber: number) => {
    setCurrentSlide(slideNumber);
    setSession((prev) => ({
      ...prev,
      slideTransitions: [...prev.slideTransitions, slideNumber]
    }));
  };

  // Format duration
  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor(seconds % 3600 / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Session Control
            </span>
            <Badge variant={session.isActive ? "default" : "secondary"}>
              {session.isActive ? "Active" : "Inactive"}
            </Badge>
          </CardTitle>
          <CardDescription>
            Managing session for: {presentationTitle}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-2xl font-bold">{formatDuration(session.duration)}</p>
              <p className="text-sm text-muted-foreground">Session Duration</p>
            </div>
            <div className="space-y-1 text-right">
              <p className="text-2xl font-bold">{currentSlide}</p>
              <p className="text-sm text-muted-foreground">Current Slide</p>
            </div>
          </div>

          <Separator />

          <div className="flex gap-2">
            {!session.isActive ?
            <Button onClick={startSession} className="flex-1">
                <Play className="h-4 w-4 mr-2" />
                Start Session
              </Button> :

            <Button onClick={endSession} variant="destructive" className="flex-1">
                <Square className="h-4 w-4 mr-2" />
                End Session
              </Button>
            }
            
            <Button
              onClick={toggleVoice}
              variant={voiceEnabled ? "default" : "outline"}
              size="icon">

              {voiceEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </Button>
          </div>

          {session.isActive &&
          <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Voice Recognition</span>
                <Badge variant={isRecording ? "default" : "secondary"}>
                  {isRecording ? <Mic className="h-3 w-3 mr-1" /> : <MicOff className="h-3 w-3 mr-1" />}
                  {isRecording ? "Listening" : "Paused"}
                </Badge>
              </div>
              
              {lastSpokenText &&
            <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Last Spoken:</p>
                  <p className="text-sm">{lastSpokenText}</p>
                </div>
            }
            </div>
          }
        </CardContent>
      </Card>

      {session.isActive &&
      <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Session Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{session.spokenContent.length}</p>
                <p className="text-sm text-muted-foreground">Speech Segments</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{session.slideTransitions.length}</p>
                <p className="text-sm text-muted-foreground">Slide Transitions</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{session.voiceCommands.length}</p>
                <p className="text-sm text-muted-foreground">Voice Commands</p>
              </div>
            </div>

            {session.voiceCommands.length > 0 &&
          <div className="mt-4">
                <h4 className="font-medium mb-2">Recent Commands:</h4>
                <ScrollArea className="h-24">
                  <div className="space-y-1">
                    {session.voiceCommands.slice(-5).map((command, index) =>
                <Badge key={index} variant="outline" className="mr-2">
                        {command.replace('_', ' ').toLowerCase()}
                      </Badge>
                )}
                  </div>
                </ScrollArea>
              </div>
          }
          </CardContent>
        </Card>
      }
    </div>);

};

export default SessionManager;