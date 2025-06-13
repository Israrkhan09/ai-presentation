import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mic, MicOff, Volume2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface VoiceRecorderProps {
  onVoiceCommand?: (command: string) => void;
  isActive?: boolean;
  showCommands?: boolean;
}

const VoiceRecorder = ({ onVoiceCommand, isActive = false, showCommands = true }: VoiceRecorderProps) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const voiceCommands = [
    'next slide', 'previous slide', 'first slide', 'last slide',
    'start presentation', 'end presentation', 'pause', 'resume'
  ];

  useEffect(() => {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setTranscript(currentTranscript);
        
        // Check for voice commands
        const command = currentTranscript.toLowerCase().trim();
        if (voiceCommands.some(cmd => command.includes(cmd))) {
          onVoiceCommand?.(command);
          toast({
            title: "Voice Command Detected",
            description: `Executed: ${command}`,
          });
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        toast({
          title: "Voice Recognition Error",
          description: "Please check your microphone and try again.",
          variant: "destructive",
        });
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [onVoiceCommand]);

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      recognitionRef.current.start();
      setIsListening(true);
      setTranscript('');
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  useEffect(() => {
    if (isActive && !isListening) {
      startListening();
    } else if (!isActive && isListening) {
      stopListening();
    }
  }, [isActive]);

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Volume2 className="h-5 w-5" />
          Voice Control
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <Button
            onClick={toggleListening}
            variant={isListening ? "destructive" : "default"}
            size="sm"
            className="flex items-center gap-2"
          >
            {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            {isListening ? 'Stop Listening' : 'Start Listening'}
          </Button>
          <Badge variant={isListening ? "default" : "secondary"}>
            {isListening ? 'Active' : 'Inactive'}
          </Badge>
        </div>

        {transcript && (
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">Current Speech:</p>
            <p className="text-sm">{transcript}</p>
          </div>
        )}

        {showCommands && (
          <div>
            <p className="text-sm font-medium mb-2">Available Commands:</p>
            <div className="flex flex-wrap gap-1">
              {voiceCommands.map((command, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {command}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {!('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) && (
          <p className="text-sm text-muted-foreground">
            Speech recognition is not supported in your browser.
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default VoiceRecorder;