'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { User, Calendar, PlusCircle, Mail } from 'lucide-react';
import { GenerateSummaryCard } from './generate-summary-card';
import type { Patient, Visit } from '@/types';
import { AddVisitDialog } from './add-visit-dialog';
import { VisitHistoryAccordion } from '@/components/visit-history-accordion';

interface PatientDetailsClientProps {
    patient: Patient;
    visits: Visit[];
}

export function PatientDetailsClient({ patient, visits }: PatientDetailsClientProps) {
  const [isAddVisitOpen, setIsAddVisitOpen] = useState(false);

  // Combine all relevant history into a single, structured string for the AI.
  const fullMedicalHistory = visits
    .map(v => `Visit on ${new Date(v.date).toLocaleDateString()}:\n- Reason: ${v.reason}\n- Notes & Treatments: ${v.notes}`)
    .join('\n\n---\n\n');

  return (
    <>
      <main className="flex-1 grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2 flex flex-col gap-6">
          <Card>
              <CardHeader className="flex flex-row items-start gap-4 space-y-0">
              <Avatar className="h-20 w-20 border-2 border-primary">
                  <AvatarImage src={patient.avatarUrl} alt={patient.name} data-ai-hint="person portrait" />
                  <AvatarFallback className="text-3xl">{patient.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
              </Avatar>
              <div className="grid gap-1">
                  <CardTitle className="text-2xl">{patient.name}</CardTitle>
                  <CardDescription>Patient ID: {patient.id}</CardDescription>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground pt-2">
                      <div className="flex items-center gap-1"><User className="h-4 w-4" /> {patient.gender}</div>
                      <div className="flex items-center gap-1"><Calendar className="h-4 w-4" /> Born {new Date(patient.dateOfBirth).toLocaleDateString()}</div>
                  </div>
              </div>
              </CardHeader>
              <CardContent>
                  <Separator className="my-4" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div><strong>Contact:</strong> {patient.contact}</div>
                      <div><strong>Address:</strong> {patient.address}</div>
                       <div className="flex items-center gap-2 col-span-full"><Mail className="h-4 w-4 text-muted-foreground" /><strong>Email:</strong> {patient.email}</div>
                  </div>
              </CardContent>
          </Card>
          
          <Card>
              <CardHeader>
                  <CardTitle>Visit History</CardTitle>
                  <CardDescription>Review past consultations and medical records.</CardDescription>
              </CardHeader>
              <CardContent>
                  <VisitHistoryAccordion visits={visits} />
              </CardContent>
          </Card>
          </div>
          <div className="md:col-span-1 space-y-6">
               {visits.length > 0 && (
                  <GenerateSummaryCard 
                      patientId={patient.id}
                      medicalHistory={fullMedicalHistory}
                  />
              )}
              <Card>
                  <CardHeader>
                      <CardTitle>Add New Visit Note</CardTitle>
                  </CardHeader>
                  <CardContent>
                      <Button className="w-full" onClick={() => setIsAddVisitOpen(true)}>
                          <PlusCircle className="mr-2 h-4 w-4" /> Add New Note
                      </Button>
                  </CardContent>
              </Card>
          </div>
      </main>
      <AddVisitDialog 
          patientId={patient.id}
          open={isAddVisitOpen}
          onOpenChange={setIsAddVisitOpen}
      />
    </>
  );
}
