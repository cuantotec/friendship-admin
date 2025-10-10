"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Shield, Loader2 } from "lucide-react";

export function NeonLoginForm() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    setError(null);

    try {
      // Use Stack Auth OTP flow
      window.location.href = `/handler/stack/otp?email=${encodeURIComponent(email)}`;
    } catch (err) {
      console.error("Sign in error:", err);
      setError("An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
          <Shield className="h-6 w-6 text-blue-600" />
        </div>
        <CardTitle className="text-xl">Welcome to Friendship Gallery</CardTitle>
        <CardDescription>
          Sign in with your email address
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleEmailSignIn} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="email"
                type="email"
                placeholder="Enter your email address"
                className="pl-10"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
          </div>

          {error && (
            <div className="text-red-600 text-sm text-center">
              {error}
            </div>
          )}
          
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Mail className="h-4 w-4 mr-2" />
                Send Sign-In Link
              </>
            )}
          </Button>
          
          <div className="text-center">
            <p className="text-xs text-gray-500">
              We'll send you a secure link to sign in
            </p>
          </div>
        </form>

        <div className="border-t pt-4 mt-6">
          <div className="text-center">
            <p className="text-xs text-gray-500">
              <Shield className="h-3 w-3 inline mr-1" />
              Powered by Neon Auth • Secure authentication
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
