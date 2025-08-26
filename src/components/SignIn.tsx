"use client"

import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card } from "./ui/card";
import { Logo } from "./ui/Logo";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";

interface SignInProps {
  onSignIn: (email: string) => void;
  onSignUp: () => void;
}

export function SignIn({ onSignIn, onSignUp }: SignInProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.endsWith("@ufl.edu")) {
      alert("Please use your UF email address (@ufl.edu)");
      return;
    }
    
    setIsLoading(true);
    
    // Simulate authentication
    setTimeout(() => {
      setIsLoading(false);
      onSignIn(email);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-uf-gradient flex flex-col">
      {/* Header */}
      <div className="p-6 text-center text-white opacity-0 animate-[fadeInUp_0.6s_ease-out_forwards]">
        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg p-2">
          <Logo size="xl" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Welcome to GatorEx</h1>
        <p className="text-white/90">Your UF marketplace</p>
      </div>
      
      {/* Sign In Form */}
      <div className="flex-1 px-6 pb-6">
        <Card className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 opacity-0 animate-[slideInUp_0.8s_ease-out_forwards] animation-delay-200">
          <div className="p-6">
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Sign In</h2>
              <p className="text-gray-600">Access your GatorEx account</p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">UF Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    type="email"
                    placeholder="your.email@ufl.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 bg-gray-50 border-gray-200 rounded-xl"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 bg-gray-50 border-gray-200 rounded-xl"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center">
                  <input type="checkbox" className="rounded border-gray-300" />
                  <span className="ml-2 text-gray-600">Remember me</span>
                </label>
                <a href="#" className="text-uf-orange hover:text-uf-orange/80">
                  Forgot password?
                </a>
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-uf-gradient hover:opacity-90 text-white font-semibold py-3 px-6 rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    Signing In...
                  </div>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>
            
            <div className="mt-6 text-center">
              <p className="text-gray-600">
                New to GatorEx?{" "}
                <button 
                  onClick={onSignUp}
                  className="text-uf-orange hover:text-uf-orange/80 font-medium"
                >
                  Create Account
                </button>
              </p>
            </div>
            
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="inline-flex items-center gap-1 bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full mx-auto">
                <span>🔒</span>
                <span>UF Student Verified Platform</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}