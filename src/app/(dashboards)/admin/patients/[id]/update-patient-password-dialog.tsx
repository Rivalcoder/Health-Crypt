"use client";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { adminUpdatePatientPassword } from '@/app/actions';

export default function UpdatePatientPasswordDialog({ patientId, patientName, open: controlledOpen, setOpen: setControlledOpen }: { patientId: string, patientName: string, open?: boolean, setOpen?: (open: boolean) => void }) {
  const [localOpen, setLocalOpen] = useState(false);
  const open = controlledOpen !== undefined ? controlledOpen : localOpen;
  const setOpen = setControlledOpen || setLocalOpen;
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (open) {
      setPassword("");
      setMessage(null);
      setSuccess(false);
    }
  }, [open]);

  useEffect(() => {
    if (success && open) {
      const timer = setTimeout(() => {
        setOpen(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success, open, setOpen]);

  const handleUpdate = async () => {
    setLoading(true);
    setMessage(null);
    setSuccess(false);
    const result = await adminUpdatePatientPassword(patientId, password);
    setLoading(false);
    setMessage(result.message);
    setSuccess(result.success);
    if (result.success) setPassword("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Password for {patientName}</DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          <Input
            type="password"
            placeholder="New password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            disabled={loading || success}
          />
          {message && (
            <div className={success ? "text-green-600" : "text-red-600"}>{message}</div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>Cancel</Button>
          <Button onClick={handleUpdate} disabled={loading || !password || success}>
            {loading ? "Updating..." : "Update Password"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 