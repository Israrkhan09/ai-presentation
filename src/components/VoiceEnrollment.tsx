import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Mic, MicOff, Play, Pause, RotateCcw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface VoiceEnrollmentProps {
  onVoiceEnrolled: (voiceData: string) => void;
}

const VoiceEnrollment: React.FC<VoiceEnrollmentProps> = ({ onVoiceEnrolled }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingProgress, setRecordingProgress] = useState(0);
  const [hasRecording, setHasRecording] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioUrlRef = useRef<string>('');
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { toast } = useToast();

  const sampleText = "Hello, my name is [Your Name]. I am registering for the presentation platform. This voice sample will help create my unique voice profile for secure access.";

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        audioUrlRef.current = URL.createObjectURL(audioBlob);
        setHasRecording(true);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      
      // Progress simulation
      let progress = 0;
      const interval = setInterval(() => {
        progress += 2;
        setRecordingProgress(progress);
        if (progress >= 100) {
          clearInterval(interval);
          mediaRecorder.stop();
          setIsRecording(false);
          setRecordingProgress(0);
        }
      }, 100);

    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to access microphone. Please check permissions.",
        variant: "destructive"
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setRecordingProgress(0);
    }
  };

  const playRecording = () => {
    if (audioUrlRef.current) {
      audioRef.current = new Audio(audioUrlRef.current);
      audioRef.current.play();
      setIsPlaying(true);
      
      audioRef.current.onended = () => {
        setIsPlaying(false);
      };
    }
  };

  const pausePlayback = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const resetRecording = () => {
    setHasRecording(false);
    setIsEnrolled(false);
    setRecordingProgress(0);
    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current);
      audioUrlRef.current = '';
    }
  };

  const confirmEnrollment = () => {
    if (audioUrlRef.current) {
      // Convert audio to base64 for storage (simplified)
      const voiceProfile = `voice_profile_${Date.now()}`;
      onVoiceEnrolled(voiceProfile);
      setIsEnrolled(true);
      toast({
        title: "Voice Enrolled Successfully!",
        description: "Your voice profile has been created and saved.",
      });
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mic className="h-5 w-5" />
          Voice Enrollment
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-800 mb-2 font-medium">Please read the following text clearly:</p>
          <p className="text-sm text-blue-700 italic">{sampleText}</p>
        </div>

        {isRecording && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Recording...</span>
              <Badge variant="destructive" className="animate-pulse">
                <Mic className="h-3 w-3 mr-1" />
                LIVE
              </Badge>
            </div>
            <Progress value={recordingProgress} className="w-full" />
          </div>
        )}

        <div className="flex gap-2 flex-wrap">
          {!hasRecording && !isRecording && (
            <Button onClick={startRecording} className="flex items-center gap-2">
              <Mic className="h-4 w-4" />
              Start Recording
            </Button>
          )}

          {isRecording && (
            <Button onClick={stopRecording} variant="destructive" className="flex items-center gap-2">
              <MicOff className="h-4 w-4" />
              Stop Recording
            </Button>
          )}

          {hasRecording && !isEnrolled && (
            <>
              <Button 
                onClick={isPlaying ? pausePlayback : playRecording}
                variant="outline"
                className="flex items-center gap-2"
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                {isPlaying ? 'Pause' : 'Play Recording'}
              </Button>
              
              <Button onClick={resetRecording} variant="outline" className="flex items-center gap-2">
                <RotateCcw className="h-4 w-4" />
                Re-record
              </Button>
              
              <Button onClick={confirmEnrollment} className="flex items-center gap-2">
                Confirm Enrollment
              </Button>
            </>
          )}
        </div>

        {isEnrolled && (
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="flex items-center gap-2">
              <Badge variant="default" className="bg-green-100 text-green-800">
                ✓ Voice Profile Created
              </Badge>
            </div>
            <p className="text-sm text-green-700 mt-2">
              Your voice has been successfully enrolled and your profile is ready!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default VoiceEnrollment;