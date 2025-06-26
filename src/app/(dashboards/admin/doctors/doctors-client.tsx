'use client';
import { useState } from 'react';
import { DataTable } from './data-table';
import { columns } from './columns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { AddDoctorDialog } from './add-doctor-dialog';
import type { Doctor } from '@/types';

export function DoctorsClient({ doctors }: { doctors: Doctor[] }) {
  const [isAddDoctorDialogOpen, setIsAddDoctorDialogOpen] = useState(false);

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Doctors List</CardTitle>
            <CardDescription>
              View, activate, or deactivate doctor accounts.
            </CardDescription>
          </div>
          <Button size="sm" onClick={() => setIsAddDoctorDialogOpen(true)}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Doctor
          </Button>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={doctors} />
        </CardContent>
      </Card>
      <AddDoctorDialog
        open={isAddDoctorDialogOpen}
        onOpenChange={setIsAddDoctorDialogOpen}
      />
    </>
  );
}
