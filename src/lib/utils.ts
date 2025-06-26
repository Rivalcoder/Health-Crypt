import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { User } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function redirectToRoleDashboard(user: User) {
  if (user.role === 'admin') return '/admin/dashboard';
  if (user.role === 'doctor') return '/dashboard';
  if (user.role === 'patient') return `/patients/${user.id}`;
  return '/login';
}
