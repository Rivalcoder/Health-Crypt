import { TopNavbar } from '@/components/top-navbar';
import { getSessionUser } from '@/app/actions';
import type { User } from '@/types';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();
  const headersList = await headers();
  const pathname = headersList.get('next-url') || '';

  if (!user) {
    redirect('/login');
  }

  // Patient should never access /dashboard or /admin
  if (user.role === 'patient' && (pathname.startsWith('/dashboard') || pathname.startsWith('/admin'))) {
    redirect(`/patients/${user.id}`);
  }

  // Doctor should never access /admin
  if (user.role === 'doctor' && pathname.startsWith('/admin')) {
    redirect('/dashboard');
  }

  // Admin should never access /dashboard
  if (user.role === 'admin' && pathname.startsWith('/dashboard')) {
    redirect('/admin/dashboard');
  }

  return (
    <div className="relative flex min-h-screen w-full flex-col">
      <TopNavbar user={user} />
      <main className="flex-1">{children}</main>
    </div>
  );
}
