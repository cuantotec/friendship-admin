import { verifyStackOTP } from "@/lib/actions/stack-otp-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Shield } from "lucide-react";
import Link from "next/link";

interface ServerOTPFormProps {
  email: string;
  error?: string | null;
  attempts?: number;
}

export function ServerOTPForm({ email, error, attempts }: ServerOTPFormProps) {
  return (
    <div className="w-full space-y-6">
      <div className="text-center">
        <div className="mx-auto h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
          <Shield className="h-6 w-6 text-blue-600" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900">Verify Your Email</h2>
        <p className="text-sm text-gray-600 mt-2">
          Enter the 6-digit code sent to <strong>{email}</strong>
        </p>
      </div>

      <form action={verifyStackOTP} className="space-y-4">
        <input type="hidden" name="email" value={email} />
        
        <div className="space-y-2">
          <Label htmlFor="otp">Verification Code</Label>
          <Input
            id="otp"
            name="otp"
            type="text"
            placeholder="Enter 6-digit code"
            className="text-center text-lg font-mono tracking-widest"
            maxLength={6}
            required
          />
        </div>

        {error && (
          <div className="text-red-600 text-sm text-center">
            {error}
          </div>
        )}

        {attempts && attempts > 0 && (
          <div className="text-yellow-600 text-sm text-center">
            {attempts} of 3 attempts used
          </div>
        )}
        
        <Button type="submit" className="w-full">
          Verify Code
        </Button>
        
        <div className="text-center">
          <p className="text-xs text-gray-500">
            Code expires in 10 minutes
          </p>
        </div>
      </form>

      <div className="border-t pt-4">
        <div className="text-center">
          <Link 
            href="/login" 
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to email entry
          </Link>
        </div>
      </div>
    </div>
  );
}
