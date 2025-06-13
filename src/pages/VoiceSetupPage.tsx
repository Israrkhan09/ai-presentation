import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/store/authStore';
import { toast } from '@/hooks/use-toast';
import VoiceRecorder from '@/components/VoiceRecorder';
import { Mic, CheckCircle, ArrowRight } from 'lucide-react';

const VoiceSetupPage = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [recordedSamples, setRecordedSamples] = useState<string[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();
  const updateVoiceProfile = useAuthStore((state) => state.updateVoiceProfile);

  const voicePrompts = [
  "Please say: 'Next slide'",
  "Please say: 'Previous slide'",
  "Please say: 'Start presentation'",
  "Please say: 'stop presentation'",
  "Please say: 'Go to slide number 5'"];


  const handleVoiceCommand = (command: string) => {
    if (isRecording && currentStep < voicePrompts.length) {
      const newSamples = [...recordedSamples, command];
      setRecordedSamples(newSamples);
      setIsRecording(false);

      toast({
        title: "Voice Sample Recorded",
        description: `Sample ${currentStep + 1} of ${voicePrompts.length} completed`
      });

      if (currentStep + 1 < voicePrompts.length) {
        setCurrentStep(currentStep + 1);
      } else {
        completeVoiceSetup();
      }
    }
  };

  const startRecording = () => {
    setIsRecording(true);
    toast({
      title: "Recording Started",
      description: voicePrompts[currentStep]
    });
  };

  const completeVoiceSetup = async () => {
    setIsProcessing(true);

    // Simulate voice profile processing
    await new Promise((resolve) => setTimeout(resolve, 3000));

    const voiceProfileId = `voice_${Date.now()}`;
    updateVoiceProfile(voiceProfileId);

    toast({
      title: "Voice Profile Created",
      description: "Your voice profile has been successfully created and is ready to use"
    });

    setIsProcessing(false);
    navigate('/dashboard');
  };

  const skipSetup = () => {
    navigate('/dashboard');
  };

  const progress = recordedSamples.length / voicePrompts.length * 100;

  if (isProcessing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6">
            <div className="h-12 w-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <Mic className="h-6 w-6 text-primary-foreground animate-pulse" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Processing Voice Profile</h3>
            <p className="text-muted-foreground mb-4">
              Creating your personalized voice recognition model...
            </p>
            <Progress value={85} className="mb-4" />
            <p className="text-sm text-muted-foreground">This may take a few moments</p>
          </CardContent>
        </Card>
      </div>);

  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Voice Profile Setup</h1>
          <p className="text-muted-foreground">
            Train your AI assistant to recognize your voice commands
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Voice Training Progress</CardTitle>
              <CardDescription>
                Complete {voicePrompts.length} voice samples to create your profile
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Progress value={progress} className="w-full" />
              <p className="text-sm text-muted-foreground">
                {recordedSamples.length} of {voicePrompts.length} samples completed
              </p>

              <div className="space-y-3">
                {voicePrompts.map((prompt, index) =>
                <div key={index} className="flex items-center gap-3">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                  index < recordedSamples.length ?
                  'bg-green-100 text-green-600' :
                  index === currentStep ?
                  'bg-blue-100 text-blue-600' :
                  'bg-muted text-muted-foreground'}`
                  }>
                      {index < recordedSamples.length ?
                    <CheckCircle className="h-4 w-4" /> :

                    <span className="text-xs font-medium">{index + 1}</span>
                    }
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm ${
                    index === currentStep ? 'font-medium' : ''}`
                    }>
                        {prompt}
                      </p>
                      {index < recordedSamples.length &&
                    <Badge variant="secondary" className="mt-1">
                          Recorded: "{recordedSamples[index]}"
                        </Badge>
                    }
                    </div>
                  </div>
                )}
              </div>

              {recordedSamples.length < voicePrompts.length &&
              <Button
                onClick={startRecording}
                disabled={isRecording}
                className="w-full">

                  <Mic className="mr-2 h-4 w-4" />
                  {isRecording ? 'Recording...' : `Record Sample ${currentStep + 1}`}
                </Button>
              }

              {recordedSamples.length === voicePrompts.length &&
              <Button onClick={completeVoiceSetup} className="w-full">
                  Complete Setup
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              }

              <Button variant="outline" onClick={skipSetup} className="w-full">
                Skip for Now
              </Button>
            </CardContent>
          </Card>

          <VoiceRecorder
            onVoiceCommand={handleVoiceCommand}
            isActive={isRecording}
            showCommands={false} />

        </div>
      </div>
    </div>);

};

export default VoiceSetupPage;