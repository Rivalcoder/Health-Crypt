import { Logo } from '@/components/logo';

export default function PatientViewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
        <Logo />
        <p className="ml-auto text-sm text-muted-foreground">Patient Portal</p>
      </header>
      <main className="flex-1 bg-muted/40">{children}</main>
       <footer className="py-4 text-center text-muted-foreground text-sm border-t">
        <p>&copy; {new Date().getFullYear()} MediVault. All rights reserved.</p>
      </footer>
    </div>
  );
}
