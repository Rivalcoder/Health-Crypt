import { Stethoscope } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export function Logo({ className, href = "/" }: { className?: string; href?: string }) {
  return (
    <Link href={href} className={cn("flex items-center gap-2 text-lg font-semibold", className)}>
      <Stethoscope className="h-6 w-6 text-primary" />
      <span>MediVault</span>
    </Link>
  );
}
