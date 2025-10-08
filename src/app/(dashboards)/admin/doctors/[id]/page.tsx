import { getDoctorById } from '@/lib/data';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, User, Mail, ShieldCheck, Activity } from 'lucide-react';
import Link from 'next/link';
import UpdateDoctorPasswordDialog from './update-doctor-password-dialog';

export default async function DoctorProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const timerLabel = `getDoctorById-${id}`;
  console.time(timerLabel);
  const doctor = await getDoctorById(id);
  console.timeEnd(timerLabel);

  if (!doctor) {
    notFound();
  }

  return (
    <div className="container max-w-4xl py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Doctor Profile</h1>
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin/doctors"><ArrowLeft className="h-4 w-4 mr-2" />Back to Doctors</Link>
        </Button>
      </div>
      <main className="flex-1 opacity-0 animate-fade-in" style={{animationDelay: '200ms'}}>
        <Card>
            <CardHeader className="flex flex-col md:flex-row items-start gap-4 space-y-0 p-6">
                <Avatar className="h-24 w-24 border-4 border-primary">
                    <AvatarImage src={doctor.avatarUrl} alt={doctor.name} data-ai-hint="doctor portrait" />
                    <AvatarFallback className="text-4xl">{doctor.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <div className="grid gap-1 flex-1">
                    <CardTitle className="text-3xl font-bold">{doctor.name}</CardTitle>
                    <CardDescription>
                        <Badge variant="secondary">{doctor.specialty}</Badge>
                    </CardDescription>
                     <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2">
                        <Activity className="h-4 w-4" /> 
                        Status: <span className={doctor.status === 'active' ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-red-600 dark:text-red-400 font-medium'}>
                            {doctor.status.charAt(0).toUpperCase() + doctor.status.slice(1)}
                        </span>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-6 pt-0">
                <Separator className="my-4" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2"><Mail className="h-4 w-4 text-muted-foreground" /><strong>Email:</strong> {doctor.email}</div>
                    <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-muted-foreground" /><strong>License ID:</strong> {doctor.licenseId}</div>
                </div>
                <div className="mt-6">
                  <UpdateDoctorPasswordDialog doctorId={doctor.id} doctorName={doctor.name} />
                </div>
            </CardContent>
        </Card>
      </main>
    </div>
  );
}
