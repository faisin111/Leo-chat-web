import { Link } from 'react-router-dom';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';

export const LoginPage = () => {
  return (
    <div className="flex w-full flex-col lg:flex-row">
      {/* Left side - Visuals */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-card border-r border-border p-12 relative overflow-hidden">
        {/* Background gradient/image placeholder */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-background z-0"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

        <div className="relative z-10 flex items-center space-x-2 font-bold text-xl text-primary">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
            L
          </div>
          <span>LeoChat</span>
        </div>

        <div className="relative z-10 max-w-md mt-24">
          <div className="w-12 h-12 bg-primary/20 text-primary flex items-center justify-center rounded-xl mb-6 text-2xl font-serif">
            &quot;
          </div>
          <h2 className="text-3xl font-bold mb-6 leading-tight">
            &quot;LeoChat keeps our decisions close to the work—and our conversations genuinely
            focused.&quot;
          </h2>
          <div>
            <p className="font-bold">Maya Chen</p>
            <p className="text-muted-foreground text-sm">Head of Design, Northstar Studio</p>
          </div>
        </div>

        <div className="relative z-10 text-xs text-muted-foreground mt-24">
          Private by design • Synced everywhere
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex flex-col justify-center items-center p-8 lg:p-12 relative">
        <div className="absolute top-8 right-8 text-sm">
          <span className="text-muted-foreground mr-2">New to LeoChat?</span>
          <Button variant="outline" asChild>
            <Link to="/register">Create account</Link>
          </Button>
        </div>

        <div className="w-full max-w-[400px]">
          <div className="lg:hidden flex items-center space-x-2 font-bold text-xl text-primary mb-12">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
              L
            </div>
            <span>LeoChat</span>
          </div>

          <h1 className="text-3xl font-bold mb-2">Welcome back</h1>
          <p className="text-muted-foreground mb-8">Sign in to continue your conversations.</p>

          <Button variant="outline" className="w-full mb-6 font-medium h-12">
            <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </Button>

          <div className="relative flex items-center mb-6">
            <div className="flex-grow border-t border-border"></div>
            <span className="flex-shrink-0 mx-4 text-muted-foreground text-xs uppercase">
              or continue with email
            </span>
            <div className="flex-grow border-t border-border"></div>
          </div>

          <form className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                placeholder="alex@northstar.design"
                required
                className="h-12"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                required
                className="h-12"
              />
            </div>

            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="remember"
                  className="rounded border-input text-primary focus:ring-primary h-4 w-4"
                />
                <Label htmlFor="remember" className="font-normal cursor-pointer text-sm">
                  Remember me
                </Label>
              </div>
              <Link
                to="/forgot-password"
                className="text-sm font-medium text-primary hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            <Button className="w-full h-12 mt-6" type="submit">
              Sign in
            </Button>
          </form>

          <div className="mt-8 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                clipRule="evenodd"
              />
            </svg>
            Your session is encrypted and protected.
          </div>

          <div className="mt-12 text-center text-xs text-muted-foreground space-x-4">
            <a href="/" className="hover:text-foreground">
              Privacy
            </a>
            <a href="/" className="hover:text-foreground">
              Terms
            </a>
            <a href="/" className="hover:text-foreground">
              Help center
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
