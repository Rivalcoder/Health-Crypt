'use client';

import { useState, useTransition } from 'react';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { updateDoctorStatus } from '@/app/actions';
import type { Doctor } from '@/types';

interface DoctorStatusToggleProps {
  doctor: Doctor;
}

export function DoctorStatusToggle({ doctor }: DoctorStatusToggleProps) {
  const { toast } = useToast();
  const [isActive, setIsActive] = useState(doctor.status === 'active');
  const [isPending, startTransition] = useTransition();

  const handleStatusChange = (newStatus: boolean) => {
    setIsActive(newStatus);
    startTransition(async () => {
      const result = await updateDoctorStatus(doctor.id, newStatus ? 'active' : 'inactive');
      if (result.success) {
        toast({
            title: `Doctor ${newStatus ? 'Activated' : 'Deactivated'}`,
            description: `${doctor.name}'s account has been successfully ${newStatus ? 'activated' : 'deactivated'}.`,
        });
      } else {
        // Revert state on failure
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
            id={`status-${doctor.id}`}
            checked={isActive}
            onCheckedChange={handleStatusChange}
            disabled={isPending}
            aria-label="Toggle doctor status"
        />
         <span className={`text-sm ${isActive ? 'text-green-600' : 'text-muted-foreground'}`}>
            {isActive ? 'Active' : 'Inactive'}
         </span>
    </div>
  );
}
