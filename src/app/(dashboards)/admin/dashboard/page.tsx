import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight, Users, UserPlus, Activity, BarChart3, HeartPulse } from 'lucide-react';
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

  // Fetch recent doctor applicants (for demo, just fetch new applicants)
  // In a real app, you would fetch actual applicant data with more details
  const client = await import('@/lib/mongodb').then(m => m.default);
  const db = (await client).db('medivault');
  const recentApplicants = await db.collection('doctors')
    .find({ passwordSet: false })
    .sort({ createdAt: -1 })
    .limit(5)
    .toArray();

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

        {/* Analytics/Chart Section */}
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <Card className="opacity-0 animate-fade-up" style={{ animationDelay: '700ms' }}>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Growth Analytics</CardTitle>
                <CardDescription>Patient & Doctor growth (coming soon)</CardDescription>
              </div>
              <BarChart3 className="h-8 w-8 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="h-32 flex items-center justify-center text-muted-foreground">
                <span>📊 Analytics chart coming soon...</span>
              </div>
            </CardContent>
          </Card>

          {/* System Health Section */}
          <Card className="opacity-0 animate-fade-up" style={{ animationDelay: '800ms' }}>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>System Health</CardTitle>
                <CardDescription>Platform status</CardDescription>
              </div>
              <HeartPulse className="h-8 w-8 text-emerald-500 dark:text-emerald-400 animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold">
                <HeartPulse className="h-5 w-5 animate-pulse" />
                All systems operational
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Doctor Applicants Section */}
        <div className="mt-8 grid gap-6">
          <Card className="opacity-0 animate-fade-up" style={{ animationDelay: '900ms' }}>
            <CardHeader>
              <CardTitle>Recent Doctor Applicants</CardTitle>
              <CardDescription>Doctors who have recently applied (pending setup)</CardDescription>
            </CardHeader>
            <CardContent>
              {recentApplicants.length === 0 ? (
                <div className="text-muted-foreground">No new applicants.</div>
              ) : (
                <ul className="divide-y">
                  {recentApplicants.map((doc: any) => (
                    <li key={doc._id} className="py-2 flex flex-col md:flex-row md:items-center md:gap-4">
                      <span className="font-medium">{doc.name}</span>
                      <span className="text-xs text-muted-foreground">{doc.email}</span>
                      <span className="text-xs text-muted-foreground">{doc.specialty}</span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
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
