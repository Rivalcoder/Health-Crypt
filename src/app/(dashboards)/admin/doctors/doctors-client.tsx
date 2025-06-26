'use client';
import { useState } from 'react';
import { DataTable } from './data-table';
import { getColumns } from './columns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { AddDoctorDialog } from './add-doctor-dialog';
import { EditDoctorDialog } from './edit-doctor-dialog';
import { DeleteDoctorDialog } from './delete-doctor-dialog';
import type { Doctor } from '@/types';

export function DoctorsClient({ doctors }: { doctors: Doctor[] }) {
  const [isAddDoctorDialogOpen, setIsAddDoctorDialogOpen] = useState(false);
  const [isEditDoctorDialogOpen, setIsEditDoctorDialogOpen] = useState(false);
  const [isDeleteDoctorDialogOpen, setIsDeleteDoctorDialogOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);

  const handleEditDoctor = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setIsEditDoctorDialogOpen(true);
  };

  const handleDeleteDoctor = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setIsDeleteDoctorDialogOpen(true);
  };

  const columns = getColumns({
    onEdit: handleEditDoctor,
    onDelete: handleDeleteDoctor,
  });

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
      <EditDoctorDialog
        doctor={selectedDoctor}
        open={isEditDoctorDialogOpen}
        onOpenChange={setIsEditDoctorDialogOpen}
      />
      <DeleteDoctorDialog
        doctor={selectedDoctor}
        open={isDeleteDoctorDialogOpen}
        onOpenChange={setIsDeleteDoctorDialogOpen}
      />
    </>
  );
}
