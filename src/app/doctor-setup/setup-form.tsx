'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { setupDoctorAccount } from '@/app/actions';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Loader2, KeyRound } from 'lucide-react';

function SubmitButton() {
    const { pending } = useFormStatus();
  
    return (
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? (
            <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Setting up Account...
            </>
        ) : (
             <>
                <KeyRound className="mr-2 h-4 w-4" />
                Set Password and Login
            </>
        )}
      </Button>
    );
}

export function SetupForm() {
  const [errorMessage, formAction] = useActionState(setupDoctorAccount, undefined);

  return (
    <form action={formAction} className="grid gap-4">
        <div className="grid gap-2">
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" name="name" placeholder="Dr. Jane Doe" required />
        </div>
        <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" name="email" placeholder="doctor@example.com" required />
        </div>
        <div className="grid gap-2">
            <Label htmlFor="licenseId">License ID</Label>
            <Input id="licenseId" name="licenseId" placeholder="LIC-JD-12345" required />
        </div>
        <div className="grid gap-2">
            <Label htmlFor="password">New Password</Label>
            <Input id="password" type="password" name="password" required />
        </div>

        {errorMessage && (
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Setup Failed</AlertTitle>
                <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
        )}
        <SubmitButton />
    </form>
  );
}
