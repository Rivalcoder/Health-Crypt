import { getPatientData } from '@/lib/data';
import { notFound, redirect } from 'next/navigation';
import { getSessionUser } from '@/app/actions';
import { AdminPatientProfileClient } from './admin-patient-profile-client';

export default async function AdminPatientProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user || user.role !== 'admin') redirect('/login');

  const resolvedParams = await params;
  const { patient, visits } = await getPatientData(resolvedParams.id);
  if (!patient) notFound();

  return <AdminPatientProfileClient patient={patient} visits={visits} />;
} 