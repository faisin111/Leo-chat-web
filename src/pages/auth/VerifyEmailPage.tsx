import { useEffect, useState, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
// eslint-disable-next-line no-restricted-imports
import { useVerifyEmail } from '@/features/auth/api/use-verify-email';
import { Button } from '@/shared/ui/button';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { formatApiError } from '@/shared/api/api-error';

export const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const verifyEmail = useVerifyEmail();
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'idle'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  // Use a ref to strictly prevent React 18 strict mode double-firing
  const hasAttempted = useRef(false);

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setErrorMessage('No verification token found in the URL.');
      return;
    }

    if (hasAttempted.current) return;
    hasAttempted.current = true;

    setStatus('loading');
    verifyEmail.mutate(
      { token },
      {
        onSuccess: () => {
          setStatus('success');
        },
        onError: (error: unknown) => {
          setStatus('error');
          setErrorMessage(
            formatApiError(
              error,
              'Failed to verify email. The link may have expired or is invalid.',
            ),
          );
        },
      },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-sm border border-slate-100 text-center">
        {status === 'loading' && (
          <div className="flex flex-col items-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-2">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Verifying Email</h1>
            <p className="text-slate-500">
              Please wait a moment while we verify your email address.
            </p>
          </div>
        )}

        {status === 'success' && (
          <div className="flex flex-col items-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center text-green-600 mb-2">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Email Verified!</h1>
            <p className="text-slate-500">
              Your email has been successfully verified. You now have full access to all features.
            </p>
            <div className="pt-4 w-full">
              <Button asChild className="w-full">
                <Link to="/">Go to Dashboard</Link>
              </Button>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center text-red-600 mb-2">
              <XCircle className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Verification Failed</h1>
            <p className="text-slate-500">{errorMessage}</p>
            <div className="pt-4 w-full">
              <Button asChild variant="outline" className="w-full">
                <Link to="/">Return to Dashboard</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
