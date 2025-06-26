'use client';
import type { ColumnDef } from '@tanstack/react-table';
import type { Patient } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, Pencil, Trash2, Eye, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PatientStatusToggle } from './patient-status-toggle';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Link from 'next/link';
import UpdatePatientPasswordDialog from './[id]/update-patient-password-dialog';
import React from 'react';

interface GetColumnsProps {
  onEdit: (patient: Patient) => void;
  onDelete: (patient: Patient) => void;
}

export const getColumns = ({ onEdit, onDelete }: GetColumnsProps): ColumnDef<Patient>[] => [
  {
    accessorKey: 'name',
    header: 'Name',
    cell: ({ row }) => {
      const patient = row.original;
      return (
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarImage src={patient.avatarUrl} alt={patient.name} />
            <AvatarFallback>{patient.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{patient.name}</div>
            <div className="text-xs text-muted-foreground">{patient.email}</div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: 'email',
    header: 'Email',
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const patient = row.original;
      return <PatientStatusToggle patient={patient} />;
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const patient = row.original;
      const [pwDialogOpen, setPwDialogOpen] = React.useState(false);
      return (
        <div className="text-right">
          <UpdatePatientPasswordDialog patientId={patient.id} patientName={patient.name} open={pwDialogOpen} setOpen={setPwDialogOpen} />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem asChild>
                <Link href={`/admin/patients/${patient.id}`}>
                  <Eye className="mr-2 h-4 w-4" />
                  View/Edit
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setPwDialogOpen(true)}>
                <User className="mr-2 h-4 w-4" />
                Reset password
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive focus:bg-destructive/10"
                onClick={() => onDelete(patient)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
]; 