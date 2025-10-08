'use server';

import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { redirect } from 'next/navigation';
import clientPromise from '@/lib/mongodb';
import { login as createSession, logout as destroySession, getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { ObjectId } from 'mongodb';
import type { User, Doctor, Patient, Visit, Prescription } from '@/types';
import { findPatients, getDoctorById, searchDoctors, searchPatientsPaginated } from '@/lib/data';

const SignupFormSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
  dateOfBirth: z.string().min(1, { message: "Date of birth is required." }).refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid date format.'}),
  gender: z.enum(['Male', 'Female', 'Other'], { errorMap: () => ({ message: 'Please select a gender.' }) }),
  bloodGroup: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'], { errorMap: () => ({ message: 'Please select a blood group.' }) }),
  contact: z.string().min(10, { message: 'Please enter a valid phone number.' }),
  address: z.string().min(5, { message: 'Please enter a valid address.' }),
  avatar: z.string().optional(),
});

const LoginFormSchemaAdminDoctor = z.object({
  email: z.string().email({ message: 'Please enter a valid email.' }),
  password: z.string().min(1, { message: 'Password field cannot be empty.' }),
  role: z.literal('admin').or(z.literal('doctor')),
});

const LoginFormSchemaPatient = z.object({
  patientId: z.string().regex(/^\d{12}$/,{ message: 'Enter a valid 12 digit Patient ID.' }),
  password: z.string().min(1, { message: 'Password field cannot be empty.' }),
  role: z.literal('patient'),
});

const AddDoctorFormSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email.' }),
  specialty: z.string().min(2, { message: 'Specialty is required.' }),
  licenseId: z.string().min(1, { message: 'License ID is required.' }),
  avatar: z.string().optional(),
});

const UpdateDoctorFormSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  specialty: z.string().min(2, { message: 'Specialty is required.' }),
  licenseId: z.string().min(1, { message: 'License ID is required.' }),
  avatar: z.string().optional(),
});

const UpdateProfileFormSchema = z.object({
    name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
    contact: z.string().optional(),
    avatar: z.string().optional(),
});

const UpdateDoctorProfileSchema = z.object({
    name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
    contact: z.string().optional(),
    avatar: z.string().optional(),
    specialty: z.string().min(2, { message: 'Specialty is required.' }),
});

const PasswordChangeSchema = z.object({
    oldPassword: z.string().min(1, { message: 'Old password is required.' }),
    newPassword: z.string().min(6, { message: 'New password must be at least 6 characters.' }),
    confirmPassword: z.string()
}).refine(data => data.newPassword === data.confirmPassword, {
    message: "New passwords don't match.",
    path: ['confirmPassword'],
});

const DoctorSetupSchema = z.object({
  name: z.string().min(1, 'Name is required.'),
  email: z.string().email('Invalid email.'),
  licenseId: z.string().min(1, 'License ID is required.'),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
});

const AddVisitFormSchema = z.object({
  reason: z.string().min(3, { message: 'Reason for visit is required.' }),
  notes: z.string().min(10, { message: 'Consultation notes are required.' }),
  prescriptions: z.string(), // This is now a JSON string
});

const UpdatePatientFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  dateOfBirth: z.string().optional(),
  gender: z.string().optional(),
  contact: z.string().optional(),
  address: z.string().optional(),
  avatar: z.string().optional(),
  bloodGroup: z.string().optional(),
});

export async function signupUser(prevState: any, formData: FormData) {
  try {
    const validatedFields = SignupFormSchema.safeParse(
      Object.fromEntries(formData.entries())
    );

    if (!validatedFields.success) {
      const firstError = Object.values(validatedFields.error.flatten().fieldErrors)[0]?.[0];
      return { success: false, message: firstError || 'Invalid fields.' };
    }
    
    const { name, email, password, dateOfBirth, gender, bloodGroup, contact, address, avatar } = validatedFields.data;
    // Generate unique 12-digit patientId
    const client = await clientPromise;
    const db = client.db('medivault');
    let patientId: string = '';
    for (let attempts = 0; attempts < 5; attempts++) {
      const candidate = Array.from({ length: 12 }, (_, i) => (i === 0 ? Math.floor(Math.random() * 9) + 1 : Math.floor(Math.random() * 10))).join('');
      const exists = await db.collection('patients').findOne({ patientId: candidate });
      if (!exists) { patientId = candidate; break; }
    }
    if (!patientId) {
      return { success: false, message: 'Could not generate a unique Patient ID. Please try again.' };
    }
    let insertedId: string;
    let redirectUrl: string;

    const patientsCollection = db.collection('patients');

    const existingUser = await patientsCollection.findOne({ email });
    if (existingUser) {
      return { success: false, message: 'An account with this email already exists.' };
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const avatarUrl = avatar && avatar.startsWith('data:image') 
      ? avatar 
      : `https://placehold.co/100x100.png?text=${name.charAt(0)}`;

    const result = await patientsCollection.insertOne({
      name,
      email,
      password: hashedPassword,
      patientId,
      dateOfBirth,
      gender,
      bloodGroup,
      contact,
      address,
      avatarUrl,
      status: 'active',
      createdAt: new Date(),
    });
    
    insertedId = result.insertedId.toString();
    await createSession(insertedId, 'patient');
    redirectUrl = `/patients/${insertedId}?pid=${patientId}`;
    
    revalidatePath('/');
    redirect(redirectUrl);

  } catch (error: any) {
    if (error.message.includes('NEXT_REDIRECT')) {
        throw error;
    }
    return { success: false, message: `An unexpected server error occurred: ${error instanceof Error ? error.message : String(error)}` };
  }
}

export async function loginUser(prevState: any, formData: FormData) {
  try {
    const data = Object.fromEntries(formData.entries());
    let role = data.role as 'admin' | 'doctor' | 'patient';
    if (!role || !['admin','doctor','patient'].includes(role)) {
      return { success: false, message: 'Invalid role specified.' };
    }

    let email: string | undefined = undefined;
    let patientId: string | undefined = undefined;
    let password: string = String(data.password || '');

    if (role === 'patient') {
      const identifier = String(data.patientId || data.email || '').trim();
      const isPid = /^\d{12}$/.test(identifier);
      if (isPid) {
        const parsed = LoginFormSchemaPatient.safeParse({ patientId: identifier, password, role });
        if (!parsed.success) {
          return { success: false, message: parsed.error.issues[0]?.message || 'Invalid fields provided.' };
        }
        patientId = parsed.data.patientId;
      } else {
        const emailSchema = z.string().email({ message: 'Please enter a valid email.' });
        const emailResult = emailSchema.safeParse(identifier);
        if (!emailResult.success) {
          return { success: false, message: 'Enter a valid 12 digit Patient ID or a valid email.' };
        }
        email = emailResult.data;
      }
    } else {
      const parsed = LoginFormSchemaAdminDoctor.safeParse({ email: data.email, password, role });
      if (!parsed.success) {
        return { success: false, message: parsed.error.issues[0]?.message || 'Invalid fields provided.' };
      }
      email = parsed.data.email;
    }
    let redirectUrl: string;

    const client = await clientPromise;
    const db = client.db('medivault');
    let user: any = null;
    let collection;
    if (role === 'admin') {
      collection = db.collection('admins');
    } else if (role === 'doctor') {
      collection = db.collection('doctors');
    } else {
      collection = db.collection('patients');
    }

    if (role === 'patient') {
      user = await collection.findOne(
        patientId ? { patientId } : { email },
        { projection: { _id: 1, password: 1, status: 1 } }
      );
    } else {
      user = await collection.findOne(
        { email },
        { projection: { _id: 1, password: 1, status: 1, licenseId: 1, specialty: 1 } }
      );
    }

    if (!user) {
        return { success: false, message: role === 'patient' ? 'No user found with this Patient ID.' : 'No user found with this email.' };
    }
    
    if (role === 'doctor' && user.status === 'inactive') {
        return { success: false, message: 'Your ID is disabled by the admin, so you cannot login.' };
    }
    if (role === 'patient' && user.status === 'inactive') {
        return { success: false, message: 'Your ID is disabled by the admin, so you cannot login.' };
    }

    const passwordsMatch = await bcrypt.compare(password, user.password);
    if (!passwordsMatch) {
        return { success: false, message: 'Invalid password.' };
    }

    await createSession(user._id.toString(), role);

    switch(role) {
        case 'admin':
            redirectUrl = '/admin/dashboard';
            break;
        case 'doctor':
            redirectUrl = '/dashboard';
            break;
        case 'patient':
            redirectUrl = `/patients/${user._id.toString()}`;
            break;
        default:
            redirectUrl = '/login';
            break;
    }
    
    redirect(redirectUrl);

  } catch (error: any) {
    if (error.message.includes('NEXT_REDIRECT')) {
        throw error;
    }
    return { success: false, message: `An unexpected server error occurred: ${error instanceof Error ? error.message : String(error)}` };
  }
}

export async function addDoctor(prevState: any, formData: FormData) {
  try {
    const validatedFields = AddDoctorFormSchema.safeParse(
      Object.fromEntries(formData.entries())
    );

    if (!validatedFields.success) {
      const firstError = Object.values(validatedFields.error.flatten().fieldErrors)[0]?.[0];
      return { success: false, message: firstError || 'Invalid fields.' };
    }

    const { name, email, specialty, licenseId, avatar } = validatedFields.data;
    const temporaryPassword = Math.random().toString(36).slice(-8);

    const client = await clientPromise;
    const db = client.db('medivault');
    const doctorsCollection = db.collection('doctors');

    const existingUser = await doctorsCollection.findOne({ email });
    if (existingUser) {
      return { success: false, message: 'A user with this email already exists.' };
    }

    const hashedPassword = await bcrypt.hash(temporaryPassword, 10);
    const avatarUrl = avatar && avatar.startsWith('data:image') 
      ? avatar 
      : `https://placehold.co/100x100.png?text=${name.charAt(0)}`;

    await doctorsCollection.insertOne({
      name,
      email,
      password: hashedPassword,
      specialty,
      licenseId,
      avatarUrl,
      status: 'active',
      passwordSet: false,
      createdAt: new Date(),
    });

    revalidatePath('/admin/doctors');
    return { message: `Doctor ${name} added successfully. They will need to set their password on first login.`, success: true };
  } catch (error: any) {
    console.error('Add Doctor Action Error:', error);
    return { success: false, message: `An unexpected server error occurred: ${error instanceof Error ? error.message : String(error)}` };
  }
}

export async function updateDoctor(doctorId: string, prevState: any, formData: FormData) {
  try {
    const validatedFields = UpdateDoctorFormSchema.safeParse(
      Object.fromEntries(formData.entries())
    );

    if (!validatedFields.success) {
      const firstError = Object.values(validatedFields.error.flatten().fieldErrors)[0]?.[0];
      return { success: false, message: firstError || 'Invalid fields.' };
    }

    const { name, specialty, licenseId, avatar } = validatedFields.data;

    const client = await clientPromise;
    const db = client.db('medivault');
    const doctorsCollection = db.collection('doctors');

    const updateData: { name: string; specialty: string; licenseId: string; avatarUrl?: string } = { name, specialty, licenseId };
    
    const existingDoctor = await doctorsCollection.findOne({ _id: new ObjectId(doctorId) });

    if (avatar && avatar.startsWith('data:image')) {
      updateData.avatarUrl = avatar;
    } else if (existingDoctor && !avatar) {
      updateData.avatarUrl = existingDoctor.avatarUrl;
    }

    await doctorsCollection.updateOne(
      { _id: new ObjectId(doctorId) },
      { $set: updateData }
    );
    
    revalidatePath('/admin/doctors');
    revalidatePath(`/admin/doctors/${doctorId}`);
    return { message: 'Doctor profile updated successfully.', success: true };
  } catch (error: any) {
    console.error('Update Doctor Action Error:', error);
    return { success: false, message: `An unexpected server error occurred: ${error instanceof Error ? error.message : String(error)}` };
  }
}

export async function deleteDoctor(doctorId: string) {
  try {
    const client = await clientPromise;
    const db = client.db('medivault');
    const doctorsCollection = db.collection('doctors');

    const result = await doctorsCollection.deleteOne({ _id: new ObjectId(doctorId) });

    if (result.deletedCount === 0) {
      return { success: false, message: 'Could not find the doctor to delete.' };
    }

  } catch (error: any) {
    return { success: false, message: `Database Error: ${error instanceof Error ? error.message : String(error)}` };
  }

  revalidatePath('/admin/doctors');
  return { message: 'Doctor deleted successfully.', success: true };
}

export async function updateDoctorStatus(doctorId: string, newStatus: 'active' | 'inactive') {
  try {
    const client = await clientPromise;
    const db = client.db('medivault');
    const doctorsCollection = db.collection('doctors');

    await doctorsCollection.updateOne(
      { _id: new ObjectId(doctorId) },
      { $set: { status: newStatus } }
    );
  } catch (error: any) {
    return { success: false, message: `Database Error: ${error instanceof Error ? error.message : String(error)}` };
  }
  revalidatePath('/admin/doctors');
  return { message: 'Status updated successfully.', success: true };
}

export async function updateUserProfile(prevState: any, formData: FormData) {
    const session = await getSession();
    if (!session?.userId) {
        return { success: false, message: 'Not authenticated.' };
    }

    const validatedFields = UpdateProfileFormSchema.safeParse(
        Object.fromEntries(formData.entries())
    );

    if (!validatedFields.success) {
        const firstError = Object.values(validatedFields.error.flatten().fieldErrors)[0]?.[0];
        return { success: false, message: firstError || 'Invalid fields.' };
    }

    const { name, contact, avatar } = validatedFields.data;

    try {
        const client = await clientPromise;
        const db = client.db('medivault');
        // Try to update in all collections (patients, doctors, admins)
        const updateData: { name: string; avatarUrl?: string; contact?: string } = { name };
        if (avatar && avatar.startsWith('data:image')) {
          updateData.avatarUrl = avatar;
        }
        if (contact) {
            updateData.contact = contact;
        }
        // Try patients
        let result = await db.collection('patients').updateOne(
            { _id: new ObjectId(session.userId) },
            { $set: updateData }
        );
        // If not found, try doctors
        if (result.matchedCount === 0) {
          result = await db.collection('doctors').updateOne(
            { _id: new ObjectId(session.userId) },
            { $set: updateData }
          );
        }
        // If not found, try admins
        if (result.matchedCount === 0) {
          result = await db.collection('admins').updateOne(
            { _id: new ObjectId(session.userId) },
            { $set: updateData }
          );
        }
    } catch (error: any) {
        return { success: false, message: `Database Error: ${error instanceof Error ? error.message : String(error)}` };
    }

    revalidatePath('/admin/settings');
    revalidatePath('/(dashboards)/layout');
    return { success: true, message: 'Profile updated successfully.' };
}

export async function updateDoctorProfile(prevState: any, formData: FormData) {
    const session = await getSession();
    if (!session?.userId || session.role !== 'doctor') {
        return { success: false, message: 'Not authenticated or not a doctor.' };
    }

    const validatedFields = UpdateDoctorProfileSchema.safeParse(
        Object.fromEntries(formData.entries())
    );

    if (!validatedFields.success) {
        const firstError = Object.values(validatedFields.error.flatten().fieldErrors)[0]?.[0];
        return { success: false, message: firstError || 'Invalid fields.' };
    }

    const { name, contact, avatar, specialty } = validatedFields.data;

    try {
        const client = await clientPromise;
        const db = client.db('medivault');
        const doctorsCollection = db.collection('doctors');

        const updateData: { name: string; specialty: string; avatarUrl?: string; contact?: string } = { name, specialty };
        if (avatar && avatar.startsWith('data:image')) {
          updateData.avatarUrl = avatar;
        }
        if (contact) {
            updateData.contact = contact;
        }

        await doctorsCollection.updateOne(
            { _id: new ObjectId(session.userId) },
            { $set: updateData }
        );
    } catch (error: any) {
        return { success: false, message: `Database Error: ${error instanceof Error ? error.message : String(error)}` };
    }

    revalidatePath('/settings');
    revalidatePath('/(dashboards)/layout');
    return { success: true, message: 'Profile updated successfully.' };
}

export async function updatePassword(prevState: any, formData: FormData) {
    const session = await getSession();
    if (!session?.userId) {
        return { success: false, message: 'Not authenticated.' };
    }

    const validatedFields = PasswordChangeSchema.safeParse(
        Object.fromEntries(formData.entries())
    );

    if (!validatedFields.success) {
        const firstError = Object.values(validatedFields.error.flatten().fieldErrors)[0]?.[0];
        return { success: false, message: firstError || "Invalid fields." };
    }

    const { oldPassword, newPassword } = validatedFields.data;

    try {
        const client = await clientPromise;
        const db = client.db('medivault');
        // Try all collections
        let user = await db.collection('patients').findOne({ _id: new ObjectId(session.userId) });
        let collection = 'patients';
        if (!user) {
          user = await db.collection('doctors').findOne({ _id: new ObjectId(session.userId) });
          collection = 'doctors';
        }
        if (!user) {
          user = await db.collection('admins').findOne({ _id: new ObjectId(session.userId) });
          collection = 'admins';
        }
        if (!user) {
            return { success: false, message: 'User not found.' };
        }

        const passwordsMatch = await bcrypt.compare(oldPassword, user.password);
        if (!passwordsMatch) {
            return { success: false, message: 'Incorrect old password.' };
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await db.collection(collection).updateOne(
            { _id: new ObjectId(session.userId) },
            { $set: { password: hashedPassword, passwordSet: true } }
        );

        return { success: true, message: 'Password updated successfully.' };

    } catch (error: any) {
        return { success: false, message: `Database Error: ${error instanceof Error ? error.message : String(error)}` };
    }
}

export async function setupDoctorAccount(prevState: any, formData: FormData) {
  try {
    const validatedFields = DoctorSetupSchema.safeParse(
      Object.fromEntries(formData.entries())
    );

    if (!validatedFields.success) {
        const firstError = Object.values(validatedFields.error.flatten().fieldErrors)[0]?.[0];
        return { success: false, message: firstError || 'Invalid fields.' };
    }

    const { name, email, licenseId, password } = validatedFields.data;

    const client = await clientPromise;
    const db = client.db('medivault');
    const doctorsCollection = db.collection('doctors');

    const doctor = await doctorsCollection.findOne({
      email,
      licenseId,
    });

    if (!doctor) {
      return { success: false, message: 'No matching doctor account found. Please contact an administrator.' };
    }
    
    if (doctor.name !== name) {
       return { success: false, message: 'The provided name does not match the account details.' };
    }

    if (doctor.status === 'inactive') {
      return { success: false, message: 'Your ID is disabled by the admin, so you cannot login.' };
    }

    if (doctor.passwordSet) {
      return { success: false, message: 'An account has already been set up for this doctor. Please use the regular login page.' };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await doctorsCollection.updateOne(
      { _id: doctor._id },
      { $set: { password: hashedPassword, passwordSet: true } }
    );

    await createSession(doctor._id.toString(), 'doctor');
    redirect('/dashboard');

  } catch (error: any) {
    if (error.message.includes('NEXT_REDIRECT')) {
        throw error;
    }
    return { success: false, message: `Database Error: ${error instanceof Error ? error.message : String(error)}` };
  }
}

export async function getSessionUser(): Promise<User | null> {
    const session = await getSession();
    if (!session?.userId) return null;

    try {
        const client = await clientPromise;
        const db = client.db('medivault');
        let userDoc = await db.collection('patients').findOne({ _id: new ObjectId(session.userId) });
        let role: 'admin' | 'doctor' | 'patient' = 'patient';
        if (!userDoc) {
          userDoc = await db.collection('doctors').findOne({ _id: new ObjectId(session.userId) });
          role = 'doctor';
        }
        if (!userDoc) {
          userDoc = await db.collection('admins').findOne({ _id: new ObjectId(session.userId) });
          role = 'admin';
        }
        if (!userDoc) return null;
        
        const user: User = {
            id: userDoc._id.toString(),
            name: userDoc.name,
            email: userDoc.email,
            avatarUrl: userDoc.avatarUrl,
            role: role,
            contact: userDoc.contact,
        };
        
        if (role === 'doctor') {
          user.specialty = userDoc.specialty;
          user.licenseId = userDoc.licenseId;
        }

        return user;

    } catch (error) {
        console.error('Get Session User Error:', error);
        return null;
    }
}

export async function logoutAction(prevState: any, formData?: FormData) {
  let role: string | undefined = undefined;
  if (formData && typeof formData.get === 'function') {
    role = formData.get('role') as string | undefined;
  }
  if (!role) {
    const session = await getSession();
    role = session?.role;
  }
  await destroySession();
  if (role === 'admin') {
    redirect('/login?role=admin');
  } else if (role === 'doctor') {
    redirect('/login?role=doctor');
  } else {
    redirect('/login?role=patient');
  }
}

export async function searchPatients(query: string): Promise<Patient[]> {
  if (!query || query.length < 2) {
    // Return all patients if no query or query is too short
    try {
      const client = await clientPromise;
      const db = client.db('medivault');
      const patients = await db.collection('patients').find({}).limit(100).toArray();
      return patients.map(user => ({
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        dateOfBirth: user.dateOfBirth,
        gender: user.gender,
        contact: user.contact,
        address: user.address,
        avatarUrl: user.avatarUrl,
        bloodGroup: user.bloodGroup,
        status: user.status,
      }));
    } catch (error) {
      console.error('Database Error:', error);
      return [];
    }
  }

  try {
    const patients = await findPatients(query);
    return patients;
  } catch (error) {
    console.error("Search Patient Error:", error);
    return [];
  }
}

export async function addVisit(patientId: string, prevState: any, formData: FormData) {
  const session = await getSession();
  if (!session?.userId || session.role !== 'doctor') {
    return { success: false, message: 'You must be logged in as a doctor to perform this action.' };
  }
  
  const validatedFields = AddVisitFormSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!validatedFields.success) {
    const firstError = Object.values(validatedFields.error.flatten().fieldErrors)[0]?.[0];
    return { success: false, message: firstError || 'Invalid fields.' };
  }

  const { reason, notes, prescriptions: prescriptionsJson } = validatedFields.data;
  
  try {
    const client = await clientPromise;
    const db = client.db('medivault');
    const visitsCollection = db.collection('visits');

    let prescriptions: Prescription[] = [];
    if (prescriptionsJson) {
      try {
        prescriptions = JSON.parse(prescriptionsJson);
        if (!Array.isArray(prescriptions)) {
            prescriptions = [];
        }
      } catch (e) {
        console.error("Invalid prescriptions format:", e);
        // Silently fail to an empty array if JSON is malformed
        prescriptions = [];
      }
    }

    await visitsCollection.insertOne({
      patientId: new ObjectId(patientId),
      doctorId: new ObjectId(session.userId),
      date: new Date().toISOString(),
      reason,
      notes,
      treatments: notes,
      prescriptions: prescriptions,
      createdAt: new Date(),
    });

  } catch (error: any) {
    console.error('Add Visit Error:', error);
    return { success: false, message: `Database Error: ${error instanceof Error ? error.message : String(error)}` };
  }

  revalidatePath(`/dashboard/patients/${patientId}`);
  revalidatePath('/dashboard');
  return { success: true, message: 'Visit note added successfully.' };
}

export async function updatePatient(patientId: string, prevState: any, formData: FormData) {
  try {
    const validatedFields = UpdatePatientFormSchema.safeParse(
      Object.fromEntries(formData.entries())
    );

    if (!validatedFields.success) {
      const firstError = Object.values(validatedFields.error.flatten().fieldErrors)[0]?.[0];
      return { success: false, message: firstError || 'Invalid fields.' };
    }

    const { name, dateOfBirth, gender, contact, address, avatar, bloodGroup } = validatedFields.data;

    const client = await clientPromise;
    const db = client.db('medivault');
    const patientsCollection = db.collection('patients');

    const updateData: any = { name };
    if (dateOfBirth) updateData.dateOfBirth = dateOfBirth;
    if (gender) updateData.gender = gender;
    if (contact) updateData.contact = contact;
    if (address) updateData.address = address;
    if (bloodGroup) updateData.bloodGroup = bloodGroup;

    const existingPatient = await patientsCollection.findOne({ _id: new ObjectId(patientId) });
    if (avatar && avatar.startsWith('data:image')) {
      updateData.avatarUrl = avatar;
    } else if (existingPatient && !avatar) {
      updateData.avatarUrl = existingPatient.avatarUrl;
    }

    await patientsCollection.updateOne(
      { _id: new ObjectId(patientId) },
      { $set: updateData }
    );

    revalidatePath('/admin/patients');
    revalidatePath(`/admin/patients/${patientId}`);
    return { message: 'Patient profile updated successfully.', success: true };
  } catch (error: any) {
    console.error('Update Patient Action Error:', error);
    return { success: false, message: `An unexpected server error occurred: ${error instanceof Error ? error.message : String(error)}` };
  }
}

export async function deletePatient(patientId: string) {
  try {
    const client = await clientPromise;
    const db = client.db('medivault');
    const patientsCollection = db.collection('patients');

    const result = await patientsCollection.deleteOne({ _id: new ObjectId(patientId) });

    if (result.deletedCount === 0) {
      return { success: false, message: 'Could not find the patient to delete.' };
    }
  } catch (error: any) {
    return { success: false, message: `Database Error: ${error instanceof Error ? error.message : String(error)}` };
  }
  revalidatePath('/admin/patients');
  return { message: 'Patient deleted successfully.', success: true };
}

export async function updatePatientStatus(patientId: string, newStatus: 'active' | 'inactive') {
  try {
    const client = await clientPromise;
    const db = client.db('medivault');
    const patientsCollection = db.collection('patients');

    await patientsCollection.updateOne(
      { _id: new ObjectId(patientId) },
      { $set: { status: newStatus } }
    );
  } catch (error: any) {
    return { success: false, message: `Database Error: ${error instanceof Error ? error.message : String(error)}` };
  }
  revalidatePath('/admin/patients');
  return { message: 'Status updated successfully.', success: true };
}

export async function deletePatientMedicalRecords(patientId: string) {
  try {
    const client = await clientPromise;
    const db = client.db('medivault');
    const visitsCollection = db.collection('visits');
    const result = await visitsCollection.deleteMany({ patientId: new ObjectId(patientId) });
    return { success: true, message: `Deleted ${result.deletedCount} medical record(s).` };
  } catch (error: any) {
    return { success: false, message: `Database Error: ${error instanceof Error ? error.message : String(error)}` };
  }
}

export async function deleteVisit(visitId: string) {
  try {
    const client = await clientPromise;
    const db = client.db('medivault');
    const visitsCollection = db.collection('visits');
    const result = await visitsCollection.deleteOne({ _id: new ObjectId(visitId) });
    if (result.deletedCount === 0) {
      return { success: false, message: 'Could not find the visit to delete.' };
    }
    return { success: true, message: 'Medical record deleted successfully.' };
  } catch (error: any) {
    return { success: false, message: `Database Error: ${error instanceof Error ? error.message : String(error)}` };
  }
}

export async function updateVisit(visitId: string, updates: Partial<{ date: string; reason: string; notes: string; treatments: string; prescriptions: any[]; doctorId: string }>) {
  try {
    const client = await clientPromise;
    const db = client.db('medivault');
    const visitsCollection = db.collection('visits');
    const result = await visitsCollection.updateOne(
      { _id: new ObjectId(visitId) },
      { $set: updates }
    );
    if (result.matchedCount === 0) {
      return { success: false, message: 'Could not find the visit to update.' };
    }
    return { success: true, message: 'Medical record updated successfully.' };
  } catch (error: any) {
    return { success: false, message: `Database Error: ${error instanceof Error ? error.message : String(error)}` };
  }
}

export async function adminUpdateDoctorPassword(doctorId: string, newPassword: string) {
  try {
    const client = await clientPromise;
    const db = client.db('medivault');
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const result = await db.collection('doctors').updateOne(
      { _id: new ObjectId(doctorId) },
      { $set: { password: hashedPassword, passwordSet: true } }
    );
    if (result.matchedCount === 0) {
      return { success: false, message: 'Doctor not found.' };
    }
    return { success: true, message: 'Password updated successfully.' };
  } catch (error) {
    return { success: false, message: `Error: ${error instanceof Error ? error.message : String(error)}` };
  }
}

export async function adminUpdatePatientPassword(patientId: string, newPassword: string) {
  try {
    const client = await clientPromise;
    const db = client.db('medivault');
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const result = await db.collection('patients').updateOne(
      { _id: new ObjectId(patientId) },
      { $set: { password: hashedPassword } }
    );
    if (result.matchedCount === 0) {
      return { success: false, message: 'Patient not found.' };
    }
    return { success: true, message: 'Password updated successfully.' };
  } catch (error) {
    return { success: false, message: `Error: ${error instanceof Error ? error.message : String(error)}` };
  }
}

export async function searchDoctorsAction(query: string, page = 1, pageSize = 20) {
  'use server';
  return await searchDoctors(query, page, pageSize);
}

export async function searchPatientsPaginatedAction(query: string, page = 1, pageSize = 20) {
  'use server';
  return await searchPatientsPaginated(query, page, pageSize);
}
