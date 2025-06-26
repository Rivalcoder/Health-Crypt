
'use client';

import { useEffect, useState } from 'react';
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
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, PlusCircle, AlertCircle, Plus, Trash2 } from 'lucide-react';
import { addVisit } from '@/app/actions';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import type { Prescription } from '@/types';

interface AddVisitDialogProps {
  patientId: string;
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
        <PlusCircle className="mr-2 h-4 w-4" />
      )}
      {pending ? 'Saving Note...' : 'Save Visit Note'}
    </Button>
  );
}

export function AddVisitDialog({ patientId, open, onOpenChange }: AddVisitDialogProps) {
  const { toast } = useToast();
  const addVisitWithPatientId = addVisit.bind(null, patientId);
  const [state, formAction] = useActionState(addVisitWithPatientId, { message: '', success: false });
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([{ medication: '', dosage: '', frequency: '' }]);

  useEffect(() => {
    if (!open) {
      // Reset form on close
      setPrescriptions([{ medication: '', dosage: '', frequency: '' }]);
    }
  }, [open]);

  useEffect(() => {
    if (state.success) {
      toast({
        title: 'Visit Note Added',
        description: state.message,
      });
      onOpenChange(false);
    }
  }, [state, toast, onOpenChange]);

  const handleAddPrescription = () => {
    setPrescriptions([...prescriptions, { medication: '', dosage: '', frequency: '' }]);
  };

  const handleRemovePrescription = (index: number) => {
    const newPrescriptions = prescriptions.filter((_, i) => i !== index);
    setPrescriptions(newPrescriptions);
  };

  const handlePrescriptionChange = (index: number, field: keyof Prescription, value: string) => {
    const newPrescriptions = [...prescriptions];
    newPrescriptions[index] = { ...newPrescriptions[index], [field]: value };
    setPrescriptions(newPrescriptions);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add New Visit Note</DialogTitle>
          <DialogDescription>
            Log a new consultation, including treatments and prescriptions.
          </DialogDescription>
        </DialogHeader>
        <form action={formAction}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="reason">Reason for Visit</Label>
              <Input id="reason" name="reason" placeholder="e.g., Follow-up, Annual Check-up" required />
            </div>
             <div className="grid gap-2">
              <Label htmlFor="notes">Consultation Notes</Label>
              <Textarea id="notes" name="notes" placeholder="Patient symptoms, diagnosis, treatments administered, etc." className="h-24" required />
            </div>
             
            <div className="grid gap-2">
              <Label>Prescriptions</Label>
              <div className="space-y-2">
                 <div className="grid grid-cols-[2fr,1.5fr,2fr,auto] gap-2 px-2 text-xs font-medium text-muted-foreground">
                    <span>Medication</span>
                    <span>Dosage</span>
                    <span>Frequency / Duration</span>
                    <span className="sr-only">Actions</span>
                 </div>
                 {prescriptions.map((p, index) => (
                    <div key={index} className="grid grid-cols-[2fr,1.5fr,2fr,auto] gap-2 items-center">
                        <Input 
                            placeholder="e.g., Ibuprofen"
                            value={p.medication}
                            onChange={(e) => handlePrescriptionChange(index, 'medication', e.target.value)}
                            aria-label="Medication"
                        />
                        <Input 
                            placeholder="e.g., 200mg"
                            value={p.dosage}
                            onChange={(e) => handlePrescriptionChange(index, 'dosage', e.target.value)}
                             aria-label="Dosage"
                        />
                        <Input 
                            placeholder="e.g., Twice daily for 5 days"
                            value={p.frequency}
                            onChange={(e) => handlePrescriptionChange(index, 'frequency', e.target.value)}
                             aria-label="Frequency"
                        />
                        
                        <Button type="button" variant="ghost" size="icon" onClick={() => handleRemovePrescription(index)} className="text-muted-foreground hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Remove prescription</span>
                        </Button>
                    </div>
                ))}
              </div>
              <Button type="button" variant="outline" size="sm" onClick={handleAddPrescription} className="mt-2 w-fit">
                <Plus className="mr-2 h-4 w-4" />
                Add Prescription
              </Button>
            </div>
            
            <input type="hidden" name="prescriptions" value={JSON.stringify(prescriptions.filter(p => p.medication))} />

            {state.message && !state.success && (
                <Alert variant="destructive">
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
