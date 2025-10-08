import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { User, Calendar, Phone, MapPin, Droplet, Mail, LogOut } from 'lucide-react';
import { getPatientData } from '@/lib/data';
import { VisitHistoryAccordion } from '@/components/visit-history-accordion';
import { Button } from '@/components/ui/button';
import { logoutAction } from '@/app/actions';

export default async function PatientViewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { patient, visits } = await getPatientData(id);

  if (!patient) {
    notFound();
  }

  return (
    <div className="container mx-auto max-w-4xl py-8 px-4">
      <div className="flex justify-end mb-4">
        <form action={logoutAction}>
          <Button type="submit" variant="outline" size="sm">
            <LogOut className="h-4 w-4 mr-2" /> Sign Out
          </Button>
        </form>
      </div>
      <div className="grid gap-8">
        <Card className="shadow-md">
          <CardHeader className="flex flex-col md:flex-row items-start gap-4 space-y-0 p-6">
            <Avatar className="h-24 w-24 border-4 border-primary">
              <AvatarImage src={patient.avatarUrl} alt={patient.name} data-ai-hint="person portrait" />
              <AvatarFallback className="text-4xl">{patient.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
            </Avatar>
            <div className="grid gap-1 flex-1">
              <CardTitle className="text-3xl font-bold">{patient.name}</CardTitle>
              <CardDescription>Patient ID: {patient.patientId || '—'}</CardDescription>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground pt-2">
                <div className="flex items-center gap-1"><User className="h-4 w-4" /> {patient.gender}</div>
                <div className="flex items-center gap-1"><Calendar className="h-4 w-4" /> Born {new Date(patient.dateOfBirth).toLocaleDateString()}</div>
                <div className="flex items-center gap-1"><Droplet className="h-4 w-4" /> {patient.bloodGroup}</div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <Separator className="my-4" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-muted-foreground" /><strong>Contact:</strong> {patient.contact}</div>
                <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-muted-foreground" /><strong>Address:</strong> {patient.address}</div>
                <div className="flex items-center gap-2 col-span-full"><Mail className="h-4 w-4 text-muted-foreground" /><strong>Email:</strong> {patient.email}</div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-md">
            <CardHeader className="p-6">
              <CardTitle>My Visit History</CardTitle>
              <CardDescription>A secure record of your past consultations.</CardDescription>
            </CardHeader>
            <CardContent className="px-6 pb-6">
               <VisitHistoryAccordion visits={visits} />
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
