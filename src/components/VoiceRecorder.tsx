import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mic, MicOff, Play, Pause, RotateCcw } from 'lucide-react';

interface VoiceRecorderProps {
  onRecordingComplete: (audioData: string) => void;
  isRequired?: boolean;
}

const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  onRecordingComplete,
  isRequired = false
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [hasRecording, setHasRecording] = useState(false);
  const [audioURL, setAudioURL] = useState<string>('');

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      mediaRecorderRef.current = new MediaRecorder(stream);
      chunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/wav' });
        const url = URL.createObjectURL(audioBlob);
        setAudioURL(url);
        setHasRecording(true);

        // Convert to base64 for storage
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64data = reader.result as string;
          onRecordingComplete(base64data);
        };
        reader.readAsDataURL(audioBlob);

        // Stop all tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);

      console.log('Voice recording started');
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Unable to access microphone. Please check your permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);

      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      console.log('Voice recording stopped');
    }
  };

  const playRecording = () => {
    if (audioURL && !isPlaying) {
      audioRef.current = new Audio(audioURL);
      audioRef.current.play();
      setIsPlaying(true);

      audioRef.current.onended = () => {
        setIsPlaying(false);
      };
    } else if (audioRef.current && isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const resetRecording = () => {
    setHasRecording(false);
    setAudioURL('');
    setRecordingTime(0);
    setIsPlaying(false);

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    onRecordingComplete('');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mic className="h-5 w-5" />
          Voice Profile Recording
          {isRequired && <Badge variant="destructive">Required</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-gray-600 mb-4">
          Please record a short voice sample (10-30 seconds) by reading this text:
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg italic text-center">
          "Hello, my name is [your name] and I'm excited to use this AI-powered presentation system. 
          This voice sample will help personalize my experience and improve speech recognition accuracy."
        </div>

        <div className="flex flex-col items-center space-y-4">
          {/* Recording Status */}
          <div className="flex items-center gap-4">
            {isRecording &&
            <Badge variant="destructive" className="animate-pulse">
                Recording... {formatTime(recordingTime)}
              </Badge>
            }
            {hasRecording && !isRecording &&
            <Badge variant="secondary">
                Recording saved ({formatTime(recordingTime)})
              </Badge>
            }
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            {!isRecording && !hasRecording &&
            <Button
              onClick={startRecording}
              className="flex items-center gap-2"
              size="lg">

                <Mic className="h-4 w-4" />
                Start Recording
              </Button>
            }

            {isRecording &&
            <Button
              onClick={stopRecording}
              variant="destructive"
              className="flex items-center gap-2"
              size="lg">

                <MicOff className="h-4 w-4" />
                Stop Recording
              </Button>
            }

            {hasRecording &&
            <>
                <Button
                onClick={playRecording}
                variant="outline"
                className="flex items-center gap-2">

                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  {isPlaying ? 'Pause' : 'Play'}
                </Button>
                
                <Button
                onClick={resetRecording}
                variant="outline"
                className="flex items-center gap-2">

                  <RotateCcw className="h-4 w-4" />
                  Re-record
                </Button>
              </>
            }
          </div>

          {/* Instructions */}
          <div className="text-xs text-gray-500 text-center max-w-md">
            {!hasRecording && "Click 'Start Recording' and read the text above clearly. A good voice sample helps improve recognition accuracy."}
            {hasRecording && "Great! Your voice profile has been recorded. You can play it back or re-record if needed."}
          </div>
        </div>
      </CardContent>
    </Card>);

};

export default VoiceRecorder;