import { useState } from 'react';
import { useBank } from '../contexts/BankContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { toast } from 'sonner';
import asensoLogo from '../assets/asensologo.png';
import '../index.css';
import '../app.css';

export function LoginPage() {
  const { login } = useBank();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const success = login(username, password);
    if (success) {
      toast.success('Login successful');
    } else {
      toast.error('Invalid username or password');
    }
  };

  const quickLogin = (user: string, pass: string) => {
    setUsername(user);
    setPassword(pass);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <img src={asensoLogo} alt="Asenso Bank" className='logo'/>
          </div>
          <CardTitle>Rural Bank System</CardTitle>
          <CardDescription>Sign in to access your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
              />
            </div>
            <Button type="submit" className="w-full">
              Sign In
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t">
            <p className="text-sm text-gray-600 mb-3">Quick Login (Demo):</p>
            <div className="grid grid-cols-2 gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => quickLogin('admin', 'admin123')}
              >
                Admin
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => quickLogin('teller1', 'teller1')}
              >
                Teller 1
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => quickLogin('teller2', 'teller2')}
              >
                Teller 2
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => quickLogin('teller3', 'teller3')}
              >
                Teller 3
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}