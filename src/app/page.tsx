import Link from 'next/link';
import { Stethoscope, User, Shield, ArrowRight, FileLock, UserCheck, BrainCircuit, LayoutDashboard, CheckCircle, Sparkles } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/logo';
import { ThemeToggle } from '@/components/theme-toggle';

export default function Home() {
  const features = [
    {
      icon: BrainCircuit,
      title: "AI-Powered Insights",
      description: "Leverage AI to generate patient summaries and identify trends, improving diagnostic accuracy.",
    },
    {
      icon: FileLock,
      title: "Secure by Design",
      description: "Your health data is protected with state-of-the-art encryption and privacy controls.",
    },
    {
      icon: UserCheck,
      title: "Patient-Centric Portal",
      description: "Empower patients with easy access to their complete medical history, prescriptions, and lab results.",
    },
    {
      icon: LayoutDashboard,
      title: "Unified Dashboards",
      description: "Manage patient records, doctor schedules, and admin tasks from one intuitive interface.",
    },
  ];

  const benefits = [
    "Centralized health records for easy access.",
    "AI-driven insights to support clinical decisions.",
    "Secure platform built with privacy first.",
    "Streamlined communication between doctors and patients.",
  ];

  const portals = [
    {
      icon: <User className="w-6 h-6 text-primary" />,
      title: "Patient Portal",
      description: "View your medical history, prescriptions, and visit summaries.",
      href: "/login?role=patient",
      delay: "200ms",
    },
    {
      icon: <Stethoscope className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />,
      title: "Doctor Login",
      description: "Manage patient records, update visit notes, and prescribe medication.",
      href: "/login?role=doctor",
      delay: "400ms",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground overflow-x-hidden">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 max-w-screen-2xl items-center justify-between">
          <Logo />
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="outline" asChild>
                <Link href="/login?role=doctor">Doctor Login</Link>
            </Button>
            <Button variant="outline" asChild>
                <Link href="/login?role=admin">Admin Login</Link>
            </Button>
          </div>
        </div>
      </header>
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-20 md:py-32">
            <div 
              aria-hidden="true" 
              className="absolute inset-0 top-0 -z-10 h-full w-full bg-background bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]"
            />
            <div className="container max-w-4xl text-center">
                <div className="mb-6 flex justify-center opacity-0 animate-fade-down">
                    <Stethoscope className="w-16 h-16 text-primary animate-pulse-glow" />
                </div>
                <h1 className="text-4xl md:text-6xl font-bold tracking-tighter mb-6 opacity-0 animate-fade-down [animation-delay:200ms]">
                    The Future of Health Records is Here.
                </h1>
                <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 opacity-0 animate-fade-up [animation-delay:400ms]">
                    MediVault provides a secure, unified platform for patients, doctors, and administrators to manage medical information seamlessly.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center opacity-0 animate-fade-up [animation-delay:600ms]">
                    <Button size="lg" asChild>
                        <Link href="/login?role=patient">
                            Patient Login <ArrowRight className="ml-2 h-5 w-5" />
                        </Link>
                    </Button>
                     <Button size="lg" variant="outline" asChild>
                        <Link href="/signup">
                            Create Patient Account
                        </Link>
                    </Button>
                </div>
            </div>
        </section>

        {/* Features Section */}
        <section className="py-20 md:py-24 bg-secondary/50">
          <div className="container">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <div className="opacity-0 animate-fade-up">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Everything You Need for
                  <span className="text-primary"> Smart Healthcare</span>
                </h2>
                <p className="text-lg text-muted-foreground">
                  Advanced features designed to make healthcare management simple, secure, and intelligent.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <div
                  key={feature.title}
                  className="opacity-0 animate-fade-up"
                  style={{ animationDelay: `${200 + index * 100}ms` }}
                >
                  <Card className="text-center h-full hover:shadow-lg transition-shadow duration-300">
                    <CardHeader>
                      <div className="mx-auto bg-primary/10 p-3 rounded-lg w-fit mb-4">
                        <feature.icon className="w-8 h-8 text-primary" />
                      </div>
                      <CardTitle className="text-xl mb-2">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription>
                        {feature.description}
                      </CardDescription>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-20 md:py-24 bg-background">
          <div className="container">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="opacity-0 animate-fade-up" style={{ animationDelay: '200ms' }}>
                <h2 className="text-3xl md:text-4xl font-bold mb-6">
                  Why Choose
                  <span className="text-primary"> MediVault?</span>
                </h2>
                <p className="text-lg text-muted-foreground mb-8">
                  Join thousands of patients and healthcare providers who trust MediVault 
                  for their digital health management needs.
                </p>
                <div className="space-y-4">
                  {benefits.map((benefit, index) => (
                    <div
                      key={benefit}
                      className="flex items-center space-x-3 opacity-0 animate-fade-up"
                      style={{ animationDelay: `${300 + index * 100}ms` }}
                    >
                      <CheckCircle className="w-6 h-6 text-emerald-500 dark:text-emerald-400 flex-shrink-0" />
                      <span className="text-foreground">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="opacity-0 animate-fade-up" style={{ animationDelay: '400ms' }}>
                <div className="bg-primary rounded-2xl p-8 text-primary-foreground">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-2xl font-bold mb-2">AI Health Assistant</h3>
                      <p className="opacity-90">Powered by advanced AI technology</p>
                    </div>
                    <Sparkles className="w-12 h-12 opacity-80" />
                  </div>
                  <div className="space-y-4">
                    <div className="bg-primary-foreground/20 rounded-lg p-4">
                      <p className="font-semibold mb-1">Health Risk Analysis</p>
                      <p className="text-sm opacity-90">AI analyzes your health patterns to identify potential risks early.</p>
                    </div>
                    <div className="bg-primary-foreground/20 rounded-lg p-4">
                      <p className="font-semibold mb-1">Medication Reminders</p>
                      <p className="text-sm opacity-90">Smart reminders ensure you never miss important medications.</p>
                    </div>
                    <div className="bg-primary-foreground/20 rounded-lg p-4">
                      <p className="font-semibold mb-1">Personalized Insights</p>
                      <p className="text-sm opacity-90">Get tailored health recommendations based on your medical history.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Portals Section */}
        <section className="py-20 md:py-24 bg-secondary/50">
          <div className="container">
            <div className="text-center max-w-3xl mx-auto mb-12">
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight opacity-0 animate-fade-up">
                    Get Started with Your Portal
                </h2>
                <p className="mt-4 text-lg text-muted-foreground opacity-0 animate-fade-up [animation-delay:200ms]">
                    Dedicated dashboards for every role in the healthcare ecosystem.
                </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
              {portals.map((portal) => (
                <div
                  key={portal.title}
                  className="opacity-0 animate-zoom-in"
                  style={{ animationDelay: portal.delay }}
                >
                  <Card className="hover:shadow-xl hover:-translate-y-2 transition-all duration-300 h-full flex flex-col">
                    <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-2">
                      <div className="bg-primary/10 p-3 rounded-full">
                        {portal.icon}
                      </div>
                      <CardTitle className="text-xl font-semibold">{portal.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-grow flex flex-col">
                      <p className="text-muted-foreground mb-6 flex-grow">
                        {portal.description}
                      </p>
                      <Button asChild className="w-full mt-auto">
                        <Link href={portal.href}>
                          Go to Portal <ArrowRight className="ml-2" />
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-primary">
          <div className="container text-center">
            <div className="opacity-0 animate-fade-up">
              <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-6">
                Ready to Transform Your Healthcare Experience?
              </h2>
              <p className="text-xl text-primary-foreground/80 mb-8 max-w-3xl mx-auto">
                Join thousands of users who have already digitized their medical records 
                and taken control of their health journey.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" variant="secondary" asChild>
                  <Link href="/signup" className="text-lg px-8">
                    Create a Patient Account <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="text-lg px-8 text-primary hover:bg-primary-foreground hover:text-primary">
                  <Link href="mailto:sales@medivault.com">
                    Contact Sales
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-8 bg-secondary/50 border-t">
        <div className="container text-center text-muted-foreground text-sm">
          <p>&copy; {new Date().getFullYear()} MediVault. All rights reserved.</p>
          <p className="mt-1">A new era of digital healthcare.</p>
        </div>
      </footer>
    </div>
  );
}
