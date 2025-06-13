import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mic, MicOff, CheckCircle, XCircle, Volume2, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface VoiceProfile {
  samples: string[];
  characteristics: {
    pitch: number;
    tone: string;
    accent: string;
    speakingRate: number;
  };
  enrollmentComplete: boolean;
}

interface EnhancedVoiceRegistrationProps {
  onEnrollmentComplete: (profile: VoiceProfile) => void;
  onSkip: () => void;
}

const EnhancedVoiceRegistration: React.FC<EnhancedVoiceRegistrationProps> = ({
  onEnrollmentComplete,
  onSkip
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [currentPhase, setCurrentPhase] = useState(0);
  const [voiceProfile, setVoiceProfile] = useState<VoiceProfile>({
    samples: [],
    characteristics: {
      pitch: 0,
      tone: 'neutral',
      accent: 'neutral',
      speakingRate: 0
    },
    enrollmentComplete: false
  });
  const [recordingProgress, setRecordingProgress] = useState(0);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentText, setCurrentText] = useState('');

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const { toast } = useToast();

  const enrollmentPhases = [
    {
      title: "Basic Voice Sample",
      text: "Hello, my name is [Your Name]. I am enrolling my voice for the AI presentation system.",
      description: "Speak clearly and naturally"
    },
    {
      title: "Command Recognition",
      text: "Next slide. Previous slide. Go to first slide. End presentation.",
      description: "Practice common presentation commands"
    },
    {
      title: "Natural Speech",
      text: "I am excited to use this AI-powered presentation system to enhance my presentations with voice control.",
      description: "Speak conversationally"
    },
    {
      title: "Technical Terms",
      text: "Machine learning, artificial intelligence, data analysis, user interface, presentation software.",
      description: "Practice pronunciation of technical terms"
    }
  ];

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      if (recognitionRef.current) {
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        recognitionRef.current.lang = 'en-US';

        recognitionRef.current.onresult = (event) => {
          const transcript = event.results[0][0].transcript;
          setCurrentText(transcript);
        };

        recognitionRef.current.onerror = (event) => {
          console.error('Speech recognition error:', event.error);
          toast({
            title: "Recognition Error",
            description: "There was an issue with voice recognition. Please try again.",
            variant: "destructive"
          });
        };
      }
    }
  }, [toast]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        await processAudioSample(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);

      // Start speech recognition
      if (recognitionRef.current) {
        recognitionRef.current.start();
      }

      // Progress simulation for recording
      let progress = 0;
      const progressInterval = setInterval(() => {
        progress += 2;
        setRecordingProgress(progress);
        if (progress >= 100) {
          clearInterval(progressInterval);
          stopRecording();
        }
      }, 100);

    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: "Recording Error",
        description: "Unable to access microphone. Please check your permissions.",
        variant: "destructive"
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setRecordingProgress(0);

      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    }
  };

  const processAudioSample = async (audioBlob: Blob) => {
    setIsAnalyzing(true);
    
    // Simulate voice analysis
    for (let i = 0; i <= 100; i += 10) {
      setAnalysisProgress(i);
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Mock voice characteristics analysis
    const characteristics = {
      pitch: Math.random() * 200 + 100, // Hz
      tone: ['warm', 'neutral', 'professional', 'friendly'][Math.floor(Math.random() * 4)],
      accent: ['neutral', 'american', 'british', 'international'][Math.floor(Math.random() * 4)],
      speakingRate: Math.random() * 100 + 120 // words per minute
    };

    // Convert blob to base64 for storage (mock)
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Audio = reader.result as string;
      
      setVoiceProfile(prev => ({
        ...prev,
        samples: [...prev.samples, base64Audio],
        characteristics: {
          ...prev.characteristics,
          ...characteristics
        }
      }));

      setIsAnalyzing(false);
      setAnalysisProgress(0);
      
      if (currentPhase < enrollmentPhases.length - 1) {
        toast({
          title: "Sample Recorded",
          description: `Phase ${currentPhase + 1} completed successfully!`
        });
        setCurrentPhase(prev => prev + 1);
      } else {
        completeEnrollment();
      }
    };
    
    reader.readAsDataURL(audioBlob);
  };

  const completeEnrollment = () => {
    const completedProfile = {
      ...voiceProfile,
      enrollmentComplete: true
    };
    
    setVoiceProfile(completedProfile);
    
    toast({
      title: "Voice Enrollment Complete!",
      description: "Your voice profile has been successfully created."
    });

    onEnrollmentComplete(completedProfile);
  };

  const retryCurrentPhase = () => {
    setCurrentText('');
    setRecordingProgress(0);
    setAnalysisProgress(0);
  };

  const skipEnrollment = () => {
    toast({
      title: "Voice Enrollment Skipped",
      description: "You can complete voice enrollment later in your profile settings."
    });
    onSkip();
  };

  const currentPhaseData = enrollmentPhases[currentPhase];
  const progressPercentage = ((currentPhase + 1) / enrollmentPhases.length) * 100;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Volume2 className="h-5 w-5" />
            Voice Enrollment - AI Training
          </CardTitle>
          <CardDescription>
            Train the AI to recognize your voice for enhanced presentation control
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Overall Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Enrollment Progress</span>
              <span>{Math.round(progressPercentage)}%</span>
            </div>
            <Progress value={progressPercentage} className="w-full" />
          </div>

          {/* Current Phase */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">{currentPhaseData.title}</h3>
              <Badge variant="outline">
                Phase {currentPhase + 1} of {enrollmentPhases.length}
              </Badge>
            </div>

            <Alert>
              <AlertDescription>
                {currentPhaseData.description}
              </AlertDescription>
            </Alert>

            {/* Text to Read */}
            <Card className="bg-muted/50">
              <CardContent className="pt-6">
                <p className="text-lg leading-relaxed">
                  "{currentPhaseData.text}"
                </p>
              </CardContent>
            </Card>

            {/* Recording Controls */}
            <div className="flex flex-col gap-4">
              {!isRecording && !isAnalyzing && (
                <Button 
                  onClick={startRecording}
                  size="lg"
                  className="w-full"
                >
                  <Mic className="h-5 w-5 mr-2" />
                  Start Recording
                </Button>
              )}

              {isRecording && (
                <div className="space-y-3">
                  <Button 
                    onClick={stopRecording}
                    variant="destructive"
                    size="lg"
                    className="w-full"
                  >
                    <MicOff className="h-5 w-5 mr-2" />
                    Stop Recording
                  </Button>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Recording...</span>
                      <span>{recordingProgress}%</span>
                    </div>
                    <Progress value={recordingProgress} className="w-full" />
                  </div>
                </div>
              )}

              {isAnalyzing && (
                <div className="space-y-3">
                  <div className="flex items-center justify-center gap-2">
                    <RefreshCw className="h-5 w-5 animate-spin" />
                    <span>Analyzing voice sample...</span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>AI Processing</span>
                      <span>{analysisProgress}%</span>
                    </div>
                    <Progress value={analysisProgress} className="w-full" />
                  </div>
                </div>
              )}

              {currentText && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-800">Recognized:</span>
                  </div>
                  <p className="text-sm text-green-700">{currentText}</p>
                </div>
              )}
            </div>

            {/* Retry Button */}
            {!isRecording && !isAnalyzing && currentText && (
              <Button 
                onClick={retryCurrentPhase}
                variant="outline"
                className="w-full"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry This Phase
              </Button>
            )}
          </div>

          {/* Voice Profile Preview */}
          {voiceProfile.samples.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Voice Profile Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 md:grid-cols-2">
                  <div>
                    <span className="text-sm font-medium">Samples Recorded:</span>
                    <p className="text-2xl font-bold text-primary">{voiceProfile.samples.length}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium">Voice Tone:</span>
                    <p className="text-lg capitalize">{voiceProfile.characteristics.tone}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button onClick={skipEnrollment} variant="outline" className="flex-1">
              Skip for Now
            </Button>
            {voiceProfile.enrollmentComplete && (
              <Button onClick={() => onEnrollmentComplete(voiceProfile)} className="flex-1">
                <CheckCircle className="h-4 w-4 mr-2" />
                Complete Enrollment
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedVoiceRegistration;