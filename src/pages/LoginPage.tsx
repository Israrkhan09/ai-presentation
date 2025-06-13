import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/store/authStore';
import { toast } from '@/hooks/use-toast';
import { Loader2, Presentation } from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await login(email, password);
      if (result.success) {
        toast({
          title: "Login Successful",
          description: "Welcome back to your presentation dashboard"
        });
        navigate('/dashboard');
      } else {
        toast({
          title: "Login Failed",
          description: result.error || "Invalid credentials",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Login Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4" data-id="l5xgncqy7" data-path="src/pages/LoginPage.tsx">
      <Card className="w-full max-w-md" data-id="vk56pf6ts" data-path="src/pages/LoginPage.tsx">
        <CardHeader className="text-center" data-id="bqbe533zs" data-path="src/pages/LoginPage.tsx">
          <div className="flex items-center justify-center mb-4" data-id="rsd3cp372" data-path="src/pages/LoginPage.tsx">
            <div className="h-12 w-12 bg-primary rounded-lg flex items-center justify-center" data-id="pv7elfwls" data-path="src/pages/LoginPage.tsx">
              <Presentation className="h-6 w-6 text-primary-foreground" data-id="70zj1u1i0" data-path="src/pages/LoginPage.tsx" />
            </div>
          </div>
          <CardTitle className="text-2xl" data-id="s8hv3pdvb" data-path="src/pages/LoginPage.tsx">AI Presentation Assistant</CardTitle>
          <CardDescription data-id="zje9xn8tt" data-path="src/pages/LoginPage.tsx">
            Sign in to access your intelligent presentation platform
          </CardDescription>
        </CardHeader>
        <CardContent data-id="z0hf8tkph" data-path="src/pages/LoginPage.tsx">
          <form onSubmit={handleSubmit} className="space-y-4" data-id="mztpsbzlr" data-path="src/pages/LoginPage.tsx">
            <div className="space-y-2" data-id="2iii5y2vr" data-path="src/pages/LoginPage.tsx">
              <Label htmlFor="email" data-id="hmoh3aj8o" data-path="src/pages/LoginPage.tsx">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required data-id="7ckp7fdxg" data-path="src/pages/LoginPage.tsx" />

            </div>
            <div className="space-y-2" data-id="calwlhxnk" data-path="src/pages/LoginPage.tsx">
              <Label htmlFor="password" data-id="nay92oai8" data-path="src/pages/LoginPage.tsx">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required data-id="gihphp9ok" data-path="src/pages/LoginPage.tsx" />

            </div>
            <Button type="submit" className="w-full" disabled={isLoading} data-id="r13xmuknq" data-path="src/pages/LoginPage.tsx">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" data-id="sfkx3htca" data-path="src/pages/LoginPage.tsx" />}
              Sign In
            </Button>
          </form>
          
          <div className="mt-6 text-center" data-id="jd00xfg6x" data-path="src/pages/LoginPage.tsx">
            <p className="text-sm text-muted-foreground" data-id="x8szjhy9k" data-path="src/pages/LoginPage.tsx">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary hover:underline" data-id="yjd3ru4e1" data-path="src/pages/LoginPage.tsx">
                Sign up
              </Link>
            </p>
          </div>

          <div className="mt-4 p-3 bg-muted rounded-lg" data-id="deqqw70wd" data-path="src/pages/LoginPage.tsx">
            <p className="text-xs text-muted-foreground text-center" data-id="l6ce6qwf9" data-path="src/pages/LoginPage.tsx">
              Demo: Use any email and password to sign in
            </p>
          </div>
        </CardContent>
      </Card>
    </div>);

};

export default LoginPage;