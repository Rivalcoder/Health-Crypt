
'use client';

import { useActionState, useEffect, useRef } from 'react';
import { useFormStatus } from 'react-dom';
import { updatePassword } from '@/app/actions';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Loader2, KeyRound } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

function SubmitButton() {
    const { pending } = useFormStatus();
  
    return (
      <Button type="submit" className="w-full sm:w-auto" disabled={pending}>
        {pending ? (
            <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
            </>
        ) : (
            <>
                <KeyRound className="mr-2 h-4 w-4" />
                Update Password
            </>
        )}
      </Button>
    );
}

export function PasswordChangeForm() {
  const [state, formAction] = useActionState(updatePassword, { message: '', success: false });
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.message) {
      toast({
        title: state.success ? 'Success' : 'Error',
        description: state.message,
        variant: state.success ? 'default' : 'destructive',
      });
      if (state.success) {
        formRef.current?.reset();
      }
    }
  }, [state, toast]);

  return (
    <form ref={formRef} action={formAction} className="grid gap-4 max-w-xl">
        <div className="grid gap-2">
            <Label htmlFor="oldPassword">Current Password</Label>
            <Input id="oldPassword" name="oldPassword" type="password" required />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
            <div className="grid gap-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input id="newPassword" name="newPassword" type="password" required />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input id="confirmPassword" name="confirmPassword" type="password" required />
            </div>
        </div>
        
        {state.message && !state.success && (
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Update Failed</AlertTitle>
                <AlertDescription>{state.message}</AlertDescription>
            </Alert>
        )}
        <div className="flex justify-end">
            <SubmitButton />
        </div>
    </form>
  );
}
