const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');
import dotenv from 'dotenv';
dotenv.config();

const uri = process.env.MONGODB_URI;
const dbName = 'medivault';

function randomFrom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function fakeEmail(name, domain = 'example.com') {
  return name.toLowerCase().replace(/\s/g, '') + Math.floor(Math.random() * 10000) + '@' + domain;
}

function fakeName(prefix) {
  const first = ["John", "Jane", "Alex", "Sam", "Chris", "Pat", "Taylor", "Jordan", "Morgan", "Casey", "Jamie", "Robin", "Drew", "Avery", "Riley", "Skyler", "Cameron", "Reese", "Quinn", "Parker"];
  const last = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin", "Lee"];
  return prefix + ' ' + randomFrom(first) + ' ' + randomFrom(last);
}

async function seed() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db(dbName);
    // 1. Insert 1 admin
    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = {
      name: 'Admin User',
      email: 'admin@medivault.com',
      password: adminPassword,
      avatarUrl: '',
      contact: '9999999999',
      createdAt: new Date(),
    };
    const adminResult = await db.collection('admins').insertOne(admin);
    // 2. Insert 20 doctors
    const specialties = ["Cardiology", "Dermatology", "Neurology", "Pediatrics", "Oncology", "Orthopedics", "Psychiatry", "Radiology", "Surgery", "Urology"];
    const doctors = [];
    for (let i = 0; i < 15; i++) {
      const name = fakeName('Dr.');
      const email = fakeEmail(name, 'doctor.com');
      const password = await bcrypt.hash('doctor123', 10);
      doctors.push({
        name,
        email,
        password,
        specialty: randomFrom(specialties),
        licenseId: 'LIC' + (1000 + i),
        avatarUrl: '',
        status: 'active',
        passwordSet: true,
        createdAt: new Date(),
      });
    }
    const doctorResult = await db.collection('doctors').insertMany(doctors);
    // 3. Insert 40 patients
    const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
    const genders = ["Male", "Female", "Other"];
    const patients = [];
    for (let i = 0; i < 25; i++) {
      const name = fakeName('Patient');
      const email = fakeEmail(name, 'patient.com');
      const password = await bcrypt.hash('patient123', 10);
      patients.push({
        name,
        email,
        password,
        dateOfBirth: `19${70 + Math.floor(Math.random() * 30)}-0${1 + Math.floor(Math.random() * 9)}-1${Math.floor(Math.random() * 9)}`,
        gender: randomFrom(genders),
        contact: '90000000' + (10 + i),
        address: '123 Main St, City',
        avatarUrl: '',
        bloodGroup: randomFrom(bloodGroups),
        status: 'active',
        createdAt: new Date(),
      });
    }
    const patientResult = await db.collection('patients').insertMany(patients);
    console.log('Seed complete:', {
      adminId: adminResult.insertedId,
      doctorCount: doctorResult.insertedCount,
      patientCount: patientResult.insertedCount,
    });
    await client.close();
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
}

seed(); 