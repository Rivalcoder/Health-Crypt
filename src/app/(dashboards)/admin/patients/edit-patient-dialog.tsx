'use client';
import { useState } from 'react';
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
import { Loader2, Pencil, AlertCircle } from 'lucide-react';
import { updatePatient, deletePatientMedicalRecords } from '@/app/actions';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import type { Patient } from '@/types';

interface EditPatientDialogProps {
  patient: Patient | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Pencil className="mr-2 h-4 w-4" />}
      {pending ? 'Saving...' : 'Save Changes'}
    </Button>
  );
}

export function EditPatientDialog({ patient, open, onOpenChange }: EditPatientDialogProps) {
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);
  const [showDeleteRecords, setShowDeleteRecords] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  if (!patient) return null;

  async function formAction(formData: FormData) {
    setError(null);
    const result = await updatePatient(patient.id, {}, formData);
    if (result.success) {
      toast({ title: 'Patient updated', description: result.message });
      onOpenChange(false);
    } else {
      setError(result.message);
    }
  }

  async function handleDeleteRecords() {
    setIsDeleting(true);
    const result = await deletePatientMedicalRecords(patient.id);
    setIsDeleting(false);
    setShowDeleteRecords(false);
    toast({
      title: result.success ? 'Medical Records Deleted' : 'Error',
      description: result.message,
      variant: result.success ? undefined : 'destructive',
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Patient</DialogTitle>
          <DialogDescription>Edit the details for this patient.</DialogDescription>
        </DialogHeader>
        <form action={formAction} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">Name</Label>
            <Input id="name" name="name" defaultValue={patient.name} className="col-span-3" required />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right">Email</Label>
            <Input id="email" name="email" defaultValue={patient.email} className="col-span-3" disabled />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="dateOfBirth" className="text-right">Date of Birth</Label>
            <Input id="dateOfBirth" name="dateOfBirth" defaultValue={patient.dateOfBirth} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="gender" className="text-right">Gender</Label>
            <Input id="gender" name="gender" defaultValue={patient.gender} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="contact" className="text-right">Contact</Label>
            <Input id="contact" name="contact" defaultValue={patient.contact} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="address" className="text-right">Address</Label>
            <Input id="address" name="address" defaultValue={patient.address} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="bloodGroup" className="text-right">Blood Group</Label>
            <Input id="bloodGroup" name="bloodGroup" defaultValue={patient.bloodGroup} className="col-span-3" />
          </div>
          {error && (
            <Alert variant="destructive" className="col-span-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <DialogFooter>
            <SubmitButton />
          </DialogFooter>
        </form>
        <div className="mt-6">
          <Button variant="destructive" onClick={() => setShowDeleteRecords(true)} disabled={isDeleting}>
            Delete All Medical Records
          </Button>
        </div>
        <AlertDialog open={showDeleteRecords} onOpenChange={setShowDeleteRecords}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete All Medical Records</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete <b>all medical/visit records</b> for this patient? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel asChild>
                <Button variant="outline">Cancel</Button>
              </AlertDialogCancel>
              <AlertDialogAction asChild>
                <Button variant="destructive" onClick={handleDeleteRecords} disabled={isDeleting}>
                  {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Delete All Records'}
                </Button>
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DialogContent>
    </Dialog>
  );
} 