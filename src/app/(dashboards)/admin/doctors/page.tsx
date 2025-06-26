
import { getDoctors } from '@/lib/data';
import { DoctorsClient } from '@/app/(dashboards)/admin/doctors/doctors-client';

export default async function DoctorsAdminPage() {
  const doctors = await getDoctors();

  return (
    <div className="container py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Doctor Management</h1>
      </div>
      <main className="flex-1 opacity-0 animate-fade-in" style={{animationDelay: '200ms'}}>
        <DoctorsClient doctors={doctors} />
      </main>
    </div>
  );
}
