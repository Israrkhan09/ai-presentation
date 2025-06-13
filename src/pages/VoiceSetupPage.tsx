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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4" data-id="l964yrp9k" data-path="src/pages/VoiceSetupPage.tsx">
        <Card className="w-full max-w-md text-center" data-id="tzave5rip" data-path="src/pages/VoiceSetupPage.tsx">
          <CardContent className="pt-6" data-id="vg5pmqnqm" data-path="src/pages/VoiceSetupPage.tsx">
            <div className="h-12 w-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-4" data-id="6b6ii8wnt" data-path="src/pages/VoiceSetupPage.tsx">
              <Mic className="h-6 w-6 text-primary-foreground animate-pulse" data-id="cl9i2yjzw" data-path="src/pages/VoiceSetupPage.tsx" />
            </div>
            <h3 className="text-lg font-semibold mb-2" data-id="165jik17h" data-path="src/pages/VoiceSetupPage.tsx">Processing Voice Profile</h3>
            <p className="text-muted-foreground mb-4" data-id="ph3pc15cn" data-path="src/pages/VoiceSetupPage.tsx">
              Creating your personalized voice recognition model...
            </p>
            <Progress value={85} className="mb-4" data-id="fpdds8x9l" data-path="src/pages/VoiceSetupPage.tsx" />
            <p className="text-sm text-muted-foreground" data-id="sjkc8ezhe" data-path="src/pages/VoiceSetupPage.tsx">This may take a few moments</p>
          </CardContent>
        </Card>
      </div>);

  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4" data-id="zr3c91xhn" data-path="src/pages/VoiceSetupPage.tsx">
      <div className="max-w-4xl mx-auto" data-id="7jr0trfsh" data-path="src/pages/VoiceSetupPage.tsx">
        <div className="text-center mb-8" data-id="6ecvwf1c7" data-path="src/pages/VoiceSetupPage.tsx">
          <h1 className="text-3xl font-bold mb-2" data-id="tpp7yxxiq" data-path="src/pages/VoiceSetupPage.tsx">Voice Profile Setup</h1>
          <p className="text-muted-foreground" data-id="8nb276lp6" data-path="src/pages/VoiceSetupPage.tsx">
            Train your AI assistant to recognize your voice commands
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6" data-id="ieobqj2x9" data-path="src/pages/VoiceSetupPage.tsx">
          <Card data-id="x4183gund" data-path="src/pages/VoiceSetupPage.tsx">
            <CardHeader data-id="46escm5e9" data-path="src/pages/VoiceSetupPage.tsx">
              <CardTitle data-id="zrpgonviw" data-path="src/pages/VoiceSetupPage.tsx">Voice Training Progress</CardTitle>
              <CardDescription data-id="3toqnlv5m" data-path="src/pages/VoiceSetupPage.tsx">
                Complete {voicePrompts.length} voice samples to create your profile
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4" data-id="9tsuhixwv" data-path="src/pages/VoiceSetupPage.tsx">
              <Progress value={progress} className="w-full" data-id="7zkt8o6jr" data-path="src/pages/VoiceSetupPage.tsx" />
              <p className="text-sm text-muted-foreground" data-id="d2ije3fep" data-path="src/pages/VoiceSetupPage.tsx">
                {recordedSamples.length} of {voicePrompts.length} samples completed
              </p>

              <div className="space-y-3" data-id="p45068p55" data-path="src/pages/VoiceSetupPage.tsx">
                {voicePrompts.map((prompt, index) =>
                <div key={index} className="flex items-center gap-3" data-id="yhrky234u" data-path="src/pages/VoiceSetupPage.tsx">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                  index < recordedSamples.length ?
                  'bg-green-100 text-green-600' :
                  index === currentStep ?
                  'bg-blue-100 text-blue-600' :
                  'bg-muted text-muted-foreground'}`
                  } data-id="dqembfhi6" data-path="src/pages/VoiceSetupPage.tsx">
                      {index < recordedSamples.length ?
                    <CheckCircle className="h-4 w-4" data-id="xjjal2faa" data-path="src/pages/VoiceSetupPage.tsx" /> :

                    <span className="text-xs font-medium" data-id="33h99st8o" data-path="src/pages/VoiceSetupPage.tsx">{index + 1}</span>
                    }
                    </div>
                    <div className="flex-1" data-id="g4hbevyab" data-path="src/pages/VoiceSetupPage.tsx">
                      <p className={`text-sm ${
                    index === currentStep ? 'font-medium' : ''}`
                    } data-id="rdsjagzbj" data-path="src/pages/VoiceSetupPage.tsx">
                        {prompt}
                      </p>
                      {index < recordedSamples.length &&
                    <Badge variant="secondary" className="mt-1" data-id="8gj0naqle" data-path="src/pages/VoiceSetupPage.tsx">
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
                className="w-full" data-id="eaw4yd28m" data-path="src/pages/VoiceSetupPage.tsx">

                  <Mic className="mr-2 h-4 w-4" data-id="ykt0pb9q9" data-path="src/pages/VoiceSetupPage.tsx" />
                  {isRecording ? 'Recording...' : `Record Sample ${currentStep + 1}`}
                </Button>
              }

              {recordedSamples.length === voicePrompts.length &&
              <Button onClick={completeVoiceSetup} className="w-full" data-id="rtu6oksy2" data-path="src/pages/VoiceSetupPage.tsx">
                  Complete Setup
                  <ArrowRight className="ml-2 h-4 w-4" data-id="mlr273cjc" data-path="src/pages/VoiceSetupPage.tsx" />
                </Button>
              }

              <Button variant="outline" onClick={skipSetup} className="w-full" data-id="cvk5uiyiu" data-path="src/pages/VoiceSetupPage.tsx">
                Skip for Now
              </Button>
            </CardContent>
          </Card>

          <VoiceRecorder
            onVoiceCommand={handleVoiceCommand}
            isActive={isRecording}
            showCommands={false} data-id="yb8as0vb1" data-path="src/pages/VoiceSetupPage.tsx" />

        </div>
      </div>
    </div>);

};

export default VoiceSetupPage;