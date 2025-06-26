
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SettingsForm } from './settings-form';
import { getSessionUser } from '@/app/actions';
import { PasswordChangeForm } from '@/components/password-change-form';

export default async function AdminSettingsPage() {
    const user = await getSessionUser();

    return (
        <div className="container max-w-4xl py-10">
             <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight">Admin Settings</h1>
                <p className="text-muted-foreground">Manage your account and profile information.</p>
            </div>
            <main className="flex flex-col gap-8 opacity-0 animate-fade-in" style={{animationDelay: '200ms'}}>
                <Card>
                    <CardHeader>
                        <CardTitle>Profile Information</CardTitle>
                        <CardDescription>
                            Update your personal details and profile picture.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {user && user.role === 'admin' ? (
                            <SettingsForm user={user} />
                        ) : (
                            <div className="text-center text-muted-foreground p-8">
                                <p>Could not load administrator profile.</p>
                                <p className="text-sm">Please try logging out and signing in again.</p>
                            </div>
                        )}
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
}
