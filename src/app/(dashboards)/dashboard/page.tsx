
import { getPatients, getTodaysAppointmentsCount } from '@/lib/data';
import { getSessionUser } from '@/app/actions';
import { DashboardClient } from './dashboard-client';
import { redirect } from 'next/navigation';

export default async function Dashboard() {
  const user = await getSessionUser();
  
  if (!user) {
    redirect('/login');
  }
  
  if (user.role !== 'doctor') {
    // Should be caught by layout, but as a safeguard.
    redirect('/login');
  }

  const patients = await getPatients(user.id);
  const todaysAppointmentsCount = await getTodaysAppointmentsCount(user.id);
  
  return (
    <div className="container py-10">
      <DashboardClient patients={patients} todaysAppointmentsCount={todaysAppointmentsCount} />
    </div>
  );
}
