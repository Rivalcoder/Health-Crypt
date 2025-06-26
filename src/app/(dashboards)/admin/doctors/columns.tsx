'use client';

import type { ColumnDef } from '@tanstack/react-table';
import type { Doctor } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, Pencil, Trash2, Eye, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DoctorStatusToggle } from './doctor-status-toggle';
import UpdateDoctorPasswordDialog from './[id]/update-doctor-password-dialog';
import React, { useState } from 'react';

interface GetColumnsProps {
  onEdit: (doctor: Doctor) => void;
  onDelete: (doctor: Doctor) => void;
}

export const getColumns = ({ onEdit, onDelete }: GetColumnsProps): ColumnDef<Doctor>[] => [
  {
    accessorKey: 'name',
    header: 'Name',
    cell: ({ row }) => {
      const doctor = row.original;
      return (
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarImage src={doctor.avatarUrl} alt={doctor.name} data-ai-hint="doctor portrait" />
            <AvatarFallback>{doctor.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{doctor.name}</div>
            <div className="text-xs text-muted-foreground">{doctor.email}</div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: 'specialty',
    header: 'Specialty',
    cell: ({ row }) => {
      return <Badge variant="secondary">{row.original.specialty}</Badge>;
    }
  },
  {
    accessorKey: 'licenseId',
    header: 'License ID',
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const doctor = row.original;
      return <DoctorStatusToggle doctor={doctor} />;
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const doctor = row.original;
      const [pwDialogOpen, setPwDialogOpen] = useState(false);
      return (
        <div className="text-right">
          <UpdateDoctorPasswordDialog doctorId={doctor.id} doctorName={doctor.name} open={pwDialogOpen} setOpen={setPwDialogOpen} />
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
                <Link href={`/admin/doctors/${doctor.id}`}>
                  <Eye className="mr-2 h-4 w-4" />
                  View profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(doctor)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setPwDialogOpen(true)}>
                <User className="mr-2 h-4 w-4" />
                Reset password
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive focus:bg-destructive/10"
                onClick={() => onDelete(doctor)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete doctor
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];
