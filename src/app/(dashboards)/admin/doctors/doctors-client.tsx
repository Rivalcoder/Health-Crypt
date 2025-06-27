'use client';
import { useState, useEffect } from 'react';
import { DataTable } from './data-table';
import { getColumns } from './columns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { AddDoctorDialog } from './add-doctor-dialog';
import { EditDoctorDialog } from './edit-doctor-dialog';
import { DeleteDoctorDialog } from './delete-doctor-dialog';
import type { Doctor } from '@/types';
import { Input } from '@/components/ui/input';
import { useRouter, useSearchParams } from 'next/navigation';
import { searchDoctorsAction } from '@/app/actions';

export function DoctorsClient({ doctors: initialDoctors }: { doctors: Doctor[] }) {
  const [isAddDoctorDialogOpen, setIsAddDoctorDialogOpen] = useState(false);
  const [isEditDoctorDialogOpen, setIsEditDoctorDialogOpen] = useState(false);
  const [isDeleteDoctorDialogOpen, setIsDeleteDoctorDialogOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [pwDialogOpenId, setPwDialogOpenId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [doctors, setDoctors] = useState(initialDoctors);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    async function fetchInitialTotal() {
      setLoading(true);
      const result = await searchDoctorsAction('', 1, pageSize);
      setTotal(result.total);
      setLoading(false);
    }
    fetchInitialTotal();
  }, [pageSize]);

  const handleEditDoctor = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setIsEditDoctorDialogOpen(true);
  };

  const handleDeleteDoctor = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setIsDeleteDoctorDialogOpen(true);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setPage(1);
    const result = await searchDoctorsAction(search, 1, pageSize);
    setDoctors(result.doctors);
    setTotal(result.total);
    setLoading(false);
    router.replace(`?q=${encodeURIComponent(search)}`);
  };

  const handlePageChange = async (newPage: number) => {
    setLoading(true);
    setPage(newPage);
    const result = await searchDoctorsAction(search, newPage, pageSize);
    setDoctors(result.doctors);
    setTotal(result.total);
    setLoading(false);
  };

  const handlePageSizeChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSize = parseInt(e.target.value, 10);
    setPageSize(newSize);
    setPage(1);
    setLoading(true);
    const result = await searchDoctorsAction(search, 1, newSize);
    setDoctors(result.doctors);
    setTotal(result.total);
    setLoading(false);
  };

  const columns = getColumns({
    onEdit: handleEditDoctor,
    onDelete: handleDeleteDoctor,
    pwDialogOpenId,
    setPwDialogOpenId,
  });

  const totalPages = Math.ceil(total / pageSize);

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
          <form onSubmit={handleSearch} className="mb-4 flex gap-2">
            <Input
              placeholder="Search doctors by name, email, license, or specialty..."
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
          <DataTable columns={columns} data={doctors} />
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
              Page {page} of {totalPages || 1} ({total} doctors)
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(page + 1)}
              disabled={page === totalPages || loading || totalPages === 0 || doctors.length < pageSize}
            >
              Next
            </Button>
          </div>
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
