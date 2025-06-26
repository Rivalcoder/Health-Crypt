import { getPatientData } from '@/lib/data';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { PatientDetailsClient } from './patient-details-client';

export default async function DoctorPatientViewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { patient, visits } = await getPatientData(id);

  if (!patient) {
    notFound();
  }
  
  return (
    <div className="bg-muted/40">
        <div className="container py-10">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold tracking-tight">Patient: {patient.name}</h1>
                <Button variant="outline" size="sm" asChild>
                    <Link href="/dashboard"><ArrowLeft className="h-4 w-4 mr-2" />Back to Dashboard</Link>
                </Button>
            </div>
            <PatientDetailsClient patient={patient} visits={visits} />
        </div>
    </div>
  );
}
