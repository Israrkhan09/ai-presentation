import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { User, Mail, Lock, UserPlus, AlertCircle, CheckCircle } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { useNavigate } from 'react-router-dom';
import EnhancedVoiceRegistration from '@/components/EnhancedVoiceRegistration';
import { useToast } from '@/hooks/use-toast';

const Registration: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: '',
    organization: ''
  });
  const [step, setStep] = useState<'form' | 'voice' | 'complete'>('form');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [voiceProfile, setVoiceProfile] = useState<any>(null);

  const { login } = useUser();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError('');
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      setError('Name is required');
      return false;
    }
    if (!formData.email.trim()) {
      setError('Email is required');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    if (!formData.role) {
      setError('Please select your role');
      return false;
    }
    return true;
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const { error } = await window.ezsite.apis.register({
        email: formData.email,
        password: formData.password
      });

      if (error) {
        setError(error);
        return;
      }

      toast({
        title: "Registration Successful!",
        description: "Your account has been created. Let's set up voice recognition."
      });

      setStep('voice');
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceEnrollmentComplete = (profile: any) => {
    setVoiceProfile(profile);
    setStep('complete');
    
    toast({
      title: "Voice Enrollment Complete!",
      description: "Your AI-powered presentation system is ready to use."
    });

    // Auto-redirect after showing success
    setTimeout(() => {
      navigate('/login');
    }, 3000);
  };

  const handleSkipVoice = () => {
    setStep('complete');
    setTimeout(() => {
      navigate('/login');
    }, 2000);
  };

  const completeRegistration = () => {
    navigate('/login');
  };

  if (step === 'voice') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="w-full max-w-4xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Voice Enrollment</h1>
            <p className="text-gray-600">Train the AI to recognize your voice for enhanced presentation control</p>
          </div>
          
          <EnhancedVoiceRegistration
            onEnrollmentComplete={handleVoiceEnrollmentComplete}
            onSkip={handleSkipVoice}
          />
        </div>
      </div>
    );
  }

  if (step === 'complete') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle className="text-2xl">Registration Complete!</CardTitle>
            <CardDescription>
              Welcome to the AI-Powered Presentation System
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="space-y-2">
              <Badge variant="outline" className="bg-green-50">
                Account Created Successfully
              </Badge>
              {voiceProfile && (
                <Badge variant="outline" className="bg-blue-50">
                  Voice Profile Enrolled
                </Badge>
              )}
            </div>
            
            <div className="text-sm text-muted-foreground space-y-1">
              <p>✓ Account verification email sent</p>
              <p>✓ Voice recognition {voiceProfile ? 'enabled' : 'can be set up later'}</p>
              <p>✓ AI features activated</p>
            </div>

            <Button onClick={completeRegistration} className="w-full">
              Continue to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl flex items-center justify-center gap-2">
            <UserPlus className="h-6 w-6" />
            Create Account
          </CardTitle>
          <CardDescription>
            Join the AI-Powered Presentation Platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleFormSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select onValueChange={(value) => handleInputChange('role', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="presenter">Presenter</SelectItem>
                    <SelectItem value="educator">Educator</SelectItem>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="business">Business Professional</SelectItem>
                    <SelectItem value="researcher">Researcher</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="organization">Organization (Optional)</Label>
              <Input
                id="organization"
                type="text"
                placeholder="Your company or institution"
                value={formData.organization}
                onChange={(e) => handleInputChange('organization', e.target.value)}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Creating Account...' : 'Create Account & Continue'}
              </Button>

              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Already have an account?{' '}
                  <Button
                    type="button"
                    variant="link"
                    className="p-0"
                    onClick={() => navigate('/login')}
                  >
                    Sign in here
                  </Button>
                </p>
              </div>
            </div>
          </form>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">What's Next?</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Voice enrollment for AI recognition</li>
              <li>• Access to presentation upload</li>
              <li>• Voice-controlled navigation</li>
              <li>• AI-generated summaries and quizzes</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Registration;