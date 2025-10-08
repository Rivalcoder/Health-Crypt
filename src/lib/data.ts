import type { Patient, Visit, Doctor } from '@/types';
import clientPromise from './mongodb';
import { ObjectId } from 'mongodb';

export async function getPatients(doctorId: string): Promise<Patient[]> {
    try {
        const client = await clientPromise;
        const db = client.db('medivault');

        if (!ObjectId.isValid(doctorId)) {
            return [];
        }

        const patientIds = await db.collection('visits').distinct('patientId', {
            doctorId: new ObjectId(doctorId)
        });

        if (patientIds.length === 0) {
            return [];
        }

        const patients = await db.collection('patients').find({
            _id: { $in: patientIds }
        }).sort({ name: 1 }).toArray();

        return patients.map(user => ({
            id: user._id.toString(),
            patientId: user.patientId,
            name: user.name,
            email: user.email,
            dateOfBirth: user.dateOfBirth,
            gender: user.gender,
            contact: user.contact,
            address: user.address,
            avatarUrl: user.avatarUrl,
            bloodGroup: user.bloodGroup,
        }));
    } catch (error) {
        console.error('Database Error:', error);
        return [];
    }
}

export async function findPatients(query: string): Promise<Patient[]> {
    try {
        const client = await clientPromise;
        const db = client.db('medivault');
        const patients = await db.collection('patients').find({
            $or: [
                { name: { $regex: query, $options: 'i' } },
                { email: { $regex: query, $options: 'i' } },
                { patientId: { $regex: query, $options: 'i' } }
            ]
        }).limit(10).toArray();

        return patients.map(user => ({
            id: user._id.toString(),
            patientId: user.patientId,
            name: user.name,
            email: user.email,
            dateOfBirth: user.dateOfBirth,
            gender: user.gender,
            contact: user.contact,
            address: user.address,
            avatarUrl: user.avatarUrl,
            bloodGroup: user.bloodGroup,
        }));
    } catch (error) {
        console.error('Database Error:', error);
        return [];
    }
}

export async function getDoctors(): Promise<Doctor[]> {
    try {
        const client = await clientPromise;
        const db = client.db('medivault');
        const doctors = await db.collection('doctors').find({}).toArray();

        return doctors.map(user => ({
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            licenseId: user.licenseId,
            specialty: user.specialty,
            status: user.status,
            avatarUrl: user.avatarUrl,
        }));
    } catch (error) {
        console.error('Database Error:', error);
        return [];
    }
}

export async function getDoctorById(id: string): Promise<Doctor | null> {
    if (!ObjectId.isValid(id)) {
        return null;
    }
    try {
        const client = await clientPromise;
        const db = client.db('medivault');
        const user = await db.collection('doctors').findOne({ _id: new ObjectId(id) });

        if (!user) {
            return null;
        }

        return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            licenseId: user.licenseId,
            specialty: user.specialty,
            status: user.status,
            avatarUrl: user.avatarUrl,
        };
    } catch (error) {
        console.error('Database Error:', error);
        return null;
    }
}

export async function getPatientData(patientId: string): Promise<{ patient: Patient | null; visits: Visit[] }> {
    if (!ObjectId.isValid(patientId)) {
        return { patient: null, visits: [] };
    }

    try {
        const client = await clientPromise;
        const db = client.db('medivault');

        const patientDoc = await db.collection('patients').findOne({ _id: new ObjectId(patientId) });

        if (!patientDoc) {
            return { patient: null, visits: [] };
        }

        const patient: Patient = {
            id: patientDoc._id.toString(),
            patientId: patientDoc.patientId,
            name: patientDoc.name,
            email: patientDoc.email,
            dateOfBirth: patientDoc.dateOfBirth,
            gender: patientDoc.gender,
            contact: patientDoc.contact,
            address: patientDoc.address,
            avatarUrl: patientDoc.avatarUrl,
            bloodGroup: patientDoc.bloodGroup,
        };

        const visitsAggregation = await db.collection('visits').aggregate([
            { $match: { patientId: new ObjectId(patientId) } },
            { $sort: { date: -1 } },
            {
                $lookup: {
                    from: 'doctors',
                    localField: 'doctorId',
                    foreignField: '_id',
                    as: 'doctorInfo'
                }
            },
            { $unwind: { path: '$doctorInfo', preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    _id: 1,
                    patientId: 1,
                    doctorId: 1,
                    date: 1,
                    reason: 1,
                    notes: 1,
                    treatments: 1,
                    prescriptions: 1,
                    doctor: {
                        id: '$doctorInfo._id',
                        name: '$doctorInfo.name',
                        specialty: '$doctorInfo.specialty',
                        avatarUrl: '$doctorInfo.avatarUrl',
                        licenseId: '$doctorInfo.licenseId',
                    }
                }
            }
        ]).toArray();
        
        const visits = visitsAggregation.map((v: any) => ({
            id: v._id.toString(),
            patientId: v.patientId.toString(),
            doctorId: v.doctorId.toString(),
            date: v.date,
            reason: v.reason,
            notes: v.notes,
            treatments: v.treatments,
            prescriptions: v.prescriptions,
            doctor: v.doctor.id ? {
                id: v.doctor.id.toString(),
                name: v.doctor.name,
                specialty: v.doctor.specialty,
                avatarUrl: v.doctor.avatarUrl,
                licenseId: v.doctor.licenseId,
            } : undefined,
        })) as Visit[];

        return { patient, visits };
    } catch (error) {
        console.error('Database Error fetching patient data:', error);
        return { patient: null, visits: [] };
    }
}

export async function getTodaysAppointmentsCount(doctorId: string): Promise<number> {
    if (!ObjectId.isValid(doctorId)) {
        return 0;
    }
    try {
        const client = await clientPromise;
        const db = client.db('medivault');
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const count = await db.collection('visits').countDocuments({
            doctorId: new ObjectId(doctorId),
            date: {
                $gte: today.toISOString(),
                $lt: tomorrow.toISOString()
            }
        });
        return count;
    } catch (error) {
        console.error('Database Error:', error);
        return 0;
    }
}

export async function getTotalDoctorsCount(): Promise<number> {
    try {
        const client = await clientPromise;
        const db = client.db('medivault');
        return await db.collection('doctors').countDocuments({});
    } catch (error) {
        console.error('Database Error:', error);
        return 0;
    }
}

export async function getTotalPatientsCount(): Promise<number> {
    try {
        const client = await clientPromise;
        const db = client.db('medivault');
        return await db.collection('patients').countDocuments({});
    } catch (error) {
        console.error('Database Error:', error);
        return 0;
    }
}

export async function getActiveDoctorsCount(): Promise<number> {
    try {
        const client = await clientPromise;
        const db = client.db('medivault');
        return await db.collection('doctors').countDocuments({ status: 'active' });
    } catch (error) {
        console.error('Database Error:', error);
        return 0;
    }
}

export async function getNewDoctorApplicantsCount(): Promise<number> {
    try {
        const client = await clientPromise;
        const db = client.db('medivault');
        // A doctor is considered an applicant if their password has not been set yet.
        return await db.collection('doctors').countDocuments({ passwordSet: false });
    } catch (error) {
        console.error('Database Error:', error);
        return 0;
    }
}

export async function searchDoctors(query: string, page = 1, pageSize = 20): Promise<{ doctors: Doctor[]; total: number }> {
    const skip = (page - 1) * pageSize;
    let filter = {};
    if (query && query.length >= 2) {
        filter = {
            $or: [
                { name: { $regex: query, $options: 'i' } },
                { email: { $regex: query, $options: 'i' } },
                { licenseId: { $regex: query, $options: 'i' } },
                { specialty: { $regex: query, $options: 'i' } },
            ]
        };
    }
    try {
        const client = await clientPromise;
        const db = client.db('medivault');
        const total = await db.collection('doctors').countDocuments(filter);
        const doctors = await db.collection('doctors')
            .find(filter)
            .skip(skip)
            .limit(pageSize)
            .toArray();
        return {
            doctors: doctors.map(user => ({
                id: user._id.toString(),
                name: user.name,
                email: user.email,
                licenseId: user.licenseId,
                specialty: user.specialty,
                status: user.status,
                avatarUrl: user.avatarUrl,
            })),
            total,
        };
    } catch (error) {
        console.error('Search Doctor Error:', error);
        return { doctors: [], total: 0 };
    }
}

export async function searchPatientsPaginated(query: string, page = 1, pageSize = 20): Promise<{ patients: Patient[]; total: number }> {
    const skip = (page - 1) * pageSize;
    let filter = {};
    if (query && query.length >= 2) {
        filter = {
            $or: [
                { name: { $regex: query, $options: 'i' } },
                { email: { $regex: query, $options: 'i' } },
            ]
        };
    }
    try {
        const client = await clientPromise;
        const db = client.db('medivault');
        const total = await db.collection('patients').countDocuments(filter);
        const patients = await db.collection('patients')
            .find(filter)
            .skip(skip)
            .limit(pageSize)
            .toArray();
        return {
            patients: patients.map(user => ({
                id: user._id.toString(),
                patientId: user.patientId,
                name: user.name,
                email: user.email,
                dateOfBirth: user.dateOfBirth,
                gender: user.gender,
                contact: user.contact,
                address: user.address,
                avatarUrl: user.avatarUrl,
                bloodGroup: user.bloodGroup,
                status: user.status,
            })),
            total,
        };
    } catch (error) {
        console.error('Search Patient Error:', error);
        return { patients: [], total: 0 };
    }
}
