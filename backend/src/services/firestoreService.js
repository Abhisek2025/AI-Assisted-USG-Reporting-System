// backend/src/services/firestoreService.js
import { firestoreDb } from '../config/firebase.js';
import { 
  collection, getDocs, getDoc, doc, setDoc, addDoc, updateDoc, deleteDoc, query, orderBy, where, limit 
} from 'firebase/firestore';
import { syncRecordToMySQL, initMySQLTables } from '../config/mysql.js';

// Initialize MySQL tables on module load
initMySQLTables().catch(err => console.warn('MySQL init tables warning:', err.message));

// Initial Seeds for Auto-Initialization if Firestore is empty
const INITIAL_PATIENTS = [
  {
    id: 1,
    uhid: 'PAT-2024-100892',
    firstName: 'Eleanor',
    lastName: 'Vance',
    gender: 'FEMALE',
    dateOfBirth: '1985-04-12',
    age: 39,
    phone: '+1-555-0199',
    email: 'eleanor.vance@example.com',
    address: '742 Evergreen Terrace, Sector 4',
    bloodGroup: 'O_POSITIVE',
    referringDoctor: 'Dr. Robert Chen (Gastroenterology)',
    medicalHistory: 'Recurrent right upper quadrant pain post-prandial. Mild fatty liver reported 2 years ago.',
    allergies: 'Penicillin',
    createdAt: new Date().toISOString()
  },
  {
    id: 2,
    uhid: 'PAT-2024-100893',
    firstName: 'Arthur',
    lastName: 'Pendelton',
    gender: 'MALE',
    dateOfBirth: '1962-11-28',
    age: 61,
    phone: '+1-555-0244',
    email: 'arthur.p@example.com',
    address: '128 Baker Street, West Wing',
    bloodGroup: 'A_POSITIVE',
    referringDoctor: 'Dr. Maria Santos (Urology)',
    medicalHistory: 'Lower urinary tract symptoms, dysuria. Prostate evaluation requested.',
    allergies: 'None known',
    createdAt: new Date().toISOString()
  },
  {
    id: 3,
    uhid: 'PAT-2024-100894',
    firstName: 'Sophia',
    lastName: 'Martinez',
    gender: 'FEMALE',
    dateOfBirth: '1993-07-15',
    age: 31,
    phone: '+1-555-0311',
    email: 'sophia.m@example.com',
    address: '55 Ocean Drive, Suite 12',
    bloodGroup: 'B_POSITIVE',
    referringDoctor: 'Dr. James Wilson (Obstetrics)',
    medicalHistory: 'First trimester routine antenatal checkup. Gestational age evaluation.',
    allergies: 'Sulfa drugs',
    createdAt: new Date().toISOString()
  }
];

const INITIAL_USERS = [
  {
    id: 1,
    email: 'admin@apexdiagnostics.com',
    firstName: 'Admin',
    lastName: 'Officer',
    roleName: 'ADMIN',
    phone: '+1-555-0101',
    qualification: 'M.HA, System Lead',
    registrationNumber: 'ADMIN-001',
    status: 'ACTIVE',
    createdAt: new Date().toISOString()
  },
  {
    id: 2,
    email: 'dr.sarah@apexdiagnostics.com',
    firstName: 'Dr. Sarah',
    lastName: 'Jenkins',
    roleName: 'RADIOLOGIST',
    phone: '+1-555-0102',
    qualification: 'MD Radiodiagnosis, FACR',
    registrationNumber: 'RAD-2024-8890',
    status: 'ACTIVE',
    createdAt: new Date().toISOString()
  },
  {
    id: 3,
    email: 'dr.marcus@apexdiagnostics.com',
    firstName: 'Dr. Marcus',
    lastName: 'Vance',
    roleName: 'RADIOLOGIST',
    phone: '+1-555-0103',
    qualification: 'DNB Radiology, Fellowship in USG',
    registrationNumber: 'RAD-2022-4412',
    status: 'ACTIVE',
    createdAt: new Date().toISOString()
  },
  {
    id: 4,
    email: 'receptionist@apexdiagnostics.com',
    firstName: 'Emily',
    lastName: 'Watson',
    roleName: 'RECEPTIONIST',
    phone: '+1-555-0104',
    qualification: 'B.Sc Health Admin',
    registrationNumber: 'REC-002',
    status: 'ACTIVE',
    createdAt: new Date().toISOString()
  },
  {
    id: 5,
    email: 'tech@apexdiagnostics.com',
    firstName: 'John',
    lastName: 'Doe',
    roleName: 'TECHNICIAN',
    phone: '+1-555-0105',
    qualification: 'Certified USG Sonographer',
    registrationNumber: 'TECH-109',
    status: 'ACTIVE',
    createdAt: new Date().toISOString()
  }
];

const INITIAL_STUDIES = [
  {
    id: 1,
    studyCode: 'STU-2024-501',
    patientId: 1,
    studyType: 'ULTRASOUND_WHOLE_ABDOMEN',
    bodyRegion: 'Abdomen & Pelvis',
    referringDoctor: 'Dr. Robert Chen',
    clinicalIndication: 'RUQ pain, suspected cholelithiasis vs fatty liver',
    priority: 'URGENT',
    status: 'IN_REVIEW',
    assignedRadiologistId: 2,
    technicianId: 5,
    studyDate: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    images: [
      {
        id: 101,
        imageUrl: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?w=800&auto=format&fit=crop&q=80',
        organType: 'Liver & Gallbladder',
        viewType: 'Subcostal Longitudinal',
        captureSequence: 1,
        uploadedAt: new Date().toISOString()
      },
      {
        id: 102,
        imageUrl: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=800&auto=format&fit=crop&q=80',
        organType: 'Right Kidney',
        viewType: 'Coronal Long Axis',
        captureSequence: 2,
        uploadedAt: new Date().toISOString()
      }
    ],
    aiFindings: [
      {
        id: 201,
        organ: 'Gallbladder',
        findingType: 'Cholelithiasis',
        severity: 'HIGH',
        confidenceScore: 0.94,
        description: 'Single mobile echogenic focus measuring 14.2 mm with acoustic shadowing within the gallbladder lumen.',
        recommendations: 'Surgical consultation recommended for symptomatic cholelithiasis.',
        isAccepted: true
      },
      {
        id: 202,
        organ: 'Liver',
        findingType: 'Hepatic Steatosis',
        severity: 'MEDIUM',
        confidenceScore: 0.88,
        description: 'Diffuse increased hepatic echogenicity with vascular blurring, consistent with Grade II fatty liver.',
        recommendations: 'Dietary modifications and lipid profile correlation advised.',
        isAccepted: true
      }
    ]
  },
  {
    id: 2,
    studyCode: 'STU-2024-502',
    patientId: 2,
    studyType: 'ULTRASOUND_KUB_PROSTATE',
    bodyRegion: 'Pelvis',
    referringDoctor: 'Dr. Maria Santos',
    clinicalIndication: 'Dysuria, urinary frequency',
    priority: 'ROUTINE',
    status: 'SCHEDULED',
    assignedRadiologistId: 3,
    technicianId: 5,
    studyDate: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    images: [],
    aiFindings: []
  }
];

const INITIAL_REPORTS = [
  {
    id: 1,
    reportNumber: 'REP-2024-9901',
    studyId: 1,
    radiologistId: 2,
    impressionText: '1. Cholelithiasis with 14.2mm gallstone.\n2. Grade II diffuse hepatic steatosis.',
    detailedFindingsText: 'Gallbladder is well-distended with normal wall thickness (2.4mm). A 14.2mm mobile hyperechoic calculus with strong posterior acoustic shadowing is identified in the neck/body region. Common bile duct is normal in caliber (4.1mm). Liver exhibits diffuse bright echogenicity.',
    recommendationsText: '1. Clinical correlation with LFTs.\n2. Surgical evaluation for elective cholecystectomy if symptomatic.',
    status: 'DRAFT',
    createdAt: new Date().toISOString()
  }
];

// Helper to clear all data manually if needed
export async function dbClearAllData() {
  try {
    const collectionsToClear = ['patients', 'studies', 'reports', 'users', 'audit_logs'];
    for (const colName of collectionsToClear) {
      const snap = await getDocs(collection(firestoreDb, colName));
      for (const d of snap.docs) {
        await deleteDoc(doc(firestoreDb, colName, d.id));
      }
    }
    console.log('All Firestore collections successfully wiped clean!');
    return { success: true };
  } catch (err) {
    console.error('Error clearing Firestore data:', err);
    throw err;
  }
}

// Auto-seed helper to guarantee collections exist in Firebase Firestore
let seeded = false;
export async function ensureSeeded() {
  if (seeded) return;
  try {
    const usersSnap = await getDocs(collection(firestoreDb, 'users'));
    if (usersSnap.empty) {
      console.log('Seeding users collection into Firebase Firestore...');
      for (const u of INITIAL_USERS) {
        await setDoc(doc(firestoreDb, 'users', String(u.id)), u);
        syncRecordToMySQL('users', u);
      }
    }
    const patientsSnap = await getDocs(collection(firestoreDb, 'patients'));
    if (patientsSnap.empty) {
      console.log('Seeding patients collection into Firebase Firestore...');
      for (const p of INITIAL_PATIENTS) {
        await setDoc(doc(firestoreDb, 'patients', String(p.id)), p);
        syncRecordToMySQL('patients', p);
      }
    }
    seeded = true;
    console.log('Firebase Firestore collections initialized successfully!');
  } catch (err) {
    console.warn('ensureSeeded warning:', err.message);
  }
}

// Trigger initial Firestore collection seeding immediately on start
ensureSeeded().catch(err => console.warn('Firestore initial seeding error:', err));

// Patient CRUD
export async function dbGetAllPatients() {
  try {
    const snap = await getDocs(collection(firestoreDb, 'patients'));
    return snap.docs.map(d => ({ id: d.data().id || d.id, ...d.data() }));
  } catch (err) {
    console.error('Firestore dbGetAllPatients error:', err);
    return [];
  }
}

export async function dbGetPatientById(id) {
  await ensureSeeded();
  try {
    const docRef = doc(firestoreDb, 'patients', String(id));
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return { id: snap.data().id || snap.id, ...snap.data() };
    }
    const all = await dbGetAllPatients();
    return all.find(p => String(p.id) === String(id)) || null;
  } catch (err) {
    console.error('Firestore dbGetPatientById error:', err);
    return null;
  }
}

export async function dbCreatePatient(patientData) {
  await ensureSeeded();
  try {
    const all = await dbGetAllPatients();
    const numericIds = all.map(p => Number(p.id)).filter(n => !isNaN(n) && n > 0);
    const newId = numericIds.length > 0 ? Math.max(...numericIds) + 1 : 1;
    const uhid = `PAT-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

    const newPatient = {
      id: newId,
      uhid,
      firstName: patientData.first_name || patientData.firstName || 'Patient',
      lastName: patientData.last_name || patientData.lastName || '',
      gender: patientData.gender || 'UNSPECIFIED',
      dateOfBirth: patientData.date_of_birth || patientData.dateOfBirth || new Date().toISOString().split('T')[0],
      age: Number(patientData.age) || 0,
      phone: patientData.phone || '',
      email: patientData.email || '',
      address: patientData.address || '',
      bloodGroup: patientData.blood_group || patientData.bloodGroup || 'A_POSITIVE',
      referringDoctor: patientData.referring_doctor || patientData.referringDoctor || 'Self',
      medicalHistory: patientData.medical_history || patientData.medicalHistory || '',
      allergies: patientData.allergies || 'None',
      createdAt: new Date().toISOString()
    };

    await setDoc(doc(firestoreDb, 'patients', String(newId)), newPatient);
    syncRecordToMySQL('patients', newPatient);
    return newPatient;
  } catch (err) {
    console.error('Firestore dbCreatePatient error:', err);
    throw err;
  }
}

export async function dbUpdatePatient(id, patientData) {
  await ensureSeeded();
  try {
    const docRef = doc(firestoreDb, 'patients', String(id));
    const existingSnap = await getDoc(docRef);
    const existing = existingSnap.exists() ? existingSnap.data() : {};

    const updated = {
      ...existing,
      firstName: patientData.first_name || patientData.firstName || existing.firstName,
      lastName: patientData.last_name || patientData.lastName || existing.lastName,
      gender: patientData.gender || existing.gender,
      dateOfBirth: patientData.date_of_birth || patientData.dateOfBirth || existing.dateOfBirth,
      age: Number(patientData.age) || existing.age,
      phone: patientData.phone || existing.phone,
      email: patientData.email || existing.email,
      address: patientData.address || existing.address,
      bloodGroup: patientData.blood_group || patientData.bloodGroup || existing.bloodGroup,
      referringDoctor: patientData.referring_doctor || patientData.referringDoctor || existing.referringDoctor,
      medicalHistory: patientData.medical_history || patientData.medicalHistory || existing.medicalHistory,
      allergies: patientData.allergies || existing.allergies,
      updatedAt: new Date().toISOString()
    };

    await setDoc(docRef, updated, { merge: true });
    syncRecordToMySQL('patients', updated);
    return updated;
  } catch (err) {
    console.error('Firestore dbUpdatePatient error:', err);
    throw err;
  }
}

// Study CRUD
export async function dbGetAllStudies() {
  await ensureSeeded();
  try {
    const [studiesSnap, patientsSnap, usersSnap, reportsSnap] = await Promise.all([
      getDocs(collection(firestoreDb, 'studies')),
      getDocs(collection(firestoreDb, 'patients')),
      getDocs(collection(firestoreDb, 'users')),
      getDocs(collection(firestoreDb, 'reports'))
    ]);

    const allPatients = patientsSnap.docs.map(d => ({ id: d.data().id || d.id, ...d.data() }));
    const allUsers = usersSnap.docs.map(d => ({ id: d.data().id || d.id, ...d.data() }));
    const allReports = reportsSnap.docs.map(d => ({ id: d.data().id || d.id, ...d.data() }));

    return studiesSnap.docs.map(d => {
      const st = { id: d.data().id || d.id, ...d.data() };
      const patient = allPatients.find(p => String(p.id) === String(st.patientId));
      const rad = allUsers.find(u => String(u.id) === String(st.assignedRadiologistId));
      const tech = allUsers.find(u => String(u.id) === String(st.technicianId));
      const report = allReports.find(r => String(r.studyId) === String(st.id));
      const images = st.images || [];
      const findings = st.aiFindings || [];

      return {
        study_id: st.id,
        study_code: st.studyCode,
        patient_id: st.patientId,
        patient_uhid: patient?.uhid || '',
        patient_name: patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown Patient',
        patient_age: patient?.age || 0,
        patient_gender: patient?.gender || 'UNSPECIFIED',
        study_type: st.studyType,
        body_region: st.bodyRegion,
        referring_doctor: st.referringDoctor,
        clinical_indication: st.clinicalIndication,
        priority: st.priority,
        status: st.status,
        study_date: st.studyDate,
        assigned_radiologist: rad ? `Dr. ${rad.firstName} ${rad.lastName}` : 'Unassigned',
        assigned_radiologist_id: st.assignedRadiologistId,
        technician: tech ? `${tech.firstName} ${tech.lastName}` : 'System',
        image_count: images.length,
        finding_count: findings.length,
        has_report: !!report,
        report_status: report?.status || 'NOT_STARTED',
        created_at: st.createdAt
      };
    });
  } catch (err) {
    console.error('Firestore dbGetAllStudies error:', err);
    return [];
  }
}

export async function dbGetStudyById(id) {
  await ensureSeeded();
  try {
    const docRef = doc(firestoreDb, 'studies', String(id));
    const snap = await getDoc(docRef);
    if (!snap.exists()) return null;

    const st = { id: snap.data().id || snap.id, ...snap.data() };

    const patient = await dbGetPatientById(st.patientId);
    const users = await dbGetAllUsers();
    const rad = users.find(u => String(u.id) === String(st.assignedRadiologistId));
    const tech = users.find(u => String(u.id) === String(st.technicianId));

    const reportsSnap = await getDocs(collection(firestoreDb, 'reports'));
    const reportDoc = reportsSnap.docs.find(d => String(d.data().studyId) === String(st.id));
    const report = reportDoc ? reportDoc.data() : null;

    const images = (st.images || []).map(img => ({
      image_id: img.id,
      study_id: st.id,
      image_url: img.imageUrl,
      organ_type: img.organType,
      view_type: img.viewType,
      capture_sequence: img.captureSequence,
      metadata: img.metadata || {},
      uploaded_at: img.uploadedAt
    }));

    const ai_findings = (st.aiFindings || []).map(f => ({
      finding_id: f.id,
      study_id: st.id,
      image_id: f.imageId,
      organ: f.organ,
      finding_type: f.findingType,
      severity: f.severity,
      confidence_score: f.confidenceScore,
      description: f.description,
      measurements: f.measurements,
      recommendations: f.recommendations,
      is_accepted: f.isAccepted,
      created_at: f.createdAt
    }));

    return {
      study_id: st.id,
      study_code: st.studyCode,
      patient_id: st.patientId,
      patient_uhid: patient?.uhid || '',
      patient_name: patient ? `${patient.firstName} ${patient.lastName}` : '',
      patient: patient ? {
        patient_id: patient.id,
        uhid: patient.uhid,
        first_name: patient.firstName,
        last_name: patient.lastName,
        gender: patient.gender,
        age: patient.age,
        phone: patient.phone,
        email: patient.email,
        address: patient.address,
        blood_group: patient.bloodGroup,
        referring_doctor: patient.referringDoctor,
        medical_history: patient.medicalHistory,
        allergies: patient.allergies
      } : null,
      study_type: st.studyType,
      body_region: st.bodyRegion,
      referring_doctor: st.referringDoctor,
      clinical_indication: st.clinicalIndication,
      priority: st.priority,
      status: st.status,
      study_date: st.studyDate,
      assigned_radiologist: rad ? `Dr. ${rad.firstName} ${rad.lastName}` : 'Unassigned',
      assigned_radiologist_id: st.assignedRadiologistId,
      technician: tech ? `${tech.firstName} ${tech.lastName}` : 'System',
      images,
      ai_findings,
      report: report ? {
        report_id: report.id,
        report_number: report.reportNumber,
        study_id: report.studyId,
        radiologist_id: report.radiologistId,
        impression_text: report.impressionText,
        detailed_findings_text: report.detailedFindingsText,
        recommendations_text: report.recommendationsText,
        status: report.status,
        approved_at: report.approvedAt,
        created_at: report.createdAt
      } : null,
      created_at: st.createdAt
    };
  } catch (err) {
    console.error('Firestore dbGetStudyById error:', err);
    return null;
  }
}

export async function dbCreateStudy(studyData) {
  await ensureSeeded();
  try {
    const studiesSnap = await getDocs(collection(firestoreDb, 'studies'));
    const all = studiesSnap.docs.map(d => d.data());
    const numericIds = all.map(s => Number(s.id)).filter(n => !isNaN(n) && n > 0);
    const newId = numericIds.length > 0 ? Math.max(...numericIds) + 1 : 1;
    const studyCode = `STU-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

    const newStudy = {
      id: newId,
      studyCode,
      patientId: Number(studyData.patient_id || studyData.patientId) || 1,
      studyType: studyData.study_type || studyData.studyType || 'ULTRASOUND_ABDOMEN_FULL',
      bodyRegion: studyData.body_region || studyData.bodyRegion || 'Abdomen',
      referringDoctor: studyData.referring_doctor || studyData.referringDoctor || 'Self',
      clinicalIndication: studyData.clinical_indication || studyData.clinicalIndication || 'Routine Evaluation',
      priority: studyData.priority || 'ROUTINE',
      status: 'SCHEDULED',
      assignedRadiologistId: (studyData.assigned_radiologist_id || studyData.assignedRadiologistId) ? Number(studyData.assigned_radiologist_id || studyData.assignedRadiologistId) : null,
      technicianId: (studyData.technician_id || studyData.technicianId) ? Number(studyData.technician_id || studyData.technicianId) : 5,
      studyDate: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      images: [],
      aiFindings: []
    };

    await setDoc(doc(firestoreDb, 'studies', String(newId)), newStudy);
    syncRecordToMySQL('studies', newStudy);
    return newStudy;
  } catch (err) {
    console.error('Firestore dbCreateStudy error:', err);
    throw err;
  }
}

export async function dbAssignRadiologist(studyId, radiologistId) {
  await ensureSeeded();
  try {
    const docRef = doc(firestoreDb, 'studies', String(studyId));
    await updateDoc(docRef, {
      assignedRadiologistId: Number(radiologistId),
      updatedAt: new Date().toISOString()
    });
    const snap = await getDoc(docRef);
    return snap.data();
  } catch (err) {
    console.error('Firestore dbAssignRadiologist error:', err);
    throw err;
  }
}

export async function dbUpdateStudyStatus(studyId, status) {
  await ensureSeeded();
  try {
    const docRef = doc(firestoreDb, 'studies', String(studyId));
    await updateDoc(docRef, {
      status,
      updatedAt: new Date().toISOString()
    });
    const snap = await getDoc(docRef);
    return snap.data();
  } catch (err) {
    console.error('Firestore dbUpdateStudyStatus error:', err);
    throw err;
  }
}

export async function dbAddStudyImages(studyId, imageList) {
  await ensureSeeded();
  try {
    const docRef = doc(firestoreDb, 'studies', String(studyId));
    const snap = await getDoc(docRef);
    if (!snap.exists()) return [];

    const existingImages = snap.data().images || [];
    const formattedNewImages = imageList.map((img, idx) => ({
      id: Date.now() + idx,
      imageUrl: img.imageUrl || img.image_url,
      organType: img.organType || img.organ_type || 'General',
      viewType: img.viewType || img.view_type || 'Standard',
      captureSequence: existingImages.length + idx + 1,
      uploadedAt: new Date().toISOString()
    }));

    const updatedImages = [...existingImages, ...formattedNewImages];
    await updateDoc(docRef, { images: updatedImages, updatedAt: new Date().toISOString() });
    return formattedNewImages;
  } catch (err) {
    console.error('Firestore dbAddStudyImages error:', err);
    throw err;
  }
}

export async function dbDeleteStudyImage(imageId) {
  await ensureSeeded();
  try {
    const studiesSnap = await getDocs(collection(firestoreDb, 'studies'));
    for (const d of studiesSnap.docs) {
      const st = d.data();
      const imgs = st.images || [];
      if (imgs.some(i => String(i.id) === String(imageId))) {
        const filtered = imgs.filter(i => String(i.id) !== String(imageId));
        await updateDoc(doc(firestoreDb, 'studies', d.id), { images: filtered });
        return { success: true };
      }
    }
    return null;
  } catch (err) {
    console.error('Firestore dbDeleteStudyImage error:', err);
    throw err;
  }
}

export async function dbUpdateFindingStatus(findingId, isAccepted) {
  await ensureSeeded();
  try {
    const studiesSnap = await getDocs(collection(firestoreDb, 'studies'));
    for (const d of studiesSnap.docs) {
      const st = d.data();
      const findings = st.aiFindings || [];
      const matchIndex = findings.findIndex(f => String(f.id) === String(findingId));
      if (matchIndex !== -1) {
        findings[matchIndex].isAccepted = isAccepted;
        await updateDoc(doc(firestoreDb, 'studies', d.id), { aiFindings: findings });
        return findings[matchIndex];
      }
    }
    return null;
  } catch (err) {
    console.error('Firestore dbUpdateFindingStatus error:', err);
    throw err;
  }
}

// Reports
export async function dbSaveReportDraft(studyId, radiologistId, impressionText, detailedFindingsText, recommendationsText) {
  await ensureSeeded();
  try {
    const reportsSnap = await getDocs(collection(firestoreDb, 'reports'));
    const allReports = reportsSnap.docs.map(d => ({ id: d.data().id || d.id, ...d.data() }));
    const existing = allReports.find(r => String(r.studyId) === String(studyId));

    if (existing) {
      const docRef = doc(firestoreDb, 'reports', String(existing.id));
      const updated = {
        radiologistId: Number(radiologistId) || existing.radiologistId,
        impressionText,
        detailedFindingsText,
        recommendationsText,
        status: 'DRAFT',
        updatedAt: new Date().toISOString()
      };
      await updateDoc(docRef, updated);
      const res = { ...existing, ...updated };
      syncRecordToMySQL('reports', res);
      return res;
    } else {
      const newId = allReports.length > 0 ? Math.max(...allReports.map(r => Number(r.id) || 0)) + 1 : 1;
      const reportNumber = `REP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

      const newReport = {
        id: newId,
        reportNumber,
        studyId: Number(studyId),
        radiologistId: Number(radiologistId) || 2,
        impressionText,
        detailedFindingsText,
        recommendationsText,
        status: 'DRAFT',
        createdAt: new Date().toISOString()
      };

      await setDoc(doc(firestoreDb, 'reports', String(newId)), newReport);
      syncRecordToMySQL('reports', newReport);
      return newReport;
    }
  } catch (err) {
    console.error('Firestore dbSaveReportDraft error:', err);
    throw err;
  }
}

export async function dbApproveReport(reportId) {
  await ensureSeeded();
  try {
    const docRef = doc(firestoreDb, 'reports', String(reportId));
    const snap = await getDoc(docRef);
    if (!snap.exists()) return null;

    const updatedReport = {
      ...snap.data(),
      status: 'APPROVED',
      approvedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    await setDoc(docRef, updatedReport, { merge: true });

    if (updatedReport.studyId) {
      await dbUpdateStudyStatus(updatedReport.studyId, 'REPORT_APPROVED');
    }

    return updatedReport;
  } catch (err) {
    console.error('Firestore dbApproveReport error:', err);
    throw err;
  }
}

export async function dbAmendReport(reportId, impressionText, detailedFindingsText, recommendationsText) {
  await ensureSeeded();
  try {
    const docRef = doc(firestoreDb, 'reports', String(reportId));
    const snap = await getDoc(docRef);
    if (!snap.exists()) return null;

    const updated = {
      ...snap.data(),
      impressionText,
      detailedFindingsText,
      recommendationsText,
      status: 'AMENDED',
      updatedAt: new Date().toISOString()
    };
    await setDoc(docRef, updated, { merge: true });
    return updated;
  } catch (err) {
    console.error('Firestore dbAmendReport error:', err);
    throw err;
  }
}

export async function dbGetAllReports() {
  await ensureSeeded();
  try {
    const [reportsSnap, studiesSnap, patientsSnap, usersSnap] = await Promise.all([
      getDocs(collection(firestoreDb, 'reports')),
      getDocs(collection(firestoreDb, 'studies')),
      getDocs(collection(firestoreDb, 'patients')),
      getDocs(collection(firestoreDb, 'users'))
    ]);

    const allStudies = studiesSnap.docs.map(d => ({ id: d.data().id || d.id, ...d.data() }));
    const allPatients = patientsSnap.docs.map(d => ({ id: d.data().id || d.id, ...d.data() }));
    const allUsers = usersSnap.docs.map(d => ({ id: d.data().id || d.id, ...d.data() }));

    return reportsSnap.docs.map(d => {
      const r = { id: d.data().id || d.id, ...d.data() };
      const st = allStudies.find(s => String(s.id) === String(r.studyId));
      const patient = st ? allPatients.find(p => String(p.id) === String(st.patientId)) : null;
      const rad = allUsers.find(u => String(u.id) === String(r.radiologistId));

      return {
        report_id: r.id,
        id: r.id,
        report_number: r.reportNumber || `REP-2024-${r.id}`,
        study_id: r.studyId,
        study_code: st?.studyCode || `STU-2024-${r.studyId}`,
        study_type: st?.studyType || 'ULTRASOUND_SCAN',
        body_region: st?.bodyRegion || 'Abdomen',
        patient_id: st?.patientId,
        patient_name: patient ? `${patient.firstName} ${patient.lastName}` : (st ? `Patient #${st.patientId}` : 'Patient Record'),
        patient_uhid: patient?.uhid || 'PAT-2024-100892',
        patient_age: patient?.age || 35,
        patient_gender: patient?.gender || 'FEMALE',
        patient_phone: patient?.phone || '',
        patient_email: patient?.email || '',
        radiologist_name: rad ? `${rad.firstName} ${rad.lastName}` : 'Dr. Sarah Jenkins',
        impression: r.impressionText || 'Ultrasound scan evaluated.',
        detailed_findings: r.detailedFindingsText || 'No acute abnormality noted.',
        recommendations: r.recommendationsText || 'Clinical correlation recommended.',
        status: r.status || 'DRAFT',
        approved_at: r.approvedAt || r.createdAt || new Date().toISOString(),
        created_at: r.createdAt || new Date().toISOString()
      };
    });
  } catch (err) {
    console.error('Firestore dbGetAllReports error:', err);
    return [];
  }
}

// Users
export async function dbGetAllUsers() {
  try {
    const snap = await getDocs(collection(firestoreDb, 'users'));
    if (snap.empty) {
      console.log('Seeding initial system users into Firestore...');
      for (const u of INITIAL_USERS) {
        const docUser = {
          ...u,
          user_id: u.id,
          username: u.username || (u.email ? u.email.split('@')[0] : 'user'),
          first_name: u.first_name || u.firstName,
          last_name: u.last_name || u.lastName,
          role_name: u.role_name || u.roleName,
          registration_number: u.registration_number || u.registrationNumber,
          is_active: u.status === 'ACTIVE'
        };
        await setDoc(doc(firestoreDb, 'users', String(u.id)), docUser);
      }
      const newSnap = await getDocs(collection(firestoreDb, 'users'));
      return newSnap.docs.map(d => ({ id: d.data().id || d.id, ...d.data() }));
    }
    return snap.docs.map(d => ({ id: d.data().id || d.id, ...d.data() }));
  } catch (err) {
    console.error('Firestore dbGetAllUsers error:', err);
    return INITIAL_USERS;
  }
}

export async function dbCreateUser(userData) {
  await ensureSeeded();
  try {
    const all = await dbGetAllUsers();
    
    // Return existing user if email matches to prevent duplicate ID entries
    if (userData.email) {
      const existing = all.find(u => u.email && u.email.toLowerCase() === userData.email.trim().toLowerCase());
      if (existing) {
        console.log(`User ${userData.email} already registered in Firestore (ID: ${existing.id || existing.user_id}). Returning existing user.`);
        return {
          ...existing,
          id: existing.id || existing.user_id,
          user_id: existing.id || existing.user_id
        };
      }
    }

    const numericIds = all.map(u => Number(u.id || u.user_id)).filter(n => !isNaN(n) && n > 0);
    const newId = numericIds.length > 0 ? Math.max(...numericIds) + 1 : 1;

    const newUser = {
      id: newId,
      user_id: newId,
      email: userData.email,
      username: userData.username || (userData.email ? userData.email.split('@')[0] : `user_${newId}`),
      firstName: userData.first_name || userData.firstName,
      lastName: userData.last_name || userData.lastName,
      first_name: userData.first_name || userData.firstName,
      last_name: userData.last_name || userData.lastName,
      roleName: userData.role_name || userData.roleName || 'RADIOLOGIST',
      role_name: userData.role_name || userData.roleName || 'RADIOLOGIST',
      phone: userData.phone || '',
      qualification: userData.qualification || '',
      registrationNumber: userData.registration_number || userData.registrationNumber || '',
      registration_number: userData.registration_number || userData.registrationNumber || '',
      status: 'ACTIVE',
      is_active: true,
      createdAt: new Date().toISOString()
    };

    await setDoc(doc(firestoreDb, 'users', String(newId)), newUser);
    syncRecordToMySQL('users', newUser);
    console.log(`Successfully stored user ${newUser.email} (ID: ${newId}) in Firebase Firestore 'users' collection!`);
    return newUser;
  } catch (err) {
    console.error('Firestore dbCreateUser error:', err);
    throw err;
  }
}

export async function dbResetUserPassword(email, newPassword) {
  await ensureSeeded();
  try {
    const snap = await getDocs(collection(firestoreDb, 'users'));
    const userDoc = snap.docs.find(d => {
      const data = d.data();
      return data.email && data.email.toLowerCase() === email.trim().toLowerCase();
    });

    if (!userDoc) {
      return null;
    }

    const docRef = doc(firestoreDb, 'users', userDoc.id);
    await updateDoc(docRef, {
      password: newPassword,
      updatedAt: new Date().toISOString()
    });

    return { id: userDoc.id, email: userDoc.data().email };
  } catch (err) {
    console.error('Firestore dbResetUserPassword error:', err);
    throw err;
  }
}

export async function dbToggleUserStatus(id, status) {
  await ensureSeeded();
  try {
    const docRef = doc(firestoreDb, 'users', String(id));
    const newStatus = status || 'INACTIVE';
    const isActive = newStatus === 'ACTIVE';
    await updateDoc(docRef, { 
      status: newStatus, 
      is_active: isActive,
      updatedAt: new Date().toISOString() 
    });
    const snap = await getDoc(docRef);
    return snap.data();
  } catch (err) {
    console.error('Firestore dbToggleUserStatus error:', err);
    throw err;
  }
}

// Doctors & Appointments Management
const DEFAULT_DOCTORS = [
  {
    id: "doc-1",
    name: "Dr. Ananya Sharma",
    qualification: "MD Radiodiagnosis (AIIMS), Fellow Fetal Medicine",
    specialization: "Senior Radiologist & 3D/4D Fetal USG Specialist",
    experience: "14+ Years",
    rating: 4.9,
    reviews_count: 320,
    available_days: ["Monday", "Tuesday", "Thursday", "Saturday"],
    time_slots: ["09:00 AM", "10:00 AM", "11:30 AM", "02:00 PM", "03:30 PM", "05:00 PM"],
    room: "USG Suite 1 (High Resolution 4D GE Voluson)",
    bio: "Pioneer in advanced 4D fetal anomaly scanning, nuchal translucency (NT), and high-risk pregnancy ultrasound evaluation."
  },
  {
    id: "doc-2",
    name: "Dr. Rajesh Verma",
    qualification: "DMRD, Fellowship in Musculoskeletal & Vascular USG",
    specialization: "Color Doppler & Vascular Specialist",
    experience: "11+ Years",
    rating: 4.8,
    reviews_count: 245,
    available_days: ["Monday", "Wednesday", "Friday", "Saturday"],
    time_slots: ["10:00 AM", "11:30 AM", "01:00 PM", "04:30 PM", "06:00 PM", "07:30 PM"],
    room: "USG Suite 2 (Philips EPIQ Elite Doppler)",
    bio: "Specializes in arterial/venous color Doppler studies, carotid duplex, deep vein thrombosis screening, and MSK joint ultrasound."
  },
  {
    id: "doc-3",
    name: "Dr. Meera Nair",
    qualification: "MD Radiodiagnosis, DNB, Fetal Echocardiography Cert.",
    specialization: "Fetal Echocardiography & Pelvic Sonography",
    experience: "9+ Years",
    rating: 4.9,
    reviews_count: 198,
    available_days: ["Tuesday", "Thursday", "Friday", "Sunday"],
    time_slots: ["09:30 AM", "11:00 AM", "12:30 PM", "02:30 PM", "04:00 PM"],
    room: "USG Suite 3 (Siemens Acuson Sequoia)",
    bio: "Expert in transvaginal scan (TVS), follicular monitoring, endometrial assessment, and pediatric fetal echo."
  },
  {
    id: "doc-4",
    name: "Dr. Vikramaditya Sen",
    qualification: "MD Radiodiagnosis, Interventional Radiologist",
    specialization: "Small Parts, Thyroid & Guided Biopsy USG",
    experience: "16+ Years",
    rating: 5.0,
    reviews_count: 410,
    available_days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    time_slots: ["04:00 PM", "05:15 PM", "06:30 PM", "07:45 PM"],
    room: "Interventional USG Lab",
    bio: "Senior radiologist specializing in thyroid elastography, breast ultrasound BIRADS scoring, and ultrasound-guided FNAC procedures."
  }
];

const DEFAULT_APPOINTMENTS = [
  {
    id: "APT-2026-101",
    patient_name: "Sunita Mukhopadhyay",
    age: 28,
    gender: "Female",
    phone: "+91-98310-44120",
    email: "sunita.m@gmail.com",
    doctor_id: "doc-1",
    doctor_name: "Dr. Ananya Sharma",
    usg_service: "3D/4D Obstetric Fetal Anomaly Scan",
    appointment_date: new Date().toISOString().split('T')[0],
    slot_time: "10:00 AM",
    status: "CONFIRMED",
    symptoms: "20 Weeks Gestational Anomaly Screening",
    reference_code: "USG-APT-88912",
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString()
  },
  {
    id: "APT-2026-102",
    patient_name: "Rajesh Kumar Das",
    age: 54,
    gender: "Male",
    phone: "+91-94331-88219",
    email: "rkdas54@yahoo.com",
    doctor_id: "doc-2",
    doctor_name: "Dr. Rajesh Verma",
    usg_service: "Bilateral Lower Limb Arterial Color Doppler",
    appointment_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    slot_time: "11:30 AM",
    status: "PENDING",
    symptoms: "Leg claudication & diabetic foot evaluation",
    reference_code: "USG-APT-99104",
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString()
  }
];

export async function dbGetAllDoctors() {
  await ensureSeeded();
  try {
    const snap = await getDocs(collection(firestoreDb, 'doctors'));
    if (snap.empty) {
      for (const d of DEFAULT_DOCTORS) {
        await setDoc(doc(firestoreDb, 'doctors', d.id), d);
      }
      return DEFAULT_DOCTORS;
    }
    return snap.docs.map(d => d.data());
  } catch (err) {
    console.error('Firestore dbGetAllDoctors error:', err);
    return DEFAULT_DOCTORS;
  }
}

export async function dbGetAllAppointments() {
  await ensureSeeded();
  try {
    const snap = await getDocs(collection(firestoreDb, 'appointments'));
    if (snap.empty) {
      for (const a of DEFAULT_APPOINTMENTS) {
        await setDoc(doc(firestoreDb, 'appointments', a.id), a);
      }
      return DEFAULT_APPOINTMENTS;
    }
    const all = snap.docs.map(d => d.data());
    return all.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
  } catch (err) {
    console.error('Firestore dbGetAllAppointments error:', err);
    return DEFAULT_APPOINTMENTS;
  }
}

export async function dbCreateAppointment(apptData) {
  await ensureSeeded();
  try {
    const all = await dbGetAllAppointments();
    const numericIds = all.map(a => Number(String(a.id || '').replace(/\D/g, ''))).filter(n => !isNaN(n) && n > 0);
    const nextNum = numericIds.length > 0 ? Math.max(...numericIds) + 1 : 103;
    const newId = `APT-${new Date().getFullYear()}-${nextNum}`;
    const refCode = `USG-APT-${Math.floor(100000 + Math.random() * 900000)}`;

    const newAppt = {
      id: newId,
      patient_name: apptData.patient_name || 'Anonymous Patient',
      age: Number(apptData.age) || 30,
      gender: apptData.gender || 'Female',
      phone: apptData.phone || '',
      email: apptData.email || '',
      doctor_id: apptData.doctor_id || 'doc-1',
      doctor_name: apptData.doctor_name || 'Dr. Ananya Sharma',
      usg_service: apptData.usg_service || 'Abdominal & Pelvic Ultrasound Scan',
      appointment_date: apptData.appointment_date || new Date().toISOString().split('T')[0],
      slot_time: apptData.slot_time || '10:00 AM',
      status: 'PENDING',
      symptoms: apptData.symptoms || apptData.notes || 'USG Diagnostic Screening',
      reference_code: refCode,
      createdAt: new Date().toISOString()
    };

    await setDoc(doc(firestoreDb, 'appointments', newId), newAppt);
    syncRecordToMySQL('appointments', newAppt);
    console.log(`Saved new USG Appointment ${newId} in Firestore!`);
    return newAppt;
  } catch (err) {
    console.error('Firestore dbCreateAppointment error:', err);
    throw err;
  }
}

export async function dbUpdateAppointmentStatus(id, status) {
  await ensureSeeded();
  try {
    const docRef = doc(firestoreDb, 'appointments', String(id));
    await updateDoc(docRef, {
      status,
      updatedAt: new Date().toISOString()
    });
    const snap = await getDoc(docRef);
    return snap.data();
  } catch (err) {
    console.error('Firestore dbUpdateAppointmentStatus error:', err);
    throw err;
  }
}

// Database Explorer Dumper
export async function dbGetDatabaseExplorer() {
  await ensureSeeded();
  try {
    const [patients, studies, users, reports] = await Promise.all([
      dbGetAllPatients(),
      getDocs(collection(firestoreDb, 'studies')).then(s => s.docs.map(d => d.data())),
      dbGetAllUsers(),
      getDocs(collection(firestoreDb, 'reports')).then(s => s.docs.map(d => d.data()))
    ]);

    return {
      tables: {
        patients,
        studies,
        users,
        reports,
        firestore_metadata: [
          {
            project_id: "folkloric-album-qcf5x",
            database_id: "ai-studio-aiassistedusgrep-c0b882be-a1ca-475d-bd6c-fa423c36a73a",
            status: "CONNECTED",
            sync_engine: "Google Cloud Firestore Native",
            auth_provider: "Firebase Auth"
          }
        ]
      }
    };
  } catch (err) {
    console.error('Firestore dbGetDatabaseExplorer error:', err);
    return { tables: {} };
  }
}
