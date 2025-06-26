'use client';

import { useActionState, useState, useRef, ChangeEvent } from 'react';
import { useFormStatus } from 'react-dom';
import { signupUser } from '@/app/actions';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Loader2, Camera } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';

function SignupButton() {
    const { pending } = useFormStatus();
  
    return (
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? (
            <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Account...
            </>
        ) : (
            'Create Patient Account'
        )}
      </Button>
    );
}

export function SignupForm() {
  const [errorMessage, formAction] = useActionState(signupUser, undefined);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const avatarFileRef = useRef<HTMLInputElement>(null);

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
    <form action={formAction} className="grid gap-4">
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
                ref={avatarFileRef}
                onChange={handleAvatarChange}
            />
            <input type="hidden" name="avatar" value={avatarPreview || ''} />
        </div>
        <div className="grid gap-2">
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" name="name" placeholder="John Doe" required />
        </div>
        <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <DatePicker name="dateOfBirth" />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="gender">Gender</Label>
                <Select name="gender" required>
                    <SelectTrigger id="gender">
                        <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
                <Label htmlFor="bloodGroup">Blood Group</Label>
                 <Select name="bloodGroup" required>
                    <SelectTrigger id="bloodGroup">
                        <SelectValue placeholder="Select group" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="A+">A+</SelectItem>
                        <SelectItem value="A-">A-</SelectItem>
                        <SelectItem value="B+">B+</SelectItem>
                        <SelectItem value="B-">B-</SelectItem>
                        <SelectItem value="AB+">AB+</SelectItem>
                        <SelectItem value="AB-">AB-</SelectItem>
                        <SelectItem value="O+">O+</SelectItem>
                        <SelectItem value="O-">O-</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="grid gap-2">
                <Label htmlFor="contact">Contact Number</Label>
                <Input id="contact" name="contact" type="tel" placeholder="e.g., (123) 456-7890" required />
            </div>
        </div>
         <div className="grid gap-2">
            <Label htmlFor="address">Address</Label>
            <Input id="address" name="address" placeholder="123 Health St, Wellness City" required />
        </div>
        <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" name="email" placeholder="m@example.com" required />
        </div>
        <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" name="password" required />
        </div>

        {errorMessage && (
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Sign Up Failed</AlertTitle>
                <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
        )}
        <SignupButton />
    </form>
  );
}
