// import { Suspense } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface ErrorPageProps {
  searchParams: Promise<{
    error?: string;
  }>;
}

export default async function AuthErrorPage({ searchParams }: ErrorPageProps) {
  const params = await searchParams;
  const { error } = params;

  const getErrorMessage = (error: string) => {
    switch (error) {
      case "Configuration":
        return {
          title: "Configuration Error",
          description: "There's a problem with the authentication configuration. Please contact your administrator.",
          details: "Missing or invalid environment variables for authentication."
        };
      case "AccessDenied":
        return {
          title: "Access Denied",
          description: "You don't have permission to access this resource.",
          details: "Your account may not have the required permissions."
        };
      case "Verification":
        return {
          title: "Verification Failed",
          description: "The verification link is invalid or has expired.",
          details: "Please try signing in again or request a new magic link."
        };
      case "Default":
        return {
          title: "Authentication Error",
          description: "An error occurred during authentication.",
          details: "Please try again or contact support if the problem persists."
        };
      default:
        return {
          title: "Authentication Error",
          description: "An unexpected error occurred.",
          details: error || "Unknown error"
        };
    }
  };

  const errorInfo = getErrorMessage(error || "Default");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Authentication Error</h1>
        </div>

        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-xl text-red-600">{errorInfo.title}</CardTitle>
            <CardDescription>
              {errorInfo.description}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-gray-50 p-3 rounded-md">
              <p className="text-sm text-gray-600">{errorInfo.details}</p>
            </div>
            
            <div className="flex flex-col space-y-2">
              <Button asChild className="w-full">
                <Link href="/login">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Try Again
                </Link>
              </Button>
              
              <Button variant="outline" asChild className="w-full">
                <Link href="/">
                  Go to Home
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <p className="text-xs text-gray-500">
            If this problem persists, please contact your administrator
          </p>
        </div>
      </div>
    </div>
  );
}
