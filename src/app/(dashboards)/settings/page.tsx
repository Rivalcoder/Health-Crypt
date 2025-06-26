import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SettingsForm } from './settings-form';
import { getSessionUser } from '@/app/actions';
import { redirect } from 'next/navigation';
import { PasswordChangeForm } from '@/components/password-change-form';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default async function DoctorSettingsPage() {
    const user = await getSessionUser();

    if (!user || user.role !== 'doctor') {
        // This should be caught by layout, but as a safeguard
        redirect('/login');
    }

    const page = (
        <div className="container max-w-4xl py-10">
            <div className="mb-4">
                <Button variant="ghost" size="icon" asChild aria-label="Back to Dashboard">
                    <Link href="/dashboard">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                </Button>
            </div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight">Doctor Settings</h1>
                <p className="text-muted-foreground">Manage your account and professional profile.</p>
            </div>
            <main className="flex flex-col gap-8 opacity-0 animate-fade-in" style={{animationDelay: '200ms'}}>
                <Card>
                    <CardHeader>
                        <CardTitle>Profile Information</CardTitle>
                        <CardDescription>
                            Update your personal details, specialty, and profile picture.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <SettingsForm user={user} />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Change Password</CardTitle>
                        <CardDescription>
                            For security, we recommend choosing a strong password that you don't use elsewhere.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <PasswordChangeForm />
                    </CardContent>
                </Card>
            </main>
        </div>
    );
    return page;
}
