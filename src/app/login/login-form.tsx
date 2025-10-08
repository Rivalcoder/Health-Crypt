'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { loginUser } from '@/app/actions';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';

function LoginButton() {
    const { pending } = useFormStatus();
  
    return (
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Logging In...
          </>
        ) : (
          'Log In'
        )}
      </Button>
    );
}

export function LoginForm({ role }: { role: 'admin' | 'doctor' | 'patient' }) {
  const [state, formAction] = useActionState(loginUser, { success: false, message: '' });

  return (
    <form action={formAction} className="grid gap-4" autoComplete="off">
        <input type="hidden" name="role" value={role} />
        {role === 'patient' ? (
          <div className="grid gap-2">
            <Label htmlFor="patientIdOrEmail">Patient ID or Email</Label>
            <Input id="patientIdOrEmail" name="patientId" placeholder="Enter 12-digit ID or email" autoComplete="off" />
          </div>
        ) : (
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              name="email"
              placeholder="m@example.com"
              required
              autoComplete="off"
            />
          </div>
        )}
        <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" name="password" required autoComplete="new-password" />
        </div>
        
        {state && !state.success && state.message && (
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Login Failed</AlertTitle>
                <AlertDescription>{state.message}</AlertDescription>
            </Alert>
        )}
        <LoginButton />
    </form>
  );
}
