import { LoginForm } from './login-form';
import { Logo } from '@/components/logo';
import { ThemeToggle } from '@/components/theme-toggle';
import Link from 'next/link';
import { getSessionUser } from '@/app/actions';
import { redirect } from 'next/navigation';
import { redirectToRoleDashboard } from '@/lib/utils';

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ role?: string }> }) {
  const user = await getSessionUser();
  if (user) {
    redirect(redirectToRoleDashboard(user));
  }
  const { role = 'patient' } = await searchParams;

  const content = {
    patient: {
      title: 'Welcome Back',
      description: 'Enter your credentials to access your patient portal.',
    },
    doctor: {
      title: 'Doctor Login',
      description: 'Access the MediVault dashboard for healthcare professionals.',
    },
    admin: {
      title: 'Admin Login',
      description: 'Access the MediVault management panel.',
    },
  };

  const { title, description } = content[role as keyof typeof content] || content.patient;
  const showSignUpLink = role === 'patient';
  const showDoctorSetupLink = role === 'doctor';

  return (
    <div className="relative flex min-h-screen flex-col bg-background">
      <div className="absolute left-6 top-6 z-10">
        <Logo />
      </div>
      <div className="absolute right-6 top-6 z-10">
        <ThemeToggle />
      </div>
      <main className="flex-grow w-full flex items-center justify-center p-6">
          <div className="mx-auto grid w-full max-w-sm gap-6">
            <div className="grid gap-4 text-center">
              <h1 className="text-3xl font-bold opacity-0 animate-fade-down [animation-delay:200ms]">{title}</h1>
              <p className="text-balance text-muted-foreground opacity-0 animate-fade-down [animation-delay:400ms]">
                {description}
              </p>
            </div>
            <div className="opacity-0 animate-fade-up [animation-delay:600ms]">
              <LoginForm role={role as 'admin' | 'doctor' | 'patient'} />
            </div>
            {showSignUpLink && (
              <div className="mt-4 text-center text-sm opacity-0 animate-fade-up [animation-delay:800ms]">
                Don&apos;t have a patient account?{' '}
                <Link href="/signup" className="underline font-medium text-primary">
                  Sign up
                </Link>
              </div>
            )}
            {showDoctorSetupLink && (
              <div className="mt-4 text-center text-sm opacity-0 animate-fade-up [animation-delay:800ms]">
                First time logging in?{' '}
                <Link href="/doctor-setup" className="underline font-medium text-primary">
                  Set up your account
                </Link>
              </div>
            )}
          </div>
      </main>
      <footer className="py-4 text-center text-muted-foreground text-sm border-t">
        <p>&copy; {new Date().getFullYear()} MediVault. All rights reserved.</p>
      </footer>
    </div>
  );
}
