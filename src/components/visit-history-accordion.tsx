
'use client';

import Link from 'next/link';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { FileText, Stethoscope, Pill, Briefcase } from 'lucide-react';
import type { Visit } from '@/types';

interface VisitHistoryAccordionProps {
    visits: Visit[];
}

export function VisitHistoryAccordion({ visits }: VisitHistoryAccordionProps) {
    if (!visits || visits.length === 0) {
        return (
            <div className="text-center text-muted-foreground py-8">
                <p>No visit history available for this patient.</p>
                <p className="text-sm">Visit records will appear here after their first consultation.</p>
            </div>
        );
    }
    
    return (
        <Accordion type="single" collapsible className="w-full">
            {visits.map((visit) => (
                <AccordionItem value={visit.id} key={visit.id}>
                    <AccordionTrigger className="hover:bg-accent/50 px-4 rounded-md">
                        <div className="flex justify-between w-full pr-4">
                            <span className="font-semibold">{visit.reason}</span>
                            <span className="text-muted-foreground">{new Date(visit.date).toLocaleDateString()}</span>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="p-4 space-y-4">
                        <div className="text-sm">
                            <div className="flex items-center gap-2">
                                <Stethoscope className="inline-block h-4 w-4 mr-1" />
                                <strong>Doctor:</strong>
                                {visit.doctor ? (
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button variant="link" className="p-0 h-auto text-sm">
                                                {visit.doctor.name} ({visit.doctor.specialty})
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-80">
                                            <div className="flex items-center gap-4">
                                                <Avatar className="h-16 w-16">
                                                    <AvatarImage src={visit.doctor.avatarUrl} alt={visit.doctor.name} />
                                                    <AvatarFallback>{visit.doctor.name.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                <div className="space-y-1">
                                                    <h4 className="font-semibold">{visit.doctor.name}</h4>
                                                    <p className="text-sm text-muted-foreground">{visit.doctor.specialty}</p>
                                                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                                                        <Briefcase className="h-3 w-3" /> {visit.doctor.licenseId}
                                                    </p>
                                                </div>
                                            </div>
                                            <Button asChild className="w-full mt-4">
                                                <Link href={`/doctors/${visit.doctor.id}`}>View Profile</Link>
                                            </Button>
                                        </PopoverContent>
                                    </Popover>
                                ) : (
                                    <span>Information unavailable</span>
                                )}
                            </div>
                            <p className="mt-2"><strong><FileText className="inline-block h-4 w-4 mr-1"/>Notes:</strong> {visit.notes}</p>
                            <p className="mt-2"><strong><FileText className="inline-block h-4 w-4 mr-1"/>Treatments:</strong> {visit.treatments}</p>
                        </div>
                        {visit.prescriptions.length > 0 && (
                            <div>
                                <h4 className="font-semibold mb-2 flex items-center"><Pill className="h-4 w-4 mr-2"/>Prescriptions</h4>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Medication</TableHead>
                                            <TableHead>Dosage</TableHead>
                                            <TableHead>Frequency</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {visit.prescriptions.map((p, i) => (
                                            <TableRow key={i}>
                                                <TableCell>{p.medication}</TableCell>
                                                <TableCell>{p.dosage}</TableCell>
                                                <TableCell>{p.frequency}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </AccordionContent>
                </AccordionItem>
            ))}
        </Accordion>
    );
}
