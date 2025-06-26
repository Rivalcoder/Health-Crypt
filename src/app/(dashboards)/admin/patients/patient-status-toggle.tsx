'use client';
import { useState, useTransition } from 'react';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { updatePatientStatus } from '@/app/actions';
import type { Patient } from '@/types';

interface PatientStatusToggleProps {
  patient: Patient;
}

export function PatientStatusToggle({ patient }: PatientStatusToggleProps) {
  const { toast } = useToast();
  const [isActive, setIsActive] = useState(patient.status === 'active');
  const [isPending, startTransition] = useTransition();

  const handleStatusChange = (newStatus: boolean) => {
    setIsActive(newStatus);
    startTransition(async () => {
      const result = await updatePatientStatus(patient.id, newStatus ? 'active' : 'inactive');
      if (result.success) {
        toast({
          title: `Patient ${newStatus ? 'Activated' : 'Deactivated'}`,
          description: `${patient.name}'s account has been successfully ${newStatus ? 'activated' : 'deactivated'}.`,
        });
      } else {
        setIsActive(!newStatus);
        toast({
          title: 'Error',
          description: result.message,
          variant: 'destructive',
        });
      }
    });
  };

  return (
    <div className="flex items-center gap-2">
      <Switch
        id={`status-${patient.id}`}
        checked={isActive}
        onCheckedChange={handleStatusChange}
        disabled={isPending}
        aria-label="Toggle patient status"
      />
      <span className={`text-sm ${isActive ? 'text-green-600' : 'text-muted-foreground'}`}>
        {isActive ? 'Active' : 'Inactive'}
      </span>
    </div>
  );
} 