'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { validateSsoToken, storeSsoAuthData } from '@/services/sso';
import { createUserDataFromSso, getRedirectPath } from '@/config/sso';
import { Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const SsoCallbackPage: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleSsoCallback = async () => {
      try {
        setIsProcessing(true);
        setError(null);

        // Get token from URL parameters
        const token = searchParams.get('token');
        
        if (!token) {
          throw new Error('SSO token not found in URL parameters.');
        }

        console.log('🔐 Processing SSO callback with token...');

        // Validate token with SSO provider
        const response = await validateSsoToken(token);

        if (!response.valid || !response.user) {
          throw new Error(response.message || 'Invalid SSO response from server.');
        }

        // Create user data from SSO response
        const userData = createUserDataFromSso(response.user, token);

        // Store authentication data
        storeSsoAuthData(userData, token);

        console.log('✅ SSO login successful:', {
          userId: userData.id,
          userEmail: userData.email,
          userRole: userData.role
        });

        // Show success message
        console.log('🎉 SSO Sign in successful!');

        // Redirect based on user role
        const redirectPath = getRedirectPath(userData.role);
        
        console.log(`🔄 Redirecting to: ${redirectPath}`);
        router.push(redirectPath);

      } catch (err: any) {
        console.error('❌ SSO callback error:', err);
        
        const errorMessage = err.response?.data?.message || err.message || 'SSO login failed.';
        setError(errorMessage);
        
        // Auto-redirect to login after error
        setTimeout(() => {
          router.push('/login');
        }, 5000);
      } finally {
        setIsProcessing(false);
      }
    };

    handleSsoCallback();
  }, [router, searchParams]);

  const handleRetryLogin = () => {
    router.push('/login');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800">
      <div className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 max-w-md w-full mx-4">
        
        {isProcessing && (
          <>
            <div className="flex justify-center mb-6">
              <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
            </div>
            <h1 className="text-xl font-semibold text-center text-slate-900 dark:text-white mb-2">
              Processing SSO Login
            </h1>
            <p className="text-center text-slate-600 dark:text-slate-300">
              Please wait while we authenticate your account...
            </p>
          </>
        )}

        {error && (
          <>
            <div className="flex justify-center mb-6">
              <AlertCircle className="w-12 h-12 text-red-500" />
            </div>
            <h1 className="text-xl font-semibold text-center text-slate-900 dark:text-white mb-4">
              Authentication Failed
            </h1>
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
              <p className="text-red-700 dark:text-red-300 text-sm">
                {error}
              </p>
            </div>
            <div className="space-y-3">
              <Button 
                onClick={handleRetryLogin}
                className="w-full"
                variant="default"
              >
                Return to Login
              </Button>
              <p className="text-xs text-center text-slate-500 dark:text-slate-400">
                Redirecting automatically in 5 seconds...
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SsoCallbackPage;
