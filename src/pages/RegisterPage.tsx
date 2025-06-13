import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/store/authStore';
import { toast } from '@/hooks/use-toast';
import { Loader2, Presentation } from 'lucide-react';

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const register = useAuthStore((state) => state.register);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      const result = await register(email, password, name);
      if (result.success) {
        toast({
          title: "Registration Successful",
          description: "Welcome to AI Presentation Assistant"
        });
        navigate('/voice-setup');
      } else {
        toast({
          title: "Registration Failed",
          description: result.error || "Registration failed",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Registration Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4" data-id="56ksie6ct" data-path="src/pages/RegisterPage.tsx">
      <Card className="w-full max-w-md" data-id="p1txfkybp" data-path="src/pages/RegisterPage.tsx">
        <CardHeader className="text-center" data-id="qqth7m5gs" data-path="src/pages/RegisterPage.tsx">
          <div className="flex items-center justify-center mb-4" data-id="mnddsc7vt" data-path="src/pages/RegisterPage.tsx">
            <div className="h-12 w-12 bg-primary rounded-lg flex items-center justify-center" data-id="yb0ynpnhq" data-path="src/pages/RegisterPage.tsx">
              <Presentation className="h-6 w-6 text-primary-foreground" data-id="ks2jmksp6" data-path="src/pages/RegisterPage.tsx" />
            </div>
          </div>
          <CardTitle className="text-2xl" data-id="ythldml81" data-path="src/pages/RegisterPage.tsx">Create Account</CardTitle>
          <CardDescription data-id="yqa0ojpri" data-path="src/pages/RegisterPage.tsx">
            Join the future of intelligent presentations
          </CardDescription>
        </CardHeader>
        <CardContent data-id="7m3835o0u" data-path="src/pages/RegisterPage.tsx">
          <form onSubmit={handleSubmit} className="space-y-4" data-id="82r8lomvd" data-path="src/pages/RegisterPage.tsx">
            <div className="space-y-2" data-id="yukzq3zi9" data-path="src/pages/RegisterPage.tsx">
              <Label htmlFor="name" data-id="2hox1vdyz" data-path="src/pages/RegisterPage.tsx">Full Name</Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                required data-id="l4eq76by8" data-path="src/pages/RegisterPage.tsx" />

            </div>
            <div className="space-y-2" data-id="uuuo1b3gs" data-path="src/pages/RegisterPage.tsx">
              <Label htmlFor="email" data-id="0m1c9pa72" data-path="src/pages/RegisterPage.tsx">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required data-id="ff7xiqzqh" data-path="src/pages/RegisterPage.tsx" />

            </div>
            <div className="space-y-2" data-id="hohdkwldt" data-path="src/pages/RegisterPage.tsx">
              <Label htmlFor="password" data-id="t70c9jh9i" data-path="src/pages/RegisterPage.tsx">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a password"
                required data-id="urm7bem4p" data-path="src/pages/RegisterPage.tsx" />

            </div>
            <div className="space-y-2" data-id="5eobswrzl" data-path="src/pages/RegisterPage.tsx">
              <Label htmlFor="confirmPassword" data-id="x8upvycyr" data-path="src/pages/RegisterPage.tsx">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                required data-id="e1tpwuehh" data-path="src/pages/RegisterPage.tsx" />

            </div>
            <Button type="submit" className="w-full" disabled={isLoading} data-id="dr8qhveye" data-path="src/pages/RegisterPage.tsx">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" data-id="193bx68wt" data-path="src/pages/RegisterPage.tsx" />}
              Create Account
            </Button>
          </form>
          
          <div className="mt-6 text-center" data-id="neejxezzu" data-path="src/pages/RegisterPage.tsx">
            <p className="text-sm text-muted-foreground" data-id="2il3d0l6e" data-path="src/pages/RegisterPage.tsx">
              Already have an account?{' '}
              <Link to="/login" className="text-primary hover:underline" data-id="zq4tu3s44" data-path="src/pages/RegisterPage.tsx">
                Sign in
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>);

};

export default RegisterPage;