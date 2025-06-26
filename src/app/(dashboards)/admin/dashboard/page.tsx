import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight, Users, UserPlus, Activity } from 'lucide-react';
import { 
    getActiveDoctorsCount, 
    getNewDoctorApplicantsCount, 
    getTotalDoctorsCount, 
    getTotalPatientsCount 
} from '@/lib/data';
import { getSessionUser } from '@/app/actions';
import { redirect } from 'next/navigation';
import { redirectToRoleDashboard } from '@/lib/utils';

export default async function AdminDashboardPage() {
    const user = await getSessionUser();
    if (!user) redirect('/login');
    if (user.role !== 'admin') {
      redirect(redirectToRoleDashboard(user));
    }

    const [
        totalDoctors,
        totalPatients,
        activeDoctors,
        newApplicants
    ] = await Promise.all([
        getTotalDoctorsCount(),
        getTotalPatientsCount(),
        getActiveDoctorsCount(),
        getNewDoctorApplicantsCount()
    ]);

  const stats = [
    {
      title: 'Total Doctors',
      value: totalDoctors.toString(),
      icon: <Users className="h-6 w-6 text-muted-foreground" />,
      delay: '200ms',
    },
    {
      title: 'Total Patients',
      value: totalPatients.toString(),
      icon: <Users className="h-6 w-6 text-muted-foreground" />,
      delay: '300ms',
    },
    {
      title: 'Active Doctors',
      value: activeDoctors.toString(),
      icon: <Activity className="h-6 w-6 text-muted-foreground" />,
      delay: '400ms',
    },
    {
      title: 'New Doctor Applicants',
      value: newApplicants.toString(),
      icon: <UserPlus className="h-6 w-6 text-muted-foreground" />,
      delay: '500ms',
    },
  ];

  return (
    <div className="container py-10">
      <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
      </div>
      <main className="flex-1">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
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

        <div className="mt-8 grid gap-6">
          <Card
            className="opacity-0 animate-fade-up"
            style={{ animationDelay: '600ms' }}
          >
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row gap-4">
              <Button asChild>
                <Link href="/admin/doctors">
                  Manage Doctors <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="secondary">
                <Link href="/admin/patients">
                  Manage Patients <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" disabled>View System Logs</Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
