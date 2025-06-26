import { SignupForm } from './signup-form';
import { Logo } from '@/components/logo';
import Link from 'next/link';

export default function SignupPage() {
  return (
    <div className="relative flex min-h-screen flex-col bg-background">
      <div className="absolute left-6 top-6 z-10">
        <Logo />
      </div>
      <main className="flex-grow w-full flex items-center justify-center p-6">
          <div className="mx-auto grid w-full max-w-md gap-6 py-12">
            <div className="grid gap-4 text-center">
              <h1 className="text-3xl font-bold opacity-0 animate-fade-down [animation-delay:200ms]">Create an account</h1>
              <p className="text-balance text-muted-foreground opacity-0 animate-fade-down [animation-delay:400ms]">
                Enter your information to get started.
              </p>
            </div>
            <div className="opacity-0 animate-fade-up [animation-delay:600ms]">
              <SignupForm />
            </div>
            <div className="mt-4 text-center text-sm opacity-0 animate-fade-up [animation-delay:800ms]">
              Already have an account?{' '}
              <Link href="/login" className="underline font-medium text-primary">
                Log in
              </Link>
            </div>
          </div>
      </main>
      <footer className="py-4 text-center text-muted-foreground text-sm border-t">
        <p>&copy; {new Date().getFullYear()} MediVault. All rights reserved.</p>
      </footer>
    </div>
  );
}
