'use client';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { adminUpdateDoctorPassword } from '@/app/actions';

export default function UpdateDoctorPasswordDialog({ doctorId, doctorName, open: controlledOpen, setOpen: setControlledOpen }: { doctorId: string, doctorName: string, open?: boolean, setOpen?: (open: boolean) => void }) {
  const [localOpen, setLocalOpen] = useState(false);
  const open = controlledOpen !== undefined ? controlledOpen : localOpen;
  const setOpen = setControlledOpen || setLocalOpen;
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleUpdate = async () => {
    setLoading(true);
    setMessage(null);
    setSuccess(false);
    const result = await adminUpdateDoctorPassword(doctorId, password);
    setLoading(false);
    setMessage(result.message);
    setSuccess(result.success);
    if (result.success) setPassword('');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Password for {doctorName}</DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          <Input
            type="password"
            placeholder="New password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            disabled={loading}
          />
          {message && (
            <div className={success ? 'text-green-600' : 'text-red-600'}>{message}</div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleUpdate} disabled={loading || !password}>
            {loading ? 'Updating...' : 'Update Password'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 