'use client';
import { useState, useEffect } from 'react';
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
import { searchPatientsPaginatedAction } from '@/app/actions';

export function PatientsClient({ patients: initialPatients }: { patients: Patient[] }) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [pwDialogOpenId, setPwDialogOpenId] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [patients, setPatients] = useState(initialPatients ?? []);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pageSize, setPageSize] = useState(20);

  useEffect(() => {
    async function fetchInitialTotal() {
      setLoading(true);
      const result = await searchPatientsPaginatedAction('', 1, pageSize);
      setTotal(result.total);
      setLoading(false);
    }
    fetchInitialTotal();
  }, [pageSize]);

  const handleEdit = (patient: Patient) => {
    setSelectedPatient(patient);
    setIsEditDialogOpen(true);
  };
  const handleDelete = (patient: Patient) => {
    setSelectedPatient(patient);
    setIsDeleteDialogOpen(true);
  };
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setPage(1);
    const result = await searchPatientsPaginatedAction(search, 1, pageSize);
    setPatients(result.patients);
    setTotal(result.total);
    setLoading(false);
    router.replace(`?q=${encodeURIComponent(search)}`);
  };
  const handlePageChange = async (newPage: number) => {
    setLoading(true);
    setPage(newPage);
    const result = await searchPatientsPaginatedAction(search, newPage, pageSize);
    setPatients(result.patients);
    setTotal(result.total);
    setLoading(false);
  };
  const handlePageSizeChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSize = parseInt(e.target.value, 10);
    setPageSize(newSize);
    setPage(1);
    setLoading(true);
    const result = await searchPatientsPaginatedAction(search, 1, newSize);
    setPatients(result.patients);
    setTotal(result.total);
    setLoading(false);
  };

  const columns = getColumns({ onEdit: handleEdit, onDelete: handleDelete, pwDialogOpenId, setPwDialogOpenId });
  const totalPages = Math.ceil(total / pageSize);

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
              placeholder="Search by name, email, or Patient ID..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="max-w-xs"
            />
            <Button type="submit" variant="outline" disabled={loading}>{loading ? 'Searching...' : 'Search'}</Button>
          </form>
          <div className="mb-2 flex items-center gap-2">
            <label htmlFor="pageSize" className="text-sm">Rows per page:</label>
            <select
              id="pageSize"
              value={pageSize}
              onChange={handlePageSizeChange}
              className="border rounded px-2 py-1 text-sm"
              disabled={loading}
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
          <DataTable columns={columns} data={patients || []} />
          <div className="flex items-center justify-between mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1 || loading}
            >
              Prev
            </Button>
            <span className="text-sm">
              Page {page} of {totalPages || 1} ({total} patients)
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(page + 1)}
              disabled={page === totalPages || loading || totalPages === 0 || patients.length < pageSize}
            >
              Next
            </Button>
          </div>
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