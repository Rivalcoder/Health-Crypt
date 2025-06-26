
'use client';

import { useActionState, useState, ChangeEvent, useEffect } from 'react';
import { useFormStatus } from 'react-dom';
import { updateDoctorProfile } from '@/app/actions';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Loader2, Camera, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { User } from '@/types';

function SubmitButton() {
    const { pending } = useFormStatus();
  
    return (
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? (
            <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving Changes...
            </>
        ) : (
            <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
            </>
        )}
      </Button>
    );
}

export function SettingsForm({ user }: { user: User }) {
  const [state, formAction] = useActionState(updateDoctorProfile, { message: '', success: false });
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user.avatarUrl || null);
  const { toast } = useToast();

  useEffect(() => {
    if (state.message) {
      toast({
        title: state.success ? 'Success' : 'Error',
        description: state.message,
        variant: state.success ? 'default' : 'destructive',
      });
    }
  }, [state, toast]);

  const handleAvatarChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <form action={formAction} className="grid gap-6">
        <div className="grid gap-2 justify-center">
            <Label htmlFor="avatarFile" className="cursor-pointer text-center">
                <div className="w-24 h-24 rounded-full bg-muted mx-auto flex items-center justify-center border-2 border-dashed border-muted-foreground hover:border-primary transition-colors relative">
                    {avatarPreview ? (
                        <img src={avatarPreview} alt="Avatar Preview" className="w-full h-full rounded-full object-cover" />
                    ) : (
                        <div className="text-muted-foreground flex flex-col items-center gap-1">
                            <Camera className="w-8 h-8"/>
                            <span className="text-xs">Upload Photo</span>
                        </div>
                    )}
                </div>
            </Label>
            <input
                type="file"
                id="avatarFile"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
            />
            <input type="hidden" name="avatar" value={avatarPreview || ''} />
        </div>
        <div className="grid gap-2">
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" name="name" defaultValue={user.name} required />
        </div>
         <div className="grid gap-2">
            <Label htmlFor="specialty">Specialty</Label>
            <Input id="specialty" name="specialty" defaultValue={user.specialty} required />
        </div>
        <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
                <Label htmlFor="email">Email (read-only)</Label>
                <Input id="email" type="email" name="email" defaultValue={user.email} required readOnly disabled />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="licenseId">License ID (read-only)</Label>
                <Input id="licenseId" name="licenseId" defaultValue={user.licenseId} readOnly disabled />
            </div>
        </div>
        <div className="grid gap-2">
            <Label htmlFor="contact">Contact Number</Label>
            <Input id="contact" name="contact" type="tel" defaultValue={user.contact} />
        </div>
        
        {state.message && !state.success && (
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Update Failed</AlertTitle>
                <AlertDescription>{state.message}</AlertDescription>
            </Alert>
        )}
        <SubmitButton />
    </form>
  );
}
