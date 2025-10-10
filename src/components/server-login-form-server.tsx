import { sendStackOTP } from "@/lib/actions/stack-otp-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Shield } from "lucide-react";

interface ServerLoginFormProps {
  error?: string | null;
}

export function ServerLoginForm({ error }: ServerLoginFormProps) {
  return (
    <div className="w-full space-y-6">
      <div className="text-center">
        <div className="mx-auto h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
          <Shield className="h-6 w-6 text-blue-600" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900">Secure Sign In</h2>
        <p className="text-sm text-gray-600 mt-2">
          Enter your email address and we&apos;ll send you a secure 6-digit code
        </p>
      </div>

      <form action={sendStackOTP} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="Enter your email address"
              className="pl-10"
              required
            />
          </div>
        </div>

        {error && (
          <div className="text-red-600 text-sm text-center">
            {error}
          </div>
        )}
        
        <Button type="submit" className="w-full">
          <Mail className="h-4 w-4 mr-2" />
          Send Verification Code
        </Button>
        
        <div className="text-center">
          <p className="text-xs text-gray-500">
            We&apos;ll send you a 6-digit code that expires in 10 minutes
          </p>
        </div>
      </form>

      <div className="border-t pt-4">
        <div className="text-center">
          <p className="text-xs text-gray-500">
            <Shield className="h-3 w-3 inline mr-1" />
            Secure authentication • No passwords required
          </p>
        </div>
      </div>
    </div>
  );
}
