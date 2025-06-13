import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Mic, MicOff, Volume2, Command } from 'lucide-react';

interface VoiceCommand {
  command: string;
  action: string;
  description: string;
}

interface VoiceCommandsProps {
  onCommand: (command: string, action: string) => void;
  isListening: boolean;
}

const VoiceCommands: React.FC<VoiceCommandsProps> = ({
  onCommand,
  isListening
}) => {
  const [isCommandMode, setIsCommandMode] = useState(false);
  const [lastCommand, setLastCommand] = useState<string>('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const commands: VoiceCommand[] = [
  { command: "next slide", action: "NEXT_SLIDE", description: "Advance to the next slide" },
  { command: "previous slide", action: "PREV_SLIDE", description: "Go to the previous slide" },
  { command: "go to slide", action: "GO_TO_SLIDE", description: "Navigate to specific slide number" },
  { command: "start presentation", action: "START_PRESENTATION", description: "Begin presentation mode" },
  { command: "end presentation", action: "END_PRESENTATION", description: "Exit presentation mode" },
  { command: "highlight keywords", action: "HIGHLIGHT_KEYWORDS", description: "Toggle keyword highlighting" },
  { command: "generate quiz", action: "GENERATE_QUIZ", description: "Create quiz from content" },
  { command: "create summary", action: "CREATE_SUMMARY", description: "Generate PDF summary" },
  { command: "toggle fullscreen", action: "TOGGLE_FULLSCREEN", description: "Enter/exit fullscreen mode" },
  { command: "pause recording", action: "PAUSE_RECORDING", description: "Pause speech recognition" },
  { command: "resume recording", action: "RESUME_RECORDING", description: "Resume speech recognition" },
  { command: "show notes", action: "SHOW_NOTES", description: "Display speaker notes" }];


  useEffect(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      const command = event.results[event.results.length - 1][0].transcript.toLowerCase().trim();
      console.log('Voice command detected:', command);
      processCommand(command);
    };

    recognition.onerror = (event) => {
      console.error('Voice command recognition error:', event.error);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const processCommand = (spokenText: string) => {
    // Check for exact matches first
    let matchedCommand = commands.find((cmd) =>
    spokenText.includes(cmd.command)
    );

    // If no exact match, try partial matching
    if (!matchedCommand) {
      matchedCommand = commands.find((cmd) => {
        const commandWords = cmd.command.split(' ');
        return commandWords.some((word) => spokenText.includes(word));
      });
    }

    if (matchedCommand) {
      setLastCommand(matchedCommand.command);
      setCommandHistory((prev) => [matchedCommand!.command, ...prev.slice(0, 4)]);
      onCommand(matchedCommand.command, matchedCommand.action);

      // Show visual feedback
      setTimeout(() => setLastCommand(''), 3000);
    } else {
      // Handle special cases with parameters
      if (spokenText.includes('slide') && /\d+/.test(spokenText)) {
        const slideNumber = spokenText.match(/\d+/)?.[0];
        setLastCommand(`Go to slide ${slideNumber}`);
        onCommand(`go to slide ${slideNumber}`, 'GO_TO_SLIDE');
        setTimeout(() => setLastCommand(''), 3000);
      }
    }
  };

  const toggleCommandMode = () => {
    if (isCommandMode) {
      recognitionRef.current?.stop();
    } else {
      recognitionRef.current?.start();
    }
    setIsCommandMode(!isCommandMode);
  };

  const speakCommand = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.8;
      utterance.pitch = 1;
      speechSynthesis.speak(utterance);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Command className="h-5 w-5" />
            Voice Commands
          </div>
          <Button
            onClick={toggleCommandMode}
            variant={isCommandMode ? "default" : "outline"}
            size="sm"
            className="flex items-center gap-1">

            {isCommandMode ?
            <>
                <Mic className="h-4 w-4" />
                Listening
              </> :

            <>
                <MicOff className="h-4 w-4" />
                Activate
              </>
            }
          </Button>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge
              variant={isCommandMode ? "default" : "secondary"}
              className={isCommandMode ? "bg-green-500" : ""}>

              {isCommandMode ? "Voice Commands Active" : "Voice Commands Inactive"}
            </Badge>
            {isListening &&
            <Badge variant="outline" className="bg-blue-50">
                Speech Recognition On
              </Badge>
            }
          </div>
          <Button
            onClick={() => speakCommand("Voice command system ready")}
            variant="outline"
            size="sm">

            <Volume2 className="h-4 w-4" />
          </Button>
        </div>

        {/* Last Command */}
        {lastCommand &&
        <div className="p-3 bg-green-50 border border-green-200 rounded">
            <div className="flex items-center gap-2">
              <Badge className="bg-green-500">Command Executed</Badge>
              <span className="font-medium">{lastCommand}</span>
            </div>
          </div>
        }

        {/* Command History */}
        {commandHistory.length > 0 &&
        <div>
            <h4 className="text-sm font-medium mb-2">Recent Commands:</h4>
            <div className="space-y-1">
              {commandHistory.map((cmd, index) =>
            <div key={index} className="text-sm text-gray-600 bg-gray-50 px-2 py-1 rounded">
                  {cmd}
                </div>
            )}
            </div>
          </div>
        }

        {/* Available Commands */}
        <div>
          <h4 className="text-sm font-medium mb-3">Available Commands:</h4>
          <div className="grid gap-2 max-h-64 overflow-y-auto">
            {commands.map((cmd, index) =>
            <div key={index} className="p-3 border rounded hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                      "{cmd.command}"
                    </code>
                    <p className="text-xs text-gray-600 mt-1">{cmd.description}</p>
                  </div>
                  <Button
                  onClick={() => processCommand(cmd.command)}
                  variant="outline"
                  size="sm"
                  className="text-xs">

                    Test
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded">
          <p className="font-medium mb-1">How to use:</p>
          <ul className="space-y-1 text-xs">
            <li>• Click "Activate" to enable voice command recognition</li>
            <li>• Speak clearly and use the exact command phrases</li>
            <li>• Commands work alongside regular speech recognition</li>
            <li>• Use "go to slide [number]" for specific slide navigation</li>
          </ul>
        </div>
      </CardContent>
    </Card>);

};

export default VoiceCommands;