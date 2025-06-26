'use client';

import { useEffect, useState, ChangeEvent } from 'react';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Pencil, AlertCircle, Camera } from 'lucide-react';
import { updateDoctor } from '@/app/actions';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import type { Doctor } from '@/types';

interface EditDoctorDialogProps {
  doctor: Doctor | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Pencil className="mr-2 h-4 w-4" />
      )}
      {pending ? 'Saving...' : 'Save Changes'}
    </Button>
  );
}

export function EditDoctorDialog({ doctor, open, onOpenChange }: EditDoctorDialogProps) {
  const { toast } = useToast();
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const updateDoctorWithId = doctor ? updateDoctor.bind(null, doctor.id) : async () => ({ success: false, message: 'No doctor selected' });
  const [state, formAction] = useActionState(updateDoctorWithId, { success: false, message: '' });

  useEffect(() => {
    if (doctor) {
        setAvatarPreview(doctor.avatarUrl);
    }
  }, [doctor]);

  useEffect(() => {
    if (state.success && state.message) {
      toast({
        title: 'Doctor Updated Successfully',
        description: state.message,
      });
      onOpenChange(false);
    }
  }, [state, toast, onOpenChange]);

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
  
  if (!doctor) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Doctor Profile</DialogTitle>
          <DialogDescription>
            Update the details for Dr. {doctor.name}.
          </DialogDescription>
        </DialogHeader>
        <form action={formAction}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2 justify-center">
                <Label htmlFor="avatarFile-edit" className="cursor-pointer text-center">
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
                    id="avatarFile-edit"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                />
                <input type="hidden" name="avatar" value={avatarPreview || ''} />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                name="name"
                defaultValue={doctor.name}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                defaultValue={doctor.email}
                className="col-span-3"
                disabled
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="specialty" className="text-right">
                Specialty
              </Label>
              <Input
                id="specialty"
                name="specialty"
                defaultValue={doctor.specialty}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="licenseId" className="text-right">
                License ID
              </Label>
              <Input
                id="licenseId"
                name="licenseId"
                defaultValue={doctor.licenseId}
                className="col-span-3"
                required
              />
            </div>
            {state.message && !state.success && (
                <Alert variant="destructive" className="col-span-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{state.message}</AlertDescription>
                </Alert>
            )}
          </div>
          <DialogFooter>
            <SubmitButton />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
