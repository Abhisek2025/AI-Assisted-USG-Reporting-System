// backend/src/config/db.js
// Database Engine & Seed Storage for AI-Assisted USG Reporting System

import bcrypt from 'bcryptjs';

// Initial default password hash for "Password123!"
const DEFAULT_PASSWORD_HASH = bcrypt.hashSync('Password123!', 10);

class DatabaseStore {
  constructor() {
    this.init();
  }

  init() {
    this.diagnostic_centers = [
      {
        center_id: 1,
        name: 'Apex Advanced Diagnostic & Imaging Center',
        code: 'APEX-MAIN-01',
        address: '452 Healthcare Boulevard, Medical District',
        phone: '+1-800-555-USG1',
        email: 'info@apexdiagnostics.com',
        logo_url: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=150&auto=format&fit=crop&q=80',
        created_at: new Date().toISOString()
      }
    ];

    this.roles = [
      { role_id: 1, role_name: 'ADMIN', description: 'System Administrator with full access' },
      { role_id: 2, role_name: 'RADIOLOGIST', description: 'Medical specialist who reviews USG images, edits AI drafts & approves reports' },
      { role_id: 3, role_name: 'RECEPTIONIST', description: 'Front-desk staff who registers patients and schedules studies' },
      { role_id: 4, role_name: 'TECHNICIAN', description: 'USG Operator who captures & uploads ultrasound images' }
    ];

    this.users = [
      {
        user_id: 1,
        email: 'admin@apexdiagnostics.com',
        password_hash: DEFAULT_PASSWORD_HASH,
        first_name: 'Admin',
        last_name: 'Officer',
        role_id: 1,
        role_name: 'ADMIN',
        diagnostic_center_id: 1,
        phone: '+1-555-0101',
        qualification: 'M.HA, System Lead',
        registration_number: 'ADMIN-001',
        status: 'ACTIVE',
        created_at: new Date().toISOString()
      },
      {
        user_id: 2,
        email: 'dr.sarah@apexdiagnostics.com',
        password_hash: DEFAULT_PASSWORD_HASH,
        first_name: 'Dr. Sarah',
        last_name: 'Jenkins',
        role_id: 2,
        role_name: 'RADIOLOGIST',
        diagnostic_center_id: 1,
        phone: '+1-555-0102',
        qualification: 'MD Radiodiagnosis, FACR',
        registration_number: 'RAD-2024-8890',
        status: 'ACTIVE',
        created_at: new Date().toISOString()
      },
      {
        user_id: 3,
        email: 'dr.marcus@apexdiagnostics.com',
        password_hash: DEFAULT_PASSWORD_HASH,
        first_name: 'Dr. Marcus',
        last_name: 'Vance',
        role_id: 2,
        role_name: 'RADIOLOGIST',
        diagnostic_center_id: 1,
        phone: '+1-555-0103',
        qualification: 'DNB Radiology, Fellowship in USG',
        registration_number: 'RAD-2022-4412',
        status: 'ACTIVE',
        created_at: new Date().toISOString()
      },
      {
        user_id: 4,
        email: 'receptionist@apexdiagnostics.com',
        password_hash: DEFAULT_PASSWORD_HASH,
        first_name: 'Emily',
        last_name: 'Watson',
        role_id: 3,
        role_name: 'RECEPTIONIST',
        diagnostic_center_id: 1,
        phone: '+1-555-0104',
        qualification: 'B.Sc Health Admin',
        registration_number: 'REC-002',
        status: 'ACTIVE',
        created_at: new Date().toISOString()
      },
      {
        user_id: 5,
        email: 'tech@apexdiagnostics.com',
        password_hash: DEFAULT_PASSWORD_HASH,
        first_name: 'John',
        last_name: 'Doyle',
        role_id: 4,
        role_name: 'TECHNICIAN',
        diagnostic_center_id: 1,
        phone: '+1-555-0105',
        qualification: 'Certified Sonographer',
        registration_number: 'TECH-108',
        status: 'ACTIVE',
        created_at: new Date().toISOString()
      }
    ];

    this.patients = [
      {
        patient_id: 1,
        uhid: 'PAT-2026-000001',
        first_name: 'Eleanor',
        last_name: 'Vance',
        gender: 'FEMALE',
        date_of_birth: '1988-04-12',
        age: 38,
        phone: '+1-555-9011',
        email: 'eleanor.vance@example.com',
        address: '742 Evergreen Terrace, Springfield',
        blood_group: 'O+',
        referring_doctor: 'Dr. R. Harrison',
        medical_history: 'Mild hypertension, previous laparoscopic cholecystectomy evaluation',
        allergies: 'Penicillin',
        created_by: 4,
        created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        patient_id: 2,
        uhid: 'PAT-2026-000002',
        first_name: 'Robert',
        last_name: 'Chen',
        gender: 'MALE',
        date_of_birth: '1975-09-25',
        age: 50,
        phone: '+1-555-9012',
        email: 'robert.chen@example.com',
        address: '120 Ocean View Ave, Metro City',
        blood_group: 'A+',
        referring_doctor: 'Dr. S. Mehta',
        medical_history: 'Type 2 Diabetes mellitus, intermittent right loin pain',
        allergies: 'None reported',
        created_by: 4,
        created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        patient_id: 3,
        uhid: 'PAT-2026-000003',
        first_name: 'Sophia',
        last_name: 'Martinez',
        gender: 'FEMALE',
        date_of_birth: '1995-11-03',
        age: 30,
        phone: '+1-555-9013',
        email: 'sophia.m@example.com',
        address: '88 Oakridge Lane, Suburbia',
        blood_group: 'B+',
        referring_doctor: 'Dr. A. Gupta (OB/GYN)',
        medical_history: 'Routine Antenatal Care, G1P0 at 22 weeks gestation',
        allergies: 'Dust, Sulfa drugs',
        created_by: 4,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];

    this.studies = [
      {
        study_id: 1,
        study_code: 'STU-2026-001001',
        patient_id: 1,
        study_type: 'Abdomen',
        body_region: 'Whole Abdomen & Pelvis',
        referring_doctor: 'Dr. R. Harrison',
        clinical_indication: 'Right upper quadrant abdominal discomfort and dyspepsia',
        technician_id: 5,
        assigned_radiologist_id: 2,
        study_date: new Date(Date.now() - 3600000 * 3).toISOString(),
        priority: 'URGENT',
        status: 'AI_COMPLETED',
        diagnostic_center_id: 1,
        created_at: new Date(Date.now() - 3600000 * 3).toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        study_id: 2,
        study_code: 'STU-2026-001002',
        patient_id: 2,
        study_type: 'Renal',
        body_region: 'Kidneys, Ureters & Urinary Bladder (KUB)',
        referring_doctor: 'Dr. S. Mehta',
        clinical_indication: 'Right renal colic, suspect nephrolithiasis or hydronephrosis',
        technician_id: 5,
        assigned_radiologist_id: 3,
        study_date: new Date(Date.now() - 3600000 * 1).toISOString(),
        priority: 'NORMAL',
        status: 'IMAGE_UPLOADED',
        diagnostic_center_id: 1,
        created_at: new Date(Date.now() - 3600000 * 1).toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        study_id: 3,
        study_code: 'STU-2026-001003',
        patient_id: 3,
        study_type: 'Obstetric',
        body_region: 'Pelvis / Fetal Anatomy',
        referring_doctor: 'Dr. A. Gupta',
        clinical_indication: 'Routine anomaly scan & fetal growth biometry at 22 weeks',
        technician_id: 5,
        assigned_radiologist_id: 2,
        study_date: new Date().toISOString(),
        priority: 'NORMAL',
        status: 'REGISTERED',
        diagnostic_center_id: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];

    this.study_images = [
      {
        image_id: 1,
        study_id: 1,
        file_name: 'usg_liver_gallbladder_01.jpg',
        file_path: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?w=800&auto=format&fit=crop&q=80',
        file_size: 1048576,
        file_type: 'image/jpeg',
        ai_status: 'PROCESSED',
        uploaded_by: 5,
        created_at: new Date(Date.now() - 3600000 * 2.5).toISOString()
      },
      {
        image_id: 2,
        study_id: 1,
        file_name: 'usg_gallbladder_stone_02.jpg',
        file_path: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=800&auto=format&fit=crop&q=80',
        file_size: 1120000,
        file_type: 'image/jpeg',
        ai_status: 'PROCESSED',
        uploaded_by: 5,
        created_at: new Date(Date.now() - 3600000 * 2.4).toISOString()
      },
      {
        image_id: 3,
        study_id: 2,
        file_name: 'usg_right_kidney_calculus.jpg',
        file_path: 'https://images.unsplash.com/photo-1530497610245-94d3c16cda28?w=800&auto=format&fit=crop&q=80',
        file_size: 980000,
        file_type: 'image/jpeg',
        ai_status: 'PENDING',
        uploaded_by: 5,
        created_at: new Date(Date.now() - 3600000 * 0.8).toISOString()
      }
    ];

    this.ai_analysis = [
      {
        ai_analysis_id: 1,
        study_id: 1,
        status: 'COMPLETED',
        model_version: 'v1.4.2-FastAPI-OpenCV-PyTorch',
        draft_impression: 'USG features suggestive of Grade I Fatty Liver and Cholelithiasis with 4.5 mm mobile calculus in Gallbladder lumen without wall thickening.',
        raw_response_json: { confidence_overall: 0.88 },
        created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
        completed_at: new Date(Date.now() - 3600000 * 1.9).toISOString()
      }
    ];

    this.ai_findings = [
      {
        finding_id: 1,
        ai_analysis_id: 1,
        organ: 'Liver',
        observation: 'Mildly diffuse increase in parenchymal echogenicity with subtle distal acoustic attenuation. Normal hepatic veins and portal vein caliber.',
        confidence: 0.89,
        location: 'Right & Left Lobes',
        measurement: 'Span 15.2 cm',
        status: 'PENDING',
        created_at: new Date(Date.now() - 3600000 * 1.9).toISOString()
      },
      {
        finding_id: 2,
        ai_analysis_id: 1,
        organ: 'Gallbladder',
        observation: 'Single acoustic shadow casting echogenic focus noted in lumen. Gallbladder wall thickness is normal (2.1 mm). No pericholecystic fluid.',
        confidence: 0.92,
        location: 'Gallbladder Body',
        measurement: 'Calculus Size 4.5 mm',
        status: 'PENDING',
        created_at: new Date(Date.now() - 3600000 * 1.9).toISOString()
      },
      {
        finding_id: 3,
        ai_analysis_id: 1,
        organ: 'Common Bile Duct (CBD)',
        observation: 'CBD is normal in caliber measuring 3.8 mm. No intrahepatic biliary radicle dilation (IHBRD).',
        confidence: 0.85,
        location: 'Porta Hepatis',
        measurement: '3.8 mm',
        status: 'PENDING',
        created_at: new Date(Date.now() - 3600000 * 1.9).toISOString()
      },
      {
        finding_id: 4,
        ai_analysis_id: 1,
        organ: 'Spleen & Pancreas',
        observation: 'Spleen measures 9.8 cm in length with homogeneous echotexture. Visualized portion of pancreas appears normal.',
        confidence: 0.82,
        location: 'Left Hypochondrium & Epigastrium',
        measurement: 'Spleen 9.8 cm',
        status: 'PENDING',
        created_at: new Date(Date.now() - 3600000 * 1.9).toISOString()
      }
    ];

    this.reports = [
      {
        report_id: 1,
        study_id: 1,
        patient_id: 1,
        radiologist_id: 2,
        status: 'DRAFT',
        clinical_indication: 'Right upper quadrant abdominal pain and nausea',
        technique: 'Real-time grey scale B-mode ultrasound examination of the abdomen was performed using a high-resolution 3.5 - 5.0 MHz convex transducer.',
        findings_text: 'LIVER: Mild diffuse increased parenchymal echogenicity noted. Liver measures 15.2 cm in span.\nGALLBLADDER: Normal wall thickness (2.1 mm). Single well-defined 4.5 mm hyperechoic calculus noted in the body showing clear posterior acoustic shadowing.\nCBD: 3.8 mm, normal.\nKIDNEYS & SPLEEN: Both kidneys are normal in size, shape, and position. Normal corticomedullary differentiation.',
        measurements_json: { liver_span: '15.2 cm', gb_wall: '2.1 mm', calculus_size: '4.5 mm', cbd_diameter: '3.8 mm', spleen_length: '9.8 cm' },
        impression: '1. Mild Hepatic Steatosis (Grade I Fatty Liver).\n2. Single Gallbladder Calculus (Cholelithiasis) without features of acute cholecystitis.',
        recommendations: 'Clinical correlation and routine follow-up recommended.',
        approved_at: null,
        verification_code: 'APX-USG-2026-9901-VERIFIED',
        qr_code_url: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=APX-USG-2026-9901-VERIFIED',
        pdf_url: null,
        created_at: new Date(Date.now() - 3600000 * 1.5).toISOString(),
        updated_at: new Date().toISOString()
      }
    ];

    this.report_versions = [
      {
        version_id: 1,
        report_id: 1,
        version_number: 1,
        content_json: {
          findings_text: 'Initial draft auto-populated from AI analysis.',
          impression: 'Grade I Fatty Liver and Cholelithiasis.'
        },
        changed_by: 2,
        change_reason: 'Initial AI Draft accepted & edited by Dr. Sarah Jenkins',
        created_at: new Date(Date.now() - 3600000 * 1.5).toISOString()
      }
    ];

    this.notifications = [
      {
        notification_id: 1,
        user_id: 2,
        title: 'New Study Assigned',
        message: 'Study STU-2026-001001 for Eleanor Vance (Abdomen) has been assigned to you.',
        type: 'INFO',
        is_read: false,
        related_entity_type: 'STUDY',
        related_entity_id: 1,
        created_at: new Date(Date.now() - 3600000 * 3).toISOString()
      },
      {
        notification_id: 2,
        user_id: 2,
        title: 'AI Analysis Completed',
        message: 'AI draft findings generated for Study STU-2026-001001. Ready for review.',
        type: 'SUCCESS',
        is_read: false,
        related_entity_type: 'STUDY',
        related_entity_id: 1,
        created_at: new Date(Date.now() - 3600000 * 1.9).toISOString()
      },
      {
        notification_id: 3,
        user_id: 3,
        title: 'Urgent Study Alert',
        message: 'Study STU-2026-001002 marked as NORMAL priority for Robert Chen.',
        type: 'INFO',
        is_read: true,
        related_entity_type: 'STUDY',
        related_entity_id: 2,
        created_at: new Date(Date.now() - 3600000 * 1).toISOString()
      }
    ];

    this.audit_logs = [
      {
        log_id: 1,
        user_id: 4,
        action: 'PATIENT_CREATED',
        entity_type: 'PATIENT',
        entity_id: 1,
        ip_address: '127.0.0.1',
        user_agent: 'ApexDiagnosticCenter-Web/1.0',
        details_json: { uhid: 'PAT-2026-000001', name: 'Eleanor Vance' },
        timestamp: new Date(Date.now() - 86400000 * 2).toISOString()
      },
      {
        log_id: 2,
        user_id: 5,
        action: 'IMAGE_UPLOADED',
        entity_type: 'STUDY',
        entity_id: 1,
        ip_address: '127.0.0.1',
        user_agent: 'SonographerWorkstation/2.1',
        details_json: { study_code: 'STU-2026-001001', count: 2 },
        timestamp: new Date(Date.now() - 3600000 * 2.5).toISOString()
      },
      {
        log_id: 3,
        user_id: 5,
        action: 'AI_ANALYSIS_REQUESTED',
        entity_type: 'STUDY',
        entity_id: 1,
        ip_address: '127.0.0.1',
        user_agent: 'SonographerWorkstation/2.1',
        details_json: { study_code: 'STU-2026-001001' },
        timestamp: new Date(Date.now() - 3600000 * 2).toISOString()
      },
      {
        log_id: 4,
        user_id: 2,
        action: 'AI_ANALYSIS_COMPLETED',
        entity_type: 'AI_ANALYSIS',
        entity_id: 1,
        ip_address: '127.0.0.1',
        user_agent: 'RadiologistStudio/3.0',
        details_json: { findings_count: 4, model: 'v1.4.2-FastAPI-OpenCV' },
        timestamp: new Date(Date.now() - 3600000 * 1.9).toISOString()
      }
    ];

    this.refresh_tokens = [];
  }

  // Helper ID generators
  getNextId(collection) {
    const items = this[collection];
    if (!items || items.length === 0) return 1;

    // Detect primary key ending in _id or fallback to id
    const sample = items[0];
    const key = Object.keys(sample).find(k => k.endsWith('_id')) || 'id';

    const max = items.reduce((maxVal, item) => {
      const val = Number(item[key]);
      return (!isNaN(val) && val > maxVal) ? val : maxVal;
    }, 0);

    return max + 1;
  }

  generateUHID() {
    const year = new Date().getFullYear();
    const count = this.patients.length + 1;
    const num = String(count).padStart(6, '0');
    return `PAT-${year}-${num}`;
  }

  generateStudyCode() {
    const year = new Date().getFullYear();
    const count = this.studies.length + 1001;
    return `STU-${year}-${count}`;
  }
}

export const db = new DatabaseStore();
