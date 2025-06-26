'use client';

import { useState, useEffect } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { searchPatients } from '@/app/actions';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';
import type { Patient } from '@/types';
import { useDebounce } from 'use-debounce';

interface PatientSearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PatientSearchDialog({ open, onOpenChange }: PatientSearchDialogProps) {
  const [query, setQuery] = useState('');
  const [debouncedQuery] = useDebounce(query, 300);
  const [results, setResults] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Reset state when dialog opens or closes
    if (!open) {
      setQuery('');
      setResults([]);
      setIsLoading(false);
    }
  }, [open]);

  useEffect(() => {
    const performSearch = async () => {
      if (debouncedQuery.length < 2) {
        setResults([]);
        return;
      }
      setIsLoading(true);
      const searchResults = await searchPatients(debouncedQuery);
      setResults(searchResults);
      setIsLoading(false);
    };

    if (debouncedQuery) {
      performSearch();
    } else {
      setResults([]);
    }
  }, [debouncedQuery]);

  const handleLinkClick = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Search for a Patient</DialogTitle>
          <DialogDescription>
            Find a patient by name or email to view their record or add a visit note.
          </DialogDescription>
        </DialogHeader>
        <div className="relative mt-4">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Start typing a patient's name or email..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-lg bg-background pl-8"
            autoFocus
          />
        </div>
        <div className="mt-4 min-h-[200px] max-h-[300px] overflow-y-auto pr-2">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin" />
              <p className="mt-2">Searching...</p>
            </div>
          ) : results.length > 0 ? (
            <div className="flex flex-col gap-1">
              {results.map((patient) => (
                <Link
                  key={patient.id}
                  href={`/dashboard/patients/${patient.id}`}
                  onClick={handleLinkClick}
                  className="flex items-center gap-3 rounded-md p-2 hover:bg-accent transition-colors"
                >
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={patient.avatarUrl} alt={patient.name} data-ai-hint="person portrait" />
                    <AvatarFallback>{patient.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{patient.name}</div>
                    <div className="text-xs text-muted-foreground">{patient.email}</div>
                  </div>
                </Link>
              ))}
            </div>
          ) : query && debouncedQuery.length > 1 ? (
             <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <p>No patients found.</p>
            </div>
          ) : (
             <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <p>Enter at least 2 characters to search.</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
