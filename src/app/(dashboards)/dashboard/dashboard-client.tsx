'use client';

import { useState } from 'react';
import { Users, CalendarCheck, Search } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import type { Patient } from '@/types';
import { Button } from '@/components/ui/button';
import { PatientSearchDialog } from './patient-search-dialog';

interface DashboardClientProps {
  patients: Patient[];
  todaysAppointmentsCount: number;
}

export function DashboardClient({ patients, todaysAppointmentsCount }: DashboardClientProps) {
  const [isSearchDialogOpen, setIsSearchDialogOpen] = useState(false);
  
  const stats = [
    {
      title: 'My Total Patients',
      value: patients.length.toString(),
      icon: <Users className="h-6 w-6 text-muted-foreground" />,
      delay: '200ms',
    },
    {
      title: 'Today\'s Appointments',
      value: todaysAppointmentsCount.toString(),
      icon: <CalendarCheck className="h-6 w-6 text-muted-foreground" />,
      delay: '300ms',
    },
  ];

  return (
    <>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
              <h1 className="text-3xl font-bold tracking-tight">Doctor Dashboard</h1>
              <p className="text-muted-foreground">An overview of your patients and appointments.</p>
          </div>
          <div className="flex items-center gap-2">
                <Button onClick={() => setIsSearchDialogOpen(true)}>
                  <Search className="mr-2 h-4 w-4" />
                  Search Patients
                </Button>
          </div>
      </div>
      <main className="flex-1">
         <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2 mb-8">
          {stats.map((stat) => (
            <Card
              key={stat.title}
              className="opacity-0 animate-fade-up"
              style={{ animationDelay: stat.delay }}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                {stat.icon}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="opacity-0 animate-fade-up" style={{ animationDelay: '500ms' }}>
          <CardHeader>
            <CardTitle>My Patients</CardTitle>
            <CardDescription>A list of all patients you have consulted with.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Gender</TableHead>
                  <TableHead>Date of Birth</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {patients.length > 0 ? (
                  patients.map((patient) => (
                    <TableRow key={patient.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarImage src={patient.avatarUrl} alt={patient.name} data-ai-hint="person portrait" />
                            <AvatarFallback>{patient.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="font-medium">{patient.name}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{patient.gender}</Badge>
                      </TableCell>
                      <TableCell>{new Date(patient.dateOfBirth).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/dashboard/patients/${patient.id}`}>View Details</Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                      You haven't treated any patients yet. Use the search bar to find a patient and add a visit note.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
      <PatientSearchDialog
        open={isSearchDialogOpen}
        onOpenChange={setIsSearchDialogOpen}
      />
    </>
  );
}
