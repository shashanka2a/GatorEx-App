"use client"

import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card } from "./ui/card";
import { Logo } from "./ui/Logo";
import { Mail, Check, RefreshCw } from "lucide-react";

interface EmailVerificationProps {
  email: string;
  onVerified: () => void;
  onBack: () => void;
}

export function EmailVerification({ email, onVerified, onBack }: EmailVerificationProps) {
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (code.length !== 6) {
      alert("Please enter a 6-digit verification code");
      return;
    }
    
    setIsLoading(true);
    
    // Simulate verification
    setTimeout(() => {
      setIsLoading(false);
      onVerified();
    }, 2000);
  };

  const handleResend = () => {
    setTimeLeft(60);
    setCanResend(false);
    // Simulate resend
    alert("Verification code resent!");
  };

  return (
    <div className="min-h-screen bg-uf-gradient flex flex-col">
      {/* Header */}
      <div className="p-6 text-center text-white opacity-0 animate-[fadeInUp_0.6s_ease-out_forwards]">
        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg p-2">
          <img 
            src="/logo.svg" 
            alt="GatorEx Logo" 
            className="w-full h-full object-contain"
          />
        </div>
        <h1 className="text-2xl font-bold mb-2">Check Your Email</h1>
        <p className="text-white/90">We sent a code to verify your UF email</p>
      </div>
      
      {/* Verification Form */}
      <div className="flex-1 px-6 pb-6">
        <Card className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 opacity-0 animate-[slideInUp_0.8s_ease-out_forwards] animation-delay-200">
          <div className="p-6">
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Email Verification</h2>
              <p className="text-gray-600">
                Enter the 6-digit code sent to
              </p>
              <p className="text-uf-orange font-medium">{email}</p>
            </div>
            
            <form onSubmit={handleVerify} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Verification Code</label>
                <Input
                  type="text"
                  placeholder="000000"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="text-center text-2xl font-mono tracking-widest bg-gray-50 border-gray-200 rounded-xl"
                  maxLength={6}
                  required
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-uf-gradient hover:opacity-90 text-white font-semibold py-3 px-6 rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                disabled={isLoading || code.length !== 6}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    Verifying...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4" />
                    Verify Email
                  </div>
                )}
              </Button>
            </form>
            
            <div className="mt-6 text-center space-y-3">
              <p className="text-gray-600">
                Didn&apos;t receive the code?
              </p>
              
              {canResend ? (
                <Button 
                  variant="outline" 
                  onClick={handleResend}
                  className="w-full"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Resend Code
                </Button>
              ) : (
                <p className="text-sm text-gray-500">
                  Resend code in {timeLeft}s
                </p>
              )}
              
              <Button 
                variant="ghost" 
                onClick={onBack}
                className="w-full text-gray-600"
              >
                Back to Sign In
              </Button>
            </div>
            
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="space-y-2 text-xs text-gray-500 text-center">
                <p>✓ Secure UF email verification</p>
                <p>✓ Ensures authentic Gator community</p>
                <p>✓ Protects against spam and fraud</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}