import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldAlert, Home, LogIn, Mail, Lock, AlertCircle, ChevronLeft } from 'lucide-react';

const UnauthorizedPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Main Card */}
        <Card className="shadow-lg border-0 overflow-hidden">
          {/* Card Header with accent border */}
          <div className="border-t-4 border-red-500">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto flex items-center justify-center w-16 h-16 rounded-full bg-red-50 mb-4">
                <ShieldAlert className="h-8 w-8 text-red-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-800">
                Access Restricted
              </CardTitle>
              <CardDescription className="text-gray-600">
                You don't have permission to view this page
              </CardDescription>
            </CardHeader>
          </div>

          <CardContent className="space-y-6">
            {/* Information Alert */}
            <div className="bg-blue-50/50 border border-blue-100 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">Why am I seeing this?</p>
                  <p>Your account doesn't have the required permissions to access this resource. This is a security measure to protect sensitive information.</p>
                </div>
              </div>
            </div>

            {/* Recommended Actions */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Recommended Actions</h3>
              <div className="grid gap-3">
                <Button asChild variant="outline" className="h-11 justify-start gap-3">
                  <Link to="/" className="text-base">
                    <Home className="h-5 w-5" />
                    Return to Homepage
                  </Link>
                </Button>
                
                <Button asChild variant="outline" className="h-11 justify-start gap-3">
                  <Link to="/login" className="text-base">
                    <LogIn className="h-5 w-5" />
                    Sign in with different account
                  </Link>
                </Button>
              </div>
            </div>

            {/* Contact Support */}
            <div className="border-t border-gray-100 pt-4">
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-3">
                  Still need help? Contact our support team
                </p>
                <Button asChild variant="ghost" size="sm" className="gap-2 text-blue-600 hover:text-blue-700">
                  <Link to="/contact">
                    <Mail className="h-4 w-4" />
                    Contact Support
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer with error details */}
        <div className="mt-6 text-center text-xs text-gray-400 flex items-center justify-center gap-3">
          <span>Error 403: Forbidden</span>
          <span>•</span>
          <span>TutorNearby Security System</span>
        </div>

        {/* Back button for better UX */}
        <div className="mt-8 text-center">
          <Button asChild variant="link" className="text-gray-600 hover:text-gray-900">
            <Link to="/" className="flex items-center justify-center gap-1">
              <ChevronLeft className="h-4 w-4" />
              Back to safety
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedPage;