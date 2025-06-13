import { useState, useEffect, useRef, useCallback } from 'react';

interface VoiceRecognitionHook {
  isListening: boolean;
  transcript: string;
  confidence: number;
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
  isSupported: boolean;
  lastCommand: string;
}

export const useVoiceRecognition = (
  onCommand?: (command: string) => void,
  continuous: boolean = true
): VoiceRecognitionHook => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [confidence, setConfidence] = useState(0);
  const [lastCommand, setLastCommand] = useState('');
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  
  const isSupported = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;

  // Voice commands pattern matching
  const processCommand = useCallback((text: string) => {
    const lowerText = text.toLowerCase().trim();
    console.log('Processing voice command:', lowerText);
    
    // Define command patterns
    const commands = {
      'next slide': ['next slide', 'next page', 'go next', 'slide next', 'move forward'],
      'previous slide': ['previous slide', 'prev slide', 'go back', 'slide back', 'move back', 'last slide'],
      'first slide': ['first slide', 'go to start', 'beginning', 'start presentation'],
      'last slide': ['last slide', 'go to end', 'end presentation', 'final slide'],
      'highlight point': ['highlight point', 'highlight this', 'mark this', 'emphasis'],
      'start presentation': ['start presentation', 'begin presentation', 'start slideshow'],
      'stop presentation': ['stop presentation', 'end presentation', 'exit presentation'],
      'pause': ['pause', 'stop', 'hold on'],
      'resume': ['resume', 'continue', 'go on'],
      'zoom in': ['zoom in', 'make bigger', 'enlarge'],
      'zoom out': ['zoom out', 'make smaller', 'reduce'],
      'fullscreen': ['fullscreen', 'full screen', 'maximize'],
      'exit fullscreen': ['exit fullscreen', 'exit full screen', 'minimize']
    };

    // Find matching command
    for (const [command, patterns] of Object.entries(commands)) {
      if (patterns.some(pattern => lowerText.includes(pattern))) {
        console.log('Command matched:', command);
        setLastCommand(command);
        onCommand?.(command);
        return;
      }
    }

    // If no specific command found, check for slide numbers
    const slideNumberMatch = lowerText.match(/(?:slide|page)\s*(\d+)/i) || lowerText.match(/^(\d+)$/);
    if (slideNumberMatch) {
      const slideNumber = parseInt(slideNumberMatch[1]);
      const command = `go to slide ${slideNumber}`;
      console.log('Slide number command:', command);
      setLastCommand(command);
      onCommand?.(command);
    }
  }, [onCommand]);

  useEffect(() => {
    if (!isSupported) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();

    const recognition = recognitionRef.current;
    recognition.continuous = continuous;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      console.log('Voice recognition started');
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        const confidence = event.results[i][0].confidence;

        if (event.results[i].isFinal) {
          finalTranscript += transcript;
          setConfidence(confidence);
          console.log('Final transcript:', transcript, 'Confidence:', confidence);
          
          // Process command immediately when final
          processCommand(transcript);
        } else {
          interimTranscript += transcript;
        }
      }

      setTranscript(finalTranscript || interimTranscript);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      
      // Auto-restart on certain errors
      if (event.error === 'no-speech' || event.error === 'audio-capture') {
        setTimeout(() => {
          if (isListening) {
            recognition.start();
          }
        }, 1000);
      }
    };

    recognition.onend = () => {
      console.log('Voice recognition ended');
      setIsListening(false);
      
      // Auto-restart if continuous mode is enabled
      if (continuous && isListening) {
        setTimeout(() => {
          recognition.start();
        }, 100);
      }
    };

    return () => {
      if (recognition) {
        recognition.stop();
      }
    };
  }, [isSupported, continuous, isListening, processCommand]);

  const startListening = useCallback(() => {
    if (!isSupported || !recognitionRef.current) return;
    
    try {
      recognitionRef.current.start();
      console.log('Starting voice recognition');
    } catch (error) {
      console.error('Error starting recognition:', error);
    }
  }, [isSupported]);

  const stopListening = useCallback(() => {
    if (!recognitionRef.current) return;
    
    recognitionRef.current.stop();
    setIsListening(false);
    console.log('Stopping voice recognition');
  }, []);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setConfidence(0);
    setLastCommand('');
  }, []);

  return {
    isListening,
    transcript,
    confidence,
    startListening,
    stopListening,
    resetTranscript,
    isSupported,
    lastCommand
  };
};