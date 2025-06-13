import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { UserPlus, Mail, Lock, User, Briefcase, CheckCircle } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { useNavigate } from 'react-router-dom';
import VoiceEnrollment from '@/components/VoiceEnrollment';
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
  const [voiceProfile, setVoiceProfile] = useState<string>('');
  const [currentStep, setCurrentStep] = useState<'info' | 'voice' | 'complete'>('info');
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useUser();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRoleChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      role: value
    }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) return 'Name is required';
    if (!formData.email.trim()) return 'Email is required';
    if (!formData.password) return 'Password is required';
    if (formData.password !== formData.confirmPassword) return 'Passwords do not match';
    if (!formData.role) return 'Role is required';
    if (formData.password.length < 6) return 'Password must be at least 6 characters';
    return '';
  };

  const handleInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError('');
    setCurrentStep('voice');
  };

  const handleVoiceEnrolled = (voiceData: string) => {
    setVoiceProfile(voiceData);
    setTimeout(() => {
      setCurrentStep('complete');
    }, 1000);
  };

  const handleFinalSubmit = async () => {
    setIsLoading(true);
    try {
      const response = await window.ezsite.apis.register({
        email: formData.email,
        password: formData.password
      });

      if (response.error) {
        throw new Error(response.error);
      }

      // Auto-login after successful registration
      const loginResponse = await window.ezsite.apis.login({
        email: formData.email,
        password: formData.password
      });

      if (loginResponse.error) {
        throw new Error(loginResponse.error);
      }

      // Get user info and update context
      const userResponse = await window.ezsite.apis.getUserInfo();
      if (userResponse.data && !userResponse.error) {
        login(userResponse.data);
      }

      toast({
        title: "Registration Successful!",
        description: "Welcome to the presentation platform. You can now start creating presentations.",
      });

      navigate('/dashboard');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Registration failed');
      toast({
        title: "Registration Failed",
        description: error instanceof Error ? error.message : 'Please try again',
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-6">
      <div className="flex items-center space-x-4">
        <div className={`flex items-center ${currentStep === 'info' ? 'text-blue-600' : currentStep === 'voice' || currentStep === 'complete' ? 'text-green-600' : 'text-gray-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'info' ? 'bg-blue-100 border-2 border-blue-600' : currentStep === 'voice' || currentStep === 'complete' ? 'bg-green-100' : 'bg-gray-100'}`}>
            {currentStep === 'voice' || currentStep === 'complete' ? <CheckCircle className="h-4 w-4" /> : '1'}
          </div>
          <span className="ml-2 text-sm font-medium">Personal Info</span>
        </div>
        
        <div className={`h-px w-12 ${currentStep === 'voice' || currentStep === 'complete' ? 'bg-green-600' : 'bg-gray-300'}`}></div>
        
        <div className={`flex items-center ${currentStep === 'voice' ? 'text-blue-600' : currentStep === 'complete' ? 'text-green-600' : 'text-gray-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'voice' ? 'bg-blue-100 border-2 border-blue-600' : currentStep === 'complete' ? 'bg-green-100' : 'bg-gray-100'}`}>
            {currentStep === 'complete' ? <CheckCircle className="h-4 w-4" /> : '2'}
          </div>
          <span className="ml-2 text-sm font-medium">Voice Enrollment</span>
        </div>
        
        <div className={`h-px w-12 ${currentStep === 'complete' ? 'bg-green-600' : 'bg-gray-300'}`}></div>
        
        <div className={`flex items-center ${currentStep === 'complete' ? 'text-blue-600' : 'text-gray-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'complete' ? 'bg-blue-100 border-2 border-blue-600' : 'bg-gray-100'}`}>
            3
          </div>
          <span className="ml-2 text-sm font-medium">Complete</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {renderStepIndicator()}
        
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mb-4">
              <UserPlus className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {currentStep === 'info' && 'Create Your Account'}
              {currentStep === 'voice' && 'Voice Enrollment'}
              {currentStep === 'complete' && 'Registration Complete'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <Alert className="border-red-200 bg-red-50">
                <AlertDescription className="text-red-800">{error}</AlertDescription>
              </Alert>
            )}

            {currentStep === 'info' && (
              <form onSubmit={handleInfoSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Full Name
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="password" className="flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      Password
                    </Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="Create a password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4" />
                      Role
                    </Label>
                    <Select onValueChange={handleRoleChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="teacher">Teacher/Educator</SelectItem>
                        <SelectItem value="student">Student</SelectItem>
                        <SelectItem value="business">Business Professional</SelectItem>
                        <SelectItem value="researcher">Researcher</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="organization">Organization (Optional)</Label>
                    <Input
                      id="organization"
                      name="organization"
                      type="text"
                      placeholder="Your organization"
                      value={formData.organization}
                      onChange={handleInputChange}
                      className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  Continue to Voice Enrollment
                </Button>
              </form>
            )}

            {currentStep === 'voice' && (
              <div className="space-y-4">
                <VoiceEnrollment onVoiceEnrolled={handleVoiceEnrolled} />
              </div>
            )}

            {currentStep === 'complete' && (
              <div className="text-center space-y-6">
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    You are successfully registered!
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Welcome to the AI-powered presentation platform, {formData.name}!
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center mb-6">
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      ✓ Account Created
                    </Badge>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      ✓ Voice Profile Enrolled
                    </Badge>
                    <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                      ✓ Ready to Present
                    </Badge>
                  </div>
                </div>
                <Button 
                  onClick={handleFinalSubmit} 
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  {isLoading ? 'Setting up your account...' : 'Proceed to Dashboard'}
                </Button>
              </div>
            )}

            <div className="text-center text-sm text-gray-600">
              Already have an account?{' '}
              <button
                onClick={() => navigate('/login')}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Sign in here
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Registration;