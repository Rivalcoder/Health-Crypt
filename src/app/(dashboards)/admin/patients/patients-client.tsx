'use client';
import { useState } from 'react';
import { DataTable } from '../doctors/data-table';
import { getColumns } from './columns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { EditPatientDialog } from './edit-patient-dialog';
import { DeletePatientDialog } from './delete-patient-dialog';
import type { Patient } from '@/types';
import { useRouter, useSearchParams } from 'next/navigation';

export function PatientsClient({ patients }: { patients: Patient[] }) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('q') || '');

  const handleEdit = (patient: Patient) => {
    setSelectedPatient(patient);
    setIsEditDialogOpen(true);
  };
  const handleDelete = (patient: Patient) => {
    setSelectedPatient(patient);
    setIsDeleteDialogOpen(true);
  };
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.replace(`?q=${encodeURIComponent(search)}`);
  };

  const columns = getColumns({ onEdit: handleEdit, onDelete: handleDelete });

  return (
    <>
      <Card className="mb-4">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Patients List</CardTitle>
            <CardDescription>View, activate/disable, edit, or delete patient accounts.</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="mb-4 flex gap-2">
            <Input
              placeholder="Search patients by name or email..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="max-w-xs"
            />
            <Button type="submit" variant="outline">Search</Button>
          </form>
          <DataTable columns={columns} data={patients} />
        </CardContent>
      </Card>
      <EditPatientDialog
        patient={selectedPatient}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
      />
      <DeletePatientDialog
        patient={selectedPatient}
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      />
    </>
  );
} 