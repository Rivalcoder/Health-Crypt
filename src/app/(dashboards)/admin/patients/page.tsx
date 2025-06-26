import { getSessionUser, searchPatients } from '@/app/actions';
import { PatientsClient } from './patients-client';
import { redirect } from 'next/navigation';

export default async function PatientsAdminPage({ searchParams }: { searchParams?: Promise<{ q?: string }> }) {
  const user = await getSessionUser();
  if (!user || user.role !== 'admin') redirect('/login');

  const params = searchParams ? await searchParams : {};
  const query = params?.q || '';
  const patients = await searchPatients(query);

  return (
    <div className="container py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Patient Management</h1>
      </div>
      <main className="flex-1 opacity-0 animate-fade-in" style={{animationDelay: '200ms'}}>
        <PatientsClient patients={patients} />
      </main>
    </div>
  );
} 