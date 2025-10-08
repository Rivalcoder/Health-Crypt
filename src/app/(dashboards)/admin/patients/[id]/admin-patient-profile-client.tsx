'use client';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { EditPatientDialog } from '../edit-patient-dialog';
import { DeletePatientDialog } from '../delete-patient-dialog';
import { Trash2, Pencil, ArrowLeft, Info } from 'lucide-react';
import Link from 'next/link';
import type { Patient, Visit } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { deleteVisit, updateVisit } from '@/app/actions';
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import UpdatePatientPasswordDialog from './update-patient-password-dialog';

export function AdminPatientProfileClient({ patient, visits: initialVisits }: { patient: Patient, visits: Visit[] }) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [visits, setVisits] = useState(initialVisits);
  const [deleteVisitId, setDeleteVisitId] = useState<string | null>(null);
  const [isDeletingVisit, setIsDeletingVisit] = useState(false);
  const [selectedVisit, setSelectedVisit] = useState<Visit | null>(null);
  const [editVisit, setEditVisit] = useState<Visit | null>(null);
  const { toast } = useToast();
  const [editingVisitId, setEditingVisitId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>({});

  const handleDeleteVisit = async () => {
    if (!deleteVisitId) return;
    setIsDeletingVisit(true);
    const result = await deleteVisit(deleteVisitId);
    setIsDeletingVisit(false);
    setDeleteVisitId(null);
    toast({
      title: result.success ? 'Medical Record Deleted' : 'Error',
      description: result.message,
      variant: result.success ? undefined : 'destructive',
    });
    if (result.success) {
      setVisits(visits.filter(v => v.id !== deleteVisitId));
    }
  };

  const handleEditClick = (visit: Visit) => {
    setEditingVisitId(visit.id);
    setEditForm({
      date: visit.date,
      reason: visit.reason,
      notes: visit.notes || '',
      treatments: visit.treatments || '',
      prescriptions: Array.isArray(visit.prescriptions) ? visit.prescriptions.join(', ') : '',
      doctorId: visit.doctor?.id || '',
    });
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleEditSave = async (visitId: string) => {
    const updates = {
      date: editForm.date,
      reason: editForm.reason,
      notes: editForm.notes,
      treatments: editForm.treatments,
      prescriptions: editForm.prescriptions.split(',').map((p: string) => p.trim()).filter(Boolean),
      doctorId: editForm.doctorId,
    };
    const result = await updateVisit(visitId, updates);
    toast({
      title: result.success ? 'Medical Record Updated' : 'Error',
      description: result.message,
      variant: result.success ? undefined : 'destructive',
    });
    if (result.success) {
      setVisits(visits.map(v => v.id === visitId ? { ...v, ...updates, prescriptions: updates.prescriptions, doctor: v.doctor && updates.doctorId ? { ...v.doctor, id: updates.doctorId } : v.doctor } : v));
      setEditingVisitId(null);
    }
  };

  const handleEditCancel = () => {
    setEditingVisitId(null);
    setEditForm({});
  };

  return (
    <div className="container max-w-4xl py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Patient Profile</h1>
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin/patients"><ArrowLeft className="h-4 w-4 mr-2" />Back to Patients</Link>
        </Button>
      </div>
      <main className="flex-1 opacity-0 animate-fade-in" style={{animationDelay: '200ms'}}>
        <Card>
          <CardHeader className="flex flex-col md:flex-row items-start gap-4 space-y-0 p-6">
            <div className="flex-1">
              <CardTitle className="text-2xl font-bold">{patient.name}</CardTitle>
              <CardDescription>{patient.email}</CardDescription>
              <div className="mt-2 text-sm text-muted-foreground">{patient.gender} | {patient.dateOfBirth}</div>
              <div className="mt-2 text-sm">Contact: {patient.contact}</div>
              <div className="mt-2 text-sm">Address: {patient.address}</div>
              <div className="mt-2 text-sm">Blood Group: {patient.bloodGroup}</div>
            </div>
            <div className="flex flex-col gap-2">
              <Button variant="outline" onClick={() => setEditOpen(true)}><Pencil className="mr-2 h-4 w-4" />Edit</Button>
              <Button variant="destructive" onClick={() => setDeleteOpen(true)}><Trash2 className="mr-2 h-4 w-4" />Delete</Button>
              <UpdatePatientPasswordDialog patientId={patient.id} patientName={patient.name} />
            </div>
          </CardHeader>
          <CardContent>
            <h2 className="text-lg font-semibold mb-2">Medical Records</h2>
            {visits.length === 0 ? (
              <div className="text-muted-foreground">No medical records found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full border text-sm">
                  <thead>
                    <tr className="bg-muted">
                      <th className="px-4 py-2 border">Date</th>
                      <th className="px-4 py-2 border">Reason</th>
                      <th className="px-4 py-2 border">Doctor</th>
                      <th className="px-4 py-2 border">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visits.map(visit => (
                      editingVisitId === visit.id ? (
                        <tr key={visit.id} className="bg-muted/50">
                          <td className="px-4 py-2 border">
                            <input name="date" value={editForm.date} onChange={handleEditChange} className="input input-bordered w-full" placeholder="Date" />
                          </td>
                          <td className="px-4 py-2 border">
                            <input name="reason" value={editForm.reason} onChange={handleEditChange} className="input input-bordered w-full" placeholder="Reason" />
                          </td>
                          <td className="px-4 py-2 border">
                            <input name="doctorId" value={editForm.doctorId} onChange={handleEditChange} className="input input-bordered w-full" placeholder="Doctor ID" />
                          </td>
                          <td className="px-4 py-2 border text-center flex gap-2 justify-center">
                            <Button size="sm" variant="default" onClick={() => handleEditSave(visit.id)}>Save</Button>
                            <Button size="sm" variant="outline" onClick={handleEditCancel}>Cancel</Button>
                          </td>
                        </tr>
                      ) : (
                        <tr key={visit.id} className="hover:bg-muted/50 cursor-pointer" onClick={e => { if ((e.target as HTMLElement).closest('button')) return; setSelectedVisit(visit); }}>
                          <td className="px-4 py-2 border">
                            <span className="inline-flex items-center gap-2">
                              {visit.date}
                              <Info className="h-4 w-4 text-muted-foreground" />
                            </span>
                          </td>
                          <td className="px-4 py-2 border">{visit.reason}</td>
                          <td className="px-4 py-2 border">
                            {visit.doctor?.id ? (
                              <Link href={`/admin/doctors/${visit.doctor.id}`} className="text-blue-600 dark:text-blue-400 underline" onClick={e => e.stopPropagation()}>
                                {visit.doctor.name}
                              </Link>
                            ) : (
                              '-'
                            )}
                          </td>
                          <td className="px-4 py-2 border text-center flex gap-2 justify-center">
                            <Button size="icon" variant="ghost" onClick={e => { e.stopPropagation(); handleEditClick(visit); }}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button size="icon" variant="ghost" onClick={e => { e.stopPropagation(); setDeleteVisitId(visit.id); }}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </td>
                        </tr>
                      )
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
      <EditPatientDialog patient={patient} open={editOpen} onOpenChange={setEditOpen} />
      <DeletePatientDialog patient={patient} open={deleteOpen} onOpenChange={setDeleteOpen} />
      {/* Visit Details Modal */}
      <Dialog open={!!selectedVisit} onOpenChange={open => !open && setSelectedVisit(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Visit Details</DialogTitle>
          </DialogHeader>
          {selectedVisit && (
            <div className="space-y-2">
              <div><b>Date:</b> {selectedVisit.date}</div>
              <div><b>Reason:</b> {selectedVisit.reason}</div>
              <div><b>Doctor:</b> {selectedVisit.doctor?.name || '-'}</div>
              {selectedVisit.notes && <div><b>Notes:</b> {selectedVisit.notes}</div>}
              {selectedVisit.treatments && <div><b>Treatments:</b> {selectedVisit.treatments}</div>}
              {selectedVisit.prescriptions && Array.isArray(selectedVisit.prescriptions) && selectedVisit.prescriptions.length > 0 && (
                <div><b>Prescriptions:</b>
                  <ul className="list-disc ml-4">
                    {selectedVisit.prescriptions.map((p: any, idx: number) => (
                      <li key={idx}>{typeof p === 'string' ? p : JSON.stringify(p)}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedVisit(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Edit Visit Modal (placeholder) */}
      <Dialog open={!!editVisit} onOpenChange={open => !open && setEditVisit(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Visit (Coming Soon)</DialogTitle>
            <DialogDescription>Edit functionality for visits can be implemented here.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditVisit(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <AlertDialog open={!!deleteVisitId} onOpenChange={open => !open && setDeleteVisitId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Medical Record</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this medical/visit record? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel asChild>
              <Button variant="outline">Cancel</Button>
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button variant="destructive" onClick={handleDeleteVisit} disabled={isDeletingVisit}>
                {isDeletingVisit ? 'Deleting...' : 'Delete'}
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 