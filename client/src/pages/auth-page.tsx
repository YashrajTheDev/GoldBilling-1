import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Coins } from "lucide-react";

export default function AuthPage() {
  const { user, loginMutation } = useAuth();
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });

  // Redirect if already logged in
  if (user) {
    return <Redirect to="/" />;
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate(credentials);
  };

  return (
    <div className="min-h-screen flex">
      {/* Login Form - Left Side */}
      <div className="flex-1 flex items-center justify-center bg-background">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="gold-gradient p-4 rounded-lg">
                <Coins className="text-primary-foreground text-3xl" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-foreground">Welcome Back</h2>
            <p className="text-muted-foreground">Sign in to access GoldBill Pro</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Login</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    type="text"
                    value={credentials.username}
                    onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                    data-testid="username-input"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={credentials.password}
                    onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                    data-testid="password-input"
                    required
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={loginMutation.isPending}
                  data-testid="login-button"
                >
                  {loginMutation.isPending ? "Signing in..." : "Sign In"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Hero Section - Right Side */}
      <div className="flex-1 bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center text-white">
        <div className="text-center space-y-6 max-w-md">
          <div className="flex justify-center">
            <Coins className="text-8xl" />
          </div>
          <h1 className="text-4xl font-bold">GoldBill Pro</h1>
          <p className="text-xl opacity-90">Professional Gold Trading System</p>
          <div className="space-y-2 text-lg">
            <p>✓ Customer Management</p>
            <p>✓ Weight Tracking</p>
            <p>✓ Professional Invoicing</p>
            <p>✓ WhatsApp Integration</p>
          </div>
        </div>
      </div>
    </div>
  );
}