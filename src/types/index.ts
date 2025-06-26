
export type User = {
    id: string;
    name: string;
    email: string;
    avatarUrl: string;
    role: 'admin' | 'doctor' | 'patient';
    contact?: string;
    specialty?: string;
    licenseId?: string;
}

export type Patient = {
  id: string;
  name: string;
  email: string;
  dateOfBirth: string;
  gender: 'Male' | 'Female' | 'Other';
  contact: string;
  address: string;
  avatarUrl: string;
  bloodGroup: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
};

export type Visit = {
  id:string;
  patientId: string;
  doctorId: string;
  date: string;
  doctor?: {
    id: string;
    name: string;
    specialty: string;
    avatarUrl: string;
    licenseId: string;
  };
  reason: string;
  notes: string;
  treatments: string;
  prescriptions: Prescription[];
};

export type Prescription = {
  medication: string;
  dosage: string;
  frequency: string;
};

export type Doctor = {
  id: string;
  name: string;
  email: string;
  licenseId: string;
  specialty: string;
  status: 'active' | 'inactive';
  avatarUrl: string;
};
